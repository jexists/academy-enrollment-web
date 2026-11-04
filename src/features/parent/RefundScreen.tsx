'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { EmptyState, Skeleton } from '@/components/ui/states';
import { errorMessage } from '@/lib/api';
import { cn } from '@/lib/cn';
import { scheduleLabel, won } from '@/lib/format';
import { useApi, useMutate } from '@/lib/use-api';
import type { ParentEnrollment } from './types';

interface Preview {
  charged: number;
  amount: number;
  rule: string;
  totalSessions: number;
  passedSessions: number;
}

/** 환불 신청 — final/screens/c-refund. 오늘 그만두면 예상 환불액을 보여 주고, 확정은 학원이 (결정8·12, D20) */
export function RefundScreen() {
  const router = useRouter();
  const params = useSearchParams();
  const { data: enrollments } = useApi<ParentEnrollment[]>('/parent/enrollments');
  const active = enrollments?.filter((e) => e.status === '수강중') ?? [];
  const [picked, setPicked] = useState<number | null>(Number(params.get('enrollment')) || null);
  const enrollmentId = picked ?? active[0]?.id ?? null;
  const { data: preview } = useApi<Preview>(enrollmentId ? `/parent/enrollments/${enrollmentId}/refund-preview` : null);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const mutate = useMutate();
  const toast = useToast();

  if (!enrollments) return <Skeleton className="h-48" />;
  if (active.length === 0) return <EmptyState message="수강 중인 반이 없어요." />;
  const chosen = active.find((e) => e.id === enrollmentId);

  return (
    <>
      <h1 className="text-page">환불 신청</h1>
      {preview && (
        <section className="flex flex-col gap-1">
          <span className="text-meta text-muted">오늘 그만두면 예상 환불액</span>
          <span className="text-[1.75rem] font-bold tabular-nums">
            약 {won(preview.amount)}
            <span className="ml-0.5 text-body font-medium">원</span>
          </span>
          <span className="text-meta text-muted">
            지난 수업 {preview.passedSessions}회 / 이번 달 {preview.totalSessions}회 · {preview.rule}
          </span>
        </section>
      )}
      <section className="flex flex-col gap-1">
        <h2 className="text-sec">수강 중인 반</h2>
        <ul className="flex flex-col divide-y divide-line">
          {active.map((e) => (
            <li key={e.id}>
              <button type="button" onClick={() => setPicked(e.id)} className={cn('flex w-full flex-col px-2 py-3 text-left', e.id === enrollmentId ? 'bg-primary-c' : 'hover:bg-s1')}>
                <span className="text-body font-medium">
                  {e.studentName} · {e.className}
                </span>
                <span className="text-meta text-muted">
                  {scheduleLabel(e.schedules)} · 월 {won(e.monthlyFee)}원
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>
      <Button size="lg" block disabled={!chosen} onClick={() => setConfirming(true)}>
        환불 신청
      </Button>
      <p className="text-meta text-subtle">
        학원이 그만둔 날을 확인하면 환불액이 확정되고 수강이 끝나요. 지난 수업에는 결석한 수업도 포함하고 휴강은 세지 않아요.{' '}
        <Link href="/guide/fees#a-5" className="underline">
          환불 규정 보기
        </Link>
      </p>

      <Modal
        open={confirming}
        onClose={() => setConfirming(false)}
        title="환불을 신청할까요?"
        role="alertdialog"
        actions={
          <>
            <Button variant="secondary" onClick={() => setConfirming(false)}>
              닫기
            </Button>
            <Button
              variant="danger"
              loading={busy}
              onClick={async () => {
                if (!chosen) return;
                setBusy(true);
                try {
                  await mutate(`/parent/enrollments/${chosen.id}/refund-request`, 'POST');
                  toast.success('환불을 신청했어요');
                  router.replace('/payments');
                } catch (reason) {
                  toast.error(errorMessage(reason));
                  setBusy(false);
                }
              }}
            >
              환불 신청
            </Button>
          </>
        }
      >
        {chosen && `${chosen.studentName} · ${chosen.className}. 학원이 확인하면 수강이 끝나고 환불액이 확정돼요.`}
      </Modal>
    </>
  );
}
