'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import type { QuestionItem, ModeResult } from '../../practice/components/practice-models';
import { ShooterSec, type ShooterCtx } from '../sec/shooter-sec';
import { Button } from '@/features/ui/components/button';
import { cn } from '@/lib/utils/cn';
import { FloatingLeaves, PANDA_LEFT, PANDA_BALANCE, PANDA_EATING } from './game-decorations';
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

const GameCanvas = React.memo(function GameCanvas({ secRef }: { secRef: React.RefObject<ShooterSec | null> }) {
  const [, setTick] = useState(0);
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    let raf: number;
    let accumulatedDt = 0;
    const loop = (time: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = time;
      const dt = time - lastTimeRef.current;
      lastTimeRef.current = time;
      accumulatedDt += dt;

      if (secRef.current) {
        const state = secRef.current.getState();
        if (state.phase === 'playing') secRef.current.tick(dt);
      }

      // Cap React rendering to ~30 FPS (every 33ms) to save CPU/GPU and bypass react-scan lag
      if (accumulatedDt >= 33) {
        setTick(t => t + 1);
        accumulatedDt = 0;
      }

      const phase = secRef.current?.getState().phase;
      if (phase !== 'gameover' && phase !== 'completed') {
        raf = requestAnimationFrame(loop);
      }
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [secRef]);

  const ctx = secRef.current?.getState();
  if (!ctx) return null;

  return (
    <>
      {ctx.targets.map(t => <Balloon key={t.id} target={t} />)}
      <BulletsLayer bullets={ctx.bullets} />
      <ParticlesLayer particles={ctx.particles} />
    </>
  );
});

const GameHUDLayer = React.memo(function GameHUDLayer({ secRef, totalItems, toggleFullscreen, isFullscreen }: { secRef: React.RefObject<ShooterSec | null>, totalItems: number, toggleFullscreen: () => void, isFullscreen: boolean }) {
  const [ctx, setCtx] = useState<ShooterCtx | null>(null);
  const [showCombo, setShowCombo] = useState(false);
  const comboTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!secRef.current) return;
    const update = () => setCtx({ ...secRef.current!.getState() });
    const u1 = secRef.current.onScore.addListener(update);
    const u2 = secRef.current.onDamage.addListener(update);
    const u3 = secRef.current.onWrongKey.addListener(update);
    update();
    return () => { u1(); u2(); u3(); };
  }, [secRef]);

  useEffect(() => {
    if (ctx && ctx.combo > 1) {
      setShowCombo(true);
      if (comboTimerRef.current) clearTimeout(comboTimerRef.current);
      comboTimerRef.current = setTimeout(() => setShowCombo(false), 1500);
    } else {
      setShowCombo(false);
    }
  }, [ctx?.combo]);

  const handlePauseToggle = useCallback(() => {
    if (!secRef.current) return;
    const state = secRef.current.getState();
    if (state.phase === 'playing') secRef.current.pause();
    else if (state.phase === 'paused') secRef.current.resume();
    setCtx({ ...secRef.current.getState() });
  }, [secRef]);

  if (!ctx) return null;

  return (
    <>
      <GameHUD hp={ctx.hp} maxHp={ctx.maxHp} score={ctx.score} combo={ctx.combo} showCombo={showCombo} isFullscreen={isFullscreen} isPaused={ctx.phase === 'paused'} onPause={handlePauseToggle} onToggleFs={toggleFullscreen} />
      <ProgressBar correct={ctx.completedWords ?? 0} total={totalItems} />
    </>
  );
});

export function BalloonMode({ items, onComplete }: BalloonModeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const secRef = useRef<ShooterSec | null>(null);

  const [flashError, setFlashError] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [gameOverStats, setGameOverStats] = useState<{score: number, correct: number, maxCombo: number} | null>(null);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) containerRef.current?.requestFullscreen().catch(console.error);
    else document.exitFullscreen().catch(console.error);
  }, []);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // Init game
  useEffect(() => {
    const sec = new ShooterSec([...items]);
    secRef.current = sec;
    setIsReady(true);
    const unsubGameOver = sec.onGameOver.addListener((res) => {
      onCompleteRef.current({ correctCount: res.correct, wrongCount: res.wrong, moveCount: res.correct + res.wrong, score: res.score, answerData: { maxCombo: res.maxCombo } });
      setGameOverStats({ score: res.score, correct: res.correct, maxCombo: res.maxCombo });
    });
    const unsubWrongKey = sec.onWrongKey.addListener(() => { setFlashError(true); setTimeout(() => setFlashError(false), 250); });
    sec.start();
    return () => { unsubGameOver(); unsubWrongKey(); sec.destroy(); };
  }, [items]);

  // Keyboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && secRef.current) {
        const state = secRef.current.getState();
        if (state.phase === 'playing') secRef.current.pause();
        else if (state.phase === 'paused') secRef.current.resume();
        return;
      }
      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey && secRef.current) secRef.current.handleKeystroke(e.key);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (gameOverStats) {
    return <GameOverScreen score={gameOverStats.score} correctKeystrokes={gameOverStats.correct} maxCombo={gameOverStats.maxCombo} />;
  }

  return (
    <div ref={containerRef} className={cn('relative w-full h-full overflow-hidden select-none bg-black', flashError && 'ring-4 ring-rose-400 ring-inset')}>
      <img src="/assets/game/backgroung/backgroung_game_shoot.png" alt="Background" className="absolute inset-0 w-full h-full object-cover pointer-events-none z-0" />
      <FloatingLeaves count={8} />
      
      {isReady && (
        <>
          <GameHUDLayer secRef={secRef} totalItems={items.length} toggleFullscreen={toggleFullscreen} isFullscreen={isFullscreen} />
          <GameCanvas secRef={secRef} />
        </>
      )}
      
      <div className="absolute bottom-[8%] left-1/2 -translate-x-1/2 z-20 flex flex-col items-center pointer-events-none">
        <img src={PANDA_LEFT} alt="Panda" className="w-36 h-36 object-contain drop-shadow-lg" />
      </div>
    </div>
  );
}
