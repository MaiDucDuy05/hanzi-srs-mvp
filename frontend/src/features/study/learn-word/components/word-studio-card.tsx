'use client';

import { useState, useEffect } from 'react';
import { Vocabulary } from '@/lib/api/types';
import { Volume2, Snail, ArrowRight, Sparkles, PenTool, RotateCcw } from 'lucide-react';
import { speakText } from '@/lib/utils/tts';
import { html } from 'pinyin-pro';
import { HanziWriterCanvas } from '@/features/games/components/hanzi-writer-canvas';
import { HanziWriterAnimation } from '@/features/games/components/hanzi-writer-animation';

interface WordStudioCardProps {
  vocabulary: Vocabulary;
  onNextWord: () => void;
  onStartChallenge?: () => void;
  hasNextWord: boolean;
}

export function WordStudioCard({
  vocabulary,
  onNextWord,
  onStartChallenge,
  hasNextWord,
}: WordStudioCardProps) {
  const [selectedCharIndex, setSelectedCharIndex] = useState(0);
  const [strokeMode, setStrokeMode] = useState<'animate' | 'canvas'>('animate');
  const [canvasKey, setCanvasKey] = useState(0);

  // Auto-play pronunciation once when word loads
  useEffect(() => {
    speakText(vocabulary.hanzi, 1);
  }, [vocabulary.hanzi]);

  const chars = Array.from(vocabulary.hanzi || '');
  const currentChar = chars[selectedCharIndex] || chars[0] || '';
  const hanziHtml = html(vocabulary.hanzi);

  const hasExample = Boolean(vocabulary.example);
  const exampleParts = vocabulary.example ? vocabulary.example.split('-') : [];
  const exampleZh = exampleParts[0]?.trim() || '';
  const exampleVi = exampleParts[1]?.trim() || '';

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col items-center">
      {/* 2-Column Responsive Layout */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Card: Vocab Information */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-gray-100 shadow-[0_10px_35px_-10px_rgba(0,0,0,0.08)] p-6 sm:p-8 flex flex-col justify-between relative">
          <div>
            {/* Top Badge */}
            <div className="flex items-center justify-between mb-4">
              {vocabulary.partOfSpeech ? (
                <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200/60 rounded-full text-xs font-bold uppercase tracking-wider">
                  {vocabulary.partOfSpeech}
                </span>
              ) : (
                <span className="text-xs text-gray-400 font-medium">Từ vựng</span>
              )}
            </div>

            {/* Hanzi & Meaning */}
            <div className="text-center py-2 sm:py-4">
              <div
                className="text-6xl sm:text-7xl md:text-8xl font-serif text-[#1a4a2b] mb-3 leading-tight tracking-wide [&>ruby]:gap-2 [&>ruby>rt]:text-lg sm:[&>ruby>rt]:text-xl [&>ruby>rt]:text-emerald-700/80 [&>ruby>rt]:font-sans [&>ruby>rt]:font-semibold"
                dangerouslySetInnerHTML={{ __html: hanziHtml }}
              />

              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-800 tracking-tight mb-4">
                {vocabulary.meaningVi}
              </h2>

              {/* Audio Controls */}
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => speakText(vocabulary.hanzi, 1)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1f5333] hover:bg-[#163f25] text-white rounded-full font-bold text-sm shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  title="Phát âm chuẩn (1.0x) - Phím tắt [A]"
                >
                  <Volume2 className="w-4 h-4" />
                  Nghe phát âm
                </button>
                <button
                  onClick={() => speakText(vocabulary.hanzi, 0.75)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-full font-semibold text-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  title="Phát âm tốc độ chậm (0.75x) - Phím tắt [S]"
                >
                  <Snail className="w-4 h-4 text-emerald-600" />
                  Chậm (0.75x)
                </button>
              </div>
            </div>
          </div>

          {/* Context Example */}
          <div className="mt-6 pt-5 border-t border-gray-100">
            {hasExample ? (
              <div className="bg-gray-50/80 border border-gray-100 rounded-2xl p-4 relative">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    Ví dụ minh họa
                  </span>
                  <button
                    onClick={() => speakText(exampleZh)}
                    className="p-1 rounded-full bg-white text-emerald-700 border border-gray-200 shadow-xs hover:bg-emerald-50 transition-colors cursor-pointer"
                    title="Nghe câu ví dụ"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div
                  className="text-base sm:text-lg font-medium text-gray-900 mb-1 leading-relaxed font-serif [&>ruby>rt]:text-xs [&>ruby>rt]:text-emerald-700"
                  dangerouslySetInnerHTML={{ __html: html(exampleZh) }}
                />
                {exampleVi && (
                  <p className="text-xs sm:text-sm text-gray-500 font-sans border-l-2 border-emerald-500 pl-2 mt-1">
                    {exampleVi}
                  </p>
                )}
              </div>
            ) : (
              <div className="bg-gray-50/60 border border-dashed border-gray-200 rounded-2xl p-3.5 text-center text-xs text-gray-400">
                Từ này chưa có câu ví dụ minh họa. Bạn có thể bấm <span className="font-semibold text-amber-700">&ldquo;Ghép từ&rdquo;</span> bên dưới để luyện nhớ chữ.
              </div>
            )}
          </div>
        </div>

        {/* Right Card: Dedicated Writing & Stroke Practice */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-gray-100 shadow-[0_10px_35px_-10px_rgba(0,0,0,0.08)] p-6 sm:p-8 flex flex-col items-center justify-between">
          <div className="w-full flex flex-col items-center">
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-emerald-50 rounded-lg text-emerald-800 border border-emerald-200/60">
                <PenTool className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-gray-800">Luyện viết chữ Hán</h3>
            </div>

            {/* Character Selector for multi-char words */}
            {chars.length > 1 && (
              <div className="flex gap-2 mb-3">
                {chars.map((char, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSelectedCharIndex(index);
                      setCanvasKey(k => k + 1);
                    }}
                    className={`w-10 h-10 rounded-xl font-serif text-xl flex items-center justify-center transition-all cursor-pointer ${
                      selectedCharIndex === index
                        ? 'bg-[#1f5333] text-white font-bold shadow-sm'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {char}
                  </button>
                ))}
              </div>
            )}

            {/* Mode Switch: Animate vs Canvas */}
            <div className="flex gap-1 bg-gray-100 p-1 rounded-xl text-xs font-semibold mb-3">
              <button
                onClick={() => setStrokeMode('animate')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  strokeMode === 'animate' ? 'bg-white text-emerald-900 shadow-xs' : 'text-gray-500'
                }`}
              >
                Xem nét mẫu
              </button>
              <button
                onClick={() => {
                  setStrokeMode('canvas');
                  setCanvasKey(k => k + 1);
                }}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  strokeMode === 'canvas' ? 'bg-white text-emerald-900 shadow-xs' : 'text-gray-500'
                }`}
              >
                Tự viết thử
              </button>
            </div>

            {/* Dedicated Writing Canvas (Traditional Tianzige grid) */}
            <div className="relative w-[210px] h-[210px] bg-[#fcfbf9] rounded-2xl border-2 border-[#e8e4d9] overflow-hidden flex items-center justify-center shadow-inner my-1">
              {/* Tianzige guidelines */}
              <div className="absolute inset-0 pointer-events-none opacity-40">
                <div className="absolute top-1/2 left-0 w-full border-t border-dashed border-gray-300" />
                <div className="absolute left-1/2 top-0 h-full border-l border-dashed border-gray-300" />
              </div>

              {strokeMode === 'animate' ? (
                <div className="relative w-[180px] h-[180px] flex items-center justify-center">
                  <HanziWriterAnimation char={currentChar} speed="normal" />
                </div>
              ) : (
                <div className="relative z-10 flex items-center justify-center">
                  <HanziWriterCanvas
                    key={`${currentChar}-${canvasKey}`}
                    char={currentChar}
                    size={180}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Action under canvas */}
          <div className="w-full flex justify-center mt-3">
            {strokeMode === 'canvas' ? (
              <button
                onClick={() => setCanvasKey(k => k + 1)}
                className="inline-flex items-center gap-1.5 px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md font-medium cursor-pointer transition-colors"
              >
                <RotateCcw className="w-3 h-3" /> Xóa viết lại
              </button>
            ) : (
              <span className="text-[11px] text-gray-400">Hoạt họa thứ tự từng nét chuẩn</span>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Action Controls */}
      <div className="w-full flex items-center justify-between gap-3 mt-6">
        {onStartChallenge ? (
          <button
            onClick={onStartChallenge}
            className="px-5 py-3 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-2xl font-bold text-sm transition-all flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-amber-600" />
            {hasExample ? 'Ghép câu' : 'Ghép từ'}
          </button>
        ) : (
          <div />
        )}

        <button
          onClick={onNextWord}
          className="px-8 py-3.5 bg-[#1f5333] hover:bg-[#163f25] text-white rounded-2xl font-bold text-base shadow-lg hover:shadow-xl transition-all flex items-center gap-2 active:scale-95 cursor-pointer ml-auto"
        >
          {hasNextWord ? 'Từ tiếp theo' : 'Hoàn thành bài học'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
