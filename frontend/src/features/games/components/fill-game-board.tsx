'use client';

/**
 * FillGameBoard — playing screen for the "Điền từ" (fill-in-the-blank) game.
 * Cute Panda Forest aesthetic: speech-bubble question card with a highlighted
 * blank slot, a peeking panda mascot, and letter-badged option cards.
 */
import React, { useState, useEffect } from 'react';
import type { FillBlankQuestion } from '@/lib/api/types';

interface FillGameBoardProps {
  question: FillBlankQuestion;
  onAnswer: (answerText: string) => void;
}

/** Letter badges for options (A, B, C, …). */
const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

export function FillGameBoard({ question, onAnswer }: FillGameBoardProps) {
  const [selected, setSelected] = useState<string | null>(null);

  // Reset selection whenever the question changes.
  useEffect(() => {
    setSelected(null);
  }, [question.questionId]);

  if (!question) return null;

  const handleSelect = (text: string) => {
    if (selected) return; // lock once chosen
    setSelected(text);
    // Brief reveal pause before advancing (server grades correctness).
    setTimeout(() => onAnswer(text), 850);
  };

  // Split the prompt around the blank marker and render a live slot.
  const parts = question.prompt.split('______');

  return (
    <div className="flex-1 flex flex-col items-center justify-center w-full max-w-2xl mx-auto px-4 py-4 relative z-10 gap-5">
      {/* ── Question card (speech-bubble style) ── */}
      <div className="w-full relative bg-[#eaf3c5] rounded-[2rem] p-6 sm:p-8 shadow-[0_8px_24px_rgba(94,127,38,0.10)] border-2 border-white/70">
        {/* Peeking panda mascot (decorative) */}
        <img
          src="/assets/illustrations/panda/panda-holding-ball.svg"
          alt=""
          aria-hidden="true"
          className="hidden sm:block absolute -top-9 -right-5 w-20 h-20 drop-shadow-md animate-panda-idle pointer-events-none"
        />

        <p className="text-xs font-black text-[#78993a] uppercase tracking-[0.2em] mb-4 text-center">
          Chọn từ đúng để điền vào chỗ trống
        </p>

        {/* Prompt with the live blank slot */}
        <div className="flex items-center justify-center flex-wrap gap-x-2 gap-y-1 mb-4 text-2xl sm:text-3xl font-serif text-[#215b3b] leading-loose">
          {parts.map((part, i) => (
            <React.Fragment key={i}>
              <span>{part}</span>
              {i < parts.length - 1 && (
                <span
                  className={`inline-flex items-center justify-center min-w-[3.5rem] px-3 py-0.5 rounded-xl text-2xl sm:text-3xl font-bold font-serif transition-all duration-300 ${
                    selected
                      ? 'bg-[#c7cf35] text-[#215b3b] border-2 border-[#78993a] scale-105'
                      : 'bg-white/70 text-[#78993a] border-2 border-dashed border-[#78993a]'
                  }`}
                >
                  {selected || '＿'}
                </span>
              )}
            </React.Fragment>
          ))}
        </div>

        {question.translation && (
          <p className="text-base sm:text-lg text-[#4a5a3a]/70 font-medium leading-relaxed text-center italic">
            {question.translation}
          </p>
        )}
      </div>

      {/* ── Options ── */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {question.options.map((opt, i) => {
          const isSelected = selected === opt;
          const letter = OPTION_LETTERS[i] ?? String(i + 1);

          let btnClass = 'bg-white border-2 border-[#dde8a6] hover:border-[#78993a] hover:bg-[#f3f8d7] text-[#215b3b]';
          let badgeClass = 'bg-[#eaf3c5] text-[#5e7f26]';
          if (isSelected) {
            btnClass = 'bg-[#5e7f26] border-[#4a6520] text-white scale-[1.03] shadow-lg';
            badgeClass = 'bg-[#c7cf35] text-[#215b3b]';
          } else if (selected && !isSelected) {
            btnClass = 'bg-[#f3f8d7] border-[#dde8a6] text-[#4a5a3a]/40 opacity-60';
            badgeClass = 'bg-[#dde8a6] text-[#78993a]/50';
          }

          return (
            <button
              key={`${opt}-${i}`}
              onClick={() => handleSelect(opt)}
              disabled={!!selected}
              className={`relative flex items-center gap-3 sm:gap-4 p-4 sm:p-5 rounded-2xl font-bold text-xl sm:text-2xl font-serif transition-all duration-200 active:scale-95 ${btnClass}`}
            >
              <span
                className={`flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm font-black transition-colors ${badgeClass}`}
              >
                {letter}
              </span>
              <span className="flex-1 text-center sm:pr-10">{opt}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
