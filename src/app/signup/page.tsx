import type { Metadata } from 'next';
import Link from 'next/link';
import { SignupForm } from '@/features/auth/SignupForm';

export const metadata: Metadata = { title: '회원가입' };
export const instant = false;

/** 학부모 회원가입 — final/screens/c-signup */
export default function SignupPage() {
  return (
    <main className="mx-auto flex w-full max-w-[400px] flex-col gap-8 px-4 py-10">
      <div className="flex flex-col gap-2">
        <Link href="/" className="text-sec text-primary">
          한빛수학
        </Link>
        <h1 className="text-page">학부모 회원가입</h1>
      </div>
      <SignupForm />
      <p className="text-meta text-subtle">
        이미 계정이 있으신가요?{' '}
        <Link href="/login" className="font-medium text-fg hover:underline">
          로그인
        </Link>
      </p>
    </main>
  );
}
