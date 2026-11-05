"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState, Skeleton } from "@/components/ui/states";
import { useApi } from "@/lib/use-api";

interface Week {
  from: string;
  to: string;
  sessions: {
    id: number;
    date: string;
    startTime: string;
    endTime: string;
    status: string;
    kind: string;
    className: string;
    attendType: string;
    memo: string | null;
  }[];
}

const WEEKDAY = ["일", "월", "화", "수", "목", "금", "토"];
const addDays = (d: string, n: number) =>
  new Date(Date.parse(`${d}T00:00:00Z`) + n * 86400000)
    .toISOString()
    .slice(0, 10);
/** 2026-11-02 → 11/2 */
const shortDate = (d: string) =>
  `${Number(d.slice(5, 7))}/${Number(d.slice(8, 10))}`;

/** 내 스케줄 — final/screens/s-schedule. 주간, 정규·보강·휴강·보충 */
export function ScheduleScreen({
  path,
  initialDate,
}: {
  path: (date: string) => string;
  initialDate?: string;
}) {
  const [date, setDate] = useState(
    () =>
      initialDate ??
      new Date(Date.now() + 9 * 3600_000).toISOString().slice(0, 10),
  );
  const { data } = useApi<Week>(path(date));
  const days = data
    ? Array.from({ length: 7 }, (_, i) => addDays(data.from, i))
    : [];

  const count = data
    ? data.sessions.filter((s) => s.status === "정상").length
    : 0;

  return (
    <Panel padded={false}>
      <div className="flex items-center gap-1 border-b border-line px-3 py-3">
        <Button
          variant="ghost"
          size="sm"
          aria-label="지난주"
          onClick={() => setDate(addDays(date, -7))}
        >
          ‹
        </Button>
        <h2 className="text-sec tabular-nums">
          {data ? `${shortDate(data.from)} – ${shortDate(data.to)}` : "…"}
        </h2>
        <Button
          variant="ghost"
          size="sm"
          aria-label="다음 주"
          onClick={() => setDate(addDays(date, 7))}
        >
          ›
        </Button>
        {data && (
          <span className="ml-auto pr-2 text-meta text-muted">
            이번 주 수업 {count}회
          </span>
        )}
      </div>
      {!data ? (
        <Skeleton className="m-5 h-40" />
      ) : data.sessions.length === 0 ? (
        <EmptyState message="이 주에는 수업이 없어요." className="py-10" />
      ) : (
        <ul className="flex flex-col divide-y divide-line">
          {days
            .filter((d) => data.sessions.some((s) => s.date === d))
            .map((d) => (
              <li key={d} className="flex gap-4 px-5 py-4">
                <span className="w-12 shrink-0 text-body-sm">
                  <b>{WEEKDAY[new Date(`${d}T00:00:00Z`).getUTCDay()]}</b>
                  <span className="block text-meta tabular-nums text-subtle">
                    {shortDate(d)}
                  </span>
                </span>
                <ul className="flex flex-1 flex-col gap-2">
                  {data.sessions
                    .filter((s) => s.date === d)
                    .map((s) => (
                      <li
                        key={`${s.id}-${s.attendType}`}
                        className="flex items-center gap-2 text-body-sm"
                      >
                        <span className="w-24 tabular-nums text-muted">
                          {s.startTime}–{s.endTime}
                        </span>
                        <span
                          className={
                            s.status === "휴강"
                              ? "flex-1 text-subtle line-through"
                              : "flex-1 font-medium"
                          }
                        >
                          {s.className}
                        </span>
                        {s.status === "휴강" ? (
                          <StatusBadge status="휴강" />
                        ) : s.attendType === "보강" ? (
                          <StatusBadge status="보강" />
                        ) : s.kind === "보충" ? (
                          <StatusBadge status="보충" />
                        ) : null}
                      </li>
                    ))}
                </ul>
              </li>
            ))}
        </ul>
      )}
    </Panel>
  );
}
