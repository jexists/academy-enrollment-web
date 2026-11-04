import type { Metadata } from 'next';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { PageHeader } from '@/components/ui/PageHeader';
import { TeacherProfiles } from '@/features/public/TeacherList';

export const metadata: Metadata = { title: '선생님 소개' };

/** 강사진 (로그인 없이) — 소개·이력·담당 반 (결정41) */
export default function TeachersPage() {
  return (
    <div className="mx-auto flex min-h-full w-full max-w-[480px] flex-col">
      <main className="flex flex-col gap-6 px-4 pb-12">
        <PageHeader title="선생님 소개" backHref="/" />
        <p className="text-body text-muted">
          한빛수학 선생님들은 한 반 8명까지만 맡아 한 명 한 명 풀이를 봐 드려요. 상담은 매월 마지막 주 토요일에 받아요.
        </p>
        <TeacherProfiles />
      </main>
      <PublicFooter />
    </div>
  );
}
