import type { Metadata } from 'next';
import { EnrollScreen } from '@/features/parent/EnrollScreen';
import { ParentShell } from '@/features/parent/ParentShell';

export const metadata: Metadata = { title: '수강 신청' };
export const instant = false;

export default function Page() {
  return (
    <ParentShell>
      <EnrollScreen />
    </ParentShell>
  );
}
