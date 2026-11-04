import Link from 'next/link';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { ButtonLink } from '@/components/ui/Button';
import { ClassList } from '@/features/public/ClassList';
import { TeacherPreview } from '@/features/public/TeacherList';

const POINTS = [
  '학년별 반, 한 반 최대 8명',
  '결석하면 같은 학년 다른 반으로 보강',
  '출석·성적·결제를 학부모 화면에서 바로 확인',
];

/** 학원 안내로 가는 길 — 자주 찾는 문서 3개 + 전체 */
const GUIDE_LINKS: [string, string, string][] = [
  ['/guide/fees', '수강료 및 환불 규정', '월 수강료, 형제 할인, 환불 계산'],
  ['/guide/attendance', '출결 및 보강 규정', '지각·결석 기준, 보강 조건'],
  ['/guide/faq', '자주 묻는 질문', '등록, 환불, 보강, 상담'],
  ['/guide', '학원 안내 전체 보기', '이용약관, 개인정보, 시간표, 웹 사용법'],
];

/** 첫 화면 (로그인 없이) — final/screens/c-landing */
export default function LandingPage() {
  return (
    <div className="mx-auto flex min-h-full w-full max-w-[480px] flex-col">
      <header className="flex h-14 items-center justify-between px-4">
        <span className="text-sec text-primary">한빛수학</span>
        <Link href="/login" className="text-body-sm font-medium text-muted hover:text-fg">
          로그인
        </Link>
      </header>

      <main className="flex flex-col gap-12 px-4 pb-12 pt-6">
        <section className="flex flex-col gap-4">
          <p className="text-meta font-medium text-primary">중·고등 수학 전문</p>
          <h1 className="text-[1.75rem] font-bold leading-9">
            중1부터 고3까지,
            <br />
            학년별 소수 정예
          </h1>
          <p className="text-body text-muted">반마다 최대 8명 · 주 2회 · 결석하면 보강</p>
          <div className="mt-2 flex gap-2">
            <ButtonLink href="/signup" size="lg" className="flex-1">
              학부모 회원가입
            </ButtonLink>
            <ButtonLink href="/login" variant="secondary" size="lg" className="flex-1">
              로그인
            </ButtonLink>
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-sec">한빛수학 소개</h2>
          <p className="text-body text-muted">
            중·고등 수학을 학년별 소수 정예로 가르치는 동네 수학 학원이에요. 한 반 8명까지만 받아 한 명 한 명 풀이를 봐
            드려요.
          </p>
          <ul className="flex flex-col gap-1.5 text-body">
            {POINTS.map((point) => (
              <li key={point} className="flex gap-2">
                <span className="text-primary" aria-hidden>
                  ·
                </span>
                {point}
              </li>
            ))}
          </ul>
          <p className="text-meta text-subtle">수업 방식: 주 2회 2시간, 매월 마지막 주 토요일 학부모 상담</p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-sec">개설 반</h2>
          <ClassList />
          <p className="text-meta text-subtle">형제·자매가 함께 다니면 둘째부터 수강료 10% 할인돼요.</p>
        </section>

        <section className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sec">선생님 소개</h2>
            <Link href="/teachers" className="text-meta font-medium text-muted hover:text-fg">
              전체 보기 ›
            </Link>
          </div>
          <TeacherPreview />
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-sec">학원 안내</h2>
          <p className="text-body text-muted">수강료·환불, 출결·보강, 시간표, 상담 방법을 한곳에 정리했어요.</p>
          <ul className="flex flex-col divide-y divide-line">
            {GUIDE_LINKS.map(([href, label, desc]) => (
              <li key={href}>
                <Link href={href} className="flex min-h-14 items-center gap-3 py-3 hover:bg-s1">
                  <div className="flex flex-1 flex-col gap-0.5">
                    <span className="text-body font-medium">{label}</span>
                    <span className="text-meta text-muted">{desc}</span>
                  </div>
                  <span className="text-sec text-subtle" aria-hidden>
                    ›
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <p className="text-meta text-subtle">상담: 매월 마지막 주 토요일 10:00~13:00 · 전화 예약 02-000-0000</p>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
