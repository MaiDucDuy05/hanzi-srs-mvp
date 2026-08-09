'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { APP_NAME } from '@/lib/utils/constants';
import { cn } from '@/lib/utils/cn';

const NAV_LINKS = [
  { href: '/dashboard', label: 'Home' },
  { href: '/courses', label: 'Courses' },
  { href: '/games', label: 'Games' },
  { href: '/leaderboard', label: 'Leaderboard' },
  { href: '/practice', label: 'Practice' },
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
    <header className="sticky top-0 z-40 px-4 pt-6 pb-2">
      <div className="mx-auto flex h-[68px] w-full max-w-6xl items-center justify-between rounded-full bg-[#edfaf3] px-6 shadow-sm">
        
        {/* Left: Logo */}
        <Link href="/" className="flex items-center gap-3">
          <img 
            src="/assets/illustrations/panda/panda-at-beach.svg" 
            alt="Panda Mascot" 
            className="h-14 w-14 object-cover rounded-full" 
          />
          <span className="font-heading text-2xl font-black text-[#1b432a] tracking-tight">{APP_NAME}</span>
        </Link>

        {/* Center: Links (Desktop) */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href || (pathname.startsWith(link.href) && link.href !== '/');
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'rounded-full px-5 py-2.5 text-base font-bold transition-colors',
                  isActive
                    ? 'bg-[#d6ebd0] text-[#1b432a]'
                    : 'text-[#4a6b38] hover:bg-[#d6ebd0] hover:text-[#1b432a]'
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right: Avatar & Stats */}
        <div className="flex items-center gap-5">
          {/* Avatar */}
          <div className="flex items-center cursor-pointer hover:opacity-80 transition-opacity">
            <div className="h-11 w-11 overflow-hidden rounded-full border-2 border-white shadow-sm bg-[#d6ebd0]">
              <img 
                src="/assets/illustrations/panda/panda-with-cloak.svg" 
                alt="Avatar" 
                className="h-full w-full object-cover scale-110" 
              />
            </div>
          </div>
          
          {/* Bamboo Points */}
          <div className="hidden sm:flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity">
            <img 
              src="/assets/illustrations/bamboo/bamboo-stalk.svg" 
              alt="Bamboo" 
              className="h-8 w-auto object-contain" 
            />
            <span className="text-xl font-black text-[#1b432a]">1</span>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="rounded-full p-2 text-[#4a6b38] hover:bg-[#d6ebd0] md:hidden transition-colors"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            {open ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {open && (
        <nav className="mx-auto mt-2 max-w-6xl rounded-3xl bg-[#edfaf3] p-4 shadow-md md:hidden flex flex-col gap-2">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block rounded-full px-4 py-3 text-base font-bold text-[#4a6b38] transition-colors hover:bg-[#d6ebd0] hover:text-[#1b432a]"
            >
              {link.label}
            </Link>
          ))}
          <button
            onClick={() => {
              setOpen(false);
              handleLogout();
            }}
            className="block w-full text-left rounded-full px-4 py-3 text-base font-bold text-gray-500 transition-colors hover:bg-gray-200"
          >
            Thoát
          </button>
        </nav>
      )}
    </header>
  );
}
