'use client';

import { useEffect, useRef } from 'react';
import { loadCharData } from '@/lib/hanzi/char-data-loader';

interface HanziWriterAnimationProps {
  char: string;
  speed: 'slow' | 'normal' | 'fast';
}

export function HanziWriterAnimation({ char, speed }: HanziWriterAnimationProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    let writer: any = null;
    let animationTimeout: ReturnType<typeof setTimeout> | null = null;

    (async () => {
      const { default: HanziWriter } = await import('hanzi-writer');
      if (cancelled || !containerRef.current) return;
      containerRef.current.innerHTML = '';
      writer = HanziWriter.create(containerRef.current, char, {
        width: 180, height: 180, padding: 5,
        showOutline: true, showCharacter: false,
        strokeColor: '#333', drawingColor: '#333',
        charDataLoader: (c: string, onLoad: any, onError: any) => {
          loadCharData(c)
            .then(data => { if (data) onLoad(data); else { try { onError(new Error('no data')); } catch {} } })
            .catch(e => { try { onError(e); } catch {} });
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
  }, [char, speed]);

  return <div ref={containerRef} className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none" />;
}
