'use client';

import React, { useState, useEffect } from 'react';
import type { YctVocabulary } from '@/lib/api/endpoints/yct';
import { speakText } from '@/lib/utils/tts';
import { resolveYctImageUrl } from '@/lib/utils/yct-image';
import { HanziWriterCanvas } from '@/features/games/components/hanzi-writer-canvas';
import { HanziWriterAnimation } from '@/features/games/components/hanzi-writer-animation';
import {
  PenTool,
  Volume2,
  RotateCcw,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Check,
} from 'lucide-react';

interface YctWritingGameProps {
  vocabularies: YctVocabulary[];
  lessonTitle: string;
  onFinish?: () => void;
}

export function YctWritingGame({
  vocabularies,
  lessonTitle,
  onFinish,
}: YctWritingGameProps) {
  // Filter vocabularies that have hanzi characters
  const validVocabs = vocabularies.filter((v) => v.hanzi && v.hanzi.trim().length > 0);

  const [currentVocabIndex, setCurrentVocabIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [completedCharsMap, setCompletedCharsMap] = useState<Record<string, boolean>>({});
  const [canvasKey, setCanvasKey] = useState(0);
  const [animSpeed, setAnimSpeed] = useState<'slow' | 'normal' | 'fast'>('normal');
  const [isCompletedAll, setIsCompletedAll] = useState(false);

  const currentVocab = validVocabs[currentVocabIndex];
  const chars = currentVocab ? Array.from(currentVocab.hanzi) : [];
  const currentChar = chars[currentCharIndex] || '';

  // Unique key for tracking character completion across words
  const getCharKey = (vocabIdx: number, charIdx: number) => `${vocabIdx}_${charIdx}`;

  const isCurrentCharCompleted = completedCharsMap[getCharKey(currentVocabIndex, currentCharIndex)];

  const isCurrentWordCompleted =
    chars.length > 0 &&
    chars.every((_, cIdx) => completedCharsMap[getCharKey(currentVocabIndex, cIdx)]);

  const completedWordsCount = validVocabs.filter((v, vIdx) => {
    const vChars = Array.from(v.hanzi);
    return vChars.length > 0 && vChars.every((_, cIdx) => completedCharsMap[getCharKey(vIdx, cIdx)]);
  }).length;

  // Auto-switch character or trigger completion
  const handleCharComplete = () => {
    const key = getCharKey(currentVocabIndex, currentCharIndex);
    setCompletedCharsMap((prev) => ({ ...prev, [key]: true }));

    // If there is next character in the same word, advance after a short delay
    if (currentCharIndex < chars.length - 1) {
      setTimeout(() => {
        setCurrentCharIndex((prev) => prev + 1);
        setCanvasKey((k) => k + 1);
      }, 500);
    } else {
      // Check if all words are completed
      const allWordsDone = validVocabs.every((v, vIdx) => {
        const vChars = Array.from(v.hanzi);
        return vChars.every((_, cIdx) => {
          if (vIdx === currentVocabIndex && cIdx === currentCharIndex) return true;
          return !!completedCharsMap[getCharKey(vIdx, cIdx)];
        });
      });

      if (allWordsDone) {
        setTimeout(() => setIsCompletedAll(true), 600);
      }
    }
  };

  const handleResetCanvas = () => {
    setCanvasKey((k) => k + 1);
  };

  const handleSelectChar = (index: number) => {
    setCurrentCharIndex(index);
    setCanvasKey((k) => k + 1);
  };

  const handleNextWord = () => {
    if (currentVocabIndex < validVocabs.length - 1) {
      setCurrentVocabIndex((prev) => prev + 1);
      setCurrentCharIndex(0);
      setCanvasKey((k) => k + 1);
    } else {
      setIsCompletedAll(true);
    }
  };

  const handlePrevWord = () => {
    if (currentVocabIndex > 0) {
      setCurrentVocabIndex((prev) => prev - 1);
      setCurrentCharIndex(0);
      setCanvasKey((k) => k + 1);
    }
  };

  const handlePlayAudio = (text: string) => {
    speakText(text);
  };

  if (!validVocabs || validVocabs.length === 0) {
    return (
      <div className="text-center py-12 bg-[#f3f8d7]/40 rounded-3xl border-2 border-dashed border-[#eaf3c5]">
        <p className="text-base font-bold text-[#215b3b]">Bài học này chưa có từ vựng nào để luyện viết.</p>
      </div>
    );
  }

  // Màn hình hoàn thành
  if (isCompletedAll) {
    return (
      <div className="py-12 px-4 text-center max-w-lg mx-auto animate-in zoom-in-95 duration-500">
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-tr from-amber-400 to-amber-200 flex items-center justify-center shadow-lg shadow-amber-300/30">
          <Sparkles className="w-12 h-12 text-amber-900 animate-spin-slow" />
        </div>

        <h3 className="text-3xl font-black text-[#11321e] mb-2 font-heading">
          Bé Viết Rất Đẹp!
        </h3>
        <p className="text-gray-600 mb-6 text-sm">
          Bé đã hoàn thành phần luyện viết nét chữ Hán cho toàn bộ từ vựng trong bài <span className="font-bold text-[#215b3b]">"{lessonTitle}"</span>.
        </p>

        <div className="bg-[#f3f8d7]/50 rounded-2xl p-4 mb-6 border border-[#eaf3c5] flex justify-around">
          <div>
            <span className="text-xs text-gray-500 font-bold block">Tổng số từ</span>
            <span className="text-2xl font-black text-[#215b3b]">{validVocabs.length}</span>
          </div>
          <div>
            <span className="text-xs text-gray-500 font-bold block">Số từ hoàn thành</span>
            <span className="text-2xl font-black text-[#8BC34A]">{completedWordsCount}</span>
          </div>
        </div>

        <div className="space-y-3">
          {onFinish && (
            <button
              onClick={onFinish}
              className="w-full flex items-center justify-center gap-2 bg-[#215b3b] hover:bg-[#18452b] text-white font-bold py-3.5 px-6 rounded-2xl shadow-md transition-all active:scale-95"
            >
              <span>Chuyển sang phần tiếp theo</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => {
              setIsCompletedAll(false);
              setCurrentVocabIndex(0);
              setCurrentCharIndex(0);
              setCompletedCharsMap({});
              setCanvasKey((k) => k + 1);
            }}
            className="w-full py-3 px-6 rounded-2xl font-bold text-gray-600 hover:bg-gray-100 transition-colors text-sm"
          >
            Luyện viết lại từ đầu
          </button>
        </div>
      </div>
    );
  }

  const imageUrl = resolveYctImageUrl(currentVocab.imageKey);

  return (
    <div className="flex flex-col items-center w-full max-w-3xl mx-auto">
      {/* Thanh tiến độ học */}
      <div className="w-full flex items-center justify-between mb-4 pb-3 border-b border-[#eaf3c5]">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-[#e5f5eb] text-[#215b3b]">
            <PenTool className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-[#11321e]">
              Luyện Viết Nét Chữ Hán
            </h2>
            <p className="text-xs text-gray-500">
              Tập viết từng nét chữ theo thứ tự chuẩn
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs font-bold text-gray-500 block">Tiến độ</span>
          <span className="text-sm font-black text-[#215b3b]">
            Từ {currentVocabIndex + 1}/{validVocabs.length}
          </span>
        </div>
      </div>

      {/* Danh sách các từ ngang (Mini navigation pills) */}
      <div className="w-full flex items-center gap-2 overflow-x-auto pb-3 mb-4 custom-scrollbar">
        {validVocabs.map((vocab, vIdx) => {
          const isDone = Array.from(vocab.hanzi).every((_, cIdx) =>
            completedCharsMap[getCharKey(vIdx, cIdx)]
          );
          const isCurrent = vIdx === currentVocabIndex;

          return (
            <button
              key={vocab.id || vIdx}
              onClick={() => {
                setCurrentVocabIndex(vIdx);
                setCurrentCharIndex(0);
                setCanvasKey((k) => k + 1);
              }}
              className={`shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                isCurrent
                  ? 'bg-[#215b3b] text-white shadow-sm scale-105'
                  : isDone
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  : 'bg-white text-gray-600 border border-[#eaf3c5] hover:bg-[#f3f8d7]/40'
              }`}
            >
              <span>{vocab.hanzi}</span>
              {isDone && <Check className="w-3 h-3 text-emerald-700" />}
            </button>
          );
        })}
      </div>

      {/* Khu vực thông tin từ vựng hiện tại */}
      <div className="w-full bg-[#f3f8d7]/30 border border-[#eaf3c5] rounded-2xl p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {imageUrl && (
            <img
              src={imageUrl}
              alt={currentVocab.hanzi}
              className="w-14 h-14 rounded-xl object-cover border border-[#eaf3c5] shadow-2xs shrink-0"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-black text-[#11321e]">
                {currentVocab.hanzi}
              </span>
              <button
                onClick={() => handlePlayAudio(currentVocab.hanzi)}
                className="p-1.5 rounded-lg bg-white border border-[#eaf3c5] text-[#215b3b] hover:bg-[#e5f5eb] transition-colors shadow-2xs"
                title="Phát âm"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs sm:text-sm font-bold text-amber-700">
              {currentVocab.pinyin}
            </p>
            <p className="text-xs text-gray-600">{currentVocab.meaningVi}</p>
          </div>
        </div>

        {/* Nút chọn ký tự trong từ (nếu từ có nhiều hơn 1 chữ) */}
        {chars.length > 1 && (
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-[#eaf3c5]">
            <span className="text-xs font-semibold text-gray-500">Chọn chữ:</span>
            {chars.map((char, cIdx) => {
              const isCharDone = completedCharsMap[getCharKey(currentVocabIndex, cIdx)];
              const isSelected = cIdx === currentCharIndex;

              return (
                <button
                  key={cIdx}
                  onClick={() => handleSelectChar(cIdx)}
                  className={`w-9 h-9 rounded-lg font-serif text-lg font-bold flex items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-[#215b3b] text-white shadow-xs scale-105'
                      : isCharDone
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {char}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Workspace: Bảng viết Tian Zi Ge (Trái) & Hoạt họa mẫu (Phải) */}
      <div className="flex flex-col md:flex-row gap-6 items-center md:items-start justify-center w-full mb-6">
        {/* Khung viết chữ của bé */}
        <div className="flex flex-col items-center">
          <div className="text-xs font-bold text-gray-500 mb-2 flex items-center gap-1">
            <span>Bảng Tập Viết Ô Điền (Tian Zi Ge)</span>
          </div>

          <div className="relative bg-white border-2 border-[#215b3b] rounded-3xl w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] shadow-sm flex items-center justify-center overflow-hidden">
            {/* Đường nét ô điền */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/2 left-0 w-full border-t border-dashed border-[#d0eedb]" />
              <div className="absolute left-1/2 top-0 h-full border-l border-dashed border-[#d0eedb]" />
            </div>

            {/* Canvas viết chữ */}
            <div className="relative z-10">
              {currentChar && !isCurrentCharCompleted ? (
                <HanziWriterCanvas
                  key={`${currentChar}-${canvasKey}`}
                  char={currentChar}
                  size={260}
                  onComplete={handleCharComplete}
                />
              ) : (
                <div className="flex flex-col items-center justify-center animate-in zoom-in-75 duration-300">
                  <span className="text-8xl font-serif text-[#215b3b] font-bold">
                    {currentChar}
                  </span>
                  <div className="mt-2 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Đã viết đúng!</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Công cụ hỗ trợ viết */}
          <div className="flex gap-2 mt-3 w-full max-w-[320px]">
            <button
              onClick={handleResetCanvas}
              disabled={isCurrentCharCompleted}
              className="flex-1 py-2 px-3 text-xs bg-white border border-[#eaf3c5] rounded-xl font-bold text-gray-700 hover:bg-[#e5f5eb] hover:text-[#215b3b] transition-all shadow-2xs flex items-center justify-center gap-1.5 disabled:opacity-40"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Viết lại nét</span>
            </button>
          </div>
        </div>

        {/* Khung xem hoạt họa mẫu chuẩn */}
        <div className="bg-[#fcfdf6] border border-[#eaf3c5] p-5 rounded-3xl shadow-2xs w-full max-w-[280px] flex flex-col items-center">
          <div className="text-xs font-bold text-gray-500 mb-3 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#8BC34A] animate-pulse"></span>
            <span>Mẫu nét viết chuẩn</span>
          </div>

          <div className="relative bg-white border border-[#eaf3c5] rounded-2xl w-[160px] h-[160px] shadow-inner flex items-center justify-center overflow-hidden mb-4">
            <div className="absolute inset-0 pointer-events-none opacity-60">
              <div className="absolute top-1/2 left-0 w-full border-t border-dashed border-gray-200" />
              <div className="absolute left-1/2 top-0 h-full border-l border-dashed border-gray-200" />
            </div>

            {currentChar && (
              <HanziWriterAnimation
                key={`${currentChar}-${animSpeed}`}
                char={currentChar}
                speed={animSpeed}
                size={140}
              />
            )}
          </div>

          {/* Điều chỉnh tốc độ animation */}
          <div className="flex gap-1.5 w-full">
            {(['slow', 'normal', 'fast'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setAnimSpeed(s)}
                className={`flex-1 py-1 text-[11px] font-bold rounded-lg border transition-all ${
                  animSpeed === s
                    ? 'bg-[#215b3b] text-white border-[#215b3b]'
                    : 'bg-white text-gray-600 border-[#eaf3c5] hover:bg-[#e5f5eb]'
                }`}
              >
                {s === 'slow' ? 'Chậm' : s === 'normal' ? 'Vừa' : 'Nhanh'}
              </button>
            ))}
          </div>

          <div className="mt-4 text-[11px] text-gray-500 text-center leading-relaxed">
            Quan sát nét bút đỏ chạy trên khung để viết theo đúng thứ tự từ trên xuống dưới, từ trái sang phải nhé!
          </div>
        </div>
      </div>

      {/* Điều hướng chuyển từ */}
      <div className="w-full flex items-center justify-between gap-3 pt-3 border-t border-[#eaf3c5]">
        <button
          onClick={handlePrevWord}
          disabled={currentVocabIndex === 0}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold border border-[#eaf3c5] bg-white text-gray-700 hover:bg-[#e5f5eb] hover:text-[#215b3b] transition-all disabled:opacity-40"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Từ trước</span>
        </button>

        <button
          onClick={handleNextWord}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#215b3b] hover:bg-[#18452b] text-white transition-all shadow-sm active:scale-95"
        >
          <span>{currentVocabIndex < validVocabs.length - 1 ? 'Từ tiếp theo' : 'Hoàn thành viết'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
