import { EmptyState } from '@/components/ui/states';
import { RequireAuth } from '@/features/auth/RequireAuth';
import { SignedInHeader } from '@/features/auth/SignedInHeader';

export const instant = false;

export default function Page() {
  return (
    <RequireAuth roles={['STUDENT']}>
      <main className="mx-auto w-full max-w-[480px] px-4 pb-24">
        <SignedInHeader />
        <h1 className="text-page">내 스케줄</h1>
        <EmptyState message="로그인했어요. 내 스케줄·출석 기록은 3단계 수업일·출결 항목에서 붙여요." />
      </main>
    </RequireAuth>
  );
}
