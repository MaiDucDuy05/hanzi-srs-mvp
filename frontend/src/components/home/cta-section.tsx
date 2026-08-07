import Link from 'next/link';
import { Bamboo, Blob, Panda } from './panda-decoration';

/**
 * CTA cuối trang — chỉ hiện cho khách chưa đăng nhập.
 */
export function CtaSection() {
  return (
    <section className="relative overflow-hidden rounded-[32px] bg-soft-lime px-6 py-14 text-center sm:py-16">
      <Blob className="absolute -left-20 -top-24 h-64 w-80 opacity-50" fill="#FAFCEC" />
      <Blob className="absolute -bottom-24 -right-20 h-64 w-80 opacity-50" fill="#FAFCEC" />

      {/* panda nhỏ góc */}
      <div className="pointer-events-none absolute -bottom-2 left-8 hidden w-24 opacity-90 md:block">
        <Panda className="animate-panda-idle h-auto w-full" />
      </div>
      <Bamboo className="pointer-events-none absolute -bottom-2 right-10 hidden h-28 w-12 md:block" />

      <div className="relative mx-auto max-w-xl">
        <h2 className="text-2xl font-bold text-forest sm:text-3xl">
          Sẵn sàng bước vào khu rừng tre chưa?
        </h2>
        <p className="mx-auto mt-3 max-w-md text-gray-600">
          Đăng ký miễn phí để bắt đầu học tiếng Trung, chơi trò chơi và luyện thi
          HSK ngay hôm nay.
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/register"
            className="rounded-full bg-accent-lime px-8 py-3.5 text-base font-bold text-forest shadow-soft transition-transform hover:scale-105 hover:bg-accent-olive"
          >
            Đăng ký miễn phí
          </Link>
          <Link
            href="/login"
            className="rounded-full border-2 border-bamboo px-8 py-3 text-base font-semibold text-forest transition-colors hover:bg-white/60"
          >
            Đăng nhập
          </Link>
        </div>
      </div>
    </section>
  );
}
