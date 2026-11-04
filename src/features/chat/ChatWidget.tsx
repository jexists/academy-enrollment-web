'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { TextArea } from '@/components/ui/TextArea';
import { cn } from '@/lib/cn';
import {
  ChatError,
  guideHref,
  guideTitle,
  readConversationId,
  streamChat,
  writeConversationId,
  type ChatSource,
} from '@/lib/chat-stream';
import { createTypewriter, type Typewriter } from '@/lib/typewriter';

interface ChatMessage {
  id: number;
  role: 'user' | 'bot';
  text: string;
  sources?: ChatSource[];
  error?: string;
  streaming?: boolean;
}

const EXAMPLES = [
  { label: '환불', query: '수업을 그만두면 환불은 어떻게 받나요?' },
  { label: '보강', query: '결석하면 보강을 받을 수 있나요?' },
  { label: '상담 예약', query: '상담 예약은 어떻게 하나요?' },
  { label: '형제 할인', query: '형제가 같이 다니면 할인이 있나요?' },
];

const PHONE = '02-000-0000';
const MAX_LENGTH = 500;

/** 학부모·학생 화면은 640 미만에서 아래 탭바(높이 64)가 있어서 버튼을 그 위로 올린다 */
const TAB_BAR_PATHS = ['/home', '/enrollments', '/enroll', '/refund', '/makeup', '/payments', '/account', '/me'];

/** 선 아이콘 (Icon과 같은 24 그리드·선 굵기) */
function Glyph({ d, className }: { d: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" className={cn('size-5 shrink-0', className)} aria-hidden>
      <path d={d} />
    </svg>
  );
}
const ICON = {
  chat: 'M4 5h16v11H9l-5 4zM8 9h8M8 12h5',
  close: 'M6 6l12 12M18 6 6 18',
  stop: 'M7 7h10v10H7z',
  refresh: 'M4 12a8 8 0 0 1 14-5.3L20 9M20 4v5h-5M20 12a8 8 0 0 1-14 5.3L4 15M4 20v-5h5',
  down: 'M12 5v14M6 13l6 6 6-6',
};

/** 맨 아래에서 이만큼 안쪽이면 "맨 아래에 있다"로 본다 */
const BOTTOM_GAP = 48;

/** 답을 기다릴 때 점 3개 (차례로 튀어 오른다) */
function TypingDots({ className }: { className?: string }) {
  return (
    <span role="status" aria-label="답을 쓰고 있어요" className={cn('inline-flex items-center gap-1', className)}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          aria-hidden
          className="size-1.5 animate-typing rounded-full bg-current motion-reduce:animate-none"
          style={{ animationDelay: `${i * 160}ms` }}
        />
      ))}
    </span>
  );
}

/** 오른쪽 아래 "문의하기" 챗봇. 모바일은 아래 시트, 넓은 화면은 카드 패널 */
export function ChatWidget() {
  const pathname = usePathname();
  const aboveTabBar = TAB_BAR_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const typerRef = useRef<Typewriter | null>(null);
  const nextId = useRef(1);
  const listRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const focusInput = () => formRef.current?.querySelector('textarea')?.focus();

  // 맨 아래를 보고 있을 때만 새 글자를 따라 내려간다. 위로 올려 읽는 중이면 그대로 둔다
  const [atBottom, setAtBottom] = useState(true);
  const atBottomRef = useRef(true);
  const scrollToBottom = (smooth = false) => {
    const list = listRef.current;
    if (list) list.scrollTo({ top: list.scrollHeight, behavior: smooth ? 'smooth' : 'auto' });
  };
  const onListScroll = () => {
    const list = listRef.current;
    if (!list) return;
    const bottom = list.scrollHeight - list.scrollTop - list.clientHeight <= BOTTOM_GAP;
    atBottomRef.current = bottom;
    setAtBottom(bottom);
  };
  useEffect(() => {
    if (atBottomRef.current) scrollToBottom();
  }, [messages, unavailable]);
  // 패널을 열면 맨 아래부터 (상태는 여는 버튼에서 되돌린다)
  useEffect(() => {
    if (open) scrollToBottom();
  }, [open]);
  const openPanel = () => {
    atBottomRef.current = true;
    setAtBottom(true);
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    focusInput();
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  // 화면을 떠나면 받던 답을 멈춘다
  useEffect(
    () => () => {
      abortRef.current?.abort();
      typerRef.current?.cancel();
    },
    [],
  );

  const updateBot = (id: number, change: (message: ChatMessage) => ChatMessage) =>
    setMessages((list) => list.map((message) => (message.id === id ? change(message) : message)));

  async function send(text: string) {
    const query = text.trim();
    if (!query || streaming) return;
    const userId = nextId.current++;
    const botId = nextId.current++;
    setMessages((list) => [
      ...list,
      { id: userId, role: 'user', text: query },
      { id: botId, role: 'bot', text: '', streaming: true },
    ]);
    setDraft('');
    setStreaming(true);
    // 내가 물어본 건 항상 보이게 맨 아래로
    atBottomRef.current = true;
    setAtBottom(true);
    const controller = new AbortController();
    abortRef.current = controller;
    // 받은 글자는 타자 치듯 조금씩 보여 준다
    const typer = createTypewriter((chunk) => updateBot(botId, (m) => ({ ...m, text: m.text + chunk })));
    typerRef.current = typer;
    let sources: ChatSource[] | undefined;

    try {
      await streamChat({
        query,
        conversationId: readConversationId(),
        signal: controller.signal,
        onDelta: (delta) => typer.push(delta),
        onEnd: ({ conversationId, sources: found }) => {
          if (conversationId) writeConversationId(conversationId);
          sources = found;
        },
      });
      // 멈춤을 눌렀으면 받은 데까지 바로 보이고, 아니면 다 쳐질 때까지 기다린다
      if (controller.signal.aborted) typer.flush();
      else await typer.drained();
      updateBot(botId, (m) => ({ ...m, sources, streaming: false }));
    } catch (error) {
      typer.flush();
      if (error instanceof ChatError && error.status === 503) {
        setUnavailable(true);
        // 준비 중이면 빈 답 말풍선은 지우고 안내만 보인다
        setMessages((list) => list.filter((m) => m.id !== botId));
      } else {
        const message = error instanceof ChatError ? error.message : '답을 받지 못했어요. 잠시 뒤에 다시 물어봐 주세요.';
        updateBot(botId, (m) => ({ ...m, streaming: false, error: message }));
      }
    } finally {
      if (abortRef.current === controller) abortRef.current = null;
      if (typerRef.current === typer) typerRef.current = null;
      setStreaming(false);
    }
  }

  function stop() {
    abortRef.current?.abort();
    typerRef.current?.flush();
  }

  function reset() {
    abortRef.current?.abort();
    typerRef.current?.cancel();
    writeConversationId(null);
    setMessages([]);
    setUnavailable(false);
    setDraft('');
    focusInput();
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    void send(draft);
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    // 한글 조합 중 Enter는 글자 확정이라 보내지 않는다. Shift+Enter는 줄바꿈
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      void send(draft);
    }
  }

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={openPanel}
          aria-label="문의하기"
          aria-haspopup="dialog"
          className={cn(
            'fixed right-4 z-40 flex size-14 items-center justify-center rounded-full bg-primary text-white transition-colors hover:bg-primary-hover sm:right-6 sm:bottom-6',
            aboveTabBar ? 'bottom-20' : 'bottom-4',
          )}
        >
          <Glyph d={ICON.chat} className="size-6" />
        </button>
      )}

      {open && (
        <>
          {/* 모바일 시트 뒤 어두운 바탕 */}
          <div className="fixed inset-0 z-50 bg-dim sm:hidden" onClick={() => setOpen(false)} aria-hidden />
          <section
            role="dialog"
            aria-label="한빛수학 문의"
            className={cn(
              'fixed z-50 flex flex-col overflow-hidden border border-line bg-canvas text-fg',
              'inset-x-0 bottom-0 h-[85dvh] animate-sheet rounded-t-modal',
              'sm:inset-x-auto sm:right-6 sm:bottom-6 sm:h-[min(640px,calc(100dvh-48px))] sm:w-[380px] sm:animate-rise sm:rounded-modal sm:border-line2',
            )}
          >
            <header className="flex h-14 shrink-0 items-center gap-1 border-b border-line pr-2 pl-4">
              <h2 className="flex-1 text-sec">한빛수학 문의</h2>
              <Button variant="ghost" size="sm" onClick={reset} disabled={messages.length === 0 && !unavailable}>
                <Glyph d={ICON.refresh} className="size-4" />새 대화
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setOpen(false)} aria-label="닫기" className="size-11 px-0">
                <Glyph d={ICON.close} />
              </Button>
            </header>

            <div className="relative flex min-h-0 flex-1 flex-col">
            <div ref={listRef} onScroll={onListScroll} className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-4" aria-live="polite">
              <div className="max-w-[85%] self-start rounded-modal bg-s1 px-3 py-2 text-body">
                안녕하세요, 한빛수학 문의 도우미예요. 학원 안내 문서를 보고 수강료·환불·보강·상담 같은 궁금한 점에 답해 드려요.
              </div>
              {messages.length === 0 && !unavailable && (
                <div className="flex flex-wrap gap-2">
                  {EXAMPLES.map((example) => (
                    <button
                      key={example.label}
                      type="button"
                      onClick={() => void send(example.query)}
                      className="h-8 rounded-full border border-line2 px-3 text-meta font-medium text-muted transition-colors hover:border-primary hover:text-primary"
                    >
                      {example.label}
                    </button>
                  ))}
                </div>
              )}

              {messages.map((message) => (
                <Bubble key={message.id} message={message} />
              ))}

              {unavailable && (
                <div role="status" className="rounded-modal bg-info-c px-3 py-3 text-body">
                  <p className="font-medium text-fg">상담 챗봇을 준비하고 있어요</p>
                  <p className="mt-1 text-meta text-muted">
                    급한 문의는 전화로 연락 주세요 · 전화{' '}
                    <a href={`tel:${PHONE}`} className="font-medium text-info underline underline-offset-2">
                      {PHONE}
                    </a>
                  </p>
                </div>
              )}
            </div>

            {/* 위로 올려 읽는 중: 답을 쓰는 동안은 점 3개만 따라오고, 끝나면 아래 화살표 */}
            {!atBottom && messages.length > 0 && (
              <button
                type="button"
                onClick={() => scrollToBottom(true)}
                aria-label={streaming ? '답을 쓰고 있어요. 맨 아래로' : '맨 아래로'}
                className={cn(
                  'absolute bottom-3 left-1/2 flex h-9 -translate-x-1/2 animate-rise items-center justify-center gap-2 rounded-full border border-line2 bg-canvas text-muted transition-colors hover:text-fg',
                  streaming ? 'px-3.5' : 'w-9',
                )}
              >
                {streaming ? <TypingDots /> : <Glyph d={ICON.down} className="size-4" />}
              </button>
            )}
            </div>

            <form ref={formRef} onSubmit={onSubmit} className="flex shrink-0 items-end gap-2 border-t border-line px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))]">
              <TextArea
                label="질문"
                value={draft}
                onChange={(event) => setDraft(event.target.value.slice(0, MAX_LENGTH))}
                onKeyDown={onKeyDown}
                rows={1}
                maxLength={MAX_LENGTH}
                placeholder="궁금한 점을 적어 주세요"
                className="flex-1 gap-0 [&_label]:sr-only [&_textarea]:max-h-32 [&_textarea]:min-h-10 [&_textarea]:resize-none"
              />
              {streaming ? (
                <Button variant="secondary" onClick={stop} className="shrink-0">
                  <Glyph d={ICON.stop} className="size-4" />
                  멈춤
                </Button>
              ) : (
                <Button type="submit" disabled={!draft.trim()} className="shrink-0">
                  보내기
                </Button>
              )}
            </form>
          </section>
        </>
      )}
    </>
  );
}

function Bubble({ message }: { message: ChatMessage }) {
  if (message.role === 'user') {
    return <div className="max-w-[85%] self-end rounded-modal bg-primary-c px-3 py-2 text-body whitespace-pre-wrap">{message.text}</div>;
  }
  const waiting = message.streaming && !message.text;
  return (
    <div className="flex max-w-[85%] flex-col gap-1 self-start">
      {(message.text || waiting) && (
        <div className="rounded-modal bg-s1 px-3 py-2 text-body whitespace-pre-wrap">
          {waiting ? <TypingDots className="h-[22px] text-subtle" /> : message.text}
          {message.streaming && message.text && <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-fg align-middle" aria-hidden />}
        </div>
      )}
      {message.error && <p className="text-meta text-err">{message.error}</p>}
      {!message.streaming && !message.error && !message.text && <p className="text-meta text-subtle">답을 멈췄어요.</p>}
      {message.sources && message.sources.length > 0 && <Sources sources={message.sources} />}
    </div>
  );
}

function Sources({ sources }: { sources: ChatSource[] }) {
  return (
    <details className="group text-meta">
      <summary className="cursor-pointer list-none py-1 text-subtle hover:text-fg">
        근거 {sources.length}개 <span className="inline-block transition-transform group-open:rotate-180">▾</span>
      </summary>
      <ul className="mt-1 flex flex-col gap-2">
        {sources.map((source, index) => {
          const href = guideHref(source.document);
          return (
            <li key={`${source.document}-${index}`} className="rounded-control border border-line px-3 py-2">
              {href ? (
                <Link href={href} className="font-medium text-info underline underline-offset-2">
                  {guideTitle(source.document)}
                </Link>
              ) : (
                <span className="font-medium text-fg">{source.document}</span>
              )}
              {source.snippet && <p className="mt-1 text-muted">{source.snippet}</p>}
            </li>
          );
        })}
      </ul>
    </details>
  );
}
