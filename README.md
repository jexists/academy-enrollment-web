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

## 로그인
- `/login` — 이메일 + 비밀번호. 학부모·학생 계정만 들어올 수 있다.
- 로컬에서는 로그인 화면 아래 **데모 계정 버튼**을 누르면 바로 로그인된다 (백엔드 `DEMO_LOGIN=true`일 때만 보임).
- 임시 비밀번호 계정은 `/change-password`로 먼저 보낸다.

## 배포 (Vercel)
- 환경 변수 `NEXT_PUBLIC_API_URL`에 Render 백엔드 주소.
