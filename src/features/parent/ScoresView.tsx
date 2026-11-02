'use client';

import { Stat } from '@/components/ui/Stat';
import { EmptyState, Skeleton } from '@/components/ui/states';
import { useApi } from '@/lib/use-api';

interface Scores {
  scores: { id: number; examName: string; examDate: string; score: number; diff: number | null }[];
  average: number | null;
  latest: { score: number; examName: string; examDate: string } | null;
}

/** 성적 (D16) — 학부모 자녀 요약 성적 탭, 학생 내 성적이 같이 쓴다. 최근·평균·변화 + 막대 + 시험별 */
export function ScoresView({ path }: { path: string }) {
  const { data } = useApi<Scores>(path);
  if (!data) return <Skeleton className="h-48" />;
  if (data.scores.length === 0) return <EmptyState message="아직 성적이 없어요." />;
  const ordered = [...data.scores].reverse();
  const first = ordered[0];
  const last = ordered[ordered.length - 1];
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-3 gap-4">
        <Stat label="최근" value={`${last.score}점`} sub={`${last.examDate.slice(5)} ${last.examName}`} />
        <Stat label="평균" value={`${data.average}점`} sub={`${data.scores.length}회`} />
        <Stat label="변화" value={`${last.score - first.score >= 0 ? '+' : ''}${last.score - first.score}`} sub={`${first.score} → ${last.score}`} />
      </div>
      <div className="flex h-36 items-end gap-3" aria-label="점수 흐름">
        {ordered.map((s) => (
          <div key={s.id} className="flex flex-1 flex-col items-center gap-1">
            <span className="text-meta tabular-nums">{s.score}</span>
            <span className="w-full max-w-10 rounded-t bg-primary" style={{ height: `${s.score}%` }} />
            <span className="truncate text-[11px] text-subtle">{s.examName}</span>
          </div>
        ))}
      </div>
      <ul className="flex flex-col divide-y divide-line">
        {data.scores.map((s) => (
          <li key={s.id} className="flex min-h-12 items-center gap-3 text-body-sm">
            <span className="flex-1 font-medium">{s.examName}</span>
            <span className="tabular-nums text-muted">{s.examDate.slice(5)}</span>
            <span className={`w-12 text-right text-meta ${s.diff === null ? 'text-subtle' : s.diff >= 0 ? 'text-ok' : 'text-err'}`}>
              {s.diff === null ? '—' : s.diff >= 0 ? `▲${s.diff}` : `▼${-s.diff}`}
            </span>
            <span className="w-12 text-right font-bold tabular-nums">{s.score}점</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
