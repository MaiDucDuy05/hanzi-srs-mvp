'use client';

import { useState } from 'react';
import { computeScore, shuffle, type ModeProps, type ModeResult } from '../practice/practice-models';
import { cn } from '@/lib/utils/cn';

interface MemoryCard {
  id: string;
  pairId: string;
  kind: 'hanzi' | 'pinyin';
  value: string;
  matched: boolean;
}

export interface MemoryState {
  cards: MemoryCard[];
  flipped: string[];
  correct: number;
  wrong: number;
  moves: number;
  lock: boolean;
}

const MAX_PAIRS = 8;

/** Trò chơi trí nhớ: lật cặp chữ Hán ↔ pinyin (PR-12). */
export function MemoryMode({
  items,
  initialState,
  onStateChange,
  onComplete,
}: ModeProps<MemoryState>) {
  const [state, setState] = useState<MemoryState>(() => {
    if (initialState) return { ...initialState, flipped: [], lock: false };
    const pairs = shuffle(items).slice(0, Math.min(MAX_PAIRS, items.length));
    const cards: MemoryCard[] = shuffle(
      pairs.flatMap((q) => [
        { id: `${q.id}:h`, pairId: q.id, kind: 'hanzi', value: q.hanzi, matched: false },
        { id: `${q.id}:p`, pairId: q.id, kind: 'pinyin', value: q.pinyin, matched: false },
      ]),
    );
    return { cards, flipped: [], correct: 0, wrong: 0, moves: 0, lock: false };
  });

  const update = (next: MemoryState) => {
    setState(next);
    onStateChange(next);
  };

  const flip = (id: string) => {
    if (state.lock || state.flipped.length >= 2) return;
    if (state.flipped.includes(id)) return;
    const card = state.cards.find((c) => c.id === id);
    if (!card || card.matched) return;

    const flipped = [...state.flipped, id];
    const next = { ...state, flipped };

    if (flipped.length === 2) {
      const [aId, bId] = flipped;
      const a = state.cards.find((c) => c.id === aId)!;
      const b = state.cards.find((c) => c.id === bId)!;
      const match = a.pairId === b.pairId;
      const matchedState: MemoryState = {
        ...next,
        lock: true,
        moves: state.moves + 1,
        correct: state.correct + (match ? 1 : 0),
        wrong: state.wrong + (match ? 0 : 1),
        cards: state.cards.map((c) => (c.id === a.id || c.id === b.id ? { ...c, matched: match || c.matched } : c)),
      };
      update(matchedState);
      setTimeout(() => {
        const allMatched = matchedState.cards.every((c) => c.matched);
        if (allMatched) {
          const result: ModeResult = {
            correctCount: matchedState.correct,
            wrongCount: matchedState.wrong,
            moveCount: matchedState.moves,
            score: computeScore(matchedState.correct, matchedState.cards.length / 2),
            answerData: { pairs: matchedState.cards.length / 2 },
          };
          onComplete(result);
        } else {
          update({ ...matchedState, flipped: [], lock: false });
        }
      }, 800);
    } else {
      update(next);
    }
  };

  const isFlipped = (id: string) => state.flipped.includes(id) || state.cards.find((c) => c.id === id)?.matched;

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>Cặp đã ghép: {state.cards.filter((c) => c.matched).length / 2}/{state.cards.length / 2}</span>
        <span>
          Đúng {state.correct} · Sai {state.wrong} · Lượt {state.moves}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {state.cards.map((card) => {
          const show = isFlipped(card.id);
          return (
            <button
              key={card.id}
              onClick={() => flip(card.id)}
              className={cn(
                'flex aspect-[3/4] items-center justify-center rounded-lg border text-sm transition-all',
                show
                  ? card.matched
                    ? 'border-green-300 bg-green-50 text-green-700 dark:bg-green-950'
                    : card.kind === 'hanzi'
                      ? 'hanzi border-brand bg-brand-light text-xl font-bold text-brand dark:bg-brand/20'
                      : 'border-indigo-300 bg-indigo-50 text-indigo-700 dark:bg-indigo-950'
                  : 'border-gray-200 bg-gray-100 text-gray-400 hover:border-brand dark:border-gray-700 dark:bg-gray-800',
              )}
            >
              {show ? card.value : '?'}
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
