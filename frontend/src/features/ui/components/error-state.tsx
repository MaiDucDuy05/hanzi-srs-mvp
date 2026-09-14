'use client';

import { Button } from '@/features/ui/components/button';
import { ServerCrash, RotateCcw } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function ErrorState({
  message,
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  const t = useTranslations('Ui');
  return (
    <div className="group relative mx-auto max-w-lg overflow-hidden rounded-[2.5rem] border border-rose-100/50 bg-white/70 p-10 text-center shadow-[0_20px_60px_-15px_rgba(225,29,72,0.1)] backdrop-blur-2xl transition-all duration-500 hover:shadow-[0_20px_60px_-15px_rgba(225,29,72,0.2)] dark:border-rose-900/30 dark:bg-zinc-950/70 dark:shadow-[0_20px_60px_-15px_rgba(225,29,72,0.2)]">
      {/* Subtle background glow */}
      <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-br from-rose-200/40 to-transparent blur-3xl transition-opacity duration-700 group-hover:opacity-70 dark:from-rose-900/20" />
      <div className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-gradient-to-tl from-red-200/40 to-transparent blur-3xl transition-opacity duration-700 group-hover:opacity-70 dark:from-red-900/20" />

      <div className="relative z-10 mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-rose-50 ring-8 ring-white dark:bg-rose-950/50 dark:ring-zinc-950">
        <div className="absolute inset-0 animate-ping rounded-full bg-rose-100/50 opacity-20 duration-3000 dark:bg-rose-800/20" />
        <ServerCrash
          className="relative h-10 w-10 text-rose-500 transition-transform duration-500 group-hover:scale-110 dark:text-rose-400"
          strokeWidth={1.5}
        />
      </div>

      <div className="relative z-10 space-y-3">
        <h3 className="bg-gradient-to-br from-zinc-800 to-zinc-500 bg-clip-text text-2xl font-semibold tracking-tight text-transparent dark:from-zinc-100 dark:to-zinc-400">
          {t('errorTitle')}
        </h3>
        <p className="mx-auto max-w-[280px] text-[15px] leading-relaxed text-zinc-500 dark:text-zinc-400">
          {message ?? t('errorMessage')}
        </p>
      </div>

      {onRetry && (
        <div className="relative z-10 mt-10">
          <Button
            variant="outline"
            onClick={onRetry}
            className="group/btn relative h-12 w-full overflow-hidden rounded-2xl border-0 bg-gradient-to-r from-rose-500 to-red-500 text-white shadow-lg shadow-rose-500/25 transition-all duration-300 hover:scale-[1.02] hover:shadow-rose-500/40 active:scale-[0.98] dark:from-rose-600 dark:to-red-600"
          >
            <div className="absolute inset-0 bg-white/20 opacity-0 transition-opacity duration-300 group-hover/btn:opacity-100" />
            <span className="relative flex items-center justify-center gap-2 text-[15px] font-medium tracking-wide">
              <RotateCcw className="h-4 w-4 transition-transform duration-500 group-hover/btn:-rotate-180" />
              {t('retryButton')}
            </span>
          </Button>
        </div>
      )}
    </div>
  );
}
