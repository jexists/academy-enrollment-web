import type { Metadata } from 'next';
import { EnrollmentsScreen } from '@/features/parent/EnrollmentsScreen';
import { ParentShell } from '@/features/parent/ParentShell';

export const metadata: Metadata = { title: '신청 내역' };
export const instant = false;

export default function Page() {
  return (
    <ParentShell>
      <EnrollmentsScreen />
    </ParentShell>
  );
}
