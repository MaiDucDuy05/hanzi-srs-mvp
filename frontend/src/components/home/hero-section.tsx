import Link from 'next/link';
import type { User } from '@/lib/api/types';
import { Blob } from './panda-decoration';

/**
 * Hero trang chủ — nền pale-green, navbar viên thuốc, panda bên trái, text bên phải.
 */
export function HeroSection({ user }: { user: User | null }) {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#dffce8] px-4 py-10 sm:px-8 sm:py-16">
      {/* Nền organic blobs ở 3 góc (hình trái tim kéo lùi ra ngoài) */}
      <Blob className="absolute -left-16 -top-16 h-[300px] w-[350px] opacity-100 sm:-left-24 sm:-top-24 sm:h-[400px] sm:w-[500px]" fill="#d7e9c1" />
      <Blob className="absolute -right-16 -top-16 h-[300px] w-[350px] scale-x-[-1] opacity-100 sm:-right-24 sm:-top-24 sm:h-[400px] sm:w-[500px]" fill="#d7e9c1" />
      <Blob className="absolute -bottom-16 -right-16 h-[300px] w-[350px] scale-x-[-1] scale-y-[-1] opacity-100 sm:-bottom-24 sm:-right-24 sm:h-[400px] sm:w-[500px]" fill="#d7e9c1" />

      {/* Floating Navbar (Bên trong hero như thiết kế) */}
      <div className="absolute top-8 left-1/2 z-20 flex w-[90%] lg:w-1/2 -translate-x-1/2 items-center justify-between rounded-full bg-gradient-to-r from-[#e5f5eb] via-[#e9f9ef] to-[#e0f5e9] px-6 py-4 shadow-md sm:px-10 sm:py-6 lg:py-7">
        <div className="flex items-center">
          <span className="text-4xl sm:text-5xl" aria-hidden>🐼</span>
        </div>
        <nav className="font-[family-name:var(--font-nunito)] flex items-center gap-6 sm:gap-10 lg:gap-12 text-lg font-black text-[#215b3b] sm:text-xl lg:text-2xl">
          <Link href="/learn" className="transition-colors hover:text-[#5E7F26]">Courses</Link>
          <Link href="/games" className="transition-colors hover:text-[#5E7F26]">Games</Link>
          <Link href="/leaderboard" className="transition-colors hover:text-[#5E7F26]">Leaderboard</Link>
        </nav>
      </div>

      <div className="relative z-10 mx-auto grid max-w-5xl grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-8">
        {/* Left: Illustration (Gấu trúc & Tre) */}
        <div className="relative flex h-[350px] items-end justify-center sm:h-[450px] lg:h-[500px]">
          {/* Cây tre (Background) */}
          {/* TODO: Thay thế src bằng hình ảnh cây tre bạn cung cấp */}
          <img
            src="/images/hero-bamboo.png"
            alt="Bamboo"
            className="absolute bottom-0 left-0 h-[90%] w-auto object-contain opacity-90 drop-shadow-sm"
          />
          {/* Gấu trúc (Foreground) */}
          {/* TODO: Thay thế src bằng hình ảnh gấu trúc bạn cung cấp */}
          <img
            src="/images/hero-panda.png"
            alt="Panda"
            className="relative z-10 h-[80%] w-auto object-contain drop-shadow-md"
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
                href="/learn"
                className="font-[family-name:var(--font-nunito)] inline-block rounded-full bg-[#8BC34A] px-8 py-4 text-lg font-black text-white shadow-md transition-all hover:scale-105 hover:bg-[#7CB342]"
              >
                Tiếp tục học
              </Link>
            ) : (
              <Link
                href="/register"
                className="font-[family-name:var(--font-nunito)] inline-block rounded-full bg-[#8BC34A] px-8 py-4 text-lg font-black text-white shadow-md transition-all hover:scale-105 hover:bg-[#7CB342]"
              >
                Start Your Journey
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
