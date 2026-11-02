'use client';

import { AttendanceMonth } from '@/features/attendance/AttendanceMonth';
import { StudentShell } from '@/features/student/StudentShell';

const thisMonth = () => new Date(Date.now() + 9 * 3600_000).toISOString().slice(0, 7);

export default function MyAttendancePage() {
  return (
    <StudentShell>
      <h1 className="text-page">출석 기록</h1>
      <AttendanceMonth path={(m) => `/student/attendance?month=${m}`} initialMonth={thisMonth()} />
      <p className="text-meta text-subtle">출석은 선생님이 체크해요. 기록이 이상하면 담당 선생님께 말씀해 주세요.</p>
    </StudentShell>
  );
}
