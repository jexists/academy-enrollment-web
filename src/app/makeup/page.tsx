import type { Metadata } from 'next';
import { MakeupScreen } from '@/features/parent/MakeupScreen';
import { ParentShell } from '@/features/parent/ParentShell';

export const metadata: Metadata = { title: '보강 신청' };
export const instant = false;

export default function Page() {
  return (
    <ParentShell>
      <MakeupScreen />
    </ParentShell>
  );
}
