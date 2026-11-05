'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { MonthCalendar, type CalendarMark } from '@/components/ui/MonthCalendar';
import { Panel } from '@/components/ui/Panel';
import { Stat } from '@/components/ui/Stat';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState, Skeleton } from '@/components/ui/states';
import { useApi } from '@/lib/use-api';

export interface MonthAttendance {
  month: string;
  출석: number;
  지각: number;
  결석: number;
  makeups: number;
  total: number;
  convertedAbsence: number;
  rate: number | null;
  records: {
    date: string;
    startTime: string;
    className: string;
    status: '출석' | '지각' | '결석';
    attendType: '수강' | '보강';
    lateMinutes: number | null;
    kind: '정규' | '보충';
    makeupDate: string | null;
    makeupStatus: string | null;
  }[];
  canceled: { date: string; className: string; replacedOn: string | null }[];
}

const shift = (ym: string, d: number) => {
  const [y, m] = ym.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1 + d, 1)).toISOString().slice(0, 7);
};

/** 2026-11-04 → 11/4 (보강일이 11/04처럼 올 때도 같은 모양) */
const shortDate = (d: string) => {
  const [mm, dd] = d.slice(-5).split(/[-/]/).map(Number);
  return `${mm}/${dd}`;
};

/** 월 출석 기록 — 학생(내 출석)·학부모(자녀 요약 출석 탭)가 같이 쓴다. 지각 3번 = 결석 1번 (C13) */
export function AttendanceMonth({ path, initialMonth }: { path: (month: string) => string; initialMonth?: string }) {
  // 로그인 뒤에만 그려지는 곳이라 여기서 오늘을 읽는다 (미리 그리는 단계에서는 실행되지 않음)
  const [month, setMonth] = useState(() => initialMonth ?? new Date(Date.now() + 9 * 3600_000).toISOString().slice(0, 7));
  const { data } = useApi<MonthAttendance>(path(month));

  const marks: CalendarMark[] = [
    ...(data?.records ?? []).map((r) => ({
      date: r.date,
      label: r.attendType === '보강' ? '보강' : r.status,
      tone: (r.attendType === '보강' ? 'info' : r.status === '출석' ? 'ok' : r.status === '지각' ? 'warn' : 'err') as CalendarMark['tone'],
    })),
    ...(data?.canceled ?? []).map((c) => ({ date: c.date, label: '휴강', tone: 'gray' as const })),
  ];

  const title = `${Number(month.slice(5))}월`;

  return (
    <div className="flex flex-col gap-8">
      <Panel>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" aria-label="이전 달" onClick={() => setMonth(shift(month, -1))}>
            ‹
          </Button>
          <h2 className="text-sec tabular-nums">{month.replace('-', '년 ')}월</h2>
          <Button variant="ghost" size="sm" aria-label="다음 달" onClick={() => setMonth(shift(month, 1))}>
            ›
          </Button>
        </div>
        {!data ? (
          <Skeleton className="mt-4 h-20" />
        ) : (
          <div className="mt-4 grid grid-cols-3 gap-4 border-t border-line pt-4">
            <Stat label="출석률" value={data.rate === null ? '—' : `${data.rate}%`} sub={`수업 ${data.total}회`} />
            <Stat label="환산 결석" value={`${data.convertedAbsence}회`} sub={`결석 ${data.결석}, 지각 ${data.지각}`} />
            <Stat label="보강" value={`${data.makeups}회`} />
          </div>
        )}
      </Panel>
      {!data ? (
        <Skeleton className="h-64" />
      ) : (
        <>
          <Panel className="p-3">
            <MonthCalendar yearMonth={month} marks={marks} />
          </Panel>
          <section className="flex flex-col gap-3">
            <h2 className="text-sec">{title} 상세 기록</h2>
            {data.records.length === 0 && data.canceled.length === 0 ? (
              <Panel>
                <EmptyState message="이 달 출석 기록이 없어요." className="py-6" />
              </Panel>
            ) : (
              <Panel padded={false}>
                <ul className="flex flex-col divide-y divide-line">
                  {data.canceled.map((c) => (
                    <li key={`c-${c.date}`} className="flex min-h-14 items-center gap-3 px-5 text-body-sm">
                      <span className="w-14 tabular-nums text-muted">{shortDate(c.date)}</span>
                      <span className="flex-1">{c.className}</span>
                      <span className="text-meta text-subtle">{c.replacedOn ? `${shortDate(c.replacedOn)} 보충` : ''}</span>
                      <StatusBadge status="휴강" />
                    </li>
                  ))}
                  {data.records.map((r, i) => (
                    <li key={i} className="flex min-h-14 items-center gap-3 px-5 text-body-sm">
                      <span className="w-14 tabular-nums text-muted">{shortDate(r.date)}</span>
                      <span className="min-w-0 flex-1">
                        <span className="font-medium">{r.className}</span>
                        {r.kind === '보충' && <span className="ml-1 text-meta text-info">보충</span>}
                        {r.attendType === '보강' && <span className="ml-1 text-meta text-info">보강</span>}
                      </span>
                      <span className="text-meta text-subtle">
                        {r.status === '지각' && r.lateMinutes ? `${r.lateMinutes}분` : ''}
                        {r.status === '결석' && r.makeupDate ? `${shortDate(r.makeupDate)} 보강${r.makeupStatus === '신청' ? ' 신청' : ''}` : ''}
                      </span>
                      <StatusBadge status={r.status} />
                    </li>
                  ))}
                </ul>
              </Panel>
            )}
          </section>
        </>
      )}
    </div>
  );
}
