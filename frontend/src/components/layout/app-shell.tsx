'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';

/**
 * Bố cục chung toàn app: Navbar + nội dung + Footer.
 * Hỗ trợ ẩn trên trang chủ (layout riêng).
 */
export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === '/';
  const isDashboard = pathname?.startsWith('/dashboard');
  const isStudy = pathname?.startsWith('/study');

  if (isHome || isDashboard || isStudy) {
    return <main className="flex min-h-screen w-full flex-col">{children}</main>;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>
      <Footer />
    </div>
  );
}
