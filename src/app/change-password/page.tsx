import type { Metadata } from 'next';
import { ChangePasswordForm } from '@/features/auth/ChangePasswordForm';

export const metadata: Metadata = { title: '비밀번호 변경' };
export const instant = false;

/** 비밀번호 변경 (첫 로그인 강제 포함) — final/screens/s-pw */
export default function ChangePasswordPage() {
  return (
    <main className="mx-auto flex w-full max-w-[400px] flex-col gap-6 px-4 py-10">
      <div className="flex flex-col gap-2">
        <span className="text-sec text-primary">한빛수학</span>
        <h1 className="text-page">비밀번호 변경</h1>
      </div>
      <ChangePasswordForm />
    </main>
  );
}
