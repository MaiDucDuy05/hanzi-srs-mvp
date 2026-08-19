'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface SentenceTokenProps {
  text: string;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

export function SentenceToken({ text, selected, onClick, className }: SentenceTokenProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'px-6 py-4 text-3xl font-bold font-["Ma_Shan_Zheng","KaiTi",sans-serif] rounded-2xl cursor-pointer shadow-md transition-all select-none',
        selected
          ? 'bg-[#aadd4a] text-white hover:bg-[#97cf34] border-4 border-[#aadd4a]'
          : 'bg-white border-4 border-[#eef7e9] text-[#215b3b] hover:border-[#8BC34A] hover:bg-[#f9fdf5]',
        className
      )}
    >
      {text}
    </div>
  );
}

interface SwapArrowProps {
  direction: 'left' | 'right';
  onClick: (e: React.MouseEvent) => void;
  visible: boolean;
}

export function SwapArrow({ direction, onClick, visible }: SwapArrowProps) {
  if (!visible) return null;
  return (
    <button
      onClick={onClick}
      className="bg-white text-[#215b3b] rounded-full p-1.5 shadow-md border border-gray-200 hover:bg-gray-100 active:bg-gray-200"
    >
      {direction === 'left' ? <ChevronLeft size={16} strokeWidth={3} /> : <ChevronRight size={16} strokeWidth={3} />}
    </button>
  );
}
