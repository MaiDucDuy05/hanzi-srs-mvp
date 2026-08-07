'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { ROLE_LABELS, APP_NAME } from '@/lib/utils/constants';
import { cn } from '@/lib/utils/cn';

const NAV_LINKS = [
 { href: '/learn', label: 'Học theo cấp' },
 { href: '/topics', label: 'Chủ đề' },
 { href: '/practice', label: 'Luyện tập' },
 { href: '/games', label: 'Trò chơi' },
 { href: '/tests/join', label: 'Làm bài kiểm tra' },
];

/**
 * Panda Forest navbar — floating pill (rounded-full), sticky trên cùng.
 * Light-only (brief: no dark theme). Brand màu forest-green.
 */
export function Navbar() {
 const { user, logout } = useAuth();
 const pathname = usePathname();
 const router = useRouter();
 const [open, setOpen] = useState(false);

 const handleLogout = () => {
 logout();
 router.push('/');
 };

 return (
 <header className="sticky top-0 z-40 px-3 pt-3">
 <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 rounded-full border border-light-bamboo bg-white/70 px-4 shadow-soft backdrop-blur md:px-6">
 <Link href="/" className="flex items-center gap-2 font-bold text-forest">
 <span className="text-xl" aria-hidden>
 🐼
 </span>
 <span className="font-heading">{APP_NAME}</span>
 </Link>

 <nav className="hidden items-center gap-1 md:flex">
 {NAV_LINKS.map((link) => (
 <Link
 key={link.href}
 href={link.href}
 className={cn(
 'rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
 pathname.startsWith(link.href)
 ? 'bg-soft-lime text-forest'
 : 'text-gray-600 hover:bg-pale-green hover:text-forest',
 )}
 >
 {link.label}
 </Link>
 ))}
 </nav>

 <div className="flex items-center gap-2">
 {user ? (
 <div className="flex items-center gap-2">
 <span
 className="hidden rounded-full bg-soft-lime px-3 py-1 text-sm font-semibold text-forest sm:inline"
 title={user.fullName}
 >
 {user.fullName.split(' ').slice(-1)[0]}
 </span>
 <span className="hidden rounded-full bg-pale-green px-2 py-0.5 text-xs text-bamboo lg:inline">
 {ROLE_LABELS[user.role]}
 </span>
 <Link
 href="/profile"
 className="rounded-full px-3 py-1.5 text-sm font-medium text-forest transition-colors hover:bg-pale-green"
 >
 Hồ sơ
 </Link>
 <button
 onClick={handleLogout}
 className="rounded-full px-3 py-1.5 text-sm text-gray-500 transition-colors hover:bg-gray-100 hover:text-forest"
 >
 Thoát
 </button>
 </div>
 ) : (
 <div className="flex items-center gap-2">
 <Link
 href="/login"
 className="rounded-full px-3 py-1.5 text-sm font-medium text-forest transition-colors hover:bg-pale-green"
 >
 Đăng nhập
 </Link>
 <Link
 href="/register"
 className="rounded-full bg-accent-lime px-4 py-2 text-sm font-bold text-forest shadow-soft transition-transform hover:scale-105 hover:bg-accent-olive"
 >
 Đăng ký
 </Link>
 </div>
 )}

 <button
 className="rounded-full p-2 text-gray-600 transition-colors hover:bg-pale-green md:hidden"
 onClick={() => setOpen(!open)}
 aria-label="Menu"
 >
 {open ? '✕' : '☰'}
 </button>
 </div>
 </div>

 {open && (
 <nav className="mx-auto mt-2 max-w-6xl rounded-3xl border border-light-bamboo bg-white/95 px-3 py-2 shadow-soft md:hidden">
 {NAV_LINKS.map((link) => (
 <Link
 key={link.href}
 href={link.href}
 onClick={() => setOpen(false)}
 className="block rounded-full px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-pale-green hover:text-forest"
 >
 {link.label}
 </Link>
 ))}
 {!user && (
 <Link
 href="/register"
 onClick={() => setOpen(false)}
 className="mt-1 block rounded-full bg-accent-lime px-4 py-2 text-center text-sm font-bold text-forest"
 >
 Đăng ký miễn phí
 </Link>
 )}
 </nav>
 )}
 </header>
 );
}
