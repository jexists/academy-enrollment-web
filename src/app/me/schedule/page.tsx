'use client';

import { ScheduleScreen } from '@/features/student/ScheduleScreen';
import { StudentShell } from '@/features/student/StudentShell';


export default function MySchedulePage() {
  return (
    <StudentShell>
      <h1 className="text-page">내 스케줄</h1>
      <ScheduleScreen path={(d) => `/student/schedule?date=${d}`} />
    </StudentShell>
  );
}
