'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { ROLE_LABEL } from '@/lib/auth-storage';
import { useAuth } from './AuthProvider';

/** 로그인한 사람 이름과 로그아웃. 코어 웹 화면 맨 위 */
export function SignedInHeader() {
  const { session, signOut } = useAuth();
  const router = useRouter();
  const user = session?.user;
  return (
    <header className="flex h-14 items-center gap-2">
      <span className="flex-1 text-sec text-primary">한빛수학</span>
      {user && (
        <span className="text-meta text-muted">
          {user.name} {ROLE_LABEL[user.role]}
        </span>
      )}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          signOut();
          router.replace('/login');
        }}
      >
        로그아웃
      </Button>
    </header>
  );
}
