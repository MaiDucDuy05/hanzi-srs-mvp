'use client';

import { useEffect, useRef, useState } from 'react';
import type HanziWriterType from 'hanzi-writer';
import { loadCharData } from '@/lib/hanzi/char-data-loader';

interface HanziWriterCanvasProps {
  char: string;
  size?: number;
  onComplete?: (totalMistakes: number) => void;
  onMistake?: () => void;
}

/**
 * Vẽ + chấm nét chữ Hán bằng hanzi-writer (PR-13).
 * Library chỉ được import phía client (useEffect) — an toàn với SSR.
 */
export function HanziWriterCanvas({
  char,
  size = 220,
  onComplete,
  onMistake,
}: HanziWriterCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasError, setHasError] = useState(false);
  const onCompleteRef = useRef(onComplete);
  const onMistakeRef = useRef(onMistake);
  useEffect(() => {
    onCompleteRef.current = onComplete;
    onMistakeRef.current = onMistake;
  }, [onComplete, onMistake]);

  useEffect(() => {
    let cancelled = false;
    setHasError(false);
    let writer: ReturnType<typeof HanziWriterType.create> | null = null;

    (async () => {
      const { default: HanziWriter } = await import('hanzi-writer');
      if (cancelled || !containerRef.current) return;
      containerRef.current.innerHTML = '';
      writer = HanziWriter.create(containerRef.current, char, {
        width: size,
        height: size,
        padding: 10,
        showOutline: true,
        showCharacter: false,
        strokeColor: '#c8102e',
        highlightColor: '#c8102e',
        outlineColor: '#d1d5db',
        drawingColor: '#374151',
        radicalColor: null,
        charDataLoader: (c, onLoad, onError) => {
          loadCharData(c)
            .then((data) => {
              if (data) onLoad(data);
              else {
                if (!cancelled) setHasError(true);
              }
            })
            .catch((e) => {
              if (!cancelled) setHasError(true);
            });
        },
        onComplete: (summary) => onCompleteRef.current?.(summary.totalMistakes),
        onMistake: () => onMistakeRef.current?.(),
      });
      try {
        writer.quiz();
      } catch (e) {
        // Data might be missing, ignore the crash
      }
    })();

    return () => {
      cancelled = true;
      try {
        writer?.cancelQuiz();
        (writer as unknown as { destroy?: () => void }).destroy?.();
      } catch {
        // đã bị gỡ khỏi DOM
      }
      if (containerRef.current) containerRef.current.innerHTML = '';
    };
  }, [char, size]);

  if (hasError) {
    return (
      <div 
        className="mx-auto w-fit flex items-center justify-center font-serif text-gray-300 pointer-events-none" 
        style={{ width: size, height: size, fontSize: size * 0.8 }}
      >
        {char}
      </div>
    );
  }

  return <div ref={containerRef} className="mx-auto w-fit" />;
}
