# academy-enrollment-web


**배포 주소**: https://academy-enrollment-web.vercel.app — main에 push하면 자동으로 다시 배포돼요.
수학학원 "한빛수학" 코어 웹 — 학원 소개·반 목록, 학부모(자녀 요약·수강 신청·보강·결제), 학생(내 스케줄·출석·성적). Next.js 16 + Tailwind 4.

## 화면
- 공개: 첫 화면(반·남은 자리), 이용약관, 회원가입, 로그인
- 학부모(하단 탭 홈·신청·결제·내 정보): 수강 신청(안 되는 반은 이유와 함께 비활성), 신청 내역·신청 취소, 환불 신청(예상액), 보강 신청, 결제·환불
- 학생(보기만): 내 스케줄, 출석 기록, 성적
- 학부모 홈 자녀 요약(D19: 출석·보강·결제할 금액·할 일), 내 정보·회원 탈퇴

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
