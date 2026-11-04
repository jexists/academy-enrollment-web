import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ToastProvider } from '@/components/ui/Toast';
import { AuthProvider } from '@/features/auth/AuthProvider';
import { ChatWidget } from '@/features/chat/ChatWidget';
import './globals.css';

export const metadata: Metadata = {
  title: { default: '한빛수학', template: '%s | 한빛수학' },
  description: '중·고등 수학 학원 한빛수학 — 수강 신청과 출결',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="ko" className="h-full">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="flex min-h-full flex-col">
        <ToastProvider>
          <AuthProvider>{children}</AuthProvider>
          {/* 문의 챗봇: 모든 화면 오른쪽 아래. 경로를 읽으므로 Suspense로 감싼다 */}
          <Suspense fallback={null}>
            <ChatWidget />
          </Suspense>
        </ToastProvider>
      </body>
    </html>
  );
}
