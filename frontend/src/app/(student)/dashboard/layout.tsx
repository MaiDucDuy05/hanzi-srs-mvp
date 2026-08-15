'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ForestBackground } from '@/features/background/components/forest-background';

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
  { label: 'Achievements', href: '/dashboard/achievements' },
  { label: 'Settings', href: '/dashboard/settings' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [coursesOpen, setCoursesOpen] = useState(false);
  const coursesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (coursesRef.current && !coursesRef.current.contains(e.target as Node)) {
        setCoursesOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

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
            const isActive = pathname === item.href || (item.href === '/dashboard/courses' && pathname.startsWith('/dashboard/courses'));
            
            if (item.label === 'Courses') {
              return (
                <div key={item.href} ref={coursesRef} className="relative flex flex-col">
                  <button
                    onClick={() => setCoursesOpen(!coursesOpen)}
                    className={`flex items-center justify-between lg:justify-start lg:gap-3 px-6 py-4 rounded-full transition-colors w-full ${
                      isActive 
                        ? 'bg-[#e5f5eb] text-[#215b3b]' 
                        : 'text-[#215b3b] hover:bg-[#f3f9f5]'
                    }`}
                  >
                    <div className="flex items-center justify-center lg:justify-start gap-3 w-full lg:w-auto">
                      <PawIcon className="w-6 h-6 shrink-0" />
                      <span className="font-[family-name:var(--font-nunito)] text-lg font-black">{item.label}</span>
                    </div>
                    <svg className={`hidden lg:block w-5 h-5 transition-transform ${coursesOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {coursesOpen && (
                    <div className="flex flex-col gap-1 mt-2 lg:pl-12 lg:pr-4 animate-in slide-in-from-top-2 fade-in duration-200">
                      <Link
                        href="/dashboard/courses/hsk"
                        onClick={() => setCoursesOpen(false)}
                        className={`px-4 py-2 rounded-xl transition-colors text-sm flex flex-col items-center lg:items-start text-center lg:text-left ${pathname.includes('/courses/hsk') ? 'bg-[#f3f9f5]' : 'hover:bg-gray-50'}`}
                      >
                        <div className={`font-bold ${pathname.includes('/courses/hsk') ? 'text-[#215b3b]' : 'text-gray-700'}`}>Học theo HSK</div>
                        <div className="text-xs font-medium text-gray-400">Bài học chuẩn HSK 1-6</div>
                      </Link>
                      <Link
                        href="/dashboard/courses/topic"
                        onClick={() => setCoursesOpen(false)}
                        className={`px-4 py-2 rounded-xl transition-colors text-sm flex flex-col items-center lg:items-start text-center lg:text-left ${pathname.includes('/courses/topic') ? 'bg-[#f3f9f5]' : 'hover:bg-gray-50'}`}
                      >
                        <div className={`font-bold ${pathname.includes('/courses/topic') ? 'text-[#215b3b]' : 'text-gray-700'}`}>Học theo Topic</div>
                        <div className="text-xs font-medium text-gray-400">Bài học theo chủ đề</div>
                      </Link>
                    </div>
                  )}
                </div>
              );
            }

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
                <PawIcon className="w-6 h-6 shrink-0" />
                <span className="font-[family-name:var(--font-nunito)] text-lg font-black">{item.label}</span>
              </Link>
            );
          })}
        </aside>
        
        {/* Main Content Area */}
        <main className={`flex-1 min-w-0 flex flex-col items-center overflow-y-auto custom-scrollbar h-full rounded-[2rem] ${
          !(pathname.startsWith('/dashboard/courses') || pathname.startsWith('/dashboard/practice/lessons') || pathname.startsWith('/dashboard/achievements')) 
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
