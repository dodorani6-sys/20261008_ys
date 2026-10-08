import type { Metadata } from 'next';
import './globals.css';
import Navigation from '@/components/Navigation';

export const metadata: Metadata = {
  title: '내 업무 도구함',
  description: '사내 업무 도구 통합 포털 - 경비 정산, 지점 매출, 리뷰 분석',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="bg-slate-50 text-slate-900 min-h-screen flex flex-col antialiased">
        <Navigation />
        <div className="flex-1 flex flex-col">{children}</div>
      </body>
    </html>
  );
}
