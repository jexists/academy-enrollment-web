'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { EmptyState, Skeleton } from '@/components/ui/states';
import { api, errorMessage } from '@/lib/api';
import { scheduleLabel } from '@/lib/format';

export interface PublicTeacher {
  id: number;
  name: string;
  subject: string;
  hiredAt: string;
  bio: string | null;
  career: string[];
  classes: {
    id: number;
    name: string;
    schedules: { weekday: number; startTime: string; endTime: string }[];
  }[];
}

/** 소개의 첫 문장 — 첫 화면 카드의 한 줄 소개 */
function firstSentence(bio: string | null): string | null {
  if (!bio) return null;
  const match = bio.match(/^.+?[.?。]|^.+$/);
  return match ? match[0].trim() : bio;
}

function useTeachers() {
  const [teachers, setTeachers] = useState<PublicTeacher[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    api<PublicTeacher[]>('/public/teachers')
      .then(setTeachers)
      .catch((reason: unknown) => setError(errorMessage(reason)));
  }, []);
  return { teachers, error };
}

function Avatar({ name, size }: { name: string; size: 'md' | 'lg' }) {
  return (
    <span
      aria-hidden
      className={
        size === 'lg'
          ? 'flex size-14 shrink-0 items-center justify-center rounded-full bg-primary-c text-sec text-primary'
          : 'flex size-11 shrink-0 items-center justify-center rounded-full bg-primary-c text-body font-bold text-primary'
      }
    >
      {name.slice(0, 1)}
    </span>
  );
}

function Loading({ height }: { height: string }) {
  return (
    <div className="flex flex-col gap-3">
      {[0, 1].map((key) => (
        <Skeleton key={key} className={height} />
      ))}
    </div>
  );
}

/** 첫 화면 "선생님 소개" — 이름·과목·한 줄 소개, 누르면 강사진 화면 */
export function TeacherPreview() {
  const { teachers, error } = useTeachers();
  if (error) return <EmptyState message={error} />;
  if (!teachers) return <Loading height="h-16" />;
  if (teachers.length === 0) return <EmptyState message="소개할 선생님이 아직 없어요." />;
  return (
    <ul className="flex flex-col divide-y divide-line">
      {teachers.map((t) => (
        <li key={t.id}>
          <Link href={`/teachers#t-${t.id}`} className="flex min-h-16 items-center gap-3 py-3 hover:bg-s1">
            <Avatar name={t.name} size="md" />
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="text-body font-bold">
                {t.name} <span className="text-meta font-normal text-muted">· {t.subject}</span>
              </span>
              <span className="truncate text-meta text-muted">{firstSentence(t.bio) ?? t.classes.map((c) => c.name).join(', ')}</span>
            </div>
            <span className="text-sec text-subtle" aria-hidden>
              ›
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** 강사진 화면 — 소개·이력·담당 반 시간 (결정41) */
export function TeacherProfiles() {
  const { teachers, error } = useTeachers();
  if (error) return <EmptyState message={error} />;
  if (!teachers) return <Loading height="h-64" />;
  if (teachers.length === 0) return <EmptyState message="소개할 선생님이 아직 없어요." />;
  return (
    <div className="flex flex-col gap-4">
      {teachers.map((t) => (
        <article key={t.id} id={`t-${t.id}`} className="card flex scroll-mt-4 flex-col gap-5 p-5">
          <header className="flex items-center gap-4">
            <Avatar name={t.name} size="lg" />
            <div className="flex flex-col gap-1">
              <h2 className="text-sec">{t.name}</h2>
              <span className="w-fit rounded-full bg-s1 px-2.5 py-0.5 text-badge text-muted">{t.subject}</span>
            </div>
          </header>

          {t.bio && <p className="text-body text-fg">{t.bio}</p>}

          {t.career.length > 0 && (
            <section className="flex flex-col gap-2">
              <h3 className="text-meta font-medium text-subtle">이력</h3>
              <ul className="flex flex-col gap-1.5">
                {t.career.map((line) => (
                  <li key={line} className="flex gap-2 text-body-sm">
                    <span className="text-primary" aria-hidden>
                      ·
                    </span>
                    {line}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="flex flex-col gap-2">
            <h3 className="text-meta font-medium text-subtle">담당 반</h3>
            {t.classes.length === 0 ? (
              <p className="text-body-sm text-muted">지금 맡은 반이 없어요.</p>
            ) : (
              <ul className="flex flex-col divide-y divide-line">
                {t.classes.map((c) => (
                  <li key={c.id} className="flex min-h-11 items-center justify-between gap-3 py-2">
                    <span className="text-body-sm font-medium">{c.name}</span>
                    <span className="text-meta tabular-nums text-muted">{scheduleLabel(c.schedules)}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </article>
      ))}
    </div>
  );
}
