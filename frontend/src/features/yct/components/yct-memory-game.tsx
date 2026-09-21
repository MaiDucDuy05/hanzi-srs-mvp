'use client';

import React, { useState, useEffect } from 'react';
import type { YctVocabulary } from '@/lib/api/endpoints/yct';
import { speakText } from '@/lib/utils/tts';
import { Sparkles, RotateCw } from 'lucide-react';
import { Button } from '@/features/ui/components/button';
import { cn } from '@/lib/utils/cn';
import { resolveYctImageUrl } from '@/lib/utils/yct-image';

interface YctMemoryGameProps {
  vocabularies: YctVocabulary[];
  lessonTitle: string;
  onFinish?: () => void;
}

interface MemoryCard {
  id: string;
  vocabId: string;
  type: 'image_hanzi' | 'meaning';
  hanzi: string;
  pinyin: string;
  meaningVi: string;
  imageKey: string | null;
  isFlipped: boolean;
  isMatched: boolean;
}

export function YctMemoryGame({ vocabularies, lessonTitle, onFinish }: YctMemoryGameProps) {
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [selectedCards, setSelectedCards] = useState<MemoryCard[]>([]);
  const [moves, setMoves] = useState(0);
  const [isWon, setIsWon] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  // Khởi tạo bộ bài từ danh sách từ vựng (tối đa 6 từ = 12 thẻ)
  const initGame = () => {
    const pool = [...vocabularies].slice(0, 6);
    const cardList: MemoryCard[] = [];

    pool.forEach((v) => {
      // Thẻ 1: Hình ảnh + Chữ Hán
      cardList.push({
        id: `${v.id}-img`,
        vocabId: v.id,
        type: 'image_hanzi',
        hanzi: v.hanzi,
        pinyin: v.pinyin,
        meaningVi: v.meaningVi,
        imageKey: v.imageKey,
        isFlipped: false,
        isMatched: false,
      });

      // Thẻ 2: Nghĩa tiếng Việt
      cardList.push({
        id: `${v.id}-meaning`,
        vocabId: v.id,
        type: 'meaning',
        hanzi: v.hanzi,
        pinyin: v.pinyin,
        meaningVi: v.meaningVi,
        imageKey: v.imageKey,
        isFlipped: false,
        isMatched: false,
      });
    });

    // Shuffle ngẫu nhiên
    const shuffled = cardList.sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setSelectedCards([]);
    setMoves(0);
    setIsWon(false);
    setIsLocked(false);
  };

  useEffect(() => {
    if (vocabularies.length > 0) {
      initGame();
    }
  }, [vocabularies]);

  const handleCardClick = (clickedCard: MemoryCard) => {
    if (isLocked || clickedCard.isFlipped || clickedCard.isMatched) return;

    const newCards = cards.map((c) =>
      c.id === clickedCard.id ? { ...c, isFlipped: true } : c,
    );
    setCards(newCards);

    if (clickedCard.type === 'image_hanzi') {
      speakText(clickedCard.hanzi);
    }

    const newSelected = [...selectedCards, clickedCard];
    setSelectedCards(newSelected);

    if (newSelected.length === 2) {
      setMoves((m) => m + 1);
      setIsLocked(true);

      const [c1, c2] = newSelected;
      if (c1.vocabId === c2.vocabId) {
        setTimeout(() => {
          setCards((prev) => {
            const updated = prev.map((c) =>
              c.vocabId === c1.vocabId ? { ...c, isMatched: true, isFlipped: true } : c,
            );
            if (updated.every((c) => c.isMatched)) {
              setIsWon(true);
            }
            return updated;
          });
          setSelectedCards([]);
          setIsLocked(false);
        }, 500);
      } else {
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.id === c1.id || c.id === c2.id ? { ...c, isFlipped: false } : c,
            ),
          );
          setSelectedCards([]);
          setIsLocked(false);
        }, 1000);
      }
    }
  };

  if (!vocabularies || vocabularies.length === 0) {
    return (
      <div className="text-center py-12 bg-[#f3f8d7]/40 rounded-3xl border-2 border-dashed border-[#eaf3c5]">
        <p className="text-base font-bold text-[#215b3b]">Bài học chưa có từ vựng để chơi lật thẻ.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Thanh thông số game */}
      <div className="flex justify-between items-center bg-white border border-[#eaf3c5] rounded-2xl p-4 mb-6 shadow-xs">
        <div>
          <h4 className="font-bold text-[#11321e] text-sm">Lật Thẻ Trí Nhớ</h4>
          <p className="text-xs text-gray-500">Tìm cặp: Hình ảnh/Chữ ↔ Nghĩa tiếng Việt</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-xs text-gray-400 font-semibold block">Lượt lật</span>
            <span className="text-lg font-black text-[#215b3b]">{moves}</span>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={initGame}
            className="rounded-xl border border-[#eaf3c5] hover:bg-[#e5f5eb] text-[#215b3b] font-bold"
            title="Chơi lại ván mới"
          >
            <RotateCw className="w-4 h-4 mr-1" />
            Chơi lại
          </Button>
        </div>
      </div>

      {/* Lưới thẻ bài (3x4 trên mobile, 4x3 trên desktop) */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 select-none">
        {cards.map((card) => {
          const isOpen = card.isFlipped || card.isMatched;

          return (
            <div
              key={card.id}
              onClick={() => handleCardClick(card)}
              className="h-36 sm:h-44 w-full perspective-1000 cursor-pointer group"
            >
              <div
                style={{ transformStyle: 'preserve-3d' }}
                className={cn(
                  'relative w-full h-full transition-transform duration-500 preserve-3d',
                  isOpen ? 'rotate-y-180' : ''
                )}
              >
                {/* Mặt sau thẻ (úp) - Chuẩn thiết kế practice với viền trắng, nền xanh lá #aadd4a và dấu hỏi trong vòng tròn */}
                <div
                  className={cn(
                    'absolute inset-0 backface-hidden bg-[#aadd4a] rounded-2xl shadow-md border-3 sm:border-4 border-white flex items-center justify-center transition-transform group-hover:-translate-y-1',
                    isOpen ? 'pointer-events-none' : ''
                  )}
                >
                  <div className="w-9 h-9 sm:w-12 sm:h-12 border-2 sm:border-4 border-white/50 rounded-full flex items-center justify-center">
                    <span className="text-white/90 font-bold text-lg sm:text-2xl">?</span>
                  </div>
                </div>

                {/* Mặt trước thẻ (mở) */}
                <div
                  className={cn(
                    'absolute inset-0 backface-hidden rotate-y-180 bg-white rounded-2xl shadow-md flex flex-col items-center justify-center p-2 text-center transition-all',
                    card.isMatched
                      ? 'border-3 sm:border-4 border-[#8BC34A] text-[#215b3b] opacity-80 scale-95'
                      : 'border-3 sm:border-4 border-[#eef7e9] text-[#215b3b]'
                  )}
                >
                  {card.type === 'image_hanzi' ? (
                    <div className="flex flex-col items-center justify-center h-full w-full">
                      {card.imageKey ? (
                        <img
                          src={resolveYctImageUrl(card.imageKey)}
                          alt={card.hanzi}
                          className="h-12 w-auto max-w-[80px] sm:h-14 rounded-lg object-contain mb-1 shadow-2xs"
                        />
                      ) : (
                        <span className="text-2xl sm:text-3xl mb-1">🀄</span>
                      )}
                      <span className="text-lg sm:text-2xl font-black text-gray-900 leading-tight">
                        {card.hanzi}
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-[#215b3b]">
                        {card.pinyin}
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full w-full p-1 sm:p-2">
                      <span className="text-[10px] sm:text-xs uppercase font-bold text-gray-400 tracking-wider mb-1">
                        Ý nghĩa
                      </span>
                      <span className="text-sm sm:text-base font-black text-[#11321e] leading-snug line-clamp-3">
                        {card.meaningVi}
                      </span>
                    </div>
                  )}

                  {card.isMatched && (
                    <div className="absolute top-1.5 right-1.5 bg-[#215b3b] text-white rounded-full p-1 shadow-xs">
                      <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Màn hình chiến thắng */}
      {isWon && (
        <div className="mt-8 bg-white border border-[#eaf3c5] rounded-3xl p-8 text-center shadow-md">
          <div className="w-16 h-16 bg-[#e5f5eb] text-[#215b3b] rounded-full flex items-center justify-center mx-auto mb-3 text-3xl">
            🏆
          </div>
          <h3 className="text-2xl font-black text-[#11321e] mb-1">Hoàn thành xuất sắc!</h3>
          <p className="text-gray-600 text-sm mb-6">
            Bạn đã hoàn thành trò chơi lật thẻ trong{' '}
            <span className="font-bold text-[#215b3b]">{moves} lượt</span>!
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={initGame}
              variant="secondary"
              className="border-[#eaf3c5] text-[#215b3b] font-bold py-3 px-6 rounded-2xl transition-transform active:scale-95"
            >
              <RotateCw className="w-4 h-4 mr-2" />
              Chơi lại
            </Button>
            {onFinish && (
              <Button
                onClick={onFinish}
                className="bg-[#215b3b] hover:bg-[#18452b] text-white font-bold py-3 px-6 rounded-2xl shadow-sm transition-transform active:scale-95"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Chơi Game Nối Từ
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
