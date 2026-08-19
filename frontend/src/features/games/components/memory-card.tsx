'use client';

import React from 'react';
import { cn } from '@/lib/utils/cn';

interface MemoryCardProps {
  card: { id: string; content: string; pairId: string };
  isFlipped: boolean;
  isMatched: boolean;
  onClick: () => void;
}

export function MemoryCard({ card, isFlipped, isMatched, onClick }: MemoryCardProps) {
  const textClass = card.content.length > 5 ? 'text-sm sm:text-lg' : 'text-3xl sm:text-4xl';

  return (
    <div
      onClick={onClick}
      className="w-[72px] h-[88px] sm:w-[96px] sm:h-[112px] md:w-[112px] md:h-[132px] lg:w-[120px] lg:h-[144px] perspective-1000 cursor-pointer group"
    >
      <div className={cn(
        'relative w-full h-full transition-transform duration-500 transform-style-3d',
        isFlipped ? 'rotate-y-180' : ''
      )}>
        {/* Back */}
        <div className={cn(
          'absolute inset-0 backface-hidden bg-[#aadd4a] rounded-xl sm:rounded-2xl shadow-md border-2 sm:border-4 border-white flex items-center justify-center transition-transform group-hover:-translate-y-1',
          isFlipped ? 'pointer-events-none' : ''
        )}>
          <div className="w-8 h-8 sm:w-12 sm:h-12 border-2 sm:border-4 border-white/50 rounded-full flex items-center justify-center">
            <span className="text-white/80 font-bold text-xl sm:text-2xl">?</span>
          </div>
        </div>

        {/* Front */}
        <div className={cn(
          'absolute inset-0 backface-hidden rotate-y-180 bg-white rounded-xl sm:rounded-2xl shadow-md flex items-center justify-center',
          textClass, 'font-bold text-center p-1 sm:p-2',
          isMatched
            ? 'border-2 sm:border-4 border-[#8BC34A] text-[#8BC34A] opacity-60 scale-95'
            : 'border-2 sm:border-4 border-[#eef7e9] text-[#215b3b]'
        )}>
          <span className="line-clamp-2">{card.content}</span>
        </div>
      </div>
    </div>
  );
}
