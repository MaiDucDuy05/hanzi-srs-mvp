'use client';

import { useMemo, useState } from 'react';
import {
  computeScore,
  shuffle,
  type ModeProps,
  type ModeResult,
  type QuestionItem,
} from './practice-models';
import { Button } from '@/features/ui/components/button';
import { cn } from '@/lib/utils/cn';

interface Pair {
  item: QuestionItem;
  matched: boolean;
}

export interface MatchingState {
  hanziSide: Pair[];
  meaningSide: Pair[];
  selectedHanzi: string | null;
  selectedMeaning: string | null;
  correct: number;
  wrong: number;
  moves: number;
}

/** Chọn N cặp (tối đa 10, tối thiểu 4) để chơi. */
function pickPairs(items: QuestionItem[]): QuestionItem[] {
  const pool = shuffle(items);
  const n = Math.min(10, Math.max(4, pool.length));
  return pool.slice(0, n);
}

export function MatchingMode({
  items,
  initialState,
  onStateChange,
  onComplete,
}: ModeProps<MatchingState>) {
  const pairs = useMemo<QuestionItem[]>(() => pickPairs(items), [items]);

  const [state, setState] = useState<MatchingState>(
    initialState ?? {
      hanziSide: shuffle(pairs.map((p) => ({ item: p, matched: false }))),
      meaningSide: shuffle(pairs.map((p) => ({ item: p, matched: false }))),
      selectedHanzi: null,
      selectedMeaning: null,
      correct: 0,
      wrong: 0,
      moves: 0,
    },
  );
  const [flashWrong, setFlashWrong] = useState(false);

  const update = (next: MatchingState) => {
    setState(next);
    onStateChange(next);
  };

  const selectHanzi = (id: string) => {
    if (state.selectedMeaning) {
      // đã chọn nghĩa → kiểm tra cặp
      const pair = state.hanziSide.find((p) => p.item.id === id);
      const meaning = state.meaningSide.find((p) => p.item.id === state.selectedMeaning);
      if (!pair || !meaning) return;
      const matched = pair.item.id === meaning.item.id;
      const next = {
        ...state,
        selectedHanzi: null,
        selectedMeaning: null,
        moves: state.moves + 1,
        correct: state.correct + (matched ? 1 : 0),
        wrong: state.wrong + (matched ? 0 : 1),
        hanziSide: state.hanziSide.map((p) =>
          p.item.id === id ? { ...p, matched: p.matched || matched } : p,
        ),
        meaningSide: state.meaningSide.map((p) =>
          p.item.id === state.selectedMeaning ? { ...p, matched: p.matched || matched } : p,
        ),
      };
      if (!matched) {
        setFlashWrong(true);
        setTimeout(() => setFlashWrong(false), 500);
      }
      const allMatched = next.hanziSide.every((p) => p.matched);
      if (allMatched) {
        const result: ModeResult = {
          correctCount: next.correct,
          wrongCount: next.wrong,
          moveCount: next.moves,
          score: computeScore(next.correct, pairs.length),
          answerData: { matchedPairs: next.correct, totalPairs: pairs.length },
        };
        onComplete(result);
      } else {
        update(next);
      }
    } else {
      update({ ...state, selectedHanzi: id });
    }
  };

  const selectMeaning = (id: string) => {
    if (state.selectedHanzi) {
      selectHanzi(state.selectedHanzi);
    } else {
      update({ ...state, selectedMeaning: id });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>
          Đã ghép: {state.hanziSide.filter((p) => p.matched).length}/{pairs.length}
        </span>
        <span>
          Đúng {state.correct} · Sai {state.wrong} · Thao tác {state.moves}
        </span>
      </div>
      <div className={cn('grid gap-4 sm:grid-cols-2', flashWrong && 'opacity-70')}>
        <div className="space-y-2">
          {state.hanziSide.map((p) => (
            <button
              key={p.item.id}
              disabled={p.matched}
              onClick={() => selectHanzi(p.item.id)}
              className={cn(
                'hanzi w-full rounded-lg border px-4 py-3 text-xl font-bold transition-colors',
                p.matched
                  ? 'border-green-300 bg-green-50 text-green-700 '
                  : state.selectedHanzi === p.item.id
                    ? 'border-brand bg-brand-light text-brand '
                    : 'border-gray-200 bg-white hover:border-brand  ',
              )}
            >
              {p.item.hanzi}
            </button>
          ))}
        </div>
        <div className="space-y-2">
          {state.meaningSide.map((p) => (
            <button
              key={p.item.id}
              disabled={p.matched}
              onClick={() => selectMeaning(p.item.id)}
              className={cn(
                'w-full rounded-lg border px-4 py-3 text-left text-sm transition-colors',
                p.matched
                  ? 'border-green-300 bg-green-50 text-green-700 '
                  : state.selectedMeaning === p.item.id
                    ? 'border-brand bg-brand-light text-brand '
                    : 'border-gray-200 bg-white hover:border-brand  ',
              )}
            >
              {p.item.pinyin} — {p.item.meaning}
            </button>
          ))}
        </div>
      </div>
      {state.wrong > 0 && (
        <p className="text-center text-xs text-gray-400">
          Ghép sai sẽ được đánh dấu đỏ nhẹ — tiếp tục nhé!
        </p>
      )}
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={() => update(initialStateState())}>
          Chơi lại
        </Button>
      </div>
    </div>
  );

  function initialStateState(): MatchingState {
    return {
      hanziSide: shuffle(pairs.map((p) => ({ item: p, matched: false }))),
      meaningSide: shuffle(pairs.map((p) => ({ item: p, matched: false }))),
      selectedHanzi: null,
      selectedMeaning: null,
      correct: 0,
      wrong: 0,
      moves: 0,
    };
  }
}
