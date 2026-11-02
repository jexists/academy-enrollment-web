import type { Metadata } from 'next';
import { PaymentsScreen } from '@/features/parent/PaymentsScreen';
import { ParentShell } from '@/features/parent/ParentShell';

export const metadata: Metadata = { title: '결제 · 환불' };
export const instant = false;

export default function Page() {
  return (
    <ParentShell>
      <PaymentsScreen />
    </ParentShell>
  );
}
