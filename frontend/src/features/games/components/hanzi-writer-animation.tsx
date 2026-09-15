'use client';

import { useEffect, useRef, useState } from 'react';
import { loadCharData } from '@/lib/hanzi/char-data-loader';

interface HanziWriterAnimationProps {
  char: string;
  speed: 'slow' | 'normal' | 'fast';
  size?: number;
}

export function HanziWriterAnimation({ char, speed, size = 180 }: HanziWriterAnimationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setHasError(false);
    let writer: any = null;
    let animationTimeout: ReturnType<typeof setTimeout> | null = null;

    (async () => {
      const { default: HanziWriter } = await import('hanzi-writer');
      if (cancelled || !containerRef.current) return;
      containerRef.current.innerHTML = '';
      writer = HanziWriter.create(containerRef.current, char, {
        width: size, height: size, padding: Math.round(size * 0.05),
        showOutline: true, showCharacter: false,
        strokeColor: '#333', drawingColor: '#333',
        charDataLoader: (c: string, onLoad: any, onError: any) => {
          loadCharData(c)
            .then(data => {
              if (data) onLoad(data);
              else {
                if (!cancelled) setHasError(true);
                if (typeof onError === 'function') onError();
              }
            })
            .catch(e => {
              if (!cancelled) setHasError(true);
              if (typeof onError === 'function') onError(e);
            });
        },
      });

      const playAnimation = () => {
        if (cancelled || !writer) return;
        const delay = speed === 'slow' ? 500 : speed === 'fast' ? 100 : 250;
        try {
          writer.animateCharacter({
            delayBetweenStrokes: delay,
            onComplete: () => { animationTimeout = setTimeout(playAnimation, 2000); },
          });
        } catch { /* Data might be missing, ignore */ }
      };

      setTimeout(playAnimation, 500);
    })();

    return () => {
      cancelled = true;
      if (animationTimeout) clearTimeout(animationTimeout);
      if (writer && typeof writer.destroy === 'function') writer.destroy();
      if (containerRef.current) containerRef.current.innerHTML = '';
    };
  }, [char, speed, size]);

  if (hasError) {
    return (
      <div 
        className="flex items-center justify-center pointer-events-none select-none"
        style={{ width: size, height: size }}
      >
        <span className="font-serif text-[#333]/30 leading-none" style={{ fontSize: size * 0.7 }}>{char}</span>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className="flex items-center justify-center pointer-events-none" 
      style={{ width: size, height: size }} 
    />
  );
}
