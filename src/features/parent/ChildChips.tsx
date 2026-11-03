'use client';

import { cn } from '@/lib/cn';
import type { Child } from './types';

/** 자녀 고르기 — 파이널 와이어프레임처럼 꽉 찬 두 칸, 고른 자녀는 주황 바탕 */
export function ChildChips({ list, value, onChange }: { list: Child[]; value: number | null; onChange: (id: number) => void }) {
  if (list.length <= 1) {
    const only = list[0];
    return only ? <p className="text-body-sm text-muted">{only.name} · {only.gradeLabel}</p> : null;
  }
  const picked = value ?? list[0].id;
  return (
    <div role="radiogroup" aria-label="자녀" className="flex rounded-control bg-s1 p-1">
      {list.map((c) => {
        const on = c.id === picked;
        return (
          <button
            key={c.id}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(c.id)}
            className={cn('h-10 flex-1 rounded-[6px] text-body-sm font-medium transition-colors', on ? 'bg-primary font-bold text-white' : 'text-muted hover:text-fg')}
          >
            {c.name} · {c.gradeLabel}
          </button>
        );
      })}
    </div>
  );
}
