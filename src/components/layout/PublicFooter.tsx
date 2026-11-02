import Link from 'next/link';

export function PublicFooter() {
  return (
    <footer className="mt-auto flex flex-col gap-1 border-t border-line px-4 py-6 text-meta text-subtle">
      <nav className="flex gap-3">
        <Link href="/terms" className="hover:text-fg">
          이용약관
        </Link>
        <Link href="/terms#refund" className="hover:text-fg">
          환불 규정
        </Link>
        <Link href="/terms#counsel" className="hover:text-fg">
          상담 안내
        </Link>
      </nav>
      <p>상담: 매월 마지막 주 토 10–13시 · 전화 02-000-0000</p>
      <p>© 한빛수학</p>
    </footer>
  );
}
