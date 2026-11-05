'use client';

import { ScoresView } from '@/features/parent/ScoresView';
import { StudentShell } from '@/features/student/StudentShell';

export default function MyScoresPage() {
  return (
    <StudentShell>
      <h1 className="text-page">성적</h1>
      <ScoresView path="/student/scores" />
      <p className="rounded-modal bg-info-c px-4 py-3 text-body-sm text-muted">
        성적은 학원 선생님이 입력해요. 궁금한 점은 담당 선생님께 물어봐 주세요.
      </p>
    </StudentShell>
  );
}
