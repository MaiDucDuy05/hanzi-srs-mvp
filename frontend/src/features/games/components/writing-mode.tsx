'use client';

/**
 * WritingMode — UI thin layer over WritingSec
 *
 * Responsibilities:
 * - Render character + canvas + controls
 * - Subscribe to SEC events
 * - Pass complete/skip to SEC
 */

import { useEffect, useRef, useState } from 'react';
import { WritingSec, type WritingCtx as WritingState } from '../sec/writing-sec';
import type { QuestionItem, ModeResult } from '../../practice/components/practice-models';
import { HanziWriterCanvas } from './hanzi-writer-canvas';
import { AudioButton } from '@/features/ui/components/audio-button';
import { Button } from '@/features/ui/components/button';

interface WritingModeProps {
  items: readonly QuestionItem[];
  initialState?: WritingState | null;
  onStateChange: (state: WritingState) => void;
  onComplete: (result: ModeResult) => void;
}

export { WritingState };

export function WritingMode({ items, initialState, onStateChange, onComplete }: WritingModeProps) {
  const secRef = useRef<WritingSec | null>(null);
  const [ctx, setCtx] = useState<WritingState>(() => initialState ?? createInitCtx(items));

  useEffect(() => {
    const sec = new WritingSec(items);
    secRef.current = sec;

    const unsubComplete = sec.onComplete.addListener((data) => {
      onComplete({
        correctCount: data.correct,
        wrongCount: data.wrong,
        moveCount: data.correct + data.wrong,
        score: data.score,
        answerData: { written: data.chars },
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

  const handleComplete = () => {
    secRef.current?.complete();
  };

  const handleSkip = () => {
    secRef.current?.skip();
  };

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>Chữ {ctx.charIndex + 1}/{ctx.totalChars}</span>
        <span>
          Đã viết {ctx.correctCount} · Bỏ qua {ctx.wrongCount}
        </span>
      </div>

      <div className="rounded-xl border border-gray-200 p-6 text-center">
        <p className="text-2xl font-bold text-brand">{ctx.currentHanzi}</p>
        <p className="mt-1 text-lg text-gray-700">{ctx.currentPinyin}</p>
        <p className="text-gray-500">{ctx.currentMeaning}</p>
        <div className="mt-2 flex justify-center">
          <AudioButton audioKey={items[ctx.charIndex]?.audioKey} />
        </div>

        <div className="mt-4 rounded-lg bg-gray-50 p-4">
          <HanziWriterCanvas
            char={ctx.currentHanzi}
            onComplete={handleComplete}
          />
        </div>
        <p className="mt-2 text-xs text-gray-400">
          Dùng chuột hoặc ngón tay viết đúng thứ tự nét trong khung.
        </p>

        {ctx.feedback === 'done' && (
          <p className="mt-3 font-medium text-green-600">Viết đúng! ✓</p>
        )}
      </div>

      <div className="flex justify-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={ctx.feedback === 'done'}
          onClick={handleSkip}
        >
          Chữ này khó — bỏ qua
        </Button>
      </div>
    </div>
  );
}

function createInitCtx(items: readonly QuestionItem[]): WritingState {
  return {
    phase: 'idle',
    charIndex: 0,
    totalChars: items.length,
    currentHanzi: items[0]?.hanzi ?? '',
    currentPinyin: items[0]?.pinyin ?? '',
    currentMeaning: items[0]?.meaning ?? '',
    correctCount: 0,
    wrongCount: 0,
    moves: 0,
    feedback: null,
  };
}
