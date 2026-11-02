# academy-enrollment-web

수학학원 "한빛수학" 코어 웹 — 학원 소개·반 목록, 학부모(자녀 요약·수강 신청·보강·결제), 학생(내 스케줄·출석·성적). Next.js 16 + Tailwind 4.

## 실행
```bash
cp .env.example .env.local   # NEXT_PUBLIC_API_URL=백엔드 주소
npm install
npm run dev -- --port 3200
```
- 확인: `npm run build`
- 공용 컴포넌트(`src/components/ui`)와 `src/app/globals.css`는 어드민 저장소와 같은 파일이다.

## 배포 (Vercel)
- 환경 변수 `NEXT_PUBLIC_API_URL`에 Render 백엔드 주소.
