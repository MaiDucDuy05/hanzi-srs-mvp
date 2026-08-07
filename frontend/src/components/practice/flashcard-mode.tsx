'use client';

import { useState } from 'react';
import {
  computeScore,
  type ModeProps,
  type ModeResult,
} from './practice-models';
import { Button } from '@/components/ui/button';
import { AudioButton } from '@/components/ui/audio-button';

export interface FlashcardState {
  index: number;
  revealed: boolean;
  known: number;
  unknown: number;
  moves: number;
}

/** Flashcard: mặt trước chữ Hán, mặt sau pinyin + nghĩa (PR-04). */
export function FlashcardMode({
  items,
  initialState,
  onStateChange,
  onComplete,
}: ModeProps<FlashcardState>) {
  const [state, setState] = useState<FlashcardState>(
    initialState ?? { index: 0, revealed: false, known: 0, unknown: 0, moves: 0 },
  );

  const update = (next: FlashcardState) => {
    setState(next);
    onStateChange(next);
  };

  const current = items[state.index];

  const answer = (correct: boolean) => {
    const index = state.index + 1;
    const next: FlashcardState = {
      index,
      revealed: false,
      known: state.known + (correct ? 1 : 0),
      unknown: state.unknown + (correct ? 0 : 1),
      moves: state.moves + 1,
    };
    if (index >= items.length) {
      const result: ModeResult = {
        correctCount: next.known,
        wrongCount: next.unknown,
        moveCount: next.moves,
        score: computeScore(next.known, items.length),
        answerData: { reviewed: items.length },
      };
      onComplete(result);
    } else {
      update(next);
    }
  };

  if (!current) return null;

  return (
    <div className="mx-auto max-w-md space-y-4">
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>
          Thẻ {state.index + 1}/{items.length}
        </span>
        <span>
          Biết {state.known} · Chưa biết {state.unknown}
        </span>
      </div>

      <button
        onClick={() => update({ ...state, revealed: !state.revealed, moves: state.moves + 1 })}
        className="perspective-1000 block w-full"
      >
        <div className="preserve-3d relative aspect-[4/3] w-full">
          <div
            className={`backface-hidden absolute inset-0 flex flex-col items-center justify-center rounded-2xl border bg-white shadow-sm  ${
              state.revealed ? 'rotate-y-180' : ''
            }`}
          >
            <span className="hanzi text-6xl font-bold text-brand">{current.hanzi}</span>
            <p className="mt-3 text-xs text-gray-400">Nhấn để lật thẻ</p>
          </div>
          <div
            className={`backface-hidden absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-2xl border border-brand/30 bg-brand-light p-6 text-center  ${
              state.revealed ? '' : 'rotate-y-180'
            }`}
          >
            <span className="text-lg font-semibold text-brand">{current.pinyin}</span>
            <span className="text-gray-700 ">{current.meaning}</span>
            <AudioButton audioKey={current.audioKey} />
          </div>
        </div>
      </button>

      {state.revealed ? (
        <div className="grid grid-cols-2 gap-3">
          <Button variant="danger" onClick={() => answer(false)}>
            Chưa biết
          </Button>
          <Button onClick={() => answer(true)}>Đã biết ✓</Button>
        </div>
      ) : (
        <p className="text-center text-sm text-gray-400">
          Lật thẻ xem đáp án rồi tự đánh giá nhé.
        </p>
      )}
    </div>
  );
}
