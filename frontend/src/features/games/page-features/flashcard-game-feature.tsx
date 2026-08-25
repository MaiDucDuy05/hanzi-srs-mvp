'use client';

import React, { useState, useCallback } from 'react';
import { BambooProgressBar } from '@/features/ui/components/bamboo-progress-bar';
import { ClickableHanzi } from '@/features/ui/components/clickable-hanzi';
import { srsApi } from '@/lib/api/endpoints/srs';
import { SrsRating } from '@/lib/api/types';

export interface FlashcardGameFeatureProps {
  /** Danh sách từ vựng cần ôn tập */
  vocabularies: {
    id: string;
    hanzi: string;
    pinyin: string;
    meaningVi: string;
    example: string | null;
    audioKey: string | null;
  }[];
  /** Gọi khi hoàn thành tất cả flashcard */
  onComplete?: () => void;
}

export function FlashcardGameFeature({ vocabularies, onComplete }: FlashcardGameFeatureProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const total = vocabularies.length;
  const current = vocabularies[currentIndex];
  const progress = total > 0 ? Math.round(((currentIndex) / total) * 100) : 0;

  // Use key to force flip reset when card changes — avoids setState in effect
  const cardKey = `${currentIndex}-${current?.id}`;

  const handleRate = useCallback(async (rating: SrsRating) => {
    if (!current || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await srsApi.submitReview(current.id, rating);
    } catch (err) {
      console.error('[FlashcardGame] submitReview failed', err);
    }
    setIsSubmitting(false);
    setIsFlipped(false);
    if (currentIndex >= total - 1) {
      onComplete?.();
    } else {
      setCurrentIndex((i) => i + 1);
    }
  }, [current, isSubmitting, currentIndex, total, onComplete]);

  const playAudio = useCallback((text?: string | null, audioKey?: string | null) => {
    if (text) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-CN';
      const voices = window.speechSynthesis.getVoices();
      const zhVoice = voices.find(v => v.lang.includes('zh') || v.lang.includes('cmn')) || voices.find(v => v.lang.includes('zh-CN'));
      if (zhVoice) {
        utterance.voice = zhVoice;
      }
      window.speechSynthesis.speak(utterance);
      return;
    }
    if (audioKey) {
      const url = `https://cdn.duguyih.cn/audio/${audioKey}`;
      new Audio(url).play().catch(() => {/* ignore audio errors */});
    }
  }, []);

  if (!current) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center w-full">
        <p className="text-gray-400">Không có từ vựng để ôn tập.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-between w-full relative h-full py-4 sm:py-8 z-10">

      {/* Top Progress Bar */}
      <BambooProgressBar progress={progress} className="mb-4 sm:mb-6 mt-2" />

      {/* Flashcard Area */}
      <div className="w-full max-w-3xl flex-1 flex flex-col items-center justify-center my-6 perspective-1000">
        <div
          key={cardKey}
          className={`relative w-full h-[320px] sm:h-[400px] cursor-pointer transition-transform duration-700 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}
          onClick={() => setIsFlipped((f) => !f)}
        >
          {/* Front of card */}
          <div className="absolute inset-0 backface-hidden bg-white rounded-[2rem] sm:rounded-[3rem] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] flex flex-col items-center justify-center p-8 border-b-[6px] sm:border-b-[8px] border-gray-100">
            <ClickableHanzi text={current.hanzi} className="mb-4 drop-shadow-sm tracking-wide" charClassName="text-8xl sm:text-[140px] font-black text-[#215b3b]" />
            <span className="text-gray-400 font-medium text-sm sm:text-base">Click to flip</span>
          </div>

          {/* Back of card */}
          <div className="absolute inset-0 backface-hidden rotate-y-180 bg-white rounded-[2rem] sm:rounded-[3rem] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] flex flex-col items-center justify-center p-8 border-b-[6px] sm:border-b-[8px] border-gray-100">
            {/* Top Right Actions */}
            <div className="absolute top-4 right-6 sm:top-8 sm:right-10 flex gap-3 sm:gap-5">
              {(current.audioKey || current.hanzi) && (
                <div className="flex flex-col items-center gap-1 sm:gap-2 group" onClick={(e) => { e.stopPropagation(); playAudio(current.hanzi, current.audioKey); }}>
                  <button className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-[#7bc62d] text-white flex items-center justify-center shadow-md group-hover:bg-[#6ab322] group-hover:scale-105 transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-7 sm:w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                  </button>
                  <span className="text-[10px] sm:text-xs font-bold text-[#4a6b38]">Audio</span>
                </div>
              )}
              <div className="flex flex-col items-center gap-1 sm:gap-2 group" onClick={(e) => e.stopPropagation()}>
                <button className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-[#7bc62d] text-white flex items-center justify-center shadow-md group-hover:bg-[#6ab322] group-hover:scale-105 transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-7 sm:w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                </button>
                <span className="text-[10px] sm:text-xs font-bold text-[#4a6b38]">Stroke Order</span>
              </div>
            </div>

            {/* Center Content */}
            <div className="flex flex-col items-center justify-center mt-6 sm:mt-10">
              <span className="text-3xl sm:text-[44px] font-medium text-[#7bc62d] mb-1 sm:mb-3 tracking-wider">{current.pinyin}</span>
              <ClickableHanzi text={current.hanzi} className="leading-tight drop-shadow-sm tracking-wide" charClassName="text-7xl sm:text-[120px] font-bold text-[#215b3b]" />
              <span className="text-gray-600 font-semibold text-base sm:text-xl mt-3">{current.meaningVi}</span>
              {current.example && (
                <p className="text-gray-400 text-sm sm:text-base mt-2 italic text-center px-4">{current.example}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Buttons */}
      <div className={`w-full max-w-3xl mt-auto pb-4 flex justify-between gap-2 sm:gap-4 transition-all duration-500 ease-out ${isFlipped ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'}`}>
        <button
          onClick={() => handleRate(SrsRating.AGAIN)}
          className="flex-1 py-4 sm:py-5 px-2 rounded-[1.5rem] font-bold text-white shadow-[0_4px_0_rgba(0,0,0,0.1)] hover:shadow-[0_2px_0_rgba(0,0,0,0.1)] active:shadow-none hover:translate-y-[2px] active:translate-y-[4px] transition-all text-sm sm:text-xl bg-[#c2daba] hover:bg-[#a5c59b]"
        >
          Again
        </button>
        <button
          onClick={() => handleRate(SrsRating.HARD)}
          className="flex-1 py-4 sm:py-5 px-2 rounded-[1.5rem] font-bold text-white shadow-[0_4px_0_rgba(0,0,0,0.1)] hover:shadow-[0_2px_0_rgba(0,0,0,0.1)] active:shadow-none hover:translate-y-[2px] active:translate-y-[4px] transition-all text-sm sm:text-xl bg-[#cfe583] hover:bg-[#b8d655]"
        >
          Hard
        </button>
        <button
          onClick={() => handleRate(SrsRating.GOOD)}
          className="flex-1 py-4 sm:py-5 px-2 rounded-[1.5rem] font-bold text-white shadow-[0_4px_0_rgba(0,0,0,0.1)] hover:shadow-[0_2px_0_rgba(0,0,0,0.1)] active:shadow-none hover:translate-y-[2px] active:translate-y-[4px] transition-all text-sm sm:text-xl bg-[#93c448] hover:bg-[#81b235]"
        >
          Good
        </button>
        <button
          onClick={() => handleRate(SrsRating.EASY)}
          className="flex-1 py-4 sm:py-5 px-2 rounded-[1.5rem] font-bold text-white shadow-[0_4px_0_rgba(0,0,0,0.1)] hover:shadow-[0_2px_0_rgba(0,0,0,0.1)] active:shadow-none hover:translate-y-[4px] active:translate-y-[4px] transition-all text-sm sm:text-xl bg-[#7bc62d] hover:bg-[#68a826]"
        >
          Easy
        </button>
      </div>

    </div>
  );
}
