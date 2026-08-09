'use client';

import React from 'react';
import { StudyBackground } from '@/components/background/study-background';
import { useRouter } from 'next/navigation';

export default function GamesLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <StudyBackground className="min-h-screen flex flex-col p-4 sm:p-6 overflow-hidden">
      {/* Top Header */}
      <header className="fixed top-4 sm:top-6 left-0 right-0 w-full max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between z-50 pointer-events-none">
        
        <div className="flex items-center gap-4 pointer-events-auto">
          {/* Exit Button */}
          <button 
            onClick={() => router.push('/dashboard/practice')}
            className="w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-full bg-white/80 backdrop-blur shadow-sm hover:bg-white text-[#215b3b] transition-colors"
            title="Exit to Practice Hub"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Right controls placeholder (if any game needs it) */}
        <div className="pointer-events-auto">
        </div>
      </header>

      {/* Game Area */}
      <main className="flex-1 w-full max-w-5xl mx-auto flex flex-col items-center justify-center relative z-10 pt-20 pb-8 h-full">
        <div className="w-full max-w-3xl flex-1 flex flex-col">
          {children}
        </div>
      </main>
    </StudyBackground>
  );
}
