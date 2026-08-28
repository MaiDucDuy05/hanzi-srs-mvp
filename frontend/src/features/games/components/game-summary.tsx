'use client';

import { formatDuration } from '@/lib/utils/format';
import type { ModeResult } from '@/features/practice/components/practice-models';
import { Star, Trophy, RotateCcw, Home } from 'lucide-react';

export interface GameSummaryProps {
  title?: string;
  subtitle?: string;
  result: ModeResult;
  elapsed: number;
  onReplay?: () => void;
  onExit: () => void;
}

export function GameSummary({
  title: propTitle,
  subtitle,
  result,
  elapsed,
  onReplay,
  onExit,
}: GameSummaryProps) {
  const getStars = (score: number) => {
    if (score >= 90) return 3;
    if (score >= 60) return 2;
    return 1;
  };

  const stars = getStars(result.score);

  const getTitle = () => {
    if (stars === 3) return "Tuyệt vời! 🎉";
    if (stars === 2) return "Khá tốt! 👍";
    return "Cố gắng lên nhé! 💪";
  };
  const title = getTitle();

  return (
    <div className="mx-auto max-w-md w-full bg-white/95 backdrop-blur-sm rounded-3xl p-6 sm:p-8 shadow-2xl border-4 border-white/60 text-center animate-in zoom-in duration-300">
      
      {/* 3 Stars */}
      <div className="flex justify-center gap-2 mb-6">
        {[1, 2, 3].map((star) => (
          <Star
            key={star}
            className={`w-12 h-12 sm:w-16 sm:h-16 transition-all duration-700 ${
              star <= stars 
                ? 'fill-yellow-400 text-yellow-500 drop-shadow-md scale-110 rotate-0' 
                : 'fill-gray-100 text-gray-200 scale-90 -rotate-12'
            }`}
          />
        ))}
      </div>

      <h2 className="text-3xl sm:text-4xl font-black text-gray-800 mb-2">{title}</h2>
      {subtitle && <p className="text-gray-500 font-medium mb-6 text-lg">{subtitle}</p>}

      {/* Score */}
      <div className="flex items-center justify-center mb-8">
        <div className="relative">
          <Trophy className="w-24 h-24 text-yellow-400 opacity-10 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          <p className="text-6xl sm:text-7xl font-black text-[#215b3b] relative z-10 drop-shadow-sm">
            {result.score}
            <span className="text-3xl sm:text-4xl ml-1">%</span>
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="rounded-2xl bg-green-50 p-3 sm:p-4 border border-green-100 shadow-sm">
          <p className="text-2xl font-black text-green-600">{result.correctCount}</p>
          <p className="text-xs sm:text-sm font-bold text-green-700/60 uppercase tracking-wider mt-1">Đúng</p>
        </div>
        <div className="rounded-2xl bg-red-50 p-3 sm:p-4 border border-red-100 shadow-sm">
          <p className="text-2xl font-black text-red-600">{result.wrongCount}</p>
          <p className="text-xs sm:text-sm font-bold text-red-700/60 uppercase tracking-wider mt-1">Sai</p>
        </div>
        <div className="rounded-2xl bg-blue-50 p-3 sm:p-4 border border-blue-100 shadow-sm flex flex-col justify-center items-center">
          <p className="text-xl font-black text-blue-600 mt-0.5">{formatDuration(elapsed)}</p>
          <p className="text-xs sm:text-sm font-bold text-blue-700/60 uppercase tracking-wider mt-1">Thời gian</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {onReplay && (
          <button 
            onClick={onReplay}
            className="flex-1 bg-[#8BC34A] hover:bg-[#7CB342] text-white font-bold py-3 px-6 rounded-full shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            Chơi lại
          </button>
        )}
        <button 
          onClick={onExit}
          className="flex-1 bg-white hover:bg-gray-50 text-gray-700 font-bold py-3 px-6 rounded-full shadow-md border-2 border-gray-100 hover:border-gray-200 transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          <Home className="w-5 h-5" />
          Về menu
        </button>
      </div>
    </div>
  );
}
