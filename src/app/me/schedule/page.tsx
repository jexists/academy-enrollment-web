'use client';

import { ScheduleScreen } from '@/features/student/ScheduleScreen';
import { StudentShell } from '@/features/student/StudentShell';

const today = () => new Date(Date.now() + 9 * 3600_000).toISOString().slice(0, 10);

export default function MySchedulePage() {
  return (
    <StudentShell>
      <h1 className="text-page">내 스케줄</h1>
      <ScheduleScreen path={(d) => `/student/schedule?date=${d}`} initialDate={today()} />
    </StudentShell>
  );
}
