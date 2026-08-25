import Link from 'next/link';
import type { User } from '@/lib/api/types';
import { ForestBackground } from '@/features/background/components/forest-background';

/**
 * Hero trang chủ — nền pale-green, navbar viên thuốc, panda bên trái, text bên phải.
 */
export function HeroSection({ user }: { user: User | null }) {
  return (
    <ForestBackground className="flex flex-col items-center justify-center px-4 py-10 sm:px-8 sm:py-16">

      {/* Floating Navbar (Bên trong hero như thiết kế) */}
      <div className="absolute top-8 left-1/2 z-20 flex w-[90%] lg:w-[50%] max-w-3xl -translate-x-1/2 items-center justify-between rounded-full bg-gradient-to-r from-[#e5f5eb] via-[#e9f9ef] to-[#e0f5e9] shadow-md px-6 py-2 font-[family-name:var(--font-nunito)] text-base sm:text-lg font-black text-[#215b3b]">
        <Link href="/">
          <img src="/assets/illustrations/panda/panda-at-beach.svg" alt="Panda" className="h-14 w-auto sm:h-16 lg:h-20" />
        </Link>
        <div className="flex items-center gap-4 sm:gap-6 lg:gap-8 pr-2">
          <Link href="/dashboard/courses" className="transition-colors hover:text-[#5E7F26] whitespace-nowrap">Courses</Link>
          <Link href="/dashboard" className="transition-colors hover:text-[#5E7F26] whitespace-nowrap">Dashboard</Link>
          <Link href="/leaderboard" className="transition-colors hover:text-[#5E7F26] whitespace-nowrap">Leaderboard</Link>
          <Link href="/contact" className="transition-colors hover:text-[#5E7F26] whitespace-nowrap">Contact Us</Link>
        </div>
      </div>

      <div className="relative z-10 mx-auto grid max-w-5xl grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-8">
        {/* Left: Illustration (Gấu trúc) */}
        <div className="relative flex h-[350px] items-end justify-center sm:h-[450px] lg:h-[500px]">
          {/* Sử dụng file ảnh có sẵn trong assets */}
          <img
            src="/assets/illustrations/panda/panda.png"
            alt="Panda Eating Bamboo"
            className="relative z-10 h-[90%] w-auto object-contain sm:h-[100%]"
          />
        </div>

        {/* Right: Content */}
        <div className="text-center lg:text-left">
          <h1 className="font-[family-name:var(--font-nunito)] text-[2.5rem] font-black leading-[1.15] text-[#215b3b] sm:text-5xl lg:text-[4rem] tracking-tight">
            Master Chinese<br />
            in the Heart of<br />
            the Forest
          </h1>
          
          <div className="mt-10">
            {user ? (
              <Link
                href="/dashboard"
                className="font-(family-name:--font-nunito) inline-block rounded-full bg-[#8BC34A] px-8 py-4 text-lg font-black text-white shadow-md transition-all hover:scale-105 hover:bg-[#7CB342]"
              >
                 Start Your Journey
              </Link>
            ) : (
              <Link
                href="/dashboard"
                className="font-[family-name:var(--font-nunito)] inline-block rounded-full bg-[#8BC34A] px-8 py-4 text-lg font-black text-white shadow-md transition-all hover:scale-105 hover:bg-[#7CB342]"
              >
                Start Your Journey
              </Link>
            )}
          </div>
        </div>
      </div>
    </ForestBackground>
  );
}
