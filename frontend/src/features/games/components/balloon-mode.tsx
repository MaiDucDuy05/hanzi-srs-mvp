'use client';

/**
 * BalloonMode — UI thin layer over BalloonSec
 *
 * Responsibilities:
 * - Render visual elements (hanzi, balloons, feedback)
 * - Subscribe to SEC events for updates
 * - Pass user interactions (pick) to SEC
 * - Handle animations via CSS/transitions
 */

import { useEffect, useRef, useState } from 'react';
import { BalloonSec, type BalloonCtx as BalloonState } from '../sec/balloon-sec';
import type { QuestionItem, ModeResult } from '../../practice/components/practice-models';
import { Button } from '@/features/ui/components/button';
import { cn } from '@/lib/utils/cn';

interface BalloonModeProps {
  items: readonly QuestionItem[];
  initialState?: BalloonState | null;
  onStateChange: (state: BalloonState) => void;
  onComplete: (result: ModeResult) => void;
}

export { BalloonState };

export function BalloonMode({ items, initialState, onStateChange, onComplete }: BalloonModeProps) {
  const secRef = useRef<BalloonSec | null>(null);
  const [ctx, setCtx] = useState<BalloonState>(() => initialState ?? createInitCtx(items));

  useEffect(() => {
    const sec = new BalloonSec(items);
    sec.setItems(items);
    secRef.current = sec;

    const unsubComplete = sec.onComplete.addListener((data) => {
      onComplete({
        correctCount: data.correct,
        wrongCount: data.wrong,
        moveCount: ctx.moves,
        score: data.score,
        answerData: { balloons: data.rounds },
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

  const handlePick = (optionIndex: number) => {
    secRef.current?.pick(optionIndex);
  };

  const showCorrectAnswer = ctx.phase === 'feedback' && ctx.pickedIndex !== ctx.correctIndex;

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>Bóng {ctx.roundIndex + 1}/{ctx.totalRounds}</span>
        <span>Đúng {ctx.correctCount} · Sai {ctx.wrongCount}</span>
      </div>

      <div className="rounded-xl border border-gray-200 p-6 text-center">
        <p className="text-xs text-gray-400">Chữ Hán này đọc là gì?</p>
        <p className="hanzi mt-1 text-6xl font-bold text-brand">{ctx.currentHanzi}</p>
        {showCorrectAnswer && (
          <p className="mt-2 text-sm font-medium text-red-600">
            Sai — đáp án: {ctx.options[ctx.correctIndex]}
          </p>
        )}
        {ctx.phase === 'feedback' && ctx.pickedIndex === ctx.correctIndex && (
          <p className="mt-2 text-sm font-medium text-green-600">Bóng vỡ! ✓</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {ctx.options.map((pinyin, i) => {
          const isCorrectAnswer = i === ctx.correctIndex;
          const isPicked = ctx.pickedIndex === i;
          const showGreen = (ctx.phase === 'feedback' && isPicked && isCorrectAnswer) ||
            (ctx.phase === 'feedback' && showCorrectAnswer && isCorrectAnswer);

          return (
            <button
              key={`${pinyin}-${i}`}
              onClick={() => handlePick(i)}
              disabled={ctx.phase !== 'playing'}
              className={cn(
                'rounded-2xl border-2 px-4 py-5 text-lg font-semibold transition-all',
                'border-blue-200 bg-gradient-to-br from-blue-100 to-indigo-200 text-blue-800',
                'hover:scale-105 hover:border-blue-400',
                showGreen && 'border-green-400 bg-green-100 text-green-700',
                ctx.phase === 'feedback' && !showGreen && !isPicked && 'opacity-50',
              )}
            >
              🎈 {pinyin}
            </button>
          );
        })}
      </div>

      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={() => {
          secRef.current?.destroy();
          const newSec = new BalloonSec(items);
          newSec.setItems(items);
          const initCtx = newSec.start();
          secRef.current = newSec;
          setCtx(initCtx);
          onStateChange(initCtx);
        }}>
          Chơi lại
        </Button>
      </div>
    </div>
  );
}

function createInitCtx(items: readonly QuestionItem[]): BalloonState {
  return {
    phase: 'idle',
    roundIndex: 0,
    totalRounds: Math.min(10, items.length),
    currentHanzi: items[0]?.hanzi ?? '',
    options: [],
    correctIndex: -1,
    pickedIndex: null,
    correctCount: 0,
    wrongCount: 0,
    moves: 0,
  };
}
