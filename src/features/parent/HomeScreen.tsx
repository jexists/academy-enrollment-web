'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ButtonLink } from '@/components/ui/Button';
import { Stat } from '@/components/ui/Stat';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Tabs } from '@/components/ui/Tabs';
import { Skeleton } from '@/components/ui/states';
import { AttendanceMonth } from '@/features/attendance/AttendanceMonth';
import { scheduleLabel, won } from '@/lib/format';
import { useApi } from '@/lib/use-api';
import { ChildChips } from './ChildChips';
import { NoFamily } from './NoFamily';
import { ScoresView } from './ScoresView';
import type { Child, Slot } from './types';

interface Summary {
  month: string;
  attendance: { 출석: number; 지각: number; 결석: number; makeups: number; total: number; convertedAbsence: number; rate: number | null };
  classes: { name: string; status: string; teacherName: string; schedules: Slot[] }[];
  due: { studentName: string; className: string; charge: number; discount: number }[];
  dueTotal: number;
  canRequestMakeup: boolean;
  absencesInMonth: number;
}

/** 자녀 요약 (D19) — final/screens/c-home. 자녀 고르기 → 요약 · 출석 기록 · 성적 */
export function HomeScreen() {
  const { data: children } = useApi<Child[]>('/parent/children');
  const [picked, setPicked] = useState<number | null>(null);
  const [tab, setTab] = useState<'summary' | 'attendance' | 'scores'>('summary');
  const childId = picked ?? children?.[0]?.id ?? null;
  const { data } = useApi<Summary>(childId && tab === 'summary' ? `/parent/summary?studentId=${childId}` : null);

  if (!children) return <Skeleton className="h-48" />;
  if (children.length === 0) return <NoFamily />;

  return (
    <>
      <ChildChips list={children} value={childId} onChange={setPicked} />
      <Tabs
        tabs={[
          { value: 'summary', label: '요약' },
          { value: 'attendance', label: '출석 기록' },
          { value: 'scores', label: '성적' },
        ]}
        value={tab}
        onChange={setTab}
      />
      {tab === 'attendance' && childId && <AttendanceMonth key={childId} path={(m) => `/parent/attendance?studentId=${childId}&month=${m}`} />}
      {tab === 'scores' && childId && <ScoresView key={childId} path={`/parent/scores?studentId=${childId}`} />}
      {tab === 'summary' &&
        (!data ? (
          <Skeleton className="h-64" />
        ) : (
          <div className="flex flex-col gap-8">
            <section className="grid grid-cols-3 gap-4">
              <Stat label={`${Number(data.month.slice(5))}월 출석률`} value={data.attendance.rate === null ? '—' : `${data.attendance.rate}%`} sub={`수업 ${data.attendance.total}회`} />
              <Stat label="결석 · 지각" value={`${data.attendance.결석} · ${data.attendance.지각}`} sub={`환산 결석 ${data.attendance.convertedAbsence}회`} />
              <Stat label="보강" value={`${data.attendance.makeups}회`} />
            </section>

            {(data.dueTotal > 0 || data.canRequestMakeup) && (
              <section className="flex flex-col gap-1">
                <h2 className="text-sec">해야 할 일</h2>
                <ul className="flex flex-col divide-y divide-line">
                  {data.dueTotal > 0 && (
                    <li className="flex min-h-14 items-center gap-3">
                      <div className="flex flex-1 flex-col">
                        <span className="text-body font-medium">이번 달 결제할 금액 {won(data.dueTotal)}원</span>
                        <span className="text-meta text-muted">
                          {data.due.map((d) => `${d.studentName} ${won(d.charge)}${d.discount ? ' (둘째 10%)' : ''}`).join(' + ')}
                        </span>
                      </div>
                      <Link href="/payments" className="text-meta font-medium text-muted hover:text-fg">
                        결제 ›
                      </Link>
                    </li>
                  )}
                  {data.canRequestMakeup && (
                    <li className="flex min-h-14 items-center gap-3">
                      <div className="flex flex-1 flex-col">
                        <span className="text-body font-medium">보강을 신청할 수 있어요</span>
                        <span className="text-meta text-muted">이번 달 결석 {data.absencesInMonth}회 · 결석한 달 안에서만 잡을 수 있어요</span>
                      </div>
                      <ButtonLink href="/makeup" size="sm">
                        보강 신청
                      </ButtonLink>
                    </li>
                  )}
                </ul>
              </section>
            )}

            <section className="flex flex-col gap-1">
              <div className="flex items-center">
                <h2 className="flex-1 text-sec">수강 중인 반</h2>
                <Link href="/enroll" className="text-meta text-muted hover:text-fg">
                  수강 신청 ›
                </Link>
              </div>
              {data.classes.length === 0 ? (
                <p className="text-body-sm text-subtle">다니는 반이 없어요.</p>
              ) : (
                <ul className="flex flex-col divide-y divide-line">
                  {data.classes.map((c) => (
                    <li key={c.name} className="flex min-h-14 items-center gap-3">
                      <div className="flex flex-1 flex-col">
                        <span className="text-body font-medium">{c.name}</span>
                        <span className="text-meta text-muted">
                          {scheduleLabel(c.schedules)} · {c.teacherName}
                        </span>
                      </div>
                      {c.status !== '수강중' && <StatusBadge status={c.status} />}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        ))}
    </>
  );
}
