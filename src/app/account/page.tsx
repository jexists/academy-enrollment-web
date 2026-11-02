import type { Metadata } from 'next';
import { AccountScreen } from '@/features/parent/AccountScreen';
import { ParentShell } from '@/features/parent/ParentShell';

export const metadata: Metadata = { title: '내 정보' };
export const instant = false;

export default function Page() {
  return (
    <ParentShell>
      <AccountScreen />
    </ParentShell>
  );
}
