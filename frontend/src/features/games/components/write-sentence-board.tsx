'use client';

import React, { useState } from 'react';
import { SentenceToken, SwapArrow } from './sentence-token';
import type { SentenceQuestion } from '@/lib/api/types';
import { Lightbulb } from 'lucide-react';

interface WriteSentenceBoardProps {
  questions: SentenceQuestion[];
  userAnswers: Record<string, string[]>;
  currentIndex: number;
  onSelectToken: (tokenId: string) => void;
  onDeselectToken: (tokenId: string) => void;
  onPrev: () => void;
  onNext: () => void;
  onSubmit: () => void;
}

export function WriteSentenceBoard({
  questions, userAnswers, currentIndex,
  onSelectToken, onDeselectToken, onPrev, onNext, onSubmit,
}: WriteSentenceBoardProps) {
  const q = questions[currentIndex];
  const [showHint, setShowHint] = useState(false);

  if (!q) return null;

  const currentAnswers = userAnswers[q.questionId] || [];
  const availableTokens = q.tokens.filter((t) => !currentAnswers.includes(t.id));
  const isLast = currentIndex === questions.length - 1;
  const isComplete = availableTokens.length === 0;

  return (
    <div className="flex-1 flex flex-col items-center justify-center w-full max-w-2xl mx-auto px-4 py-6 relative z-10 min-h-screen">

      {/* Header */}
      <div className="w-full flex justify-between items-center mb-6">
        <h1 className="text-3xl font-black text-[#215b3b] font-heading drop-shadow-sm">Viết câu</h1>
        <div className="bg-[#eef7e9] border-2 border-[#8BC34A] text-[#215b3b] px-5 py-2 rounded-full font-bold shadow-sm">
          Câu {currentIndex + 1} / {questions.length}
        </div>
      </div>

      {/* Prompt — Vietnamese meaning as the question */}
      <div className="w-full bg-white rounded-3xl shadow-lg p-8 mb-6 text-center border border-gray-100">
        <p className="text-sm font-bold text-[#8BC34A] uppercase tracking-widest mb-3">Dịch sang tiếng Trung</p>
        {q.translation && (
          <p className="text-2xl sm:text-3xl text-gray-800 font-bold leading-relaxed">
            &quot;{q.translation}&quot;
          </p>
        )}
        {q.prompt && (
          <p className="text-gray-500 mt-2 font-medium">{q.prompt}</p>
        )}
      </div>

      {/* Hint toggle */}
      <button
        onClick={() => setShowHint((h) => !h)}
        className="mb-4 flex items-center gap-2 text-[#215b3b] font-medium hover:text-[#4a6b38] transition-colors"
      >
        <Lightbulb className="w-5 h-5" />
        {showHint ? 'Ẩn gợi ý Pinyin' : 'Xem gợi ý Pinyin'}
      </button>

      {/* Drop zone */}
      <div className="w-full min-h-[120px] bg-white rounded-3xl border-4 border-dashed border-[#8BC34A] p-5 flex flex-wrap gap-3 items-center justify-center mb-6 transition-all shadow-inner">
        {currentAnswers.length === 0 && (
          <span className="text-gray-400 font-medium text-center">Chọn các từ bên dưới để ghép câu</span>
        )}
        {currentAnswers.map((tokenId) => {
          const token = q.tokens.find((t) => t.id === tokenId);
          if (!token) return null;
          return (
            <div key={token.id} className="flex flex-col items-center">
              {showHint && <span className="text-xs text-gray-400 mb-0.5">{(token as any).pinyin || '—'}</span>}
              <SentenceToken text={token.text} selected onClick={() => onDeselectToken(token.id)} />
            </div>
          );
        })}
      </div>

      {/* Token bank */}
      <div className="flex flex-wrap gap-3 items-center justify-center w-full min-h-[80px] mb-8">
        {availableTokens.map((token) => (
          <div key={token.id} className="flex flex-col items-center">
            {showHint && <span className="text-xs text-gray-400 mb-0.5">{(token as any).pinyin || '—'}</span>}
            <SentenceToken text={token.text} onClick={() => onSelectToken(token.id)} />
          </div>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex justify-between w-full">
        <button
          onClick={onPrev}
          disabled={currentIndex === 0}
          className={`px-8 py-3 rounded-full font-bold transition-colors ${currentIndex === 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-[#215b3b] shadow-md hover:bg-gray-50 border-2 border-[#eef7e9]'}`}
        >
          Câu trước
        </button>
        <button
          onClick={isLast && isComplete ? onSubmit : onNext}
          className={`px-10 py-3 rounded-full font-bold shadow-lg transition-all ${isComplete && isLast ? 'bg-[#215b3b] text-white hover:bg-[#1a4a2f] animate-bounce ring-4 ring-[#aadd4a]/30' : 'bg-white text-[#215b3b] hover:bg-gray-50 border-2 border-[#eef7e9]'}`}
        >
          {isLast && isComplete ? 'Nộp bài 🎉' : 'Câu tiếp theo'}
        </button>
      </div>
    </div>
  );
}
