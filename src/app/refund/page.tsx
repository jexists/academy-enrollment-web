import type { Metadata } from 'next';
import { Suspense } from 'react';
import { RefundScreen } from '@/features/parent/RefundScreen';
import { ParentShell } from '@/features/parent/ParentShell';

export const metadata: Metadata = { title: '환불 신청' };
export const instant = false;

export default function Page() {
  return (
    <ParentShell>
      <Suspense>
        <RefundScreen />
      </Suspense>
    </ParentShell>
  );
}
