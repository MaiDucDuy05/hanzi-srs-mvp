'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ForestBackground } from '@/features/background/components/forest-background';
import { useAuth } from '@/lib/auth/auth-context';
import { useTranslations } from 'next-intl';
import LocaleSwitcher from '@/components/ui/locale-switcher';

const PawIcon = ({ className }: { className?: string }) => (
  <img 
    src="/assets/illustrations/animals/pawicon.png" 
    alt="Paw" 
    className={`${className} object-contain`} 
  />
);

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const pathname = usePathname();
  const t = useTranslations('Sidebar');

  const NAV_ITEMS = [
    { label: t('dashboard'), href: '/dashboard' },
    { label: t('hsk'), href: '/dashboard/courses/hsk' },
    { label: t('topic'), href: '/dashboard/courses/topic' },
    { label: t('practice'), href: '/dashboard/practice' },
    { label: t('exams'), href: '/dashboard/exams' },
    { label: t('achievements'), href: '/dashboard/achievements' },
    { label: t('resources'), href: '/dashboard/resources' },
    { label: t('settings'), href: '/dashboard/settings' },
  ];

  return (
    <ForestBackground className="p-4 sm:p-8">
      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-6 lg:flex-row lg:items-stretch lg:h-[calc(100vh-4rem)]">
        
        {/* Sidebar */}
        <aside className="flex-shrink-0 w-full lg:w-64 bg-white rounded-[2rem] p-4 lg:p-6 shadow-sm flex flex-col gap-2">
          
          <div className="mb-4 flex justify-center">
            <LocaleSwitcher />
          </div>

          <div className="flex-1 flex flex-col justify-center gap-1.5">
            {NAV_ITEMS.map((item) => {
            const isActive = item.href === '/dashboard' 
              ? pathname === item.href 
              : pathname.startsWith(item.href);

            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`flex items-center justify-start gap-3 w-full lg:w-48 mx-auto px-5 py-2.5 rounded-full transition-colors ${
                  isActive 
                    ? 'bg-[#e5f5eb] text-[#215b3b]' 
                    : 'text-[#215b3b] hover:bg-[#f3f9f5]'
                }`}
              >
                <PawIcon className="w-5 h-5 shrink-0" />
                <span className="font-[family-name:var(--font-nunito)] text-[15px] font-black">{item.label}</span>
              </Link>
            );
          })}
          </div>

          {/* VIP Status Box */}
          {user && (
            <div className="pt-4 border-t border-gray-100">
              <div className="bg-[#fefce8] rounded-2xl p-4 border border-[#fef08a] flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-700">{t('account')}</span>
                  {user.vipValidUntil && new Date(user.vipValidUntil) > new Date() ? (
                    <span className="px-2 py-0.5 rounded-full bg-[#fef08a] text-[#a16207] text-xs font-bold uppercase tracking-wider">
                      {t('vip')}
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-bold uppercase tracking-wider">
                      {t('free')}
                    </span>
                  )}
                </div>

                {user.vipValidUntil && new Date(user.vipValidUntil) > new Date() ? (
                  <p className="text-xs text-gray-500 font-medium">
                    {t('validUntil')}: <span className="text-[#a16207] font-bold">{new Date(user.vipValidUntil).toLocaleDateString('vi-VN')}</span>
                  </p>
                ) : (
                  <p className="text-xs text-gray-500 font-medium leading-relaxed">
                    {t('upgradeVipPrompt')}
                  </p>
                )}

                <Link
                  href="/dashboard/upgrade-vip"
                  className="mt-2 text-center text-sm font-bold text-[#854d0e] bg-[#fde047] hover:bg-[#facc15] py-2 rounded-xl transition-colors shadow-sm"
                >
                  {user.vipValidUntil && new Date(user.vipValidUntil) > new Date() ? t('extendVip') : t('requestVip')}
                </Link>
              </div>
            </div>
          )}
        </aside>
        
        {/* Main Content Area */}
        <main className={`flex-1 min-w-0 flex flex-col items-center overflow-y-auto custom-scrollbar h-full ${
          !(pathname.startsWith('/dashboard/courses') || pathname.startsWith('/dashboard/practice/lessons') || pathname.startsWith('/dashboard/achievements') || pathname.startsWith('/dashboard/exams')) 
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
