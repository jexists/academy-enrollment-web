'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useToast } from '@/components/ui/Toast';
import { EmptyState, Skeleton } from '@/components/ui/states';
import { errorMessage } from '@/lib/api';
import { cn } from '@/lib/cn';
import { useApi, useMutate } from '@/lib/use-api';
import { ChildChips } from './ChildChips';
import { NoFamily } from './NoFamily';
import type { Child } from './types';

interface Options {
  absences: { id: number; date: string; className: string; startTime: string; makeupStatus: string | null }[];
  absencesInMonth: number;
  targets: { id: number; date: string; startTime: string; endTime: string; className: string; teacherName: string; capacity: number; headcount: number; problem: string | null }[];
  forAbsenceId: number | null;
}

/** 보강 신청 — final/screens/c-makeup. ① 결석한 수업 → ② 들어갈 수업(같은 학년·이번 달). 안 되는 수업은 비활성 + 이유 */
export function MakeupScreen() {
  const { data: children } = useApi<Child[]>('/parent/children');
  const [picked, setPicked] = useState<number | null>(null);
  const childId = picked ?? children?.[0]?.id ?? null;
  const { data, reload } = useApi<Options>(childId ? `/parent/makeups/options?studentId=${childId}` : null);
  const [target, setTarget] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const mutate = useMutate();
  const toast = useToast();

  if (!children) return <Skeleton className="h-40" />;
  if (children.length === 0) return <NoFamily />;
  const eligible = (data?.absencesInMonth ?? 0) >= 2;
  const absence = data?.absences.find((a) => a.id === data.forAbsenceId);

  return (
    <>
      <h1 className="text-page">보강 신청</h1>
      <ChildChips list={children} value={childId} onChange={(id) => { setPicked(id); setTarget(null); }} />
      {!data ? (
        <Skeleton className="h-40" />
      ) : (
        <>
          <section className="flex flex-col gap-2">
            <h2 className="text-sec">
              ① 결석한 수업 <span className="text-meta font-normal text-subtle">(이번 달 결석 {data.absencesInMonth}회)</span>
            </h2>
            {data.absences.length === 0 ? (
              <p className="text-body-sm text-subtle">이번 달 결석이 없어요.</p>
            ) : (
              <ul className="flex flex-col divide-y divide-line">
                {data.absences.map((a) => (
                  <li key={a.id} className={cn('flex min-h-12 items-center gap-3 text-body-sm', a.id === data.forAbsenceId && 'font-medium')}>
                    <span className="w-24 tabular-nums">{a.date.slice(5)} {a.startTime}</span>
                    <span className="flex-1">{a.className}</span>
                    {a.makeupStatus ? <StatusBadge status={a.makeupStatus === '확정' ? '보강 확정' : '보강 신청'} tone={a.makeupStatus === '확정' ? 'ok' : 'warn'} /> : <StatusBadge status="결석" />}
                  </li>
                ))}
              </ul>
            )}
          </section>

          {!eligible ? (
            <EmptyState message="이번 달 결석이 2회 미만이라 보강을 신청할 수 없어요." />
          ) : !absence ? (
            <EmptyState message="결석한 수업 모두 보강을 신청했어요." />
          ) : (
            <section className="flex flex-col gap-2">
              <h2 className="text-sec">
                ② 들어갈 수업 <span className="text-meta font-normal text-subtle">({absence.date.slice(5)} 결석분 · 같은 학년 · 이번 달 안)</span>
              </h2>
              {data.targets.length === 0 ? (
                <p className="text-body-sm text-subtle">들어갈 수 있는 수업이 없어요. 학원에 문의해 주세요.</p>
              ) : (
                <ul className="flex flex-col divide-y divide-line">
                  {data.targets.map((t) => (
                    <li key={t.id}>
                      <button
                        type="button"
                        disabled={!!t.problem}
                        onClick={() => setTarget(t.id)}
                        className={cn('flex w-full flex-col gap-0.5 px-2 py-3 text-left disabled:cursor-not-allowed', target === t.id ? 'bg-primary-c' : 'hover:bg-s1')}
                      >
                        <span className={cn('flex items-center gap-2 text-body', t.problem && 'text-subtle')}>
                          <span className="tabular-nums">{t.date.slice(5)} {t.startTime}</span>
                          <span className="font-bold">{t.className}</span>
                          <span className="ml-auto text-meta tabular-nums">{t.headcount}/{t.capacity}명</span>
                        </span>
                        <span className={cn('text-meta', t.problem ? 'text-err' : 'text-muted')}>{t.problem ?? t.teacherName}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <Button
                size="lg"
                block
                disabled={!target}
                loading={busy}
                onClick={async () => {
                  setBusy(true);
                  try {
                    await mutate('/parent/makeups', 'POST', { absenceAttendanceId: absence.id, targetSessionId: target });
                    toast.success('보강을 신청했어요');
                    setTarget(null);
                    reload();
                  } catch (reason) {
                    toast.error(errorMessage(reason));
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                보강 신청
              </Button>
            </section>
          )}
          <p className="text-meta text-subtle">학원이 확정하면 출석 기록과 스케줄에 보여요.</p>
        </>
      )}
    </>
  );
}
