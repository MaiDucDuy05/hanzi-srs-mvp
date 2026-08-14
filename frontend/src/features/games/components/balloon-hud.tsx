'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Pause, Play, Maximize2, Minimize2 } from 'lucide-react';
import { PawHP } from './game-decorations';
import { cn } from '@/lib/utils/cn';

const IconButton = ({ onClick, title, children }: React.PropsWithChildren<{ onClick: () => void; title: string }>) => (
  <button
    onClick={onClick}
    title={title}
    className="p-3 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/50 text-emerald-700 hover:bg-white hover:text-emerald-600 transition-colors"
  >
    {children}
  </button>
);

interface GameHUDProps {
  hp: number; maxHp: number; score: number; combo: number;
  showCombo: boolean; isFullscreen: boolean; isPaused: boolean;
  onPause: () => void; onToggleFs: () => void;
}

export function GameHUD({ hp, maxHp, score, combo, showCombo, isFullscreen, isPaused, onPause, onToggleFs }: GameHUDProps) {
  return (
    <div className="absolute top-0 left-0 right-0 z-10 flex items-start justify-between px-5 py-4">
      <div className="flex gap-1.5">
        {Array.from({ length: maxHp }).map((_, i) => <PawHP key={i} active={i < hp} />)}
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
          <IconButton onClick={onPause} title={isPaused ? 'Tiếp tục' : 'Tạm dừng'}>
            {isPaused ? <Play size={24} /> : <Pause size={24} />}
          </IconButton>
          <IconButton onClick={onToggleFs} title={isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}>
            {isFullscreen ? <Minimize2 size={24} /> : <Maximize2 size={24} />}
          </IconButton>
        </div>
      </div>
    </div>
  );
}

export function ProgressBar({ correct, total }: { correct: number; total: number }) {
  const pct = Math.min(100, (correct / Math.max(total, 1)) * 100);
  return (
    <div className="absolute top-16 left-4 right-4 z-10">
      <div className="bg-white/60 backdrop-blur-sm rounded-full h-2 overflow-hidden border border-white/40">
        <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all duration-300" style={{ width: `${pct}%` }} />
      </div>
      <div className="text-xs text-emerald-700/70 font-semibold mt-0.5 ml-1">{correct} / {total} từ</div>
    </div>
  );
}
