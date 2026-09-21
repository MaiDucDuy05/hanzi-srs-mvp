'use client';

import React, { useState, useEffect } from 'react';
import type { YctVocabulary } from '@/lib/api/endpoints/yct';
import { speakText } from '@/lib/utils/tts';
import { Sparkles, RotateCw, Volume2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/features/ui/components/button';
import { resolveYctImageUrl } from '@/lib/utils/yct-image';

interface YctMatchGameProps {
  vocabularies: YctVocabulary[];
  lessonTitle: string;
  onFinish?: () => void;
}

interface MatchItem {
  id: string;
  vocabId: string;
  hanzi: string;
  pinyin: string;
  meaningVi: string;
  imageKey: string | null;
}

export function YctMatchGame({ vocabularies, lessonTitle, onFinish }: YctMatchGameProps) {
  const [leftItems, setLeftItems] = useState<MatchItem[]>([]);
  const [rightItems, setRightItems] = useState<MatchItem[]>([]);
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);
  const [matchedIds, setMatchedIds] = useState<Set<string>>(new Set());
  const [wrongPair, setWrongPair] = useState<{ left: string; right: string } | null>(null);
  const [isWon, setIsWon] = useState(false);

  const initGame = () => {
    const pool = [...vocabularies].slice(0, 5).map((v) => ({
      id: v.id,
      vocabId: v.id,
      hanzi: v.hanzi,
      pinyin: v.pinyin,
      meaningVi: v.meaningVi,
      imageKey: v.imageKey,
    }));

    setLeftItems([...pool].sort(() => Math.random() - 0.5));
    setRightItems([...pool].sort(() => Math.random() - 0.5));
    setSelectedLeft(null);
    setSelectedRight(null);
    setMatchedIds(new Set());
    setWrongPair(null);
    setIsWon(false);
  };

  useEffect(() => {
    if (vocabularies.length > 0) {
      initGame();
    }
  }, [vocabularies]);

  const handleSelectLeft = (item: MatchItem) => {
    if (matchedIds.has(item.vocabId)) return;
    speakText(item.hanzi);
    setSelectedLeft(item.vocabId);

    if (selectedRight) {
      checkMatch(item.vocabId, selectedRight);
    }
  };

  const handleSelectRight = (item: MatchItem) => {
    if (matchedIds.has(item.vocabId)) return;
    setSelectedRight(item.vocabId);

    if (selectedLeft) {
      checkMatch(selectedLeft, item.vocabId);
    }
  };

  const checkMatch = (leftVocabId: string, rightVocabId: string) => {
    if (leftVocabId === rightVocabId) {
      const newMatched = new Set(matchedIds);
      newMatched.add(leftVocabId);
      setMatchedIds(newMatched);
      setSelectedLeft(null);
      setSelectedRight(null);

      if (newMatched.size === leftItems.length) {
        setIsWon(true);
      }
    } else {
      setWrongPair({ left: leftVocabId, right: rightVocabId });
      setTimeout(() => {
        setWrongPair(null);
        setSelectedLeft(null);
        setSelectedRight(null);
      }, 700);
    }
  };

  if (!vocabularies || vocabularies.length === 0) {
    return (
      <div className="text-center py-12 bg-[#f3f8d7]/40 rounded-3xl border-2 border-dashed border-[#eaf3c5]">
        <p className="text-base font-bold text-[#215b3b]">Bài học chưa có từ vựng để chơi nối từ.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header trạng thái */}
      <div className="flex justify-between items-center bg-white border border-[#eaf3c5] rounded-2xl p-4 mb-6 shadow-xs">
        <div>
          <h4 className="font-bold text-[#11321e] text-sm">Nối Từ & Ý Nghĩa</h4>
          <p className="text-xs text-gray-500">Chạm một thẻ chữ Hán và chạm nghĩa tương ứng để ghép đôi</p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-[#215b3b] bg-[#e5f5eb] border border-[#eaf3c5] px-3 py-1.5 rounded-full">
            Đã nối: {matchedIds.size} / {leftItems.length}
          </span>
          <Button
            variant="secondary"
            size="sm"
            onClick={initGame}
            className="rounded-xl border border-[#eaf3c5] hover:bg-[#e5f5eb] text-[#215b3b] font-bold"
          >
            <RotateCw className="w-4 h-4 mr-1" />
            Làm lại
          </Button>
        </div>
      </div>

      {/* Hai cột nối từ */}
      <div className="grid grid-cols-2 gap-4 select-none">
        {/* CỘT TRÁI: CHỮ HÁN + PINYIN + ẢNH */}
        <div className="space-y-3">
          <h5 className="text-center font-bold text-xs uppercase tracking-wider text-[#215b3b]">
            Chữ Hán & Hình ảnh
          </h5>
          {leftItems.map((item) => {
            const isMatched = matchedIds.has(item.vocabId);
            const isSelected = selectedLeft === item.vocabId;
            const isError = wrongPair?.left === item.vocabId;

            return (
              <div
                key={item.id}
                onClick={() => handleSelectLeft(item)}
                className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between shadow-xs ${
                  isMatched
                    ? 'bg-[#e5f5eb] border-[#215b3b] opacity-60 pointer-events-none'
                    : isError
                    ? 'bg-rose-100 border-rose-400 animate-shake'
                    : isSelected
                    ? 'bg-[#e5f5eb] border-[#215b3b] shadow-xs ring-2 ring-[#eaf3c5]'
                    : 'bg-white border-[#eaf3c5] hover:border-[#78993a] hover:bg-[#f3f8d7]/20'
                }`}
              >
                <div className="flex items-center gap-3">
                  {item.imageKey ? (
                    <img
                      src={resolveYctImageUrl(item.imageKey)}
                      alt={item.hanzi}
                      className="w-12 h-12 rounded-xl object-contain border border-[#eaf3c5] bg-gray-50/50 p-0.5"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-xl">
                      🀄
                    </div>
                  )}
                  <div>
                    <div className="text-xl font-black text-gray-900">{item.hanzi}</div>
                    <div className="text-xs font-bold text-[#215b3b]">{item.pinyin}</div>
                  </div>
                </div>

                {isMatched ? (
                  <CheckCircle2 className="w-5 h-5 text-[#215b3b]" />
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      speakText(item.hanzi);
                    }}
                    className="p-1.5 rounded-full hover:bg-[#e5f5eb] text-[#215b3b]"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* CỘT PHẢI: NGHĨA TIẾNG VIỆT */}
        <div className="space-y-3">
          <h5 className="text-center font-bold text-xs uppercase tracking-wider text-[#215b3b]">
            Ý nghĩa tiếng Việt
          </h5>
          {rightItems.map((item) => {
            const isMatched = matchedIds.has(item.vocabId);
            const isSelected = selectedRight === item.vocabId;
            const isError = wrongPair?.right === item.vocabId;

            return (
              <div
                key={item.id}
                onClick={() => handleSelectRight(item)}
                className={`min-h-[72px] p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between shadow-xs ${
                  isMatched
                    ? 'bg-[#e5f5eb] border-[#215b3b] opacity-60 pointer-events-none'
                    : isError
                    ? 'bg-rose-100 border-rose-400 animate-shake'
                    : isSelected
                    ? 'bg-[#e5f5eb] border-[#215b3b] shadow-xs ring-2 ring-[#eaf3c5]'
                    : 'bg-white border-[#eaf3c5] hover:border-[#78993a] hover:bg-[#f3f8d7]/20'
                }`}
              >
                <span className="font-extrabold text-[#11321e] text-base">
                  {item.meaningVi}
                </span>

                {isMatched && (
                  <CheckCircle2 className="w-5 h-5 text-[#215b3b] ml-2" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Màn hình hoàn thành */}
      {isWon && (
        <div className="mt-8 bg-white border border-[#eaf3c5] rounded-3xl p-8 text-center shadow-md">
          <div className="w-16 h-16 bg-[#e5f5eb] text-[#215b3b] rounded-full flex items-center justify-center mx-auto mb-3 text-3xl">
            🎯
          </div>
          <h3 className="text-2xl font-black text-[#11321e] mb-1">Nối từ chính xác!</h3>
          <p className="text-gray-600 text-sm mb-6">
            Bạn đã ghép đúng tất cả các từ trong bài học.
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
                Hoàn thành bài học
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
