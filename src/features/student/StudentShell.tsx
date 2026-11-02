'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { RequireAuth } from '@/features/auth/RequireAuth';
import { SignedInHeader } from '@/features/auth/SignedInHeader';
import { cn } from '@/lib/cn';

const TABS = [
  { href: '/me/schedule', label: '내 스케줄' },
  { href: '/me/attendance', label: '출석 기록' },
  { href: '/me/scores', label: '성적' },
];

/** 학생 공통 틀: 보기만 (결정16). 하단 탭 3개, 640 이상이면 위쪽 메뉴 */
export function StudentShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const nav = (bottom: boolean) => (
    <nav aria-label="학생 메뉴" className={cn('flex', bottom ? 'fixed inset-x-0 bottom-0 z-40 h-16 border-t border-line bg-canvas sm:hidden' : 'mb-4 hidden gap-1 sm:flex')}>
      <div className="mx-auto flex w-full max-w-[480px]">
        {TABS.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? 'page' : undefined}
              className={cn('flex items-center justify-center text-body-sm', bottom ? 'flex-1' : 'h-9 rounded-control px-3', active ? 'font-bold text-fg' : 'text-subtle hover:text-fg', !bottom && active && 'bg-s1')}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
  return (
    <RequireAuth roles={['STUDENT']}>
      <div className="mx-auto flex min-h-full w-full max-w-[480px] flex-col px-4 pb-24 sm:pb-10">
        <SignedInHeader />
        {nav(false)}
        <main className="flex flex-col gap-6">{children}</main>
        <p className="mt-8 text-meta text-subtle">학생은 보기만 할 수 있어요. 신청·취소는 학부모님 계정에서 해요.</p>
      </div>
      {nav(true)}
    </RequireAuth>
  );
}
