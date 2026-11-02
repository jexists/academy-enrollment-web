import type { Metadata } from 'next';
import { HomeScreen } from '@/features/parent/HomeScreen';
import { ParentShell } from '@/features/parent/ParentShell';

export const metadata: Metadata = { title: '자녀 요약' };
export const instant = false;

export default function HomePage() {
  return (
    <ParentShell>
      <HomeScreen />
    </ParentShell>
  );
}
