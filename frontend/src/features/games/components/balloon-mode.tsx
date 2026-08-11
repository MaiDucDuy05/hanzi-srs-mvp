'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import type { QuestionItem, ModeResult } from '../../practice/components/practice-models';
import { ShooterSec, type ShooterCtx } from '../sec/shooter-sec';
import { Button } from '@/features/ui/components/button';
import { cn } from '@/lib/utils/cn';

interface BalloonModeProps {
  items: readonly QuestionItem[];
  onStateChange: (state: any) => void;
  onComplete: (result: ModeResult) => void;
}

export function BalloonMode({ items, onComplete }: BalloonModeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const secRef = useRef<ShooterSec | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  
  const [ctx, setCtx] = useState<ShooterCtx | null>(null);
  const [flashError, setFlashError] = useState(false);

  // Initialize game
  useEffect(() => {
    const sec = new ShooterSec([...items]);
    secRef.current = sec;
    
    const unsubGameOver = sec.onGameOver.addListener((res) => {
      onComplete({
        correctCount: res.correct,
        wrongCount: res.wrong,
        moveCount: res.correct + res.wrong,
        score: res.score,
        answerData: { maxCombo: res.maxCombo },
      });
    });

    const unsubWrongKey = sec.onWrongKey.addListener(() => {
      setFlashError(true);
      setTimeout(() => setFlashError(false), 200);
    });

    sec.start();
    setCtx(sec.getState());

    return () => {
      unsubGameOver();
      unsubWrongKey();
      sec.destroy();
    };
  }, [items, onComplete]);

  // Game Loop
  const loop = useCallback((time: number) => {
    if (!lastTimeRef.current) lastTimeRef.current = time;
    const dt = time - lastTimeRef.current;
    lastTimeRef.current = time;

    if (secRef.current) {
      secRef.current.tick(dt);
      // Create a shallow copy to trigger React re-render
      setCtx({ ...secRef.current.getState() });
    }

    rafRef.current = requestAnimationFrame(loop);
  }, []);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [loop]);

  // Keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey && secRef.current) {
        secRef.current.handleKeystroke(e.key);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!ctx) return null;

  if (ctx.phase === 'gameover') {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] text-center w-full">
        <h2 className="text-4xl font-black text-red-500 mb-4">Game Over!</h2>
        <p className="text-2xl mb-2">Score: <span className="font-bold text-[#215b3b]">{ctx.score}</span></p>
        <p className="text-xl text-gray-600 mb-8">Max Combo: {ctx.maxCombo}</p>
        <Button onClick={() => window.location.reload()}>Play Again</Button>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative w-full h-[600px] bg-gradient-to-b from-[#e5f5eb] to-white rounded-2xl overflow-hidden shadow-inner border-4 transition-colors duration-200",
        flashError ? "border-red-500 bg-red-50" : "border-[#aadd4a]"
      )}
    >
      {/* HUD */}
      <div className="absolute top-4 left-4 z-10 flex gap-1">
        {Array.from({ length: ctx.maxHp }).map((_, i) => (
          <div key={i} className={cn("text-2xl transition-opacity", i < ctx.hp ? "opacity-100 text-red-500" : "opacity-30 text-gray-400 grayscale")}>
            ❤️
          </div>
        ))}
      </div>
      
      <div className="absolute top-4 right-4 z-10 text-right">
        <div className="text-3xl font-black text-[#215b3b] drop-shadow-sm">{ctx.score}</div>
        {ctx.combo > 1 && (
          <div className="text-xl font-bold text-[#ff9800] animate-bounce">{ctx.combo}x Combo!</div>
        )}
      </div>

      {/* Targets (Balloons) */}
      {ctx.targets.map(t => (
        <div 
          key={t.id}
          className={cn(
            "absolute flex flex-col items-center justify-center",
            t.fullyTyped && "animate-pulse scale-110"
          )}
          style={{
            left: `${t.x}%`,
            top: `${t.y}%`,
            transform: 'translate(-50%, -50%)',
            transition: 'top 0.1s linear, left 0.1s linear'
          }}
        >
          <div className="w-16 h-20 bg-white rounded-t-full rounded-b-xl shadow-md border-2 border-[#aadd4a] flex items-center justify-center relative mb-2">
            <span className="text-3xl font-bold text-[#215b3b]">{t.hanzi}</span>
            {/* Balloon string */}
            <div className="absolute -bottom-4 w-0.5 h-4 bg-gray-300"></div>
          </div>
          
          <div className="bg-white/95 px-3 py-1 rounded-full shadow-sm text-xl font-bold flex tracking-wider">
            <span className="text-[#ff9800]">{t.pinyinTyped.substring(0, t.typedCount)}</span>
            <span className="text-gray-300">{t.pinyinTyped.substring(t.typedCount)}</span>
          </div>
          
          {/* Tone-marked pinyin hint below */}
          <div className="text-sm text-gray-500 mt-1 font-medium bg-white/50 px-2 rounded-full">
            {t.pinyinDisplay}
          </div>
        </div>
      ))}

      {/* Bullets */}
      {ctx.bullets.map(b => (
        <div 
          key={b.id}
          className="absolute w-3 h-6 bg-gradient-to-t from-[#ff9800] to-yellow-300 rounded-full shadow-[0_0_10px_#ff9800]"
          style={{
            left: `${b.x}%`,
            top: `${b.y}%`,
            transform: 'translate(-50%, -50%)'
          }}
        />
      ))}

      {/* Particles */}
      {ctx.particles.map(p => (
        <div 
          key={p.id}
          className="absolute w-3 h-3 rounded-full shadow-sm"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            backgroundColor: p.color,
            opacity: p.life / p.maxLife,
            transform: `translate(-50%, -50%) scale(${p.life / p.maxLife})`
          }}
        />
      ))}

      {/* Player Cannon */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-24 flex flex-col items-center justify-end z-20">
        {/* Cannon barrel */}
        <div className="w-8 h-16 bg-gradient-to-r from-gray-700 to-gray-600 rounded-t-lg -mb-4 shadow-inner" />
        {/* Base */}
        <div className="w-24 h-12 bg-gradient-to-t from-[#215b3b] to-[#4a6b38] rounded-t-[2rem] shadow-xl border-t-4 border-[#aadd4a]" />
      </div>
    </div>
  );
}
