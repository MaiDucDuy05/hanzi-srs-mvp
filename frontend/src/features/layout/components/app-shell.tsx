'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ForestBackground } from '@/features/background/components/forest-background';

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
  const isAuth = pathname?.startsWith('/login') || pathname?.startsWith('/register') || pathname?.startsWith('/forgot-password');

  const isContact = pathname?.startsWith('/contact');

  if (isHome || isDashboard || isStudy || isGames || isAdmin || isTeacher || isAuth) {
    return <main className="flex min-h-screen w-full flex-col">{children}</main>;
  }

  return (
    <ForestBackground className="flex min-h-screen flex-col font-[family-name:var(--font-nunito)] relative">
      {/* Gấu trúc trang trí góc trái */}
      {!isContact && (
        <div className="fixed bottom-0 left-0 z-0 hidden lg:block h-[300px] xl:h-[400px] pointer-events-none opacity-90">
          <img
            src="/assets/illustrations/panda/panda.png"
            alt="Panda Decorative"
            className="h-full w-auto object-contain object-bottom"
          />
        </div>
      )}

      <div className="absolute top-8 left-1/2 z-20 flex w-[90%] lg:w-[50%] max-w-3xl -translate-x-1/2 items-center justify-between rounded-full bg-gradient-to-r from-[#e5f5eb] via-[#e9f9ef] to-[#e0f5e9] shadow-md px-6 py-2 font-[family-name:var(--font-nunito)] text-base sm:text-lg font-black text-[#215b3b]">
        <Link href="/">
          <img src="/assets/illustrations/panda/panda-at-beach.svg" alt="Panda" className="h-14 w-auto sm:h-16 lg:h-20" />
        </Link>
        <div className="flex items-center gap-4 sm:gap-6 lg:gap-8 pr-2">
          <Link href="/dashboard/courses" className="transition-colors hover:text-[#5E7F26] whitespace-nowrap">Courses</Link>
          <Link href="/dashboard" className="transition-colors hover:text-[#5E7F26] whitespace-nowrap">Dashboard</Link>
          <Link href="/dashboard/achievements" className="transition-colors hover:text-[#5E7F26] whitespace-nowrap">Leaderboard</Link>
          <Link href="/contact" className="transition-colors hover:text-[#5E7F26] whitespace-nowrap">Contact Us</Link>
        </div>
      </div>
      <main className="mx-auto flex-1 w-full max-w-6xl px-4 py-6 pt-32 relative z-10 flex flex-col">
        {children}
      </main>
      <div className="relative z-10">
      </div>
    </ForestBackground>
  );
}
