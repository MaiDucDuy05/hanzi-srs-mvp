'use client';

import { useState } from 'react';
import {
  computeScore,
  shuffle,
  type ModeProps,
  type ModeResult,
  type QuestionItem,
} from '../practice/practice-models';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';

export interface BalloonState {
  rounds: number[]; // index vào items
  options: string[][]; // 4 pinyin per round
  index: number;
  correct: number;
  wrong: number;
  moves: number;
  feedback: 'correct' | 'wrong' | null;
}

const ROUNDS = 10;

/** Bắn bóng pinyin: chọn bóng đúng pinyin cho chữ Hán hiển thị (PR-11). */
export function BalloonMode({
  items,
  initialState,
  onStateChange,
  onComplete,
}: ModeProps<BalloonState>) {
  const [state, setState] = useState<BalloonState>(() => {
    if (initialState) return initialState;
    const rounds = shuffle(items.map((_, i) => i)).slice(0, Math.min(ROUNDS, items.length));
    const options = rounds.map((idx) => {
      const others = shuffle(
        items.filter((_, j) => j !== idx).map((q) => q.pinyin),
      ).slice(0, 3);
      return shuffle([items[idx].pinyin, ...others]);
    });
    return { rounds, options, index: 0, correct: 0, wrong: 0, moves: 0, feedback: null };
  });

  const update = (next: BalloonState) => {
    setState(next);
    onStateChange(next);
  };

  const roundIdx = state.rounds[state.index];
  const question: QuestionItem | undefined = roundIdx !== undefined ? items[roundIdx] : undefined;
  if (!question) return null;

  const pop = (pinyin: string) => {
    if (state.feedback) return;
    const ok = pinyin === question.pinyin;
    const next: BalloonState = {
      ...state,
      feedback: ok ? 'correct' : 'wrong',
      correct: state.correct + (ok ? 1 : 0),
      wrong: state.wrong + (ok ? 0 : 1),
      moves: state.moves + 1,
    };
    if (ok) {
      setTimeout(() => advance(next), 700);
    } else {
      setTimeout(() => advance(next), 900);
    }
    update(next);
  };

  const advance = (next: BalloonState) => {
    const index = state.index + 1;
    const nxt: BalloonState = { ...next, index, feedback: null };
    if (index >= state.rounds.length) {
      const result: ModeResult = {
        correctCount: nxt.correct,
        wrongCount: nxt.wrong,
        moveCount: nxt.moves,
        score: computeScore(nxt.correct, state.rounds.length),
        answerData: { balloons: state.rounds.length },
      };
      onComplete(result);
    } else {
      update(nxt);
    }
  };

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>
          Bóng {state.index + 1}/{state.rounds.length}
        </span>
        <span>
          Đúng {state.correct} · Sai {state.wrong}
        </span>
      </div>

      <div className="rounded-xl border border-gray-200 p-6 text-center dark:border-gray-700">
        <p className="text-xs text-gray-400">Chữ Hán này đọc là gì?</p>
        <p className="hanzi mt-1 text-6xl font-bold text-brand">{question.hanzi}</p>
        {state.feedback === 'wrong' && (
          <p className="mt-2 text-sm font-medium text-red-600">
            Sai — đáp án: {question.pinyin}
          </p>
        )}
        {state.feedback === 'correct' && (
          <p className="mt-2 text-sm font-medium text-green-600">Bóng vỡ! ✓</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {state.options[state.index].map((p, i) => {
          const showCorrect = state.feedback === 'wrong' && p === question.pinyin;
          const picked = state.feedback === 'correct' && p === question.pinyin;
          return (
            <button
              key={`${p}-${i}`}
              onClick={() => pop(p)}
              disabled={!!state.feedback}
              className={cn(
                'rounded-2xl border-2 px-4 py-5 text-lg font-semibold transition-all',
                'border-blue-200 bg-gradient-to-br from-blue-100 to-indigo-200 text-blue-800 hover:scale-105 hover:border-blue-400 dark:from-blue-950 dark:to-indigo-950 dark:text-blue-200',
                showCorrect && 'border-green-400 bg-green-100 text-green-700 dark:bg-green-900',
                picked && 'border-green-400 bg-green-100 text-green-700 dark:bg-green-900',
                state.feedback === 'wrong' && !showCorrect && 'opacity-50',
              )}
            >
              🎈 {p}
            </button>
          );
        })}
      </div>

      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={() => update(initialStateState())}>
          Chơi lại
        </Button>
      </div>
    </div>
  );

  function initialStateState(): BalloonState {
    const rounds = shuffle(items.map((_, i) => i)).slice(0, Math.min(ROUNDS, items.length));
    const options = rounds.map((idx) => {
      const others = shuffle(items.filter((_, j) => j !== idx).map((q) => q.pinyin)).slice(0, 3);
      return shuffle([items[idx].pinyin, ...others]);
    });
    return { rounds, options, index: 0, correct: 0, wrong: 0, moves: 0, feedback: null };
  }
}
