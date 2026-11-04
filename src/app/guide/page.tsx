import type { Metadata } from 'next';
import Link from 'next/link';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { PageHeader } from '@/components/ui/PageHeader';
import { guideDocs, type GuideGroup } from '@/features/guide/load-guide';

export const metadata: Metadata = { title: '학원 안내' };

const GROUPS: { group: GuideGroup; title: string; desc: string }[] = [
  { group: '규정', title: '이용약관과 규정', desc: '학원과 학부모 사이의 약속이에요.' },
  { group: '안내', title: '학원 안내', desc: '시간표, 선생님, 상담, 웹 사용법이에요.' },
];

/** 학원 안내 목록 (로그인 없이) — 이용약관은 이 안의 규정 묶음 */
export default function GuidePage() {
  const docs = guideDocs();
  return (
    <div className="mx-auto flex min-h-full w-full max-w-[480px] flex-col">
      <main className="flex flex-col gap-8 px-4 pb-12">
        <PageHeader title="학원 안내" backHref="/" />
        <p className="-mt-4 text-body text-muted">
          한빛수학 이용약관과 수강료·환불, 출결·보강, 시간표, 상담 방법을 정리했어요. 궁금한 점은 오른쪽 아래 문의하기로
          물어볼 수도 있어요.
        </p>
        {GROUPS.map(({ group, title, desc }) => (
          <section key={group} className="flex flex-col gap-2">
            <h2 className="text-sec">{title}</h2>
            <p className="text-meta text-subtle">{desc}</p>
            <ul className="card flex flex-col divide-y divide-line py-1!">
              {docs
                .filter((doc) => doc.group === group)
                .map((doc) => (
                  <li key={doc.slug}>
                    <Link href={`/guide/${doc.slug}`} className="flex min-h-16 items-center gap-3 py-3 hover:opacity-80">
                      <div className="flex flex-1 flex-col gap-0.5">
                        <span className="text-body font-medium">{doc.title}</span>
                        <span className="text-meta text-muted">{doc.summary}</span>
                      </div>
                      <span className="text-sec text-subtle" aria-hidden>
                        ›
                      </span>
                    </Link>
                  </li>
                ))}
            </ul>
          </section>
        ))}
      </main>
      <PublicFooter />
    </div>
  );
}
