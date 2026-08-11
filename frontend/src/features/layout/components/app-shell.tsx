'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from '@/features/layout/components/navbar';
import { Footer } from '@/features/layout/components/footer';

/**
 * Bố cục chung toàn app: Navbar + nội dung + Footer.
 * Hỗ trợ ẩn trên trang chủ (layout riêng).
 */
export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === '/';
  const isDashboard = pathname?.startsWith('/dashboard');
  const isStudy = pathname?.startsWith('/study');
  const isGames = pathname?.startsWith('/games');
  const isAdmin = pathname?.startsWith('/admin');

  const isTeacher = pathname?.startsWith('/teacher');

  if (isHome || isDashboard || isStudy || isGames || isAdmin || isTeacher) {
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
