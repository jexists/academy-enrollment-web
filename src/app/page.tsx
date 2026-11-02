import { PageHeader } from '@/components/ui/PageHeader';
import { SetupCheck } from '@/features/setup/SetupCheck';

export default function HomePage() {
  return (
    <main className="mx-auto w-full max-w-[480px] px-4 pb-24">
      <PageHeader title="한빛수학 코어 웹" />
      <SetupCheck app="코어 웹" />
    </main>
  );
}
