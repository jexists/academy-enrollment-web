/**
 * 받은 글자를 한꺼번에 붙이지 않고 조금씩 흘려 보여 준다 (문의하기 답).
 * Dify가 몰아서 보내도 화면에는 고른 속도로 나온다.
 */
export interface Typewriter {
  /** 받은 글자를 줄에 세운다 */
  push(text: string): void;
  /** 줄에 선 글자가 다 나올 때까지 기다린다 */
  drained(): Promise<void>;
  /** 남은 글자를 바로 다 내보낸다 */
  flush(): void;
  /** 멈춘다 (남은 글자는 버린다) */
  cancel(): void;
}

/**
 * 한 번에 내보낼 글자 수 (25ms마다): 보통 1자(초당 40자), 밀리면 2~3자까지(초당 80~120자).
 * 사람이 읽는 속도에 가깝게 고르게 나오고, 긴 답도 크게 뒤처지지 않는다.
 */
export function charsPerTick(backlog: number): number {
  if (backlog > 240) return 3;
  if (backlog > 80) return 2;
  return 1;
}

export function createTypewriter(onText: (text: string) => void, tickMs = 25): Typewriter {
  // 한글·이모지가 반으로 갈리지 않게 글자 단위 배열로 둔다
  let queue: string[] = [];
  let timer: ReturnType<typeof setTimeout> | null = null;
  let waiters: (() => void)[] = [];

  const settle = () => {
    const list = waiters;
    waiters = [];
    list.forEach((resolve) => resolve());
  };

  const tick = () => {
    timer = null;
    if (queue.length === 0) return settle();
    const n = charsPerTick(queue.length);
    onText(queue.slice(0, n).join(''));
    queue = queue.slice(n);
    timer = setTimeout(tick, tickMs);
  };

  return {
    push(text) {
      if (!text) return;
      queue.push(...Array.from(text));
      timer ??= setTimeout(tick, tickMs);
    },
    drained() {
      if (queue.length === 0 && timer === null) return Promise.resolve();
      return new Promise((resolve) => waiters.push(resolve));
    },
    flush() {
      if (timer) clearTimeout(timer);
      timer = null;
      if (queue.length) onText(queue.join(''));
      queue = [];
      settle();
    },
    cancel() {
      if (timer) clearTimeout(timer);
      timer = null;
      queue = [];
      settle();
    },
  };
}
