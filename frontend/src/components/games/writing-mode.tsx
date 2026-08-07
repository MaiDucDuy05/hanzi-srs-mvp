'use client';

import { useEffect, useRef, useState } from 'react';
import { computeScore, type ModeProps, type ModeResult } from '../practice/practice-models';
import { HanziWriterCanvas } from './hanzi-writer-canvas';
import { AudioButton } from '@/components/ui/audio-button';
import { Button } from '@/components/ui/button';

export interface WritingState {
  index: number;
  correct: number;
  wrong: number;
  moves: number;
  feedback: 'done' | null;
}

/** Luyện viết chữ Hán theo nét (PR-13). */
export function WritingMode({
  items,
  initialState,
  onStateChange,
  onComplete,
}: ModeProps<WritingState>) {
  const [state, setState] = useState<WritingState>(
    initialState ?? { index: 0, correct: 0, wrong: 0, moves: 0, feedback: null },
  );
  // Timeout nâng cấp chữ khi viết đúng — phải huỷ khi bỏ qua/unmount để tránh
  // advance hai lần (nhảy cóc chữ tiếp theo).
  const doneTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (doneTimerRef.current) clearTimeout(doneTimerRef.current);
    },
    [],
  );

  const update = (next: WritingState) => {
    setState(next);
    onStateChange(next);
  };

  const question = items[state.index];
  if (!question) return null;

  const advance = (correct: boolean) => {
    if (doneTimerRef.current) {
      clearTimeout(doneTimerRef.current);
      doneTimerRef.current = null;
    }
    const index = state.index + 1;
    const next: WritingState = {
      index,
      correct: state.correct + (correct ? 1 : 0),
      wrong: state.wrong + (correct ? 0 : 1),
      moves: state.moves + 1,
      feedback: null,
    };
    if (index >= items.length) {
      const result: ModeResult = {
        correctCount: next.correct,
        wrongCount: next.wrong,
        moveCount: next.moves,
        score: computeScore(next.correct, items.length),
        answerData: { written: items.length },
      };
      onComplete(result);
    } else {
      update(next);
    }
  };

  const handleDone = () => {
    update({ ...state, feedback: 'done' });
    if (doneTimerRef.current) clearTimeout(doneTimerRef.current);
    doneTimerRef.current = setTimeout(() => advance(true), 900);
  };

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>
          Chữ {state.index + 1}/{items.length}
        </span>
        <span>
          Đã viết {state.correct} · Bỏ qua {state.wrong}
        </span>
      </div>

      <div className="rounded-xl border border-gray-200 p-6 text-center dark:border-gray-700">
        <p className="text-2xl font-bold text-brand">{question.hanzi}</p>
        <p className="mt-1 text-lg text-gray-700 dark:text-gray-200">{question.pinyin}</p>
        <p className="text-gray-500">{question.meaning}</p>
        <div className="mt-2 flex justify-center">
          <AudioButton audioKey={question.audioKey} />
        </div>

        <div className="mt-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
          <HanziWriterCanvas
            char={question.hanzi}
            onComplete={() => handleDone()}
          />
        </div>
        <p className="mt-2 text-xs text-gray-400">
          Dùng chuột hoặc ngón tay viết đúng thứ tự nét trong khung.
        </p>

        {state.feedback === 'done' && (
          <p className="mt-3 font-medium text-green-600">Viết đúng! ✓</p>
        )}
      </div>

      <div className="flex justify-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={state.feedback === 'done'}
          onClick={() => advance(false)}
        >
          Chữ này khó — bỏ qua
        </Button>
      </div>
    </div>
  );
}
