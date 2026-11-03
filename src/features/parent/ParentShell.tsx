'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { Icon } from '@/components/ui/Icon';
import { RequireAuth } from '@/features/auth/RequireAuth';
import { SignedInHeader } from '@/features/auth/SignedInHeader';
import { cn } from '@/lib/cn';

const TABS = [
  { href: '/home', label: '홈', icon: 'home' },
  { href: '/enrollments', label: '신청', icon: 'apply', also: ['/enroll', '/refund', '/makeup'] },
  { href: '/payments', label: '결제', icon: 'card' },
  { href: '/account', label: '내 정보', icon: 'user' },
];

/** 학부모 공통 틀: 가운데 480 + 하단 탭(640 이상이면 위쪽 메뉴) — components.md AppShell core-parent */
export function ParentShell({ children }: { children: ReactNode }) {
  return (
    <RequireAuth roles={['PARENT']}>
      <div className="mx-auto flex min-h-full w-full max-w-[480px] flex-col px-4 pb-24 sm:pb-10">
        <SignedInHeader />
        <TabNav className="mb-4 hidden sm:flex" />
        <main className="flex flex-col gap-6">{children}</main>
      </div>
      <TabNav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-canvas sm:hidden" bottom />
    </RequireAuth>
  );
}

function TabNav({ className, bottom }: { className?: string; bottom?: boolean }) {
  const pathname = usePathname();
  return (
    <nav className={cn('flex', className)} aria-label="학부모 메뉴">
      <div className={cn('mx-auto flex w-full max-w-[480px]', bottom ? 'h-16' : 'gap-1')}>
        {TABS.map((tab) => {
          const active = pathname === tab.href || tab.also?.some((p) => pathname.startsWith(p));
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex items-center justify-center',
                bottom ? 'flex-1 flex-col gap-0.5 text-[11px]' : 'h-9 gap-1.5 rounded-control px-3 text-body-sm',
                active ? 'font-bold text-primary' : 'text-subtle hover:text-fg',
                !bottom && active && 'bg-primary-c',
              )}
            >
              <Icon name={tab.icon} className={bottom ? 'size-6' : 'size-4'} />
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
