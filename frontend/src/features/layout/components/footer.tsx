import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { APP_NAME } from '@/lib/utils/constants';

/** Decoration: vài cọng lá tre nhỏ ở góc footer (SVG inline, flat 2D). */
function BambooSprig({ className }: { className?: string }) {
 return (
 <svg
 viewBox="0 0 80 60"
 className={className}
 fill="none"
 aria-hidden
 focusable="false"
 >
 <path
 d="M12 58 C14 44 18 34 24 18"
 stroke="#78993A"
 strokeWidth="3"
 strokeLinecap="round"
 opacity="0.5"
 />
 <path
 d="M24 18 C32 22 40 20 46 14 C40 18 36 26 34 32"
 fill="#78993A"
 opacity="0.35"
 />
 <path
 d="M20 34 C27 36 34 34 40 29 C34 35 30 42 28 46"
 fill="#5E7F26"
 opacity="0.3"
 />
 <circle cx="64" cy="16" r="4" fill="#C7CF35" opacity="0.5" />
 <circle cx="72" cy="30" r="3" fill="#B8C533" opacity="0.4" />
 </svg>
 );
}

/**
 * Panda Forest footer — nền off-white, bo trên 32px, trang trí lá tre.
 * Light-only.
 */
export async function Footer() {
 const t = await getTranslations('Layout');
 return (
 <footer className="relative mt-10 overflow-hidden rounded-t-[32px] bg-[#f3fef6]">
 <BambooSprig className="absolute -left-1 bottom-2 w-20 opacity-80" />
 <BambooSprig className="absolute -right-1 bottom-2 w-20 -scale-x-100 opacity-80" />
 <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-8 text-sm text-gray-500 sm:flex-row">
 <p className="flex items-center gap-1.5">
 <img src="/assets/illustrations/panda/panda-at-beach.svg" alt="Panda" className="inline-block h-10 w-auto" />
 © {new Date().getFullYear()} {APP_NAME} — {t('footerTagline')}
 </p>
 <div className="flex gap-5">
 <Link href="/contact" className="transition-colors hover:text-forest">
 {t('footerContact')}
 </Link>
 <Link href="/resources" className="transition-colors hover:text-forest">
 {t('footerResources')}
 </Link>
 <Link href="/upgrade-vip" className="transition-colors hover:text-forest">
 {t('footerUpgradeVip')}
 </Link>
 </div>
 </div>
 </footer>
 );
}
