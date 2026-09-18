'use client';

import React from 'react';
import { Volume2 } from 'lucide-react';
import type { ListeningVocabItem } from '../utils/listening-question-generator';

interface ListeningSpeakerDisplayProps {
  vocab: ListeningVocabItem;
  isPlaying: boolean;
  isAnswered: boolean;
  onPlay: () => void;
}

export function ListeningSpeakerDisplay({
  vocab,
  isPlaying,
  isAnswered,
  onPlay,
}: ListeningSpeakerDisplayProps) {
  return (
    <div className="flex flex-col items-center justify-center my-4 w-full">
      {/* Animated Audio Speaker Button */}
      <div className="relative group">
        <div
          className={`absolute -inset-2 rounded-full blur-md opacity-40 transition-all duration-500 ${
            isPlaying ? 'bg-[#aadd4a] scale-110' : 'bg-transparent'
          }`}
        />
        <button
          onClick={onPlay}
          className={`relative w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-white shadow-2xl flex items-center justify-center border-8 transition-all duration-300 ${
            isPlaying
              ? 'border-[#8bc34a] scale-105 shadow-[#8bc34a]/30'
              : 'border-[#eef7e9] hover:border-[#aadd4a] hover:scale-105'
          }`}
        >
          <Volume2
            className={`w-12 h-12 sm:w-14 sm:h-14 text-[#215b3b] transition-transform duration-300 ${
              isPlaying ? 'scale-110 animate-pulse text-[#8bc34a]' : 'group-hover:scale-110'
            }`}
          />
        </button>
      </div>

      {/* Revealed Character & Pinyin info after answering */}
      <div className="min-h-[70px] mt-4 flex flex-col items-center justify-center text-center">
        {isAnswered ? (
          <div className="animate-in fade-in zoom-in duration-300 bg-white/90 backdrop-blur-sm px-6 py-2.5 rounded-2xl border border-[#aadd4a]/40 shadow-sm">
            <p className="text-3xl sm:text-4xl font-black text-[#215b3b] tracking-wide font-hanzi">
              {vocab.hanzi}
            </p>
            <p className="text-base sm:text-lg font-bold text-[#8bc34a] mt-0.5">
              {vocab.pinyin}
            </p>
          </div>
        ) : (
          <p className="text-sm sm:text-base text-[#4a6b38] font-medium bg-white/60 px-4 py-1.5 rounded-full backdrop-blur-sm border border-white/60">
            Nhấn loa hoặc phím <kbd className="px-1.5 py-0.5 text-xs bg-gray-100 rounded border">Space</kbd> để nghe lại
          </p>
        )}
      </div>
    </div>
  );
}
