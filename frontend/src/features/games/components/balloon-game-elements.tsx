'use client';

import React from 'react';
import { cn } from '@/lib/utils/cn';
import type { ShooterCtx } from '../sec/shooter-sec';

const BALLOON_PALETTES = [
  { bg: 'from-rose-400 to-pink-500',     border: 'border-pink-400',     text: 'text-pink-700' },
  { bg: 'from-violet-400 to-purple-500', border: 'border-purple-400',   text: 'text-purple-700' },
  { bg: 'from-amber-400 to-orange-400', border: 'border-orange-400',   text: 'text-orange-700' },
  { bg: 'from-emerald-400 to-teal-500', border: 'border-teal-400',    text: 'text-teal-700' },
  { bg: 'from-blue-400 to-indigo-500',  border: 'border-indigo-400',  text: 'text-indigo-700' },
  { bg: 'from-red-400 to-rose-500',    border: 'border-rose-400',    text: 'text-rose-700' },
];

interface BalloonProps {
  target: ShooterCtx['targets'][0];
}

export function Balloon({ target }: BalloonProps) {
  const colors = BALLOON_PALETTES[target.id.charCodeAt(0) % BALLOON_PALETTES.length];
  return (
    <div
      className={cn('absolute flex flex-col items-center', target.fullyTyped && 'animate-pulse')}
      style={{
        left: `${target.x}%`, top: `${target.y}%`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <div 
        className={cn('relative w-16 h-20 rounded-t-full rounded-b-2xl flex items-center justify-center bg-gradient-to-b from-white to-90% border-2', colors.bg, colors.border)}
        style={{
          boxShadow: target.fullyTyped ? '0 0 12px rgba(0,200,83,0.8)' : '0 4px 8px rgba(0,0,0,0.15)'
        }}
      >
        <span className="text-3xl font-black text-white" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>{target.hanzi}</span>
        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2 h-2 bg-white/80 rounded-sm" />
      </div>
      <div className="mt-2 bg-white/95 rounded-full px-3 py-1 shadow-md border border-white/60">
        <div className="flex items-center gap-0.5">
          <span className={cn('text-xl font-bold tracking-widest', colors.text)}>{target.pinyinTyped.substring(0, target.typedCount)}</span>
          <span className="text-xl font-bold tracking-widest text-gray-300">{target.pinyinTyped.substring(target.typedCount)}</span>
        </div>
      </div>
      <div className="mt-1 text-xs text-emerald-700/60 font-semibold bg-white/60 px-2 py-0.5 rounded-full">{target.pinyinDisplay}</div>
    </div>
  );
}

export function BulletsLayer({ bullets }: { bullets: ShooterCtx['bullets'] }) {
  return (
    <>
      {bullets.map(b => (
        <div
          key={b.id}
          className="absolute w-2 h-6 rounded-full pointer-events-none"
          style={{
            left: `${b.x}%`, top: `${b.y}%`, transform: 'translate(-50%, -50%)',
            background: 'linear-gradient(to top, #65a30d, #a3e635)',
            boxShadow: '0 0 6px #65a30d88',
          }}
        />
      ))}
    </>
  );
}

export function ParticlesLayer({ particles }: { particles: ShooterCtx['particles'] }) {
  return (
    <>
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: `${p.x}%`, top: `${p.y}%`,
            width: p.life * 0.4, height: p.life * 0.4,
            backgroundColor: p.color,
            opacity: p.life / p.maxLife,
            transform: `translate(-50%, -50%) scale(${p.life / p.maxLife})`,
          }}
        />
      ))}
    </>
  );
}
