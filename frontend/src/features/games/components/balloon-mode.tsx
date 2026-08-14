'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import type { QuestionItem, ModeResult } from '../../practice/components/practice-models';
import { ShooterSec, type ShooterCtx } from '../sec/shooter-sec';
import { Button } from '@/features/ui/components/button';
import { cn } from '@/lib/utils/cn';
import { Maximize2, Minimize2, Pause, Play } from 'lucide-react';

// Panda mascot illustrations
const PANDA_LEFT = '/assets/illustrations/panda/panda_shoot.png';
const PANDA_BALANCE = '/assets/illustrations/panda/panda-holding-ball.svg';
const PANDA_EATING = '/assets/illustrations/panda/panda-eating.svg';

const BALLOON_COLORS = [
  { bg: 'from-rose-400 to-pink-500',   border: 'border-pink-400',   text: 'text-pink-700' },
  { bg: 'from-violet-400 to-purple-500', border: 'border-purple-400', text: 'text-purple-700' },
  { bg: 'from-amber-400 to-orange-400',  border: 'border-orange-400',  text: 'text-orange-700' },
  { bg: 'from-emerald-400 to-teal-500',  border: 'border-teal-400',   text: 'text-teal-700' },
  { bg: 'from-blue-400 to-indigo-500',    border: 'border-indigo-400', text: 'text-indigo-700' },
  { bg: 'from-red-400 to-rose-500',      border: 'border-rose-400',   text: 'text-rose-700' },
];

function getBalloonStyle(id: string) {
  const idx = id.charCodeAt(0) % BALLOON_COLORS.length;
  return BALLOON_COLORS[idx];
}

const STATIC_LEAVES = Array.from({ length: 8 }, (_, i) => {
  const leaves = [
    '/assets/nature/leaves/leaf_1.svg',
    '/assets/nature/leaves/leaf_5.svg',
    '/assets/nature/leaves/leaf_9.svg',
    '/assets/nature/leaves/leaf_14.svg',
  ];
  return {
    id: i,
    src: leaves[Math.floor(Math.random() * leaves.length)],
    style: {
      left: `${(i * 13 + 7) % 95}%`,
      top: `${(i * 17 + 5) % 85}%`,
      animationDelay: `${i * 0.8}s`,
      animationDuration: `${6 + (i % 4)}s`,
    },
  };
});

const FloatingLeaf = React.memo(function FloatingLeaf({ src, style }: { src: string, style: React.CSSProperties }) {
  return (
    <img
      src={src}
      alt=""
      className="pointer-events-none absolute opacity-20"
      style={{ width: 28, height: 28, ...style }}
    />
  );
});

const StaticBackground = React.memo(function StaticBackground() {
  return (
    <>
      {/* New Background Image */}
      <img
        src="/assets/game/backgroung/backgroung_game_shoot.png"
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover pointer-events-none z-0"
      />
      {/* Floating leaves decoration */}
      {STATIC_LEAVES.map((l) => (
        <FloatingLeaf key={l.id} src={l.src} style={l.style} />
      ))}
      <div className="absolute bottom-[8%] left-1/2 -translate-x-1/2 z-20 flex flex-col items-center pointer-events-none">
        <img
          src={PANDA_LEFT}
          alt="Panda archer"
          className="w-36 h-36 object-contain drop-shadow-lg"
        />
      </div>
    </>
  );
});



const GameHUD = React.memo(function GameHUD({
  hp, maxHp, score, combo, showCombo, isFullscreen, toggleFullscreen, isPaused, onPause
}: {
  hp: number; maxHp: number; score: number; combo: number; showCombo: boolean; isFullscreen: boolean; toggleFullscreen: () => void; isPaused: boolean; onPause: () => void;
}) {
  return (
    <div className="absolute top-0 left-0 right-0 z-10 flex items-start justify-between px-5 py-4">
      <div className="flex gap-1.5">
        {Array.from({ length: maxHp }).map((_, i) => (
          <img
            key={i}
            src="/assets/illustrations/animals/pawicon.png"
            alt="HP"
            className={cn(
              'w-8 h-8 transition-all duration-200',
              i < hp ? 'opacity-100 drop-shadow-sm' : 'opacity-25 grayscale scale-90'
            )}
          />
        ))}
      </div>
      <div className="flex items-start gap-4">
        <div className="text-right relative">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl px-5 py-2 shadow-lg border border-white/50">
            <div className="text-3xl font-black text-emerald-700 leading-none drop-shadow-sm">{score}</div>
            <div className="text-xs font-semibold text-emerald-500 tracking-wide">ĐIỂM</div>
          </div>
          {showCombo && combo > 1 && (
            <div className="absolute right-0 top-16 animate-bounce pointer-events-none whitespace-nowrap">
              <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-white font-black text-xl px-4 py-1.5 rounded-full shadow-lg">
                {combo}x Combo! 🔥
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onPause}
            className="p-3 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/50 text-emerald-700 hover:bg-white hover:text-emerald-600 transition-colors"
            title={isPaused ? "Tiếp tục" : "Tạm dừng"}
          >
            {isPaused ? <Play size={24} /> : <Pause size={24} />}
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-3 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/50 text-emerald-700 hover:bg-white hover:text-emerald-600 transition-colors"
            title={isFullscreen ? "Thu nhỏ" : "Toàn màn hình"}
          >
            {isFullscreen ? <Minimize2 size={24} /> : <Maximize2 size={24} />}
          </button>
        </div>
      </div>
    </div>
  );
});

const ProgressBar = React.memo(function ProgressBar({ correct, total }: { correct: number; total: number }) {
  const percentage = Math.min(100, (correct / Math.max(total, 1)) * 100);
  return (
    <div className="absolute top-16 left-4 right-4 z-10">
      <div className="bg-white/60 backdrop-blur-sm rounded-full h-2 overflow-hidden border border-white/40">
        <div
          className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="text-xs text-emerald-700/70 font-semibold mt-0.5 ml-1">
        {correct} / {total} từ
      </div>
    </div>
  );
});

function BalloonsLayer({ targets }: { targets: ShooterCtx['targets'] }) {
  return (
    <>
      {targets.map((t) => {
        const colors = getBalloonStyle(t.id);
        return (
          <div
            key={t.id}
            className={cn(
              'absolute flex flex-col items-center transition-all duration-100',
              t.fullyTyped && 'animate-pulse'
            )}
            style={{
              left: `${t.x}%`,
              top: `${t.y}%`,
              transform: 'translate(-50%, -50%)',
              filter: t.fullyTyped ? 'drop-shadow(0 0 8px rgba(0,200,83,0.6))' : 'drop-shadow(0 4px 6px rgba(0,0,0,0.15))',
            }}
          >
            <div className={cn(
              'relative w-16 h-20 rounded-t-full rounded-b-2xl flex items-center justify-center shadow-lg',
              'bg-gradient-to-b from-white to-90% border-2',
              colors.bg, colors.border
            )}>
              <span className="text-3xl font-black text-white drop-shadow-md">{t.hanzi}</span>
              <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2 h-2 bg-white/80 rounded-sm" />
            </div>
            <div className="mt-2 bg-white/95 backdrop-blur-sm rounded-full px-3 py-1 shadow-md border border-white/60">
              <div className="flex items-center gap-0.5">
                <span className={cn('text-xl font-bold tracking-widest', colors.text)}>
                  {t.pinyinTyped.substring(0, t.typedCount)}
                </span>
                <span className="text-xl font-bold tracking-widest text-gray-300">
                  {t.pinyinTyped.substring(t.typedCount)}
                </span>
              </div>
            </div>
            <div className="mt-1 text-xs text-emerald-700/60 font-semibold bg-white/40 px-2 py-0.5 rounded-full">
              {t.pinyinDisplay}
            </div>
          </div>
        );
      })}
    </>
  );
}

function BulletsLayer({ bullets }: { bullets: ShooterCtx['bullets'] }) {
  return (
    <>
      {bullets.map((b) => (
        <div
          key={b.id}
          className="absolute w-2 h-6 rounded-full shadow-md pointer-events-none"
          style={{
            left: `${b.x}%`,
            top: `${b.y}%`,
            transform: 'translate(-50%, -50%)',
            background: 'linear-gradient(to top, #65a30d, #a3e635)',
            boxShadow: '0 0 6px #65a30d88',
          }}
        />
      ))}
    </>
  );
}

function ParticlesLayer({ particles }: { particles: ShooterCtx['particles'] }) {
  return (
    <>
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.life * 0.4,
            height: p.life * 0.4,
            backgroundColor: p.color,
            opacity: p.life / p.maxLife,
            transform: `translate(-50%, -50%) scale(${p.life / p.maxLife})`,
          }}
        />
      ))}
    </>
  );
}



const GameOverScreen = React.memo(function GameOverScreen({
  score, correctKeystrokes, maxCombo
}: {
  score: number; correctKeystrokes: number; maxCombo: number;
}) {
  const isGreat = score >= 80;
  const isGood = score >= 50;
  const pandaSrc = isGreat ? PANDA_BALANCE : isGood ? PANDA_LEFT : PANDA_EATING;
  const resultLabel = isGreat ? 'Xuất sắc!' : isGood ? 'Tốt lắm!' : 'Cố gắng thêm nhé!';
  const resultEmoji = isGreat ? '🏆' : isGood ? '✨' : '💪';

  return (
    <div className="flex flex-col items-center justify-center min-h-[580px] text-center w-full px-4">
      <div className="relative bg-gradient-to-b from-emerald-50 via-white to-emerald-50 rounded-3xl p-8 w-full max-w-sm border-2 border-emerald-200 shadow-xl overflow-hidden">
        <img src="/assets/illustrations/bamboo/bamboo-stalk.svg" alt="" className="absolute top-0 left-0 w-12 h-32 opacity-30" />
        <img src="/assets/illustrations/bamboo/bamboo-stalk.svg" alt="" className="absolute top-0 right-0 w-12 h-32 opacity-30 scale-x-[-1]" />
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
});

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
  const [showCombo, setShowCombo] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const comboTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(console.error);
    } else {
      document.exitFullscreen().catch(console.error);
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

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
      setTimeout(() => setFlashError(false), 250);
    });

    sec.start();
    setCtx(sec.getState());

    return () => {
      unsubGameOver();
      unsubWrongKey();
      if (comboTimerRef.current) clearTimeout(comboTimerRef.current);
      sec.destroy();
    };
  }, [items, onComplete]);

  const loop = useCallback((time: number) => {
    if (!lastTimeRef.current) lastTimeRef.current = time;
    const dt = time - lastTimeRef.current;
    lastTimeRef.current = time;
    
    if (secRef.current) {
      const currentState = secRef.current.getState();
      
      if (currentState.phase === 'playing') {
        secRef.current.tick(dt);
        setCtx({ ...secRef.current.getState() });
      }
      
      if (currentState.phase !== 'gameover' && currentState.phase !== 'completed') {
        rafRef.current = requestAnimationFrame(loop);
      }
    }
  }, []);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [loop]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && secRef.current) {
        const state = secRef.current.getState();
        if (state.phase === 'playing') {
          secRef.current.pause();
          setCtx({ ...secRef.current.getState() });
        } else if (state.phase === 'paused') {
          secRef.current.resume();
          setCtx({ ...secRef.current.getState() });
        }
        return;
      }
      
      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey && secRef.current) {
        secRef.current.handleKeystroke(e.key);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handlePauseToggle = useCallback(() => {
    if (!secRef.current) return;
    const state = secRef.current.getState();
    if (state.phase === 'playing') {
      secRef.current.pause();
      setCtx({ ...secRef.current.getState() });
    } else if (state.phase === 'paused') {
      secRef.current.resume();
      setCtx({ ...secRef.current.getState() });
    }
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
    return (
      <GameOverScreen 
        score={ctx.score} 
        correctKeystrokes={ctx.correctKeystrokes ?? 0} 
        maxCombo={ctx.maxCombo} 
      />
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative w-full h-full overflow-hidden select-none bg-black',
        flashError && 'ring-4 ring-rose-400 ring-inset'
      )}
    >
      <StaticBackground />
      
      <GameHUD 
        hp={ctx.hp} 
        maxHp={ctx.maxHp} 
        score={ctx.score} 
        combo={ctx.combo} 
        showCombo={showCombo} 
        isFullscreen={isFullscreen} 
        toggleFullscreen={toggleFullscreen} 
        isPaused={ctx.phase === 'paused'}
        onPause={handlePauseToggle}
      />
      
      <ProgressBar 
        correct={ctx.correctKeystrokes ?? 0} 
        total={items.length} 
      />
      
      <BalloonsLayer targets={ctx.targets} />
      <BulletsLayer bullets={ctx.bullets} />
      <ParticlesLayer particles={ctx.particles} />
    </div>
  );
}
