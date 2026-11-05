'use client';

import { useId } from 'react';
import { Panel } from '@/components/ui/Panel';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState, Skeleton } from '@/components/ui/states';
import { cn } from '@/lib/cn';
import { useApi } from '@/lib/use-api';

interface Score {
  id: number;
  examName: string;
  examDate: string;
  score: number;
  diff: number | null;
}

interface Scores {
  scores: Score[];
  average: number | null;
  latest: { score: number; examName: string; examDate: string } | null;
}

/** 2026-10-20 → 10/20 */
const shortDate = (iso: string) => `${Number(iso.slice(5, 7))}/${Number(iso.slice(8, 10))}`;

/** 성적 (D16) — 학부모 자녀 성적 탭, 학생 내 성적이 같이 쓴다. 최근 시험 카드 + 추이 그래프 + 시험 기록 (와이어프레임 s-scores) */
export function ScoresView({ path }: { path: string }) {
  const { data } = useApi<Scores>(path);
  if (!data) return <Skeleton className="h-96" />;
  if (data.scores.length === 0) return <EmptyState message="아직 성적이 없어요." />;

  const ordered = [...data.scores].reverse(); // 오래된 시험 → 최근 시험
  const first = ordered[0];
  const last = ordered[ordered.length - 1];
  const total = last.score - first.score;

  return (
    <div className="flex flex-col gap-8">
      <LatestCard latest={last} count={ordered.length} total={total} />

      <section className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <h2 className="text-sec">성적 추이</h2>
          {data.average !== null && (
            <span className="text-meta text-subtle tabular-nums">
              {ordered.length}회 평균 {data.average}점
            </span>
          )}
        </div>
        <Panel>
          <TrendChart scores={ordered} />
        </Panel>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sec">시험 기록</h2>
        <Panel padded={false} className="overflow-hidden">
          <div className="grid grid-cols-[1fr_4rem_4rem] items-center bg-s1 px-5 h-10 text-meta text-muted">
            <span>시험</span>
            <span className="text-center">날짜</span>
            <span className="text-right">점수</span>
          </div>
          <ul className="divide-y divide-line">
            {data.scores.map((s, i) => (
              <li key={s.id} className="grid min-h-14 grid-cols-[1fr_4rem_4rem] items-center px-5 text-body">
                <span className="flex min-w-0 items-center gap-2">
                  <span className="truncate font-medium">{s.examName}</span>
                  {i === 0 && <span className="rounded-full bg-primary-c px-2 text-badge text-primary">최신</span>}
                </span>
                <span className="text-center text-body-sm text-subtle tabular-nums">{shortDate(s.examDate)}</span>
                <span className={cn('text-right font-bold tabular-nums', i === 0 && 'text-primary')}>{s.score}점</span>
              </li>
            ))}
          </ul>
        </Panel>
      </section>
    </div>
  );
}

/** 맨 위 카드: 최근 시험 이름·날짜, 큰 점수, 이전 시험 대비, 전체 흐름 한 줄 */
function LatestCard({ latest, count, total }: { latest: Score; count: number; total: number }) {
  const diff = latest.diff;
  const trend =
    count < 2
      ? null
      : total > 0
        ? `최근 ${count}회 시험에서 ${total}점 올랐어요.`
        : total < 0
          ? `최근 ${count}회 시험에서 ${-total}점 내려갔어요.`
          : `최근 ${count}회 시험 점수가 같아요.`;

  return (
    <Panel>
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex h-7 items-center rounded-full bg-primary-c px-3 text-body-sm font-bold text-primary">
          {latest.examName}
        </span>
        <span className="text-meta text-subtle tabular-nums">{shortDate(latest.examDate)} 시험</span>
      </div>
      <div className="mt-4 flex flex-wrap items-end gap-x-3 gap-y-2">
        {/* 화면의 주인공 숫자 — 와이어프레임 크기를 따른다 */}
        <p className="flex items-baseline font-bold tabular-nums leading-none">
          <span className="text-[3rem] tracking-tight">{latest.score}</span>
          <span className="ml-0.5 text-page">점</span>
        </p>
        {diff !== null && (
          <StatusBadge
            className="mb-1"
            tone={diff > 0 ? 'ok' : diff < 0 ? 'err' : 'gray'}
            status={diff === 0 ? '이전 시험과 같아요' : `이전 시험 대비 ${diff > 0 ? '+' : ''}${diff}점`}
          />
        )}
      </div>
      {trend && <p className="mt-5 border-t border-line pt-4 text-body-sm text-muted">{trend}</p>}
    </Panel>
  );
}

const W = 320;
const H = 150;
const TOP = 30; // 점수 글자 자리
const BOTTOM = 12;

/** 꺾은선 그래프. 세로 범위를 점수에 맞춰 잡아 작은 변화도 보이게 한다. */
function TrendChart({ scores }: { scores: Score[] }) {
  const gradientId = useId();
  const values = scores.map((s) => s.score);
  const lo = Math.max(0, Math.floor((Math.min(...values) - 10) / 10) * 10);
  const hi = Math.min(100, Math.max(lo + 20, Math.ceil((Math.max(...values) + 5) / 10) * 10));
  const n = scores.length;
  const x = (i: number) => (W * (i + 0.5)) / n;
  const y = (v: number) => TOP + (1 - (v - lo) / (hi - lo)) * (H - TOP - BOTTOM);
  const points = scores.map((s, i) => `${x(i)},${y(s.score)}`).join(' ');
  const base = H - BOTTOM;
  const area = `${x(0)},${base} ${points} ${x(n - 1)},${base}`;

  return (
    <figure aria-label={`점수 흐름: ${scores.map((s) => `${s.examName} ${s.score}점`).join(', ')}`}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full overflow-visible" aria-hidden>
        <defs>
          <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.18" />
            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 0.5, 1].map((t) => (
          <line
            key={t}
            x1={0}
            x2={W}
            y1={TOP + t * (H - TOP - BOTTOM)}
            y2={TOP + t * (H - TOP - BOTTOM)}
            stroke="var(--color-line2)"
            strokeDasharray="3 4"
          />
        ))}
        {n > 1 && (
          <>
            <polygon points={area} fill={`url(#${gradientId})`} />
            <polyline
              points={points}
              fill="none"
              stroke="var(--color-primary)"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </>
        )}
        {scores.map((s, i) => {
          const isLast = i === n - 1;
          return (
            <g key={s.id}>
              <circle
                cx={x(i)}
                cy={y(s.score)}
                r={isLast ? 5.5 : 4.5}
                fill={isLast ? 'var(--color-primary)' : 'var(--color-canvas)'}
                stroke="var(--color-primary)"
                strokeWidth={2.5}
              />
              <text
                x={x(i)}
                y={y(s.score) - 12}
                textAnchor="middle"
                fontSize={isLast ? 13 : 11.5}
                fontWeight={700}
                fill={isLast ? 'var(--color-primary)' : 'var(--color-fg)'}
                className="tabular-nums"
              >
                {s.score}점
              </text>
            </g>
          );
        })}
      </svg>
      <figcaption
        className="mt-2 grid border-t border-line pt-3 text-meta"
        style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}
      >
        {scores.map((s, i) => (
          <span key={s.id} className={cn('truncate text-center', i === n - 1 ? 'font-bold text-primary' : 'text-subtle')}>
            {s.examName}
          </span>
        ))}
      </figcaption>
    </figure>
  );
}
