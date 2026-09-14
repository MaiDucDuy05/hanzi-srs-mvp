'use client';

import { cn } from '@/lib/utils/cn';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

export function Spinner({ className }: { className?: string }) {
  const t = useTranslations('Ui');
  return (
    <div
      role="status"
      aria-label={t('spinnerAria')}
      className={cn(
        'inline-block h-8 w-8 animate-spin rounded-full border-[3px] border-[#eaf3c5] border-t-[#78993a]',
        className,
      )}
    />
  );
}

/**
 * Loading state machine — drives the cheerful loading mascot.
 * Keys map 1-to-1 to UI strings in the `Ui` namespace so swapping locale
 * automatically picks the right copy + illustration set.
 */
const LOADING_STATE_KEYS = [
  { key: 'loadingState1', image: '/assets/illustrations/panda/panda.png' },
  { key: 'loadingState2', image: '/assets/illustrations/panda/panda-eating.svg' },
  { key: 'loadingState3', image: '/assets/illustrations/panda/panda-standing.svg' },
  { key: 'loadingState4', image: '/assets/illustrations/panda/panda-in-bamboo.svg' },
  { key: 'loadingState5', image: '/assets/illustrations/panda/panda-with-accessory.svg' },
  { key: 'loadingState6', image: '/assets/illustrations/panda/panda_shoot.png' },
] as const;

export function PageLoading({ label }: { label?: string }) {
  const t = useTranslations('Ui');
  const [stateIndex, setStateIndex] = useState(0);

  useEffect(() => {
    if (label) return;
    const interval = setInterval(() => {
      setStateIndex((prev) => (prev + 1) % LOADING_STATE_KEYS.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [label]);

  const currentState = label
    ? { text: label, image: LOADING_STATE_KEYS[0].image }
    : { text: t(LOADING_STATE_KEYS[stateIndex].key), image: LOADING_STATE_KEYS[stateIndex].image };

  return (
    <div className="flex min-h-[40vh] w-full flex-col items-center justify-center gap-8">
      <div className="relative flex items-center justify-center">
        {/* Outer glowing rings */}
        <div className="absolute h-32 w-32 animate-ping rounded-full bg-[#78993a] opacity-20" style={{ animationDuration: '3s' }}></div>
        <div className="absolute h-24 w-24 animate-pulse rounded-full bg-[#c2df7a] opacity-60" style={{ animationDuration: '2s' }}></div>

        {/* Center Icon */}
        <div className="relative z-10 flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-xl shadow-[#78993a]/20 border-2 border-[#eaf3c5] overflow-hidden p-3">
          <img
            src={currentState.image}
            alt={t('loadingPandaAlt')}
            className="animate-bounce object-contain w-full h-full"
            style={{ animationDuration: '2s' }}
          />
        </div>
      </div>

      <div className="flex flex-col items-center gap-3">
        <h3 className="font-[family-name:var(--font-nunito)] text-lg font-bold text-[#215b3b] animate-pulse">
          {currentState.text}
        </h3>
        <div className="flex gap-1.5">
          <span className="h-2 w-2 animate-bounce rounded-full bg-[#78993a] opacity-80 [animation-delay:-0.3s]"></span>
          <span className="h-2 w-2 animate-bounce rounded-full bg-[#78993a] opacity-80 [animation-delay:-0.15s]"></span>
          <span className="h-2 w-2 animate-bounce rounded-full bg-[#78993a] opacity-80"></span>
        </div>
      </div>
    </div>
  );
}
