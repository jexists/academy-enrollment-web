// 서버에서만 쓴다 (node:fs). 빌드할 때 읽어 정적 화면으로 만든다
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { marked } from 'marked';

/** 학원 안내 문서 원본 (웹 화면·PDF·Dify 지식이 모두 이 파일을 쓴다) */
const DIR = join(process.cwd(), 'content', 'guide');

/** 01~04는 규정(약관), 05~10은 안내 */
export type GuideGroup = '규정' | '안내';

export interface GuideArticle {
  /** 앵커 id — a-1, a-2 … (FAQ는 q-1 …) */
  id: string;
  title: string;
  html: string;
}

export interface GuideDoc {
  slug: string;
  order: number;
  group: GuideGroup;
  title: string;
  /** "시행일 … · 대상: …" */
  meta: string;
  summary: string;
  articles: GuideArticle[];
}

/** "관련 말:" 줄은 검색(RAG)용이라 화면에서는 뺀다 */
const KEYWORD_LINE = /^관련 말:.*$/gm;

function parse(file: string): GuideDoc {
  const match = file.match(/^(\d+)-(.+)\.md$/);
  if (!match) throw new Error(`학원 안내 파일 이름이 맞지 않아요: ${file}`);
  const order = Number(match[1]);
  const raw = readFileSync(join(DIR, file), 'utf8').replace(/\r\n?/g, '\n');
  const [head, ...sections] = raw.split(/^## /m);
  const headLines = head.split('\n').map((l) => l.trim()).filter(Boolean);
  const title = headLines[0].replace(/^#\s*/, '');
  const meta = headLines[1] ?? '';
  const summary = headLines.slice(2).join(' ');
  const faq = sections.every((s) => s.startsWith('Q.'));
  const articles = sections.map((section, index) => {
    const [titleLine, ...body] = section.split('\n');
    return {
      id: `${faq ? 'q' : 'a'}-${index + 1}`,
      title: titleLine.trim(),
      html: marked.parse(body.join('\n').replace(KEYWORD_LINE, '').trim(), { async: false }),
    };
  });
  return { slug: match[2], order, group: order <= 4 ? '규정' : '안내', title, meta, summary, articles };
}

let cache: GuideDoc[] | null = null;

export function guideDocs(): GuideDoc[] {
  cache ??= readdirSync(DIR)
    .filter((f) => f.endsWith('.md'))
    .sort()
    .map(parse);
  return cache;
}

export function guideDoc(slug: string): GuideDoc | undefined {
  return guideDocs().find((doc) => doc.slug === slug);
}
