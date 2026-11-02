import { EmptyState } from '@/components/ui/states';
import { RequireAuth } from '@/features/auth/RequireAuth';
import { SignedInHeader } from '@/features/auth/SignedInHeader';

export const instant = false;

export default function Page() {
  return (
    <RequireAuth roles={['PARENT']}>
      <main className="mx-auto w-full max-w-[480px] px-4 pb-24">
        <SignedInHeader />
        <h1 className="text-page">자녀 요약</h1>
        <EmptyState message="로그인했어요. 자녀 요약·수강 신청 화면은 3단계 다음 항목에서 붙여요." />
      </main>
    </RequireAuth>
  );
}
