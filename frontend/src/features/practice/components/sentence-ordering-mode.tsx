'use client';

import React from 'react';
import type { SentenceQuestion } from '@/lib/api/types';
import type { ModeResult } from './practice-models';
import { Button } from '@/features/ui/components/button';
import { Check, RotateCcw } from 'lucide-react';
import { SelectedTokenChip, BankTokenChip } from './sentence-ordering-token';
import {
  useSentenceOrderingState,
  type OrderingState,
} from './use-sentence-ordering-state';

export type { OrderingState };

interface SentenceOrderingModeProps {
  /** Danh sách câu hỏi từ backend (đã shuffle token) */
  questions: SentenceQuestion[];
  initialState?: OrderingState | null;
  /** Lưu userAnswers: questionId → tokenIds[] */
  onAnswersChange: (answers: Record<string, string[]>) => void;
  /** Gọi khi người dùng hoàn thành tất cả các câu */
  onComplete: (result: ModeResult) => void;
}

/**
 * Giao diện luyện tập Sắp xếp câu (Sentence Ordering).
 * Hỗ trợ co giãn linh hoạt, chống tràn UI khi câu có nhiều từ hoặc từ dài.
 */
export function SentenceOrderingMode({
  questions,
  initialState,
  onAnswersChange,
  onComplete,
}: SentenceOrderingModeProps) {
  const {
    state,
    total,
    question,
    remainingTokens,
    isCompact,
    canSubmit,
    progressPercent,
    pickToken,
    removeToken,
    resetAnswer,
    moveLeft,
    moveRight,
    check,
  } = useSentenceOrderingState({
    questions,
    initialState,
    onAnswersChange,
    onComplete,
  });

  if (!question) return null;

  return (
    <div className="w-full max-w-2xl sm:max-w-3xl mx-auto space-y-4 sm:space-y-6">
      {/* Thanh tiến độ và số câu đúng / sai */}
      <div className="space-y-1.5 px-1">
        <div className="flex items-center justify-between text-xs sm:text-sm font-semibold text-gray-500">
          <span className="text-[#215b3b] font-bold">
            Câu {state.index + 1} / {total}
          </span>
          <span className="flex items-center gap-2">
            <span className="text-emerald-600">Đúng: {state.correct}</span>
            <span>·</span>
            <span className="text-rose-500">Sai: {state.wrong}</span>
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200/70">
          <div
            className="h-full bg-gradient-to-r from-[#8BC34A] to-[#5E7F26] transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Thẻ nội dung câu hỏi */}
      <div className="rounded-3xl border border-[#d8ecd8] bg-white/95 p-5 sm:p-7 shadow-soft text-center transition-all">
        {question.translation && (
          <p className="text-xl sm:text-2xl font-bold text-[#215b3b] font-heading mb-1.5">
            {question.translation}
          </p>
        )}
        {question.explanation && (
          <p className="text-sm text-gray-500 italic mb-3">{question.explanation}</p>
        )}

        {/* Thanh tiêu đề vùng ghép và nút Đặt lại */}
        <div className="flex items-center justify-between mt-3 mb-1 px-1">
          <p className="text-xs sm:text-sm font-medium text-gray-400">
            Sắp xếp các từ thành câu đúng:
          </p>
          {state.answer.length > 0 && !state.feedback && (
            <button
              type="button"
              onClick={resetAnswer}
              className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-rose-600 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Đặt lại</span>
            </button>
          )}
        </div>

        {/* Vùng trả lời — Drop Zone (giới hạn max-h có cuộn, chống tràn dọc) */}
        <div className="flex min-h-[68px] max-h-52 overflow-y-auto flex-wrap items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#8BC34A] bg-[#f9fdf5]/80 p-3 sm:p-4 transition-all shadow-inner">
          {state.answer.length === 0 && (
            <span className="text-sm text-gray-400 select-none">
              Chạm từ bên dưới để ghép câu
            </span>
          )}
          {state.answer.map((tokenId, pos) => {
            const token = question.tokens.find((t) => t.id === tokenId);
            if (!token) return null;
            return (
              <SelectedTokenChip
                key={`${tokenId}-${pos}`}
                token={token}
                position={pos}
                totalSelected={state.answer.length}
                isCompact={isCompact}
                feedback={state.feedback}
                onMoveLeft={() => moveLeft(pos)}
                onMoveRight={() => moveRight(pos)}
                onRemove={() => removeToken(pos)}
              />
            );
          })}
        </div>

        {/* Vùng chọn — Token Bank (giới hạn max-h có cuộn, co giãn khi nhiều từ) */}
        <div className="mt-4 flex max-h-48 sm:max-h-56 overflow-y-auto flex-wrap items-center justify-center gap-2 p-1">
          {remainingTokens.map((token) => (
            <BankTokenChip
              key={token.id}
              token={token}
              isCompact={isCompact}
              disabled={!!state.feedback}
              onPick={() => pickToken(token.id)}
            />
          ))}
        </div>

        {/* Thông báo phản hồi đúng / sai */}
        {state.feedback === 'correct' && (
          <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-4 py-1.5 text-sm font-bold text-emerald-700">
            <span>Chính xác!</span>
            <Check className="w-4 h-4 stroke-[2.5]" />
          </div>
        )}
        {state.feedback === 'wrong' && (
          <div className="mt-4 inline-flex items-center rounded-full bg-rose-50 px-4 py-1.5 text-sm font-bold text-rose-700">
            Chưa đúng — thử lại câu khác nhé!
          </div>
        )}

        {/* Nút kiểm tra */}
        <div className="mt-5">
          <Button
            onClick={check}
            disabled={!canSubmit}
            className="px-8 py-2.5 rounded-full font-bold shadow-sm"
          >
            Kiểm tra
          </Button>
        </div>

        {/* Số token còn thiếu */}
        {!canSubmit && state.answer.length > 0 && (
          <p className="mt-2 text-xs text-gray-400 font-medium">
            {question.tokens.length - state.answer.length} từ còn thiếu
          </p>
        )}
      </div>
    </div>
  );
}
