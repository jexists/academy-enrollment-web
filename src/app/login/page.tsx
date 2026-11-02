import type { Metadata } from 'next';
import Link from 'next/link';
import { LoginForm } from '@/features/auth/LoginForm';

export const metadata: Metadata = { title: '로그인' };
// 로그인 상태(localStorage)에 따라 화면이 바뀌어서 미리 그려 둘 수 없다
export const instant = false;

/** 학부모·학생 공용 로그인 — final/screens/c-login */
export default function LoginPage() {
  return (
    <main className="mx-auto flex w-full max-w-[400px] flex-col gap-8 px-4 py-10">
      <div className="flex flex-col gap-2">
        <Link href="/" className="text-sec text-primary">
          한빛수학
        </Link>
        <p className="text-meta text-subtle">학부모 · 학생 공용</p>
        <h1 className="text-page">로그인</h1>
      </div>
      <LoginForm />
      <div className="flex flex-col gap-1 text-meta text-subtle">
        <p>
          <Link href="/signup" className="font-medium text-fg hover:underline">
            회원가입
          </Link>
          {' · '}비밀번호를 잊었으면 학원에 문의해 주세요.
        </p>
        <p>학생 계정은 학원에서 만들어 드려요. 첫 로그인 때 비밀번호를 바꿔 주세요.</p>
      </div>
    </main>
  );
}
