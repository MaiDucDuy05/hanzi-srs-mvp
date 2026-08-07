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
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/90 backdrop-blur dark:border-gray-800 dark:bg-gray-950/90">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-brand">
          <span className="text-xl">漢</span>
          <span>{APP_NAME}</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                pathname.startsWith(link.href)
                  ? 'bg-brand-light text-brand dark:bg-brand/20 dark:text-brand'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800',
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <div className="flex items-center gap-2">
              <Link
                href="/profile"
                className="hidden text-sm font-medium text-gray-700 hover:text-brand dark:text-gray-300 sm:block"
                title={user.fullName}
              >
                {user.fullName.split(' ').slice(-1)[0]}
              </Link>
              <span className="hidden rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-300 sm:inline">
                {ROLE_LABELS[user.role]}
              </span>
              <button
                onClick={handleLogout}
                className="rounded-md px-2 py-1 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-800 dark:hover:bg-gray-800"
              >
                Thoát
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="rounded-md px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300"
              >
                Đăng nhập
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-brand px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-dark"
              >
                Đăng ký
              </Link>
            </div>
          )}

          <button
            className="rounded-md p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 md:hidden"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            {open ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-gray-100 bg-white px-4 py-2 dark:border-gray-800 dark:bg-gray-950 md:hidden">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
