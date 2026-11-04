import Link from 'next/link';

export function PublicFooter() {
  return (
    <footer className="mt-auto flex flex-col gap-1 border-t border-line px-4 py-6 text-meta text-subtle">
      <nav className="flex flex-wrap gap-x-3 gap-y-1">
        <Link href="/guide" className="hover:text-fg">
          학원 안내
        </Link>
        <Link href="/guide/terms" className="hover:text-fg">
          이용약관
        </Link>
        <Link href="/guide/fees#a-5" className="hover:text-fg">
          환불 규정
        </Link>
        <Link href="/guide/counsel" className="hover:text-fg">
          상담 안내
        </Link>
      </nav>
      <p>상담: 매월 마지막 주 토 10–13시 · 전화 02-000-0000</p>
      <p>© 한빛수학</p>
    </footer>
  );
}
