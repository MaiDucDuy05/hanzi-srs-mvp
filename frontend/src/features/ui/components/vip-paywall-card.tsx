'use client';

import React from 'react';
import { Crown, Lock, Sparkles, ArrowLeft } from 'lucide-react';
import { Link, useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

interface VipPaywallCardProps {
  levelName?: string;
  lessonTitle?: string;
  backHref?: string;
}

export function VipPaywallCard({
  levelName,
  lessonTitle,
  backHref,
}: VipPaywallCardProps) {
  const router = useRouter();
  const t = useTranslations('Vip.lockModal');

  return (
    <div className="container mx-auto px-4 py-12 max-w-lg text-center">
      <div className="bg-white rounded-[2.5rem] border border-[#eaf3c5] p-8 sm:p-10 shadow-sm relative overflow-hidden">
        {/* Crown & Lock Icon */}
        <div className="mx-auto w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/25 mb-6 relative">
          <Crown className="w-10 h-10 text-white fill-white/20 animate-bounce" />
          <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-[#215b3b] border-2 border-white flex items-center justify-center shadow-md">
            <Lock className="w-4 h-4 text-white" />
          </div>
        </div>

        {/* Heading */}
        <h2 className="text-2xl sm:text-3xl font-black text-[#11321e] mb-3 font-heading">
          {t('modalTitle')}
        </h2>

        {/* Explanatory text */}
        <p className="text-gray-600 text-sm leading-relaxed mb-6">
          {levelName ? (
            <span>
              {t('modalDesc', { level: levelName })}
            </span>
          ) : (
            t('modalDefaultDesc')
          )}
          {lessonTitle && (
            <span className="block font-semibold text-gray-800 mt-1">
              {t('lessonLabel', { title: lessonTitle })}
            </span>
          )}
          <span className="block mt-2 text-xs text-gray-500">
            {t('upgradePrompt')}
          </span>
        </p>

        {/* Buttons */}
        <div className="space-y-3">
          <Link
            href="/upgrade-vip"
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-sm shadow-md shadow-amber-500/25 flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <Sparkles className="w-4 h-4 fill-white" />
            <span>{t('upgradeNow')}</span>
          </Link>

          {backHref ? (
            <Link
              href={backHref}
              className="w-full py-3 px-4 rounded-xl text-xs font-bold text-[#215b3b] hover:bg-[#e5f5eb] transition-all flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t('backToLessons')}</span>
            </Link>
          ) : (
            <button
              onClick={() => router.back()}
              className="w-full py-3 px-4 rounded-xl text-xs font-bold text-[#215b3b] hover:bg-[#e5f5eb] transition-all flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t('backToLessons')}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
