'use client';

import { useState } from 'react';
import { FilterChips } from '@/components/ui/FilterChips';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState, Skeleton } from '@/components/ui/states';
import { won } from '@/lib/format';
import { useApi } from '@/lib/use-api';

interface Payments {
  month: string;
  dueTotal: number;
  due: { enrollmentId: number; studentName: string; className: string; listPrice: number; expectedDiscount: number; expectedCharge: number }[];
  paid: { id: number; yearMonth: string; studentName: string; className: string; discountType: string; discountAmount: number; paidAmount: number; paidAt: string }[];
  refunds: { id: number; status: string; studentName: string; className: string; endDate: string | null; refundAmount: number | null; estimate?: number }[];
}

type Filter = '전체' | '결제할 내역' | '결제 내역' | '환불 내역';

/** 결제 · 환불 — final/screens/c-payments. 결제할 내역(형제 할인 반영) · 낸 돈 · 환불 (결정19) */
export function PaymentsScreen() {
  const { data } = useApi<Payments>('/parent/payments');
  const [filter, setFilter] = useState<Filter>('전체');
  if (!data) return <Skeleton className="h-48" />;
  const show = (f: Filter) => filter === '전체' || filter === f;

  return (
    <>
      <h1 className="text-page">결제 · 환불</h1>
      <section className="flex flex-col gap-1">
        <span className="text-meta text-muted">{data.month.slice(5)}월 결제할 금액</span>
        <span className="text-[1.75rem] font-bold tabular-nums">
          {won(data.dueTotal)}
          <span className="ml-0.5 text-body font-medium">원</span>
          {data.dueTotal > 0 && <StatusBadge status="미납" className="ml-2 align-middle" />}
        </span>
        <span className="text-meta text-subtle">결제는 학원 데스크·계좌이체로 해 주세요. 확인되면 결제 내역에 보여요.</span>
      </section>
      <FilterChips options={(['전체', '결제할 내역', '결제 내역', '환불 내역'] as Filter[]).map((f) => ({ value: f, label: f }))} value={filter} onChange={setFilter} />

      {show('결제할 내역') && (
        <section className="flex flex-col gap-1">
          <h2 className="text-sec">결제할 내역</h2>
          {data.due.length === 0 ? (
            <p className="text-body-sm text-subtle">낼 돈이 없어요.</p>
          ) : (
            <ul className="flex flex-col divide-y divide-line">
              {data.due.map((d) => (
                <li key={d.enrollmentId} className="flex items-center gap-3 py-3">
                  <div className="flex flex-1 flex-col">
                    <span className="text-body font-medium">
                      {d.studentName} · {d.className}
                    </span>
                    <span className="text-meta text-muted">
                      정가 {won(d.listPrice)}
                      {d.expectedDiscount ? ` · 둘째 10% −${won(d.expectedDiscount)}` : ' · 할인 없음'}
                    </span>
                  </div>
                  <span className="font-bold tabular-nums">{won(d.expectedCharge)}원</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {show('환불 내역') && data.refunds.length > 0 && (
        <section className="flex flex-col gap-1">
          <h2 className="text-sec">환불 내역</h2>
          <ul className="flex flex-col divide-y divide-line">
            {data.refunds.map((r) => (
              <li key={r.id} className="flex items-center gap-3 py-3">
                <div className="flex flex-1 flex-col">
                  <span className="flex items-center gap-2 text-body font-medium">
                    <StatusBadge status={r.status === '환불요청' ? '환불요청' : '수강종료'} />
                    {r.studentName} · {r.className}
                  </span>
                  <span className="text-meta text-muted">{r.status === '환불요청' ? '학원 확인 후 확정 · 오늘 기준 예상액' : `${r.endDate} 그만둠 · 확정`}</span>
                </div>
                <span className="font-bold tabular-nums">{won(r.status === '환불요청' ? (r.estimate ?? 0) : (r.refundAmount ?? 0))}원</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {show('결제 내역') && (
        <section className="flex flex-col gap-1">
          <h2 className="text-sec">결제 내역</h2>
          {data.paid.length === 0 ? (
            <EmptyState message="결제 내역이 없어요." />
          ) : (
            <ul className="flex flex-col divide-y divide-line">
              {data.paid.map((p) => (
                <li key={p.id} className="flex items-center gap-3 py-3">
                  <div className="flex flex-1 flex-col">
                    <span className="text-body font-medium">
                      {p.yearMonth.slice(5)}월 · {p.studentName} · {p.className}
                    </span>
                    <span className="text-meta text-muted">
                      {p.paidAt} 납부{p.discountType !== '없음' ? ` · ${p.discountType} −${won(p.discountAmount)}` : ''}
                    </span>
                  </div>
                  <span className="tabular-nums">{won(p.paidAmount)}원</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </>
  );
}
