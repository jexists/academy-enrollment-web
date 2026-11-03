'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button, ButtonLink } from '@/components/ui/Button';
import { FilterChips } from '@/components/ui/FilterChips';
import { Modal } from '@/components/ui/Modal';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useToast } from '@/components/ui/Toast';
import { EmptyState, Skeleton } from '@/components/ui/states';
import { errorMessage } from '@/lib/api';
import { scheduleLabel, won } from '@/lib/format';
import { useApi, useMutate } from '@/lib/use-api';
import type { ParentEnrollment } from './types';

const FILTERS = ['전체', '신청됨', '수강중', '환불요청', '끝남'] as const;
type Filter = (typeof FILTERS)[number];
const ENDED = ['수강종료', '거절', '취소'];

/** 신청 내역 — final/screens/c-enrollments. 승인 전엔 신청 취소, 수강 중엔 환불 신청 (결정8) */
export function EnrollmentsScreen() {
  const { data, reload } = useApi<ParentEnrollment[]>('/parent/enrollments');
  const [filter, setFilter] = useState<Filter>('전체');
  const [canceling, setCanceling] = useState<ParentEnrollment | null>(null);
  const [busy, setBusy] = useState(false);
  const mutate = useMutate();
  const toast = useToast();

  if (!data) return <Skeleton className="h-48" />;
  const rows = data.filter((e) =>
    filter === '전체' ? true : filter === '끝남' ? ENDED.includes(e.status) : e.status === filter,
  );
  const children = [...new Map(rows.map((e) => [e.studentId, e.studentName])).entries()];

  return (
    <>
      <div className="flex items-center">
        <h1 className="flex-1 text-page">신청 내역</h1>
        <ButtonLink href="/enroll" size="sm">
          수강 신청
        </ButtonLink>
      </div>
      <FilterChips options={FILTERS.map((f) => ({ value: f, label: f }))} value={filter} onChange={setFilter} />
      {rows.length === 0 && <EmptyState message="해당하는 신청이 없어요." />}
      {children.map(([studentId, name]) => (
        <section key={studentId} className="flex flex-col rounded-modal border border-line">
          <h2 className="flex items-center gap-2 border-b border-line px-4 py-3 text-sec">
            <span className="flex size-7 items-center justify-center rounded-full bg-primary-c text-meta font-bold text-primary">{name[1]}</span>
            {name}
            <span className="ml-auto text-meta font-normal text-subtle">{rows.filter((e) => e.studentId === studentId).length}건</span>
          </h2>
          <ul className="flex flex-col divide-y divide-line px-4">
            {rows
              .filter((e) => e.studentId === studentId)
              .map((e) => (
                <li key={e.id} className="flex items-center gap-3 py-3">
                  <div className="flex flex-1 flex-col gap-0.5">
                    <span className="flex items-center gap-2">
                      <StatusBadge status={e.status} />
                      <span className="text-body font-bold">{e.className}</span>
                      {e.byPhone && <StatusBadge status="전화 신청" />}
                    </span>
                    <span className="text-meta text-muted">
                      {scheduleLabel(e.schedules)} · 월 {won(e.monthlyFee)}원
                    </span>
                    <span className="text-meta text-subtle">
                      {e.status === '신청됨' && `${e.appliedOn} 신청 · 학원 확인 후 확정`}
                      {e.status === '수강중' && `${e.startDate}부터`}
                      {e.status === '환불요청' && '환불 요청 · 학원 확인 후 확정'}
                      {e.status === '수강종료' && `${e.endDate} 그만둠${e.refundAmount !== null ? ` · 환불 ${won(e.refundAmount)}원` : ''}`}
                      {e.status === '거절' && '학원에서 거절했어요'}
                      {e.status === '취소' && `${e.appliedOn} 신청 취소`}
                    </span>
                  </div>
                  {e.status === '신청됨' && (
                    <Button variant="secondary" size="sm" onClick={() => setCanceling(e)}>
                      신청 취소
                    </Button>
                  )}
                  {e.status === '수강중' && (
                    <Link href={`/refund?enrollment=${e.id}`} className="text-meta font-medium text-muted hover:text-fg">
                      환불 신청
                    </Link>
                  )}
                </li>
              ))}
          </ul>
        </section>
      ))}
      <p className="text-meta text-subtle">승인 전에는 신청 취소, 수강 중에는 환불 신청을 할 수 있어요. 전화로 신청하면 학원에서 대신 등록해 줘요.</p>

      <Modal
        open={canceling !== null}
        onClose={() => setCanceling(null)}
        title="신청을 취소할까요?"
        role="alertdialog"
        actions={
          <>
            <Button variant="secondary" onClick={() => setCanceling(null)}>
              닫기
            </Button>
            <Button
              variant="danger"
              loading={busy}
              onClick={async () => {
                if (!canceling) return;
                setBusy(true);
                try {
                  await mutate(`/parent/enrollments/${canceling.id}/cancel`, 'POST');
                  toast.success('취소했어요');
                  setCanceling(null);
                  reload();
                } catch (reason) {
                  toast.error(errorMessage(reason));
                } finally {
                  setBusy(false);
                }
              }}
            >
              신청 취소
            </Button>
          </>
        }
      >
        {canceling && `${canceling.studentName} · ${canceling.className}. 승인 전이라 바로 취소돼요.`}
      </Modal>
    </>
  );
}
