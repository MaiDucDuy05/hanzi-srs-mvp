'use client';

/**
 * Shared UI components for game screens.
 * Extracted to avoid duplication across game features.
 */
import { cn } from '@/lib/utils/cn';
import { Button } from '@/features/ui/components/button';
import { BambooCorner, PandaMascot, PANDA_BALANCE, PANDA_EATING, PANDA_LEFT } from './game-decorations';

interface GameResultCardProps {
  score: number;
  correctCount: number;
  wrongCount: number;
  elapsed: number;
  maxCombo?: number;
  title?: string;
  subtitle?: string;
  onReplay?: () => void;
  onExit?: () => void;
}

export function GameResultCard({
  score,
  correctCount,
  wrongCount,
  elapsed,
  maxCombo,
  title = 'Hoàn thành! 🎉',
  subtitle,
  onReplay,
  onExit,
}: GameResultCardProps) {
  const isGreat = score >= 80;
  const isGood = score >= 50;
  const pandaSrc = isGreat ? PANDA_BALANCE : isGood ? PANDA_LEFT : PANDA_EATING;
  const resultLabel = isGreat ? 'Xuất sắc!' : isGood ? 'Tốt lắm!' : 'Cố gắng thêm nhé!';
  const resultEmoji = isGreat ? '🏆' : isGood ? '✨' : '💪';

  return (
    <div className="flex flex-col items-center justify-center min-h-[580px] text-center w-full px-4">
      <div className="relative bg-gradient-to-b from-emerald-50 via-white to-emerald-50 rounded-3xl p-8 w-full max-w-sm border-2 border-emerald-200 shadow-xl overflow-hidden">
        <BambooCorner side="left" />
        <BambooCorner side="right" />

        <PandaMascot src={pandaSrc} />

        <div className="text-5xl mb-2">{resultEmoji}</div>
        <h2 className="text-3xl font-black text-emerald-700 mb-1">{resultLabel}</h2>
        {subtitle && <p className="text-gray-500 text-sm mb-6">{subtitle}</p>}

        <div className="grid grid-cols-3 gap-3 mb-6">
          <StatBox label="Điểm" value={score} color="text-amber-500" />
          <StatBox label="Đúng" value={correctCount} color="text-emerald-600" />
          {maxCombo !== undefined ? (
            <StatBox label="Combo" value={maxCombo} color="text-rose-500" />
          ) : (
            <StatBox label="Sai" value={wrongCount} color="text-red-500" />
          )}
        </div>

        <div className="flex gap-3">
          {onReplay && (
            <Button onClick={onReplay} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl shadow-lg">
              🔄 Chơi lại
            </Button>
          )}
          {onExit && (
            <Button onClick={onExit} variant="outline" className="flex-1 py-3 rounded-xl">
              ← Thoát
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-white rounded-xl p-3 shadow-sm border border-emerald-100">
      <div className={cn('text-2xl font-black', color)}>{value}</div>
      <div className="text-xs text-gray-400 font-medium">{label}</div>
    </div>
  );
}

// ── Game Header (score + progress) ─────────────────────────────

interface GameHeaderProps {
  title: string;
  score: number;
  progress: number;      // 0–100
  current: number;
  total: number;
  label?: string;
}

export function GameHeader({ title, score, progress, current, total, label = 'ĐIỂM' }: GameHeaderProps) {
  return (
    <>
      <div className="flex items-center justify-between px-5 py-4">
        <h1 className="text-xl sm:text-3xl font-black text-emerald-700 font-heading drop-shadow-sm">{title}</h1>
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl px-5 py-2 shadow-lg border border-white/50">
          <div className="text-3xl font-black text-emerald-700 leading-none drop-shadow-sm">{score}</div>
          <div className="text-xs font-semibold text-emerald-500 tracking-wide">{label}</div>
        </div>
      </div>

      <div className="px-4">
        <div className="bg-white/60 backdrop-blur-sm rounded-full h-2 overflow-hidden border border-white/40">
          <div
            className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(100, progress)}%` }}
          />
        </div>
        <div className="text-xs text-emerald-700/70 font-semibold mt-0.5 ml-1">
          {current} / {total}
        </div>
      </div>
    </>
  );
}

// ── Timer ────────────────────────────────────────────────────

export function GameTimer({ seconds }: { seconds: number }) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return (
    <div className="bg-[#d4ebd0] text-[#215b3b] font-bold text-sm sm:text-xl px-3 py-1.5 sm:px-4 sm:py-2 rounded-full flex items-center gap-2 shadow-sm whitespace-nowrap">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      {m}:{s}
    </div>
  );
}
