'use client';

import React, { useState } from 'react';
import type { YctVocabulary } from '@/lib/api/endpoints/yct';
import { speakText } from '@/lib/utils/tts';
import { Volume2, RotateCw, ArrowLeft, ArrowRight, Sparkles, CheckCircle2, Shuffle } from 'lucide-react';
import { Button } from '@/features/ui/components/button';
import { resolveYctImageUrl } from '@/lib/utils/yct-image';

interface YctFlashcardGameProps {
  vocabularies: YctVocabulary[];
  lessonTitle: string;
  onFinish?: () => void;
}

export function YctFlashcardGame({ vocabularies, lessonTitle, onFinish }: YctFlashcardGameProps) {
  const [cards, setCards] = useState<YctVocabulary[]>(vocabularies);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [completed, setCompleted] = useState(false);

  if (!cards || cards.length === 0) {
    return (
      <div className="text-center py-12 bg-[#f3f8d7]/40 rounded-3xl border-2 border-dashed border-[#eaf3c5]">
        <p className="text-base font-bold text-[#215b3b]">Bài học này chưa có từ vựng nào.</p>
      </div>
    );
  }

  const current = cards[currentIndex];

  const handlePlayAudio = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    speakText(text);
  };

  const handleNext = () => {
    setIsFlipped(false);
    if (currentIndex < cards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCompleted(true);
    }
  };

  const handlePrev = () => {
    setIsFlipped(false);
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleShuffle = () => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
    setCompleted(false);
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setCompleted(false);
  };

  if (completed) {
    return (
      <div className="bg-white border border-[#eaf3c5] rounded-3xl p-8 text-center max-w-lg mx-auto shadow-sm">
        <div className="w-16 h-16 bg-[#e5f5eb] text-[#215b3b] rounded-full flex items-center justify-center mx-auto mb-4 shadow-xs text-3xl">
          🎉
        </div>
        <h3 className="text-2xl font-black text-[#11321e] mb-2">Hoàn thành bài học!</h3>
        <p className="text-gray-600 text-sm mb-6">
          Bạn đã xem hết <span className="font-bold text-[#215b3b]">{cards.length}</span> thẻ từ vựng của bài{' '}
          <span className="font-bold">"{lessonTitle}"</span>.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={handleRestart}
            variant="secondary"
            className="border-[#eaf3c5] text-[#215b3b] font-bold py-3 px-6 rounded-2xl transition-transform active:scale-95"
          >
            <RotateCw className="w-4 h-4 mr-2" />
            Xem lại từ đầu
          </Button>
          {onFinish && (
            <Button
              onClick={onFinish}
              className="bg-[#215b3b] hover:bg-[#18452b] text-white font-bold py-3 px-6 rounded-2xl shadow-sm transition-transform active:scale-95"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Chơi Lật Thẻ Trí Nhớ
            </Button>
          )}
        </div>
      </div>
    );
  }

  const progressPercent = Math.round(((currentIndex + 1) / cards.length) * 100);

  return (
    <div className="max-w-md mx-auto">
      {/* Thanh tiến độ */}
      <div className="mb-4">
        <div className="flex justify-between items-center text-xs font-bold text-[#215b3b] mb-1">
          <span className="flex items-center gap-1.5">
            Thẻ {currentIndex + 1} / {cards.length}
          </span>
          <span className="bg-[#e5f5eb] text-[#215b3b] px-2 py-0.5 rounded-full border border-[#eaf3c5]">
            {progressPercent}%
          </span>
        </div>
        <div className="w-full bg-[#e5f5eb] rounded-full h-2 overflow-hidden border border-[#eaf3c5]">
          <div
            className="bg-[#215b3b] h-full rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Thẻ Flashcard chính */}
      <div
        onClick={() => setIsFlipped(!isFlipped)}
        className="relative h-[450px] sm:h-[480px] w-full cursor-pointer perspective-1000 group select-none"
      >
        <div
          className={`relative w-full h-full duration-500 transform-style-preserve-3d transition-transform rounded-3xl shadow-sm ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* MẶT TRƯỚC: ẢNH S3 + CHỮ HÁN + PINYIN */}
          <div className="absolute inset-0 backface-hidden bg-white border-2 border-[#eaf3c5] rounded-3xl p-6 flex flex-col items-center justify-between overflow-hidden shadow-xs">
            <div className="w-full flex justify-between items-center">
              <span className="text-xs font-bold uppercase tracking-wider text-[#215b3b] bg-[#e5f5eb] px-3 py-1 rounded-full border border-[#eaf3c5]">
                Flashcard
              </span>
              <button
                onClick={(e) => handlePlayAudio(e, current.hanzi)}
                className="w-10 h-10 rounded-full bg-[#e5f5eb] hover:bg-[#d0eedb] text-[#215b3b] flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-xs"
                title="Phát âm"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>

            {/* Hình ảnh minh hoạ S3 - Hiển thị tự nhiên không ép vuông/cắt ảnh */}
            <div className="flex-1 w-full flex items-center justify-center my-2 min-h-0">
              {current.imageKey ? (
                <img
                  src={resolveYctImageUrl(current.imageKey)}
                  alt={current.hanzi}
                  className="max-h-52 sm:max-h-56 max-w-full w-auto h-auto object-contain rounded-2xl group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="text-center p-4 bg-gray-50/80 rounded-2xl border border-dashed border-[#eaf3c5]">
                  <span className="text-4xl">🎨</span>
                  <p className="text-xs text-gray-400 mt-2 font-medium">Chưa có ảnh</p>
                </div>
              )}
            </div>

            {/* Chữ Hán & Pinyin */}
            <div className="text-center">
              <div className="text-5xl font-black text-gray-900 tracking-wide">
                {current.hanzi}
              </div>
              <div className="text-xl font-bold text-[#215b3b] mt-1">
                {current.pinyin}
              </div>
            </div>

            {/* Hint */}
            <div className="flex items-center gap-1 text-xs text-gray-400 font-medium">
              <RotateCw className="w-3.5 h-3.5" />
              <span>Chạm để lật xem nghĩa tiếng Việt</span>
            </div>
          </div>

          {/* MẶT SAU: NGHĨA TIẾNG VIỆT + VÍ DỤ */}
          <div className="absolute inset-0 backface-hidden rotate-y-180 bg-gradient-to-br from-[#1c4d32] to-[#256642] text-white border-2 border-[#256642] rounded-3xl p-6 flex flex-col items-center justify-between shadow-lg">
            <div className="w-full flex justify-between items-center">
              <span className="text-xs font-bold uppercase tracking-wider bg-white/15 text-white px-3 py-1 rounded-full backdrop-blur-sm border border-white/20">
                Nghĩa tiếng Việt
              </span>
              <button
                onClick={(e) => handlePlayAudio(e, current.hanzi)}
                className="w-10 h-10 rounded-full bg-white text-[#215b3b] hover:bg-emerald-50 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-md"
                title="Phát âm"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center my-auto">
              <div className="text-4xl font-extrabold text-white mb-2">
                {current.hanzi}
              </div>
              <div className="text-lg font-bold text-emerald-200 mb-4">
                {current.pinyin}
              </div>

              <div className="bg-white/15 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/20 shadow-inner">
                <div className="text-2xl font-black text-white capitalize">
                  {current.meaningVi}
                </div>
                {current.partOfSpeech && (
                  <span className="inline-block text-xs font-semibold bg-white/20 text-white px-2.5 py-0.5 rounded-full mt-2">
                    {current.partOfSpeech}
                  </span>
                )}
              </div>

              {current.example && (
                <div className="mt-4 text-sm bg-black/15 rounded-xl p-3 text-emerald-100 font-medium">
                  <p className="italic">"{current.example}"</p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1 text-xs text-white/70 font-medium">
              <RotateCw className="w-3.5 h-3.5" />
              <span>Chạm để lật lại chữ Hán</span>
            </div>
          </div>
        </div>
      </div>

      {/* Thanh điều khiển dưới */}
      <div className="flex items-center justify-between mt-6 gap-3">
        <Button
          variant="secondary"
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="rounded-2xl px-4 py-3 font-bold border border-[#eaf3c5] hover:bg-[#e5f5eb] text-[#215b3b] disabled:opacity-40"
        >
          <ArrowLeft className="w-5 h-5 mr-1" />
          Trước
        </Button>

        <Button
          variant="secondary"
          onClick={handleShuffle}
          className="rounded-2xl px-4 py-3 font-bold border border-[#eaf3c5] hover:bg-[#e5f5eb] text-[#215b3b]"
          title="Xáo trộn thẻ ngẫu nhiên"
        >
          <Shuffle className="w-5 h-5" />
        </Button>

        <Button
          onClick={handleNext}
          className="rounded-2xl px-6 py-3 font-bold bg-[#215b3b] hover:bg-[#18452b] text-white shadow-sm transition-transform active:scale-95"
        >
          {currentIndex === cards.length - 1 ? (
            <>
              Hoàn thành
              <CheckCircle2 className="w-5 h-5 ml-1.5" />
            </>
          ) : (
            <>
              Tiếp theo
              <ArrowRight className="w-5 h-5 ml-1.5" />
            </>
          )}
        </Button>
      </div>

      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
}
