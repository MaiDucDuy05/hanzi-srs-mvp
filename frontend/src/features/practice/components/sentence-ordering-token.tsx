'use client';

import React from 'react';
import type { SentenceToken } from '@/lib/api/types';
import { cn } from '@/lib/utils/cn';

interface SelectedTokenChipProps {
  token: SentenceToken;
  position: number;
  totalSelected: number;
  isCompact?: boolean;
  feedback: 'correct' | 'wrong' | null;
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onRemove: () => void;
}

/**
 * Chip hiển thị từ đã được chọn trong vùng ghép câu (Answer Zone).
 * Tích hợp nút mũi tên trái/phải gọn gàng trong cùng một thẻ, chống vỡ layout khi nhiều từ.
 */
export function SelectedTokenChip({
  token,
  position,
  totalSelected,
  isCompact = false,
  feedback,
  onMoveLeft,
  onMoveRight,
  onRemove,
}: SelectedTokenChipProps) {
  const isWrong = feedback === 'wrong';
  const isCorrect = feedback === 'correct';

  return (
    <div
      className={cn(
        'group inline-flex items-stretch rounded-xl border-2 transition-all select-none shadow-2xs max-w-full overflow-hidden',
        isWrong
          ? 'border-red-400 bg-red-50 text-red-600 line-through'
          : isCorrect
          ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
          : 'border-[#8BC34A] bg-white text-gray-800 hover:border-[#5E7F26]',
      )}
    >
      {/* Nút dịch sang trái */}
      {position > 0 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onMoveLeft();
          }}
          disabled={!!feedback}
          aria-label="Di chuyển từ sang trái"
          title="Dịch sang trái"
          className={cn(
            'flex items-center justify-center border-r border-[#8BC34A]/30 text-gray-400 hover:bg-[#f3f8d7] hover:text-[#5E7F26] disabled:opacity-30 transition-colors',
            isCompact ? 'px-1 text-xs' : 'px-1.5 text-sm',
          )}
        >
          ‹
        </button>
      )}

      {/* Chữ Hán / nội dung từ — bấm vào để trả lại ngân hàng từ */}
      <button
        type="button"
        onClick={onRemove}
        disabled={!!feedback}
        title="Bấm để bỏ từ này"
        className={cn(
          'hanzi font-bold transition-colors whitespace-nowrap min-w-0 max-w-[200px] truncate',
          isCompact ? 'px-2 py-1 text-base sm:text-lg' : 'px-3 py-1.5 text-lg sm:text-xl',
          !feedback && 'hover:bg-red-50 hover:text-red-500',
        )}
      >
        {token.text}
      </button>

      {/* Nút dịch sang phải */}
      {position < totalSelected - 1 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onMoveRight();
          }}
          disabled={!!feedback}
          aria-label="Di chuyển từ sang phải"
          title="Dịch sang phải"
          className={cn(
            'flex items-center justify-center border-l border-[#8BC34A]/30 text-gray-400 hover:bg-[#f3f8d7] hover:text-[#5E7F26] disabled:opacity-30 transition-colors',
            isCompact ? 'px-1 text-xs' : 'px-1.5 text-sm',
          )}
        >
          ›
        </button>
      )}
    </div>
  );
}

interface BankTokenChipProps {
  token: SentenceToken;
  isCompact?: boolean;
  disabled?: boolean;
  onPick: () => void;
}

/**
 * Chip từ chưa chọn trong ngân hàng từ (Token Bank).
 */
export function BankTokenChip({
  token,
  isCompact = false,
  disabled = false,
  onPick,
}: BankTokenChipProps) {
  return (
    <button
      type="button"
      onClick={onPick}
      disabled={disabled}
      className={cn(
        'hanzi rounded-xl border-2 border-gray-200 bg-white font-bold text-gray-800 shadow-2xs transition-all select-none',
        'hover:border-[#8BC34A] hover:bg-[#f9fdf5] hover:text-[#5E7F26] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed',
        'max-w-[220px] truncate whitespace-nowrap',
        isCompact ? 'px-2.5 py-1 text-base sm:text-lg' : 'px-3.5 py-1.5 text-lg sm:text-xl',
      )}
    >
      {token.text}
    </button>
  );
}
