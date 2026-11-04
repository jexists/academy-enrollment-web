import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { PageHeader } from '@/components/ui/PageHeader';
import { guideDoc, guideDocs } from '@/features/guide/load-guide';

export function generateStaticParams() {
  return guideDocs().map((doc) => ({ slug: doc.slug }));
}

export async function generateMetadata({ params }: PageProps<'/guide/[slug]'>): Promise<Metadata> {
  const { slug } = await params;
  return { title: guideDoc(slug)?.title ?? '학원 안내' };
}

/** 학원 안내 문서 한 개 — 위에 조 목차, 아래 본문. 읽는 글이라 18/30 글자 */
export default async function GuideDocPage({ params }: PageProps<'/guide/[slug]'>) {
  const { slug } = await params;
  const doc = guideDoc(slug);
  if (!doc) notFound();
  const docs = guideDocs();
  const index = docs.findIndex((d) => d.slug === doc.slug);
  const [prev, next] = [docs[index - 1], docs[index + 1]];
  const isFaq = doc.articles[0]?.id.startsWith('q');

  return (
    <div className="mx-auto flex min-h-full w-full max-w-[480px] flex-col">
      <main className="flex flex-col gap-8 px-4 pb-12">
        <div className="flex flex-col gap-2">
          <PageHeader title={doc.title} backHref="/guide" />
          <p className="text-meta text-subtle">
            한빛수학 {doc.group} · {doc.meta}
          </p>
          <p className="text-body text-muted">{doc.summary}</p>
        </div>

        <nav aria-label="목차" className="card flex flex-col gap-1">
          <p className="mb-1 text-meta font-medium text-subtle">{isFaq ? `질문 ${doc.articles.length}개` : '목차'}</p>
          {doc.articles.map((a) => (
            <a key={a.id} href={`#${a.id}`} className="py-1 text-body-sm text-muted hover:text-fg">
              {a.title}
            </a>
          ))}
        </nav>

        {doc.articles.map((a) => (
          <section key={a.id} id={a.id} className="flex scroll-mt-4 flex-col gap-3">
            <h2 className="text-sec">{a.title}</h2>
            {/* 원본은 저장소의 content/guide 마크다운(직접 쓴 글)이라 그대로 넣는다 */}
            <div className="guide-prose" dangerouslySetInnerHTML={{ __html: a.html }} />
          </section>
        ))}

        <nav className="flex justify-between gap-3 border-t border-line pt-6 text-body-sm">
          {prev ? (
            <Link href={`/guide/${prev.slug}`} className="text-muted hover:text-fg">
              ‹ {prev.title}
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link href={`/guide/${next.slug}`} className="text-right text-muted hover:text-fg">
              {next.title} ›
            </Link>
          )}
        </nav>
      </main>
      <PublicFooter />
    </div>
  );
}
