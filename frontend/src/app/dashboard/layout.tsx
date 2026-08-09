'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ForestBackground } from '@/components/background/forest-background';

const PawIcon = ({ className }: { className?: string }) => (
  <img 
    src="/assets/illustrations/animals/pawicon.png" 
    alt="Paw" 
    className={`${className} object-contain`} 
  />
);

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Courses', href: '/dashboard/courses' },
  { label: 'Practice', href: '/dashboard/practice' },
  { label: 'Leaderboard', href: '/dashboard/leaderboard' },
  { label: 'Settings', href: '/dashboard/settings' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <ForestBackground className="p-4 sm:p-8">
      {/* Panda Illustration (Lơ lửng góc phải trên cùng của Dashboard) */}
      <div className="absolute right-[110px] top-[110px] hidden sm:block pointer-events-none z-0">
        <img src="/assets/illustrations/panda/panda-holding-ball.svg" alt="Panda" className="h-40 object-contain drop-shadow-md transform origin-bottom" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-6 lg:flex-row lg:items-stretch lg:h-[calc(100vh-4rem)]">
        
        {/* Sidebar */}
        <aside className="flex-shrink-0 w-full lg:w-64 bg-white rounded-[2rem] p-6 shadow-sm flex flex-col justify-center gap-2">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`flex items-center justify-center lg:justify-start gap-3 px-6 py-4 rounded-full transition-colors ${
                  isActive 
                    ? 'bg-[#e5f5eb] text-[#215b3b]' 
                    : 'text-[#215b3b] hover:bg-[#f3f9f5]'
                }`}
              >
                <PawIcon className="w-6 h-6" />
                <span className="font-[family-name:var(--font-nunito)] text-lg font-black">{item.label}</span>
              </Link>
            );
          })}
        </aside>
        
        {/* Main Content Area */}
        <main className={`flex-1 min-w-0 flex flex-col items-center overflow-y-auto custom-scrollbar h-full rounded-[2rem] ${
          !(pathname.startsWith('/dashboard/courses') || pathname.startsWith('/dashboard/practice/lessons')) 
            ? 'justify-center' 
            : ''
        }`}>
          <div className="w-full max-w-6xl py-4 sm:py-0">
            {children}
          </div>
        </main>
      </div>
    </ForestBackground>
  );
}
