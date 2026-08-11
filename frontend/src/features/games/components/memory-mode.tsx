'use client';

/**
 * MemoryMode — UI thin layer over MemorySec
 *
 * Responsibilities:
 * - Render card grid (4x4)
 * - Subscribe to SEC events
 * - Pass flip interactions to SEC
 * - Handle CSS animations for flip/match
 */

import { useEffect, useRef, useState } from 'react';
import { MemorySec, type MemoryCtx as MemoryState } from '../sec/memory-sec';
import type { QuestionItem, ModeResult } from '../../practice/components/practice-models';
import { cn } from '@/lib/utils/cn';

interface MemoryModeProps {
  items: readonly QuestionItem[];
  initialState?: MemoryState | null;
  onStateChange: (state: MemoryState) => void;
  onComplete: (result: ModeResult) => void;
}

export { MemoryState };

export function MemoryMode({ items, initialState, onStateChange, onComplete }: MemoryModeProps) {
  const secRef = useRef<MemorySec | null>(null);
  const [ctx, setCtx] = useState<MemoryState>(() => initialState ?? createInitCtx(items));

  useEffect(() => {
    const sec = new MemorySec(items);
    secRef.current = sec;

    const unsubComplete = sec.onComplete.addListener((data) => {
      onComplete({
        correctCount: data.correct,
        wrongCount: data.wrong,
        moveCount: ctx.moves,
        score: data.score,
        answerData: { pairs: data.pairs },
      });
    });

    const interval = setInterval(() => {
      if (secRef.current) {
        setCtx(secRef.current.getState());
      }
    }, 50);

    const initCtx = sec.start();
    setCtx(initCtx);
    onStateChange(initCtx);

    return () => {
      clearInterval(interval);
      unsubComplete();
      sec.destroy();
    };
  }, [items, onComplete, onStateChange]);

  const handleFlip = (cardId: string) => {
    secRef.current?.flip(cardId);
  };

  const isCardFlipped = (cardId: string): boolean => {
    const card = ctx.cards.find((c) => c.id === cardId);
    return (card?.matched ?? false) || ctx.flipped.includes(cardId);
  };

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>Cặp đã ghép: {ctx.matchedPairs}/{ctx.totalPairs}</span>
        <span>
          Đúng {ctx.correctCount} · Sai {ctx.wrongCount} · Lượt {ctx.moves}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {ctx.cards.map((card) => {
          const flipped = isCardFlipped(card.id);
          return (
            <button
              key={card.id}
              onClick={() => handleFlip(card.id)}
              disabled={ctx.phase === 'feedback' || card.matched}
              className={cn(
                'flex aspect-[3/4] items-center justify-center rounded-lg border text-sm transition-all',
                flipped
                  ? card.matched
                    ? 'border-green-300 bg-green-50 text-green-700 font-bold'
                    : card.kind === 'hanzi'
                      ? 'hanzi border-brand bg-brand-light text-xl font-bold text-brand'
                      : 'border-indigo-300 bg-indigo-50 text-indigo-700 font-semibold'
                  : 'border-gray-200 bg-gray-100 text-gray-400 hover:border-brand',
              )}
            >
              {flipped ? card.value : '?'}
            </button>
          );
        })}
      </div>

      <p className="text-center text-xs text-gray-400">
        Lật hai thẻ: một chữ Hán và một pinyin khớp nhau sẽ được giữ lại.
      </p>
    </div>
  );
}

function createInitCtx(items: readonly QuestionItem[]): MemoryState {
  return {
    phase: 'idle',
    cards: [],
    flipped: [],
    matchedPairs: 0,
    totalPairs: Math.min(8, items.length),
    correctCount: 0,
    wrongCount: 0,
    moves: 0,
  };
}
