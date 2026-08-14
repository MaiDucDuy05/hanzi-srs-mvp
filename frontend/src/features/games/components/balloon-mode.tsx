'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import type { QuestionItem, ModeResult } from '../../practice/components/practice-models';
import { ShooterSec, type ShooterCtx } from '../sec/shooter-sec';
import { Button } from '@/features/ui/components/button';
import { cn } from '@/lib/utils/cn';
import { BambooBackground, FloatingLeaves, PANDA_LEFT, PANDA_BALANCE, PANDA_EATING } from './game-decorations';
import { GameHUD, ProgressBar } from './balloon-hud';
import { Balloon, BulletsLayer, ParticlesLayer } from './balloon-game-elements';

// ── Result screen ─────────────────────────────────────────────

function GameOverScreen({ score, correctKeystrokes, maxCombo }: { score: number; correctKeystrokes: number; maxCombo: number }) {
  const isGreat = score >= 80, isGood = score >= 50;
  const pandaSrc = isGreat ? PANDA_BALANCE : isGood ? PANDA_LEFT : PANDA_EATING;
  const resultLabel = isGreat ? 'Xuất sắc!' : isGood ? 'Tốt lắm!' : 'Cố gắng thêm nhé!';
  const resultEmoji = isGreat ? '🏆' : isGood ? '✨' : '💪';

  return (
    <div className="flex flex-col items-center justify-center min-h-[580px] text-center w-full px-4">
      <div className="relative bg-gradient-to-b from-emerald-50 via-white to-emerald-50 rounded-3xl p-8 w-full max-w-sm border-2 border-emerald-200 shadow-xl overflow-hidden">
        <img src={pandaSrc} alt="Panda" className="w-28 h-28 mx-auto mb-4 drop-shadow-md" />
        <div className="text-5xl mb-2">{resultEmoji}</div>
        <h2 className="text-3xl font-black text-emerald-700 mb-1">{resultLabel}</h2>
        <p className="text-gray-500 text-sm mb-6">Bạn đã hoàn thành trò chơi!</p>
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-xl p-3 shadow-sm border border-emerald-100">
            <div className="text-2xl font-black text-amber-500">{score}</div>
            <div className="text-xs text-gray-400 font-medium">Điểm</div>
          </div>
          <div className="bg-white rounded-xl p-3 shadow-sm border border-emerald-100">
            <div className="text-2xl font-black text-emerald-600">{correctKeystrokes}</div>
            <div className="text-xs text-gray-400 font-medium">Đúng</div>
          </div>
          <div className="bg-white rounded-xl p-3 shadow-sm border border-emerald-100">
            <div className="text-2xl font-black text-rose-500">{maxCombo}</div>
            <div className="text-xs text-gray-400 font-medium">Combo</div>
          </div>
        </div>
        <Button onClick={() => window.location.reload()} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl shadow-lg">
          🎮 Chơi lại
        </Button>
      </div>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────

interface BalloonModeProps {
  items: readonly QuestionItem[];
  onComplete: (result: ModeResult) => void;
}

export function BalloonMode({ items, onComplete }: BalloonModeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const secRef = useRef<ShooterSec | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const comboTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [ctx, setCtx] = useState<ShooterCtx | null>(null);
  const [flashError, setFlashError] = useState(false);
  const [showCombo, setShowCombo] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) containerRef.current?.requestFullscreen().catch(console.error);
    else document.exitFullscreen().catch(console.error);
  }, []);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  // Init game
  useEffect(() => {
    const sec = new ShooterSec([...items]);
    secRef.current = sec;
    const unsubGameOver = sec.onGameOver.addListener((res) => {
      onComplete({ correctCount: res.correct, wrongCount: res.wrong, moveCount: res.correct + res.wrong, score: res.score, answerData: { maxCombo: res.maxCombo } });
    });
    const unsubWrongKey = sec.onWrongKey.addListener(() => { setFlashError(true); setTimeout(() => setFlashError(false), 250); });
    sec.start();
    setCtx(sec.getState());
    return () => { unsubGameOver(); unsubWrongKey(); sec.destroy(); };
  }, [items, onComplete]);

  // Game loop
  useEffect(() => {
    const loop = (time: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = time;
      const dt = time - lastTimeRef.current;
      lastTimeRef.current = time;
      if (secRef.current) {
        const state = secRef.current.getState();
        if (state.phase === 'playing') secRef.current.tick(dt);
        if (state.phase !== 'gameover' && state.phase !== 'completed') rafRef.current = requestAnimationFrame(loop);
        setCtx({ ...secRef.current.getState() });
      }
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  // Keyboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && secRef.current) {
        const state = secRef.current.getState();
        if (state.phase === 'playing') secRef.current.pause();
        else if (state.phase === 'paused') secRef.current.resume();
        setCtx({ ...secRef.current.getState() });
        return;
      }
      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey && secRef.current) secRef.current.handleKeystroke(e.key);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handlePauseToggle = useCallback(() => {
    if (!secRef.current) return;
    const state = secRef.current.getState();
    if (state.phase === 'playing') secRef.current.pause();
    else if (state.phase === 'paused') secRef.current.resume();
    setCtx({ ...secRef.current.getState() });
  }, []);

  useEffect(() => {
    if (ctx && ctx.combo > 1) {
      setShowCombo(true);
      if (comboTimerRef.current) clearTimeout(comboTimerRef.current);
      comboTimerRef.current = setTimeout(() => setShowCombo(false), 1500);
    } else {
      setShowCombo(false);
    }
  }, [ctx?.combo]);

  if (!ctx) return null;
  if (ctx.phase === 'gameover') {
    return <GameOverScreen score={ctx.score} correctKeystrokes={ctx.correctKeystrokes ?? 0} maxCombo={ctx.maxCombo} />;
  }

  return (
    <div ref={containerRef} className={cn('relative w-full h-full overflow-hidden select-none bg-black', flashError && 'ring-4 ring-rose-400 ring-inset')}>
      <BambooBackground />
      <FloatingLeaves count={8} />
      <GameHUD hp={ctx.hp} maxHp={ctx.maxHp} score={ctx.score} combo={ctx.combo} showCombo={showCombo} isFullscreen={isFullscreen} isPaused={ctx.phase === 'paused'} onPause={handlePauseToggle} onToggleFs={toggleFullscreen} />
      <ProgressBar correct={ctx.correctKeystrokes ?? 0} total={items.length} />
      {ctx.targets.map(t => <Balloon key={t.id} target={t} />)}
      <BulletsLayer bullets={ctx.bullets} />
      <ParticlesLayer particles={ctx.particles} />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center pointer-events-none">
        <img src={PANDA_LEFT} alt="Panda" className="w-36 h-36 object-contain drop-shadow-lg" />
      </div>
    </div>
  );
}
