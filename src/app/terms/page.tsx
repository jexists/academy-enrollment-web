import type { Metadata } from 'next';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { PageHeader } from '@/components/ui/PageHeader';

export const metadata: Metadata = { title: '이용약관' };

const ARTICLES = [
  {
    id: 'fee',
    title: '제1조 (수강료)',
    body: '주 2회 반은 월 280,000원입니다. 형제가 함께 다니면 학원 등록순으로 둘째부터 10% 할인합니다. 수강료는 학원 데스크·계좌이체로 내고, 학원이 확인하면 결제 내역에 표시됩니다.',
  },
  {
    id: 'refund',
    title: '제2조 (환불)',
    body: '수업 시작 전 전액, 1/3이 지나기 전 2/3, 1/2이 지나기 전 1/2을 돌려드리고 그 뒤에는 환불하지 않습니다. 지난 수업에는 결석한 수업도 포함합니다. 휴강한 수업은 세지 않습니다.',
  },
  {
    id: 'makeup',
    title: '제3조 (보강)',
    body: '한 달 결석이 2회 이상이면 보강을 신청할 수 있고, 결석한 달 안에서만 같은 학년 다른 반 수업으로 잡을 수 있습니다. 학원이 확정하면 출석 기록과 스케줄에 보입니다.',
  },
  {
    id: 'counsel',
    title: '제4조 (상담)',
    body: '매월 마지막 주 토요일 10:00~13:00에 상담합니다. 전화(02-000-0000)로 예약합니다.',
  },
];

const REFUND_TABLE = [
  ['수업 시작 전', '전액'],
  ['1/3 지나기 전', '2/3'],
  ['1/2 지나기 전', '1/2'],
  ['1/2 지난 뒤', '없음'],
];

/** 이용약관 — final/screens/c-terms. 읽는 글이라 18/30 글자 */
export default function TermsPage() {
  return (
    <div className="mx-auto flex min-h-full w-full max-w-[480px] flex-col">
      <main className="flex flex-col gap-8 px-4 pb-12">
        <PageHeader title="이용약관" backHref="/" />
        <p className="text-meta text-subtle">한빛수학 학원 운영 규정 · 시행일 2026. 3. 1.</p>
        {ARTICLES.map((article) => (
          <section key={article.id} id={article.id} className="flex scroll-mt-4 flex-col gap-2">
            <h2 className="text-sec">{article.title}</h2>
            <p className="text-reading text-fg">{article.body}</p>
            {article.id === 'refund' && (
              <table className="mt-2 w-full text-body-sm">
                <tbody className="divide-y divide-line">
                  {REFUND_TABLE.map(([when, amount]) => (
                    <tr key={when} className="h-11">
                      <td className="text-muted">{when}</td>
                      <td className="text-right font-bold tabular-nums">{amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        ))}
      </main>
      <PublicFooter />
    </div>
  );
}
