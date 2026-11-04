import { readSession } from './auth-storage';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4200';
const GUEST_KEY = 'hanbit-chat-guest';
const CONVERSATION_KEY = 'hanbit-chat-conversation';

/** 백엔드가 보내는 근거 (문서 이름, 내용 일부, 점수) */
export interface ChatSource {
  document: string;
  snippet: string;
  score: number | null;
}

export class ChatError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

const FALLBACK = '답을 받지 못했어요. 잠시 뒤에 다시 물어봐 주세요.';

/** 로그인하지 않은 사람을 구분하는 번호. 이 브라우저에만 둔다 */
function guestId(): string {
  try {
    const saved = localStorage.getItem(GUEST_KEY);
    if (saved) return saved;
    const created = crypto.randomUUID();
    localStorage.setItem(GUEST_KEY, created);
    return created;
  } catch {
    return crypto.randomUUID();
  }
}

/** 대화 번호는 탭을 닫으면 사라지게 sessionStorage에 둔다 */
export function readConversationId(): string | undefined {
  try {
    return sessionStorage.getItem(CONVERSATION_KEY) ?? undefined;
  } catch {
    return undefined;
  }
}

export function writeConversationId(id: string | null) {
  try {
    if (id) sessionStorage.setItem(CONVERSATION_KEY, id);
    else sessionStorage.removeItem(CONVERSATION_KEY);
  } catch {
    // 저장소를 못 쓰면 대화가 이어지지 않을 뿐이다
  }
}

/** SSE 조각에서 완성된 이벤트만 꺼내고 남은 부분은 돌려준다 */
export function parseSse(buffer: string): { events: { event: string; data: string }[]; rest: string } {
  const blocks = buffer.replace(/\r\n?/g, '\n').split('\n\n');
  const rest = blocks.pop() ?? '';
  const events = blocks.flatMap((block) => {
    let event = 'message';
    const data: string[] = [];
    for (const line of block.split('\n')) {
      if (line.startsWith('event:')) event = line.slice(6).trim();
      else if (line.startsWith('data:')) data.push(line.slice(5).replace(/^ /, ''));
    }
    return data.length ? [{ event, data: data.join('\n') }] : [];
  });
  return { events, rest };
}

interface StreamOptions {
  query: string;
  conversationId?: string;
  signal: AbortSignal;
  onDelta: (text: string) => void;
  onEnd: (result: { conversationId: string; sources: ChatSource[] }) => void;
}

/**
 * 문의 챗봇에 질문을 보내고 답을 조금씩 받는다.
 * 실패하면 ChatError를 던진다(503이면 챗봇 준비 중). 멈춤(abort)은 조용히 끝난다.
 */
export async function streamChat({ query, conversationId, signal, onDelta, onEnd }: StreamOptions): Promise<void> {
  const token = readSession()?.token;
  let response: Response;
  try {
    response = await fetch(new URL('/chat/messages', API_URL), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
        'x-chat-guest': guestId(),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ query, ...(conversationId ? { conversationId } : {}) }),
      cache: 'no-store',
      signal,
    });
  } catch {
    if (signal.aborted) return;
    throw new ChatError(0, '서버에 연결할 수 없어요. 잠시 뒤에 다시 물어봐 주세요.');
  }

  if (!response.ok || !response.body) {
    const body = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new ChatError(response.status, body?.message ?? FALLBACK);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let finished = false;
  try {
    while (!finished) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const { events, rest } = parseSse(buffer);
      buffer = rest;
      for (const { event, data } of events) {
        let payload: Record<string, unknown>;
        try {
          payload = JSON.parse(data) as Record<string, unknown>;
        } catch {
          continue;
        }
        if (event === 'delta' && typeof payload.text === 'string') onDelta(payload.text);
        else if (event === 'end') {
          onEnd({
            conversationId: typeof payload.conversationId === 'string' ? payload.conversationId : '',
            sources: Array.isArray(payload.sources) ? (payload.sources as ChatSource[]) : [],
          });
          finished = true;
        } else if (event === 'error') {
          throw new ChatError(200, typeof payload.message === 'string' ? payload.message : FALLBACK);
        }
      }
    }
  } catch (error) {
    if (signal.aborted) return;
    if (error instanceof ChatError) throw error;
    throw new ChatError(0, FALLBACK);
  } finally {
    reader.cancel().catch(() => undefined);
  }
  if (!finished && !signal.aborted) throw new ChatError(0, FALLBACK);
}
