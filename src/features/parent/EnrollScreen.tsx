'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useToast } from '@/components/ui/Toast';
import { EmptyState, Skeleton } from '@/components/ui/states';
import { errorMessage } from '@/lib/api';
import { scheduleLabel, won } from '@/lib/format';
import { useApi, useMutate } from '@/lib/use-api';
import { ChildChips } from './ChildChips';
import { NoFamily } from './NoFamily';
import type { Child, Slot } from './types';

interface ClassOption {
  id: number;
  name: string;
  teacherName: string;
  monthlyFee: number;
  capacity: number;
  enrolled: number;
  schedules: Slot[];
  myStatus: string | null;
  check: { code: string; message: string | null } | null;
}

/** 수강 신청 — final/screens/c-enroll. 자녀 학년에 맞는 반만, 안 되는 반은 비활성 + 이유 (components.md 1.6) */
export function EnrollScreen() {
  const { data: children } = useApi<Child[]>('/parent/children');
  const [picked, setPicked] = useState<number | null>(null);
  const childId = picked ?? children?.[0]?.id ?? null;
  const { data: classes, reload } = useApi<ClassOption[]>(childId ? `/parent/classes?studentId=${childId}` : null);
  const mutate = useMutate();
  const toast = useToast();
  const [busyId, setBusyId] = useState<number | null>(null);

  if (!children) return <Skeleton className="h-40" />;
  if (children.length === 0) return <NoFamily />;
  const child = children.find((c) => c.id === childId);

  return (
    <>
      <h1 className="text-page">수강 신청</h1>
      <ChildChips list={children} value={childId} onChange={setPicked} />
      <p className="text-meta text-subtle">{child?.name}({child?.gradeLabel})에게 맞는 반만 보여요.</p>
      {!classes ? (
        <Skeleton className="h-40" />
      ) : classes.length === 0 ? (
        <EmptyState message="지금 열린 같은 학년 반이 없어요." />
      ) : (
        <ul className="flex flex-col divide-y divide-line">
          {classes.map((cls) => {
            const blocked = cls.check?.message ?? null;
            return (
              <li key={cls.id} className="flex flex-col gap-2 py-4">
                <div className="flex items-start gap-3">
                  <div className="flex flex-1 flex-col gap-0.5">
                    <span className="flex items-center gap-2 text-body font-bold">
                      {cls.name}
                      {cls.myStatus && <StatusBadge status={cls.myStatus} />}
                    </span>
                    <span className="text-meta text-muted">
                      {scheduleLabel(cls.schedules)} · {cls.teacherName}
                    </span>
                    <span className="text-meta text-muted">
                      월 {won(cls.monthlyFee)}원 · {cls.enrolled}/{cls.capacity}명
                    </span>
                  </div>
                  {!cls.myStatus && (
                    <Button
                      size="sm"
                      variant={blocked ? 'secondary' : 'primary'}
                      disabled={!!blocked}
                      loading={busyId === cls.id}
                      onClick={async () => {
                        setBusyId(cls.id);
                        try {
                          await mutate('/parent/enrollments', 'POST', { studentId: childId, classId: cls.id });
                          toast.success('신청했어요');
                          reload();
                        } catch (reason) {
                          toast.error(errorMessage(reason));
                        } finally {
                          setBusyId(null);
                        }
                      }}
                    >
                      {cls.check?.code === '정원 초과' ? '마감' : '신청'}
                    </Button>
                  )}
                </div>
                {blocked && cls.check?.code !== '정원 초과' && <p className="text-meta text-err">{blocked}</p>}
              </li>
            );
          })}
        </ul>
      )}
      <p className="text-meta text-subtle">
        신청하면 학원에서 확인 후 승인해요. 승인 전에는 신청 내역에서 취소할 수 있어요. 전화(02-000-0000)로 신청해도 돼요.
      </p>
    </>
  );
}
