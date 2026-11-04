'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState, Skeleton } from '@/components/ui/states';
import { api, errorMessage } from '@/lib/api';
import { scheduleLabel, won } from '@/lib/format';

interface PublicClass {
  id: number;
  name: string;
  teacherId: number;
  teacherName: string;
  monthlyFee: number;
  remaining: number;
  schedules: { weekday: number; startTime: string; endTime: string }[];
}

/** 첫 화면 개설 반 목록 — 요일·시간·강사·월 수강료·남은 자리 (결정17) */
export function ClassList() {
  const [classes, setClasses] = useState<PublicClass[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<PublicClass[]>('/public/classes')
      .then(setClasses)
      .catch((reason: unknown) => setError(errorMessage(reason)));
  }, []);

  if (error) return <EmptyState message={error} />;
  if (!classes) {
    return (
      <div className="flex flex-col gap-3">
        {[0, 1, 2].map((key) => (
          <Skeleton key={key} className="h-14" />
        ))}
      </div>
    );
  }
  if (classes.length === 0) return <EmptyState message="지금 열린 반이 없어요." />;

  return (
    <ul className="flex flex-col divide-y divide-line">
      {classes.map((cls) => (
        <li key={cls.id} className="flex min-h-16 items-center gap-3 py-3">
          <div className="flex flex-1 flex-col gap-0.5">
            <span className="text-body font-bold">{cls.name}</span>
            <span className="text-meta text-muted">
              {scheduleLabel(cls.schedules)} ·{' '}
              <Link href={`/teachers#t-${cls.teacherId}`} className="underline decoration-line2 underline-offset-2 hover:text-fg">
                {cls.teacherName}
              </Link>
            </span>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-body-sm tabular-nums">월 {won(cls.monthlyFee)}원</span>
            {cls.remaining > 0 ? (
              <span className="text-meta text-ok">남은 자리 {cls.remaining}</span>
            ) : (
              <StatusBadge status="마감" tone="gray" />
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
