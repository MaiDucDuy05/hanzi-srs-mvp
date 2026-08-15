'use client';

import React, { useState, useEffect } from 'react';
import type { SentenceQuestion, SentenceToken } from '@/lib/api/types';
import { Volume2 } from 'lucide-react';

interface WriteSentenceBoardProps {
  questions: SentenceQuestion[];
  userAnswers: Record<string, string[]>;
  currentIndex: number;
  onUpdateAnswers: (tokenIds: string[]) => void;
  onPrev: () => void;
  onNext: () => void;
  onSubmit: () => void;
}

function parseTokens(input: string, tokens: SentenceToken[]): string[] {
  let str = input.replace(/\s/g, '');
  const remaining = [...tokens];
  const matchedIds: string[] = [];
  
  while (str.length > 0) {
    const match = remaining
      .map((t, i) => ({ t, i }))
      .sort((a, b) => b.t.text.length - a.t.text.length)
      .find(x => str.startsWith(x.t.text));
      
    if (match) {
      matchedIds.push(match.t.id);
      str = str.substring(match.t.text.length);
      remaining.splice(match.i, 1);
    } else {
      break;
    }
  }
  return matchedIds;
}

function speakText(text: string) {
  if ('speechSynthesis' in window) {
    const msg = new SpeechSynthesisUtterance(text);
    msg.lang = 'zh-CN';
    msg.rate = 0.85;
    window.speechSynthesis.speak(msg);
  }
}

export function WriteSentenceBoard({
  questions, userAnswers, currentIndex,
  onUpdateAnswers, onPrev, onNext, onSubmit,
}: WriteSentenceBoardProps) {
  const q = questions[currentIndex];
  
  const currentTokenIds = q ? (userAnswers[q.questionId] || []) : [];
  
  // Try to reconstruct the initial string from tokenIds (in case user goes back)
  const [inputValue, setInputValue] = useState('');
  
  useEffect(() => {
    if (q) {
      const tokens = currentTokenIds.map(id => q.tokens.find(t => t.id === id)?.text || '').join('');
      setInputValue(tokens);
    }
  }, [q?.questionId]);

  if (!q) return null;

  const isLast = currentIndex === questions.length - 1;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    const parsed = parseTokens(val, q.tokens);
    onUpdateAnswers(parsed);
  };

  const handleNext = () => {
    if (isLast) {
      onSubmit();
    } else {
      onNext();
    }
  };

  const fullChineseText = q.tokens.map(t => t.text).join('');

  return (
    <div className="flex-1 flex flex-col items-center justify-center w-full max-w-2xl mx-auto px-4 py-6 relative z-10 min-h-[500px]">

      {/* Header */}
      <div className="w-full flex justify-between items-center mb-6">
        <h1 className="text-3xl font-black text-[#215b3b] font-heading drop-shadow-sm">Viết câu</h1>
        <div className="bg-[#eef7e9] border-2 border-[#8BC34A] text-[#215b3b] px-5 py-2 rounded-full font-bold shadow-sm">
          Câu {currentIndex + 1} / {questions.length}
        </div>
      </div>

      {/* Main card */}
      <div className="w-full bg-[#f8f9fa] rounded-3xl shadow-sm border border-gray-200 p-6 md:p-8 flex flex-col mb-6">
        {q.translation && (
          <p className="text-2xl sm:text-3xl text-gray-800 font-bold leading-relaxed text-center mb-8">
            {q.translation}
          </p>
        )}

        <input
          type="text"
          value={inputValue}
          onChange={handleChange}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleNext();
          }}
          placeholder="Nhập tiếng Trung..."
          autoFocus
          className="w-full text-center text-3xl p-4 bg-transparent border-b-2 border-gray-300 focus:border-[#215b3b] outline-none transition-colors mb-8 font-sans"
        />

        <div className="flex items-center gap-3 w-full">
          <button
            onClick={handleNext}
            className={`flex-1 py-4 rounded-xl font-bold text-lg text-white transition-all shadow-md active:scale-95 ${
              inputValue.length > 0 
                ? 'bg-[#2b7149] hover:bg-[#215b3b]' 
                : 'bg-gray-400 hover:bg-gray-500'
            }`}
          >
            {isLast ? 'Hoàn thành 🎉' : 'Kiểm tra (Enter)'}
          </button>
          <button
            onClick={() => speakText(fullChineseText)}
            className="w-14 h-14 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-[#215b3b] transition-all shadow-sm active:scale-95 shrink-0"
            aria-label="Phát âm thanh"
          >
            <Volume2 className="w-7 h-7" />
          </button>
        </div>
      </div>

      {/* Navigation (Prev button) */}
      <div className="flex justify-start w-full">
        <button
          onClick={onPrev}
          disabled={currentIndex === 0}
          className={`px-8 py-3 rounded-full font-bold transition-colors ${currentIndex === 0 ? 'opacity-0 cursor-default' : 'bg-white text-gray-500 shadow-sm hover:bg-gray-50 border border-gray-200'}`}
        >
          Quay lại
        </button>
      </div>
    </div>
  );
}
