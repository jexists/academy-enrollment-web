'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ButtonLink } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
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
          <div className="flex flex-col gap-6">
            <section className="flex flex-col gap-3">
              <div className="flex items-end gap-2">
                <span className="text-meta text-muted">{Number(data.month.slice(5))}월 출석률</span>
                <Link href="#" onClick={(e) => { e.preventDefault(); setTab('attendance'); }} className="ml-auto text-meta text-subtle hover:text-fg">
                  전체 내역 ›
                </Link>
              </div>
              <span className="text-[2.25rem] font-bold leading-none tabular-nums">
                {data.attendance.rate === null ? '—' : data.attendance.rate}
                <span className="ml-0.5 text-sec">{data.attendance.rate === null ? '' : '%'}</span>
              </span>
              <div className="grid grid-cols-4 rounded-modal bg-s1 py-3 text-center">
                {[
                  ['결석', data.attendance.결석],
                  ['지각', data.attendance.지각],
                  ['환산 결석', `${data.attendance.convertedAbsence}회`],
                  ['보강', data.attendance.makeups],
                ].map(([label, value]) => (
                  <div key={label} className="flex flex-col gap-1 border-l border-line first:border-l-0">
                    <span className="text-meta text-muted">{label}</span>
                    <span className="text-sec tabular-nums">{value}</span>
                  </div>
                ))}
              </div>
            </section>

            {data.dueTotal > 0 && (
              <section className="flex flex-col gap-1 rounded-modal bg-primary-c p-4">
                <div className="flex items-center gap-2">
                  <span className="text-meta font-medium text-fg">{Number(data.month.slice(5))}월 결제할 금액</span>
                  <StatusBadge status="미납" />
                  <Link href="/payments" className="ml-auto text-meta font-medium text-primary">
                    결제 · 환불 ›
                  </Link>
                </div>
                <span className="text-[1.75rem] font-bold tabular-nums">
                  {won(data.dueTotal)}
                  <span className="ml-0.5 text-body font-medium">원</span>
                </span>
                <span className="text-meta text-muted">
                  {data.due.map((d) => `${d.studentName} ${won(d.charge)}${d.discount ? ' (둘째 10% 할인)' : ''}`).join(' + ')}
                </span>
                <span className="mt-1 text-meta text-subtle">결제는 학원 데스크·계좌이체로 해 주세요.</span>
              </section>
            )}

            {data.canRequestMakeup && (
              <section className="flex items-center gap-3 rounded-modal border border-line p-4">
                <div className="flex flex-1 flex-col">
                  <span className="text-body font-medium">보강을 신청할 수 있어요</span>
                  <span className="text-meta text-muted">이번 달 결석 {data.absencesInMonth}회 · 결석한 달 안에서만 잡을 수 있어요</span>
                </div>
                <ButtonLink href="/makeup" size="sm">
                  보강 신청
                </ButtonLink>
              </section>
            )}

            <section className="flex flex-col gap-2">
              <h2 className="text-sec">수강 중인 반</h2>
              {data.classes.length === 0 ? (
                <p className="text-body-sm text-subtle">다니는 반이 없어요.</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {data.classes.map((c) => (
                    <li key={c.name} className="flex items-center gap-3 rounded-modal border border-line px-4 py-3">
                      <div className="flex flex-1 flex-col gap-0.5">
                        <span className="flex items-center gap-2 text-body font-bold">
                          {c.name}
                          <span className="rounded bg-s1 px-1.5 text-badge text-muted">{c.teacherName}</span>
                        </span>
                        <span className="flex items-center gap-1 text-meta text-muted">
                          <Icon name="clock" className="size-3.5" />
                          {scheduleLabel(c.schedules)}
                        </span>
                      </div>
                      {c.status !== '수강중' && <StatusBadge status={c.status} />}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="flex flex-col gap-1">
              <h2 className="text-meta text-subtle">학원 서비스 바로가기</h2>
              <ul className="flex flex-col divide-y divide-line">
                {[
                  ['/enroll', 'calendar', '수강 신청'],
                  ['/enrollments', 'apply', '신청 내역'],
                  ['/makeup', 'repeat', '보강 신청'],
                ].map(([href, icon, label]) => (
                  <li key={href}>
                    <Link href={href} className="flex h-12 items-center gap-3 text-body hover:text-primary">
                      <Icon name={icon} className="text-subtle" />
                      <span className="flex-1">{label}</span>
                      <span className="text-subtle">›</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        ))}
    </>
  );
}
