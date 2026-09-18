'use client';

import React from 'react';
import { Check, X } from 'lucide-react';
import type { ListeningOption } from '../utils/listening-question-generator';

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

interface ListeningOptionsGridProps {
  options: ListeningOption[];
  selectedOptionId: string | null;
  onSelectOption: (id: string) => void;
}

export function ListeningOptionsGrid({
  options,
  selectedOptionId,
  onSelectOption,
}: ListeningOptionsGridProps) {
  const isAnswered = selectedOptionId !== null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full max-w-2xl mb-4">
      {options.map((opt, idx) => {
        const isSelected = selectedOptionId === opt.id;
        const isCorrect = opt.isCorrect;

        let btnClass = 'bg-white text-gray-800 border-gray-100 hover:border-[#aadd4a] hover:bg-[#f9fdf5] shadow-sm';
        let badgeClass = 'bg-gray-100 text-gray-600';

        if (isAnswered) {
          if (isSelected) {
            if (isCorrect) {
              btnClass = 'bg-[#215b3b] text-white border-[#215b3b] shadow-lg scale-[1.02]';
              badgeClass = 'bg-white/20 text-white';
            } else {
              btnClass = 'bg-rose-600 text-white border-rose-600 shadow-lg scale-[1.02]';
              badgeClass = 'bg-white/20 text-white';
            }
          } else if (isCorrect) {
            btnClass = 'bg-emerald-50 text-emerald-800 border-emerald-500 shadow-md font-bold';
            badgeClass = 'bg-emerald-600 text-white';
          } else {
            btnClass = 'bg-white/60 text-gray-400 border-transparent opacity-40';
            badgeClass = 'bg-gray-100 text-gray-400';
          }
        }

        return (
          <button
            key={opt.id}
            onClick={() => onSelectOption(opt.id)}
            disabled={isAnswered}
            className={`relative py-3.5 sm:py-4 px-4 sm:px-6 rounded-2xl text-base sm:text-lg font-bold transition-all duration-200 border-2 flex items-center justify-between text-left group ${btnClass}`}
          >
            <div className="flex items-center gap-3">
              <span
                className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black transition-colors ${badgeClass}`}
              >
                {OPTION_LABELS[idx]}
              </span>
              <span className="line-clamp-2">{opt.text}</span>
            </div>

            {isAnswered && isCorrect && (
              <Check className={`w-6 h-6 shrink-0 ${isSelected ? 'text-white' : 'text-emerald-600'}`} />
            )}
            {isAnswered && isSelected && !isCorrect && (
              <X className="w-6 h-6 shrink-0 text-white" />
            )}
          </button>
        );
      })}
    </div>
  );
}
