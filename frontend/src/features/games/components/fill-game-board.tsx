'use client';

import React, { useState, useEffect } from 'react';
import type { FillBlankQuestion } from '@/lib/api/types';
import { CheckCircle, XCircle } from 'lucide-react';
import type { ModeResult } from '@/features/practice/components/practice-models';

interface FillGameBoardProps {
  question: FillBlankQuestion;
  onAnswer: (answerText: string) => void;
}

export function FillGameBoard({ question, onAnswer }: FillGameBoardProps) {
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    setSelected(null);
  }, [question.questionId]);

  if (!question) return null;

  const handleSelect = (text: string) => {
    if (selected) return;
    setSelected(text);
    setTimeout(() => {
      onAnswer(text);
    }, 900);
  };

  // Render the prompt by replacing ______ with the blank or selected text
  const parts = question.prompt.split('______');

  return (
    <div className="flex-1 flex flex-col items-center justify-center w-full max-w-2xl mx-auto px-4 py-8 relative z-10">
      {/* Header */}
      <div className="w-full flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black text-[#215b3b] font-heading drop-shadow-sm">Điền từ</h1>
      </div>

      {/* Question card */}
      <div className="w-full bg-white rounded-3xl shadow-lg p-8 mb-8 text-center border border-gray-100">
        <p className="text-sm font-bold text-[#8BC34A] uppercase tracking-widest mb-4">Chọn từ đúng để điền vào chỗ trống</p>
        
        <div className="flex items-center justify-center flex-wrap gap-2 mb-6 text-3xl font-serif text-gray-800 leading-loose">
          {parts.map((part, i) => (
            <React.Fragment key={i}>
              {part}
              {i < parts.length - 1 && (
                <span className="px-4 text-3xl font-bold font-serif text-[#215b3b] border-b-2 border-dashed border-[#8bc34a] min-w-[3rem] text-center transition-all duration-300 inline-block mx-2">
                  {selected ? selected : ' '}
                </span>
              )}
            </React.Fragment>
          ))}
        </div>

        {question.translation && (
          <p className="text-lg text-gray-500 font-medium leading-relaxed">
            {question.translation}
          </p>
        )}
      </div>

      {/* Options */}
      <div className="w-full grid grid-cols-2 gap-4">
        {question.options.map((opt, i) => {
          const isSelected = selected === opt;

          let btnClass = 'bg-white border-2 border-gray-100 hover:border-[#8BC34A] hover:bg-[#f1f8ed] text-gray-700';
          if (isSelected) {
            btnClass = 'bg-[#8BC34A] border-[#8BC34A] text-white transform scale-105 shadow-md';
          } else if (selected && !isSelected) {
            btnClass = 'bg-gray-50 border-gray-100 text-gray-400 opacity-60';
          }

          return (
            <button
              key={`${opt}-${i}`}
              onClick={() => handleSelect(opt)}
              disabled={!!selected}
              className={`relative flex items-center justify-center p-6 rounded-2xl font-bold text-2xl font-serif transition-all duration-200 active:scale-95 ${btnClass}`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface FillResultsProps {
  result: ModeResult | null;
  fillBlankQuestions: FillBlankQuestion[];
  elapsed: number;
  onExit: () => void;
}

export function FillResults({ result, fillBlankQuestions, elapsed, onExit }: FillResultsProps) {
  const resultsData = (result?.answerData as any)?.results || [];

  return (
    <div className="flex-1 flex flex-col items-center w-full max-w-4xl mx-auto px-4 py-8 relative z-10">
      <h1 className="text-3xl font-black text-[#215b3b] mb-6 font-heading">Kết quả làm bài</h1>
      <div className="bg-white rounded-3xl shadow-sm p-6 w-full max-w-2xl mb-10 text-center border-4 border-[#8BC34A]">
        <p className="text-3xl font-bold mb-3 text-[#215b3b]">
          Điểm số: {result?.score ?? 0}/10
        </p>
        <p className="text-[#4a6b38] font-medium text-lg">
          Số câu đúng: {result?.correctCount ?? 0} / {(result?.correctCount ?? 0) + (result?.wrongCount ?? 0)}
        </p>
      </div>

      <div className="w-full max-w-3xl space-y-6">
        {fillBlankQuestions.map((q, idx) => {
          const qResult = resultsData.find((r: any) => r.questionId === q.questionId);
          const isCorrect = qResult?.isCorrect;
          const correctAns = qResult?.correctTokenId || '';
          
          return (
            <div key={q.questionId} className={`p-6 rounded-2xl border-2 shadow-sm ${isCorrect ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'}`}>
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-bold text-lg text-gray-800">Câu {idx + 1}</h3>
                <div className={`flex items-center gap-1 font-bold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                  {isCorrect ? <><CheckCircle className="w-5 h-5" /> Đúng</> : <><XCircle className="w-5 h-5" /> Sai</>}
                </div>
              </div>
              
              <p className="text-xl font-bold font-serif mb-3 text-gray-900 tracking-wider">
                {q.prompt.replace('______', `[ ${correctAns || '???'} ]`)}
              </p>
              
              {q.translation && <p className="text-gray-700 italic mb-2"><span className="font-semibold not-italic">Dịch:</span> {q.translation}</p>}
              {q.explanation && (
                <p className="text-sm text-gray-600 bg-white/50 p-3 rounded-lg border border-gray-200 mt-2">
                  <span className="font-semibold">Giải thích:</span> {q.explanation}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <button
        onClick={onExit}
        className="mt-10 px-10 py-4 bg-[#215b3b] text-white font-bold text-lg rounded-full shadow-lg hover:bg-[#1a4a2f] transition-all transform hover:-translate-y-1"
      >
        Trở về trang chủ
      </button>
    </div>
  );
}
