'use client';

import { useState, type FormEvent } from 'react';
import { computeScore, type ModeProps, type ModeResult } from './practice-models';
import { Button } from '@/features/ui/components/button';
import { Input } from '@/features/ui/components/form';
import { AudioButton } from '@/features/ui/components/audio-button';
import { ClickableHanzi } from '@/features/ui/components/clickable-hanzi';
import { cn } from '@/lib/utils/cn';

export interface FillBlankState {
  index: number;
  input: string;
  correct: number;
  wrong: number;
  moves: number;
  feedback: 'correct' | 'wrong' | null;
}

/** Điền chữ Hán theo pinyin + nghĩa (PR-09). */
export function FillBlankMode({
  items,
  initialState,
  onStateChange,
  onComplete,
}: ModeProps<FillBlankState>) {
  const [state, setState] = useState<FillBlankState>(
    initialState ?? { index: 0, input: '', correct: 0, wrong: 0, moves: 0, feedback: null },
  );

  const update = (next: FillBlankState) => {
    setState(next);
    onStateChange(next);
  };

  const current = items[state.index];

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!state.input.trim() || state.feedback) return;
    const ok = state.input.trim() === current.hanzi;
    update({ ...state, feedback: ok ? 'correct' : 'wrong', moves: state.moves + 1 });
    setTimeout(() => {
      const index = state.index + 1;
      const next: FillBlankState = {
        index,
        input: '',
        correct: state.correct + (ok ? 1 : 0),
        wrong: state.wrong + (ok ? 0 : 1),
        moves: state.moves + 1,
        feedback: null,
      };
      if (index >= items.length) {
        const result: ModeResult = {
          correctCount: next.correct,
          wrongCount: next.wrong,
          moveCount: next.moves,
          score: computeScore(next.correct, items.length),
          answerData: { blanks: items.length },
        };
        onComplete(result);
      } else {
        update(next);
      }
    }, 900);
  };

  if (!current) return null;

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

      <div className="rounded-xl border border-gray-200 p-6 text-center ">
        <p className="text-lg font-semibold text-brand">{current.pinyin}</p>
        <p className="mt-1 text-gray-600">{current.meaning}</p>
        <div className="mt-3 flex justify-center">
          <AudioButton audioKey={current.audioKey} text={current.hanzi} />
        </div>
        <div className="mt-4 flex justify-center gap-2">
          <Input
            autoFocus
            value={state.input}
            onChange={(e) => update({ ...state, input: e.target.value })}
            placeholder="Nhập chữ Hán..."
            disabled={!!state.feedback}
            className="max-w-xs text-center text-lg"
          />
          <Button onClick={submit} disabled={!!state.feedback}>
            Kiểm tra
          </Button>
        </div>
        {state.feedback === 'correct' && (
          <p className="mt-3 font-medium text-green-600">Chính xác! ✓</p>
        )}
        {state.feedback === 'wrong' && (
          <p className="mt-3 font-medium text-red-600">
            Sai - đáp án: <ClickableHanzi text={current.hanzi} className="hanzi font-bold" />
          </p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <span className={cn('text-xs text-gray-400')}>
          {state.feedback ? 'Đang chuyển câu tiếp theo...' : 'Nhập chữ Hán đúng với pinyin & nghĩa trên.'}
        </span>
      </div>
    </div>
  );
}
