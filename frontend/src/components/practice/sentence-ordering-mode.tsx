'use client';

import { useState } from 'react';
import {
  computeScore,
  shuffle,
  splitChars,
  type ModeProps,
  type ModeResult,
} from './practice-models';
import { Button } from '@/components/ui/button';
import { AudioButton } from '@/components/ui/audio-button';

export interface OrderingState {
  index: number;
  remaining: string[];
  answer: string[];
  correct: number;
  wrong: number;
  moves: number;
  feedback: 'correct' | 'wrong' | null;
}

/** Sắp xếp các chữ thành đúng thứ tự của từ (PR-10). */
export function SentenceOrderingMode({
  items,
  initialState,
  onStateChange,
  onComplete,
}: ModeProps<OrderingState>) {
  const [state, setState] = useState<OrderingState>(() =>
    initialState
      ? initialState
      : {
          index: 0,
          remaining: shuffle(splitChars(items[0]?.hanzi ?? '')),
          answer: [],
          correct: 0,
          wrong: 0,
          moves: 0,
          feedback: null,
        },
  );

  const update = (next: OrderingState) => {
    setState(next);
    onStateChange(next);
  };

  const question = items[state.index];
  if (!question) return null;

  const advance = (next: OrderingState) => {
    const index = state.index + 1;
    const nxt: OrderingState = {
      index,
      remaining: index < items.length ? shuffle(splitChars(items[index].hanzi)) : [],
      answer: [],
      correct: next.correct,
      wrong: next.wrong,
      moves: next.moves,
      feedback: null,
    };
    if (index >= items.length) {
      const result: ModeResult = {
        correctCount: nxt.correct,
        wrongCount: nxt.wrong,
        moveCount: nxt.moves,
        score: computeScore(nxt.correct, items.length),
        answerData: { sentences: items.length },
      };
      onComplete(result);
    } else {
      update(nxt);
    }
  };

  const pickToken = (token: string, idx: number) => {
    if (state.feedback) return;
    const remaining = [...state.remaining];
    remaining.splice(idx, 1);
    update({
      ...state,
      remaining,
      answer: [...state.answer, token],
      moves: state.moves + 1,
    });
  };

  const removeToken = (idx: number) => {
    if (state.feedback) return;
    const answer = [...state.answer];
    const [token] = answer.splice(idx, 1);
    update({
      ...state,
      answer,
      remaining: [...state.remaining, token],
      moves: state.moves + 1,
    });
  };

  const check = () => {
    if (state.feedback || state.answer.length === 0) return;
    const ok = state.answer.join('') === question.hanzi;
    const next: OrderingState = {
      ...state,
      feedback: ok ? 'correct' : 'wrong',
      correct: state.correct + (ok ? 1 : 0),
      wrong: state.wrong + (ok ? 0 : 1),
      moves: state.moves + 1,
    };
    if (ok) {
      setTimeout(() => advance(next), 700);
    } else {
      setTimeout(() => advance(next), 1200);
    }
    update(next);
  };

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>
          Câu {state.index + 1}/{items.length}
        </span>
        <span>
          Đúng {state.correct} · Sai {state.wrong}
        </span>
      </div>

      <div className="rounded-xl border border-gray-200 p-6 text-center dark:border-gray-700">
        <p className="text-lg font-semibold text-brand">{question.pinyin}</p>
        <p className="mt-1 text-gray-600">{question.meaning}</p>
        <div className="mt-3 flex justify-center">
          <AudioButton audioKey={question.audioKey} />
        </div>

        <p className="mt-5 text-xs text-gray-400">Sắp xếp các chữ thành từ đúng:</p>
        <div className="mt-2 flex min-h-12 flex-wrap items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 p-3 dark:border-gray-600">
          {state.answer.length === 0 && (
            <span className="text-sm text-gray-400">Chạm chữ bên dưới để ghép</span>
          )}
          {state.answer.map((t, i) => (
            <button
              key={`${t}-${i}`}
              onClick={() => removeToken(i)}
              className="hanzi rounded-md bg-brand px-3 py-1.5 text-xl font-bold text-white"
            >
              {t}
            </button>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          {state.remaining.map((t, i) => (
            <button
              key={`${t}-${i}`}
              onClick={() => pickToken(t, i)}
              disabled={!!state.feedback}
              className="hanzi rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xl font-bold text-gray-700 hover:border-brand hover:text-brand disabled:opacity-40 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200"
            >
              {t}
            </button>
          ))}
        </div>

        <div className="mt-4">
          <Button onClick={check} disabled={state.answer.length === 0 || !!state.feedback}>
            Kiểm tra
          </Button>
        </div>

        {state.feedback === 'correct' && (
          <p className="mt-3 font-medium text-green-600">Chính xác! ✓</p>
        )}
        {state.feedback === 'wrong' && (
          <p className="mt-3 font-medium text-red-600">
            Sai — đáp án: <span className="hanzi">{question.hanzi}</span>
          </p>
        )}
      </div>
    </div>
  );
}
