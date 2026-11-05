<div align="center">

# 한빛수학 코어 웹

**학부모·학생을 위한 수강 신청·출결 서비스**

수강 신청, 보강·환불 신청, 일정·출석·성적 확인 제공

<a href="https://academy-enrollment-web.vercel.app"><img src="https://img.shields.io/badge/%EC%BD%94%EC%96%B4%20%EC%9B%B9%20%EB%B0%94%EB%A1%9C%EA%B0%80%EA%B8%B0-111827?style=for-the-badge&logo=vercel&logoColor=white" alt="코어 웹 바로가기"></a> <a href="https://academy-enrollment-admin.vercel.app"><img src="https://img.shields.io/badge/%EC%96%B4%EB%93%9C%EB%AF%BC%20%EB%B0%94%EB%A1%9C%EA%B0%80%EA%B8%B0-111827?style=for-the-badge&logo=vercel&logoColor=white" alt="어드민 바로가기"></a> <a href="https://academy-enrollment-backend.onrender.com/health"><img src="https://img.shields.io/badge/%EB%B0%B1%EC%97%94%EB%93%9C%20%EC%83%81%ED%83%9C%20%EB%B3%B4%EA%B8%B0-111827?style=for-the-badge&logo=render&logoColor=white" alt="백엔드 상태 보기"></a> <a href="https://jexists.github.io/academy-enrollment-web/"><img src="https://img.shields.io/badge/%EB%B0%9C%ED%91%9C%EC%9E%90%EB%A3%8C%20%EB%B3%B4%EB%9F%AC%EA%B0%80%EA%B8%B0-FF5D00?style=for-the-badge" alt="발표자료 보러가기"></a>

<sub><b>코어 웹</b> <a href="https://github.com/jexists/academy-enrollment-web">저장소</a> &nbsp;·&nbsp; 어드민 <a href="https://github.com/jexists/academy-enrollment-admin">저장소</a> &nbsp;·&nbsp; 백엔드 <a href="https://github.com/jexists/academy-enrollment-backend">저장소</a></sub>

</div>

> AX Campus 3회차 과제 결과물. 학원·인물·수치는 모두 가상.

## 기술 스택

| 구분 | 기술 |
|---|---|
| Frontend | ![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white) ![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB) ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white) ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-0F172A?style=for-the-badge&logo=tailwindcss&logoColor=06B6D4) |
| Deployment | ![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white) |

## 주요 기능

| 기능 | 내용 |
|---|---|
| **공개 안내** | 반 목록, 남은 자리, 강사 소개, 학원 안내 문서 |
| **자녀 요약** | 자녀별 출석률, 보강, 이번 달 결제 금액 |
| **수강 신청** | 학년에 맞는 반 목록, 신청 불가 사유 표시 |
| **보강·환불 신청** | 보강 수업 신청, 환불 예상 금액 확인 |
| **학생 화면** | 내 스케줄, 출석 기록, 성적 조회 |
| **문의 챗봇** | 학원 안내 문서 기반 답변 |

## 화면 캡처

[자녀 요약](docs/captures/05-web-home-summary.png) &nbsp;·&nbsp; [수강 신청](docs/captures/08-web-enroll.png) &nbsp;·&nbsp; [보강 신청](docs/captures/11-web-makeup-B11.png) &nbsp;·&nbsp; [환불 신청](docs/captures/12-web-refund-D20.png) &nbsp;·&nbsp; [문의 챗봇](docs/captures/49-web-chat-answer.png)

전체 캡처 폴더: [academy-enrollment-web/docs/captures](docs/captures/)

## 프로젝트 구조

<details>
<summary>폴더 구조 보기</summary>

```text
src/
├── app/          # 경로별 페이지
├── features/     # 업무별 화면·로직 (parent, student, chat 등)
├── components/   # 공용 UI·레이아웃
└── lib/          # API 호출, 로그인, 형식 변환
content/guide/    # 학원 안내 문서 10개
docs/             # 발표 자료, 화면 캡처 (GitHub Pages)
```

</details>

## 문서

[학원 안내 문서](content/guide/) &nbsp;·&nbsp; [발표 자료 원본](docs/index.html) &nbsp;·&nbsp; [API·DB 구조](https://github.com/jexists/academy-enrollment-backend#readme)
