'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { MemoryCard } from './memory-card';
import { BambooProgressBar } from '@/features/ui/components/bamboo-progress-bar';
import { shuffle, type ModeResult, type QuestionItem } from '@/features/practice/components/practice-models';

export interface MemoryState {
  cards: Array<{ id: string; content: string; pairId: string }>;
  flipped: number[];
  matchedPairIds: string[];
  mistakes: number;
  moves: number;
  isGameActive: boolean;
}

function pickPairs(items: QuestionItem[]): QuestionItem[] {
  return shuffle(items).slice(0, Math.min(8, Math.max(4, items.length)));
}

function buildCards(pairs: QuestionItem[]) {
  const cards: Array<{ id: string; content: string; pairId: string }> = [];
  for (const item of pairs) {
    cards.push({ id: `${item.id}-hanzi`, content: item.hanzi, pairId: item.id });
    cards.push({ id: `${item.id}-pinyin`, content: item.pinyin, pairId: item.id });
  }
  return shuffle(cards);
}

function formatTime(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const s = (totalSeconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

interface MemoryBoardProps {
  items: QuestionItem[];
  initialState: MemoryState | null;
  onStateChange: (state: MemoryState) => void;
  onComplete: (result: ModeResult) => void;
  elapsed?: number;
}

export function MemoryBoard({ items, initialState, onStateChange, onComplete, elapsed = 0 }: MemoryBoardProps) {
  const pairs = useMemo(() => pickPairs(items), [items]);

  const [state, setState] = useState<MemoryState>(() => {
    if (initialState) return initialState;
    return { cards: buildCards(pairs), flipped: [], matchedPairIds: [], mistakes: 0, moves: 0, isGameActive: true };
  });

  const [isProcessing, setIsProcessing] = useState(false);



  useEffect(() => { onStateChange(state); }, [state, onStateChange]);

  const handleFlip = (index: number) => {
    if (isProcessing) return;
    if (state.flipped.includes(index)) return;
    if (state.matchedPairIds.includes(state.cards[index].pairId)) return;

    const newFlipped = [...state.flipped, index];

    if (newFlipped.length === 1) {
      setState(s => ({ ...s, flipped: newFlipped }));
      return;
    }

    if (newFlipped.length === 2) {
      const [first, second] = newFlipped;
      const card1 = state.cards[first];
      const card2 = state.cards[second];
      const nextMoves = state.moves + 1;
      setState(s => ({ ...s, flipped: newFlipped, moves: nextMoves }));
      setIsProcessing(true);

      if (card1.pairId === card2.pairId) {
        setTimeout(() => {
          const nextMatched = [...state.matchedPairIds, card1.pairId];
          const isComplete = nextMatched.length === pairs.length;
          setState(s => ({
            ...s, matchedPairIds: nextMatched, flipped: [], isGameActive: !isComplete,
          }));
          if (isComplete) {
            onComplete({
              score: Math.max(0, 100 - state.mistakes * 10),
              correctCount: pairs.length, wrongCount: state.mistakes,
              moveCount: nextMoves, answerData: { mode: 'MEMORY', pairs: pairs.length },
            });
          }
          setIsProcessing(false);
        }, 600);
      } else {
        setTimeout(() => {
          setState(s => ({ ...s, flipped: [], mistakes: s.mistakes + 1 }));
          setIsProcessing(false);
        }, 1000);
      }
    }
  };

  const progress = Math.round((state.matchedPairIds.length / pairs.length) * 100);

  return (
    <div className="flex-1 flex flex-col items-center w-full max-w-5xl mx-auto px-2 py-2 sm:py-4 relative z-10 h-full max-h-[85vh]">
      {/* Header */}
      <div className="w-full flex flex-col md:flex-row items-center justify-between gap-2 sm:gap-4 mb-2 sm:mb-4 shrink-0">
        <h1 className="text-xl sm:text-3xl font-black text-[#215b3b] font-heading drop-shadow-sm text-center md:text-left flex-1 line-clamp-1">
          Memory Grove
        </h1>
        <div className="flex items-center gap-3 sm:gap-6 w-full md:w-auto">
          <div className="bg-[#d4ebd0] text-[#215b3b] font-bold text-sm sm:text-xl px-3 py-1.5 sm:px-4 sm:py-2 rounded-full flex items-center gap-2 shadow-sm whitespace-nowrap">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {formatTime(elapsed)}
          </div>
          <div className="w-[120px] sm:w-[260px]">
            <BambooProgressBar
              progress={progress}
              label={`${state.matchedPairIds.length}/${pairs.length} Cặp`}
              className="!h-[50px] sm:!h-[80px]"
              hidePanda={true}
              labelClassName="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] sm:text-sm text-[#215b3b] bg-white/70 px-1 py-0.5 rounded"
            />
          </div>
        </div>
      </div>

      {/* Card grid */}
      <div className="flex flex-wrap justify-center content-center items-center gap-2 sm:gap-3 md:gap-4 w-full flex-1">
        {state.cards.map((card, index) => (
          <MemoryCard
            key={card.id}
            card={card}
            isFlipped={state.flipped.includes(index) || state.matchedPairIds.includes(card.pairId)}
            isMatched={state.matchedPairIds.includes(card.pairId)}
            onClick={() => handleFlip(index)}
          />
        ))}
      </div>
    </div>
  );
}
