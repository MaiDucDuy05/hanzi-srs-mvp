'use client';
/**
 * Decorative backgrounds for game components.
 * Extracted to avoid cluttering game logic files.
 */
import { cn } from '@/lib/utils/cn';
import React from 'react';

// ── Bamboo Grove ──────────────────────────────────────────────

export function BambooBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <img
        src="/assets/illustrations/bamboo/bamboo.png"
        alt=""
        className="absolute bottom-0 left-0 w-28 h-64 object-cover opacity-20"
      />
      <img
        src="/assets/illustrations/bamboo/bamboo.png"
        alt=""
        className="absolute bottom-0 right-0 w-24 h-56 object-cover opacity-15 scale-x-[-1]"
      />
    </div>
  );
}

// ── Rice Paper texture ────────────────────────────────────────

export function PaperTexture({ className }: { className?: string }) {
  return (
    <div
      className={cn('absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-multiply', className)}
      style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/rice-paper.png")' }}
    />
  );
}

// ── Sky gradient ───────────────────────────────────────────────

export function SkyGradient({ children, className }: React.PropsWithChildren<{ className?: string }>) {
  return (
    <div className={cn('relative w-full h-full bg-gradient-to-b from-sky-300 via-sky-100 to-emerald-50', className)}>
      {children}
    </div>
  );
}

// ── Tian Zi Ge grid paper ─────────────────────────────────────

export function TianZiGrid({ className }: { className?: string }) {
  return (
    <div className={cn('absolute inset-0 pointer-events-none', className)}>
      <div className="absolute top-1/2 left-0 w-full border-t-2 border-dashed border-[#c6bcab]" />
      <div className="absolute left-1/2 top-0 h-full border-l-2 border-dashed border-[#c6bcab]" />
    </div>
  );
}

// ── Card flip pattern (back face) ──────────────────────────────

export function CardBack({ className }: { className?: string }) {
  return (
    <div className={cn('w-8 h-8 sm:w-12 sm:h-12 border-2 sm:border-4 border-white/50 rounded-full flex items-center justify-center', className)}>
      <span className="text-white/80 font-bold text-xl sm:text-2xl">?</span>
    </div>
  );
}

// ── Bamboo stalk decoration ───────────────────────────────────

export function BambooCorner({ side }: { side: 'left' | 'right' }) {
  return (
    <img
      src="/assets/illustrations/bamboo/bamboo-stalk.svg"
      alt=""
      className={cn(
        'absolute top-0 w-12 h-32 opacity-30 pointer-events-none',
        side === 'right' && 'right-0 scale-x-[-1]'
      )}
    />
  );
}

// ── Paw HP icon ───────────────────────────────────────────────

export function PawHP({ active }: { active: boolean }) {
  return (
    <img
      src="/assets/illustrations/animals/pawicon.png"
      alt="HP"
      className={cn(
        'w-8 h-8 transition-all duration-200',
        active ? 'opacity-100 drop-shadow-sm' : 'opacity-25 grayscale scale-90'
      )}
    />
  );
}

// ── Corner frame decorations ──────────────────────────────────

export function CornerFrame({ className }: { className?: string }) {
  return (
    <>
      <div className={cn('absolute top-1.5 left-1.5 w-4 h-4 border-t-[3px] border-l-[3px] border-[#a3977c]', className)} />
      <div className={cn('absolute top-1.5 right-1.5 w-4 h-4 border-t-[3px] border-r-[3px] border-[#a3977c]', className)} />
      <div className={cn('absolute bottom-1.5 left-1.5 w-4 h-4 border-b-[3px] border-l-[3px] border-[#a3977c]', className)} />
      <div className={cn('absolute bottom-1.5 right-1.5 w-4 h-4 border-b-[3px] border-r-[3px] border-[#a3977c]', className)} />
    </>
  );
}

// ── Floating leaves ───────────────────────────────────────────

const LEAF_SRCS = [
  '/assets/nature/leaves/leaf_1.svg',
  '/assets/nature/leaves/leaf_5.svg',
  '/assets/nature/leaves/leaf_9.svg',
  '/assets/nature/leaves/leaf_14.svg',
];

export const FloatingLeaves = React.memo(function FloatingLeaves({ count = 8 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <img
          key={i}
          src={LEAF_SRCS[i % LEAF_SRCS.length]}
          alt=""
          className="pointer-events-none absolute opacity-20"
          style={{
            width: 28,
            height: 28,
            left: `${(i * 13 + 7) % 95}%`,
            top: `${(i * 17 + 5) % 85}%`,
          }}
        />
      ))}
    </>
  );
});

// ── Panda mascot ──────────────────────────────────────────────

export const PANDA_LEFT = '/assets/illustrations/panda/panda_shoot.png';
export const PANDA_BALANCE = '/assets/illustrations/panda/panda-holding-ball.svg';
export const PANDA_EATING = '/assets/illustrations/panda/panda-eating.svg';

export function PandaMascot({ src, className }: { src?: string; className?: string }) {
  return (
    <img
      src={src ?? PANDA_LEFT}
      alt="Panda"
      className={cn('w-28 h-28 mx-auto mb-4 drop-shadow-md', className)}
    />
  );
}
