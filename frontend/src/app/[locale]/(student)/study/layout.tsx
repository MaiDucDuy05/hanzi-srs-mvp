'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { StudyBackground } from '@/features/background/components/study-background';
import { useRouter } from 'next/navigation';

export default function StudyLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const t = useTranslations('StudyLayout');

  return (
    <StudyBackground className="min-h-screen flex flex-col p-4 sm:p-6 overflow-hidden">
      {/* Top Header */}
      <header className="fixed top-4 sm:top-6 left-0 right-0 w-full max-w-6xl mx-auto px-4 sm:px-6 flex items-center gap-4 z-50">
        <button
          onClick={() => router.back()}
          className="w-12 h-12 shrink-0 flex items-center justify-center rounded-full bg-white/80 backdrop-blur shadow-sm hover:bg-white text-[#215b3b] transition-colors"
          aria-label={t('exitAria')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex-1"></div>
      </header>

      {/* Study Area */}
      <main className="flex-1 w-full max-w-5xl mx-auto flex flex-col justify-center relative z-10 pb-8">
        {children}
      </main>
    </StudyBackground>
  );
}
