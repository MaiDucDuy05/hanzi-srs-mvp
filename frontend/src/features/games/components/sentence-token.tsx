'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { SentenceToken as SentenceTokenType } from '@/lib/api/types';
import { cn } from '@/lib/utils/cn';

interface SelectedGameTokenProps {
  token: SentenceTokenType;
  index: number;
  total: number;
  onSwapLeft: () => void;
  onSwapRight: () => void;
  onDeselect: () => void;
}

/**
 * Chip từ trong vùng Drop Zone của Game Sắp xếp câu (Sentence Forest).
 * Tích hợp mũi tên sang trái/phải vào 2 bên mép thẻ, triệt tiêu double arrow và chống tràn vỡ giao diện.
 */
export function SelectedGameToken({
  token,
  index,
  total,
  onSwapLeft,
  onSwapRight,
  onDeselect,
}: SelectedGameTokenProps) {
  return (
    <div className="group inline-flex items-stretch rounded-2xl bg-[#8BC34A] text-white shadow-sm hover:shadow-md border-2 border-[#7cb342] transition-all select-none overflow-hidden max-w-full">
      {/* Mũi tên trái */}
      {index > 0 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSwapLeft();
          }}
          className="flex items-center justify-center px-1.5 sm:px-2 bg-black/10 hover:bg-black/25 text-white transition-colors"
          title="Đổi sang trái"
          aria-label="Đổi từ sang trái"
        >
          <ChevronLeft size={16} strokeWidth={2.5} />
        </button>
      )}

      {/* Thân từ Hán */}
      <button
        type="button"
        onClick={onDeselect}
        title="Bấm để bỏ từ"
        className="px-3.5 py-1.5 sm:px-4 sm:py-2 text-xl sm:text-2xl font-bold font-['Ma_Shan_Zheng','KaiTi',sans-serif] tracking-wide hover:bg-black/10 transition-colors whitespace-nowrap min-w-0 max-w-[200px] truncate"
      >
        {token.text}
      </button>

      {/* Mũi tên phải */}
      {index < total - 1 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSwapRight();
          }}
          className="flex items-center justify-center px-1.5 sm:px-2 bg-black/10 hover:bg-black/25 text-white transition-colors"
          title="Đổi sang phải"
          aria-label="Đổi từ sang phải"
        >
          <ChevronRight size={16} strokeWidth={2.5} />
        </button>
      )}
    </div>
  );
}

interface BankGameTokenProps {
  token: SentenceTokenType;
  onClick: () => void;
}

/**
 * Thẻ từ chưa chọn trong ngân hàng từ (Token Bank) của Game.
 */
export function BankGameToken({ token, onClick }: BankGameTokenProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'px-3.5 py-1.5 sm:px-4 sm:py-2 text-xl sm:text-2xl font-bold font-["Ma_Shan_Zheng","KaiTi",sans-serif]',
        'bg-white text-[#215b3b] border-2 border-[#e0ebd5] rounded-2xl shadow-2xs',
        'hover:border-[#8BC34A] hover:bg-[#f9fdf5] hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all select-none',
        'whitespace-nowrap max-w-[220px] truncate',
      )}
    >
      {token.text}
    </button>
  );
}

/**
 * Hỗ trợ tương thích ngược (Legacy components)
 */
export { BankGameToken as SentenceToken };

export function SwapArrow({
  direction,
  onClick,
  visible,
}: {
  direction: 'left' | 'right';
  onClick: (e: React.MouseEvent) => void;
  visible: boolean;
}) {
  if (!visible) return null;
  return (
    <button
      type="button"
      onClick={onClick}
      className="bg-white text-[#215b3b] rounded-full p-1 shadow-2xs border border-gray-200 hover:bg-gray-100 transition-colors"
    >
      {direction === 'left' ? (
        <ChevronLeft size={14} strokeWidth={2.5} />
      ) : (
        <ChevronRight size={14} strokeWidth={2.5} />
      )}
    </button>
  );
}
