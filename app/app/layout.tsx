import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Inter } from 'next/font/google';
import { IconSprite } from '@/components/Icon';
import './globals.css';

/* 'vietnamese' bắt buộc — thiếu thì chữ có dấu rơi về font dự phòng. */
const inter = Inter({ subsets: ['latin', 'vietnamese'], display: 'swap' });

export const metadata: Metadata = {
  title: 'SaaS Churn & MRR',
  description: 'Theo dõi tỷ lệ khách rời bỏ và doanh thu tháng (MRR) theo gói và khu vực.',
};

/* data-theme đặt trên <html> để [data-theme="dark"] trong globals.css khớp.
   Class font đặt trên <body>: globals.css gán body{font-family:var(--sans)} theo
   tên 'Inter', còn next/font đăng ký font dưới tên băm — class thắng selector `body`. */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi" data-theme="light" suppressHydrationWarning>
      <body className={inter.className}>
        <IconSprite />
        {children}
      </body>
    </html>
  );
}
