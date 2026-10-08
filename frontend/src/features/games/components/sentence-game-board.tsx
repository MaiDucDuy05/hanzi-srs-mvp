'use client';

import React from 'react';
import { SelectedGameToken, BankGameToken } from './sentence-token';
import { CheckCircle, XCircle, Info } from 'lucide-react';
import type { ModeResult } from '@/features/practice/components/practice-models';
import type { SentenceQuestion } from '@/lib/api/types';

interface SentenceResultsProps {
  engine: {
    result: ModeResult | null;
    sentenceQuestions: SentenceQuestion[];
    elapsed: number;
  };
  onExit: () => void;
}

interface SentenceQuestionResult {
  questionId: string;
  isCorrect?: boolean;
  correctOrder?: string[];
}

export function SentenceResults({ engine, onExit }: SentenceResultsProps) {
  const resultsData =
    ((engine.result?.answerData as Record<string, unknown>)?.results as SentenceQuestionResult[] | undefined) || [];

  return (
    <div className="flex-1 flex flex-col items-center w-full max-w-4xl mx-auto px-4 py-8 relative z-10">
      <h1 className="text-3xl font-black text-[#215b3b] mb-6 font-heading">Kết quả làm bài</h1>
      <div className="bg-white rounded-3xl shadow-sm p-6 w-full max-w-2xl mb-10 text-center border-4 border-[#8BC34A]">
        <p className="text-3xl font-bold mb-3 text-[#215b3b]">
          Điểm số: {engine.result?.score ?? 0}/10
        </p>
        <p className="text-[#4a6b38] font-medium text-lg">
          Số câu đúng: {engine.result?.correctCount ?? 0} / {(engine.result?.correctCount ?? 0) + (engine.result?.wrongCount ?? 0)}
        </p>
      </div>

      <div className="w-full max-w-3xl space-y-6">
        {engine.sentenceQuestions.map((q, idx) => {
          const qResult = resultsData.find((r) => r.questionId === q.questionId);
          const isCorrect = qResult?.isCorrect;
          const correctOrderIds = qResult?.correctOrder || [];
          const correctSentence = correctOrderIds.map((id: string) => q.tokens.find((t) => t.id === id)?.text).join('');

          return (
            <div key={q.questionId} className={`p-6 rounded-2xl border-2 shadow-sm ${isCorrect ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'}`}>
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-bold text-lg text-gray-800">Câu {idx + 1}</h3>
                <div className={`flex items-center gap-1 font-bold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                  {isCorrect ? <><CheckCircle className="w-5 h-5" /> Đúng</> : <><XCircle className="w-5 h-5" /> Sai</>}
                </div>
              </div>
              <p className="text-2xl font-bold font-serif mb-3 text-gray-900 tracking-wider" style={{ fontFamily: '"Ma Shan Zheng", "KaiTi", sans-serif' }}>
                {correctSentence || 'Không có dữ liệu đáp án'}
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

interface SentenceGameBoardProps {
  questions: SentenceQuestion[];
  userAnswers: Record<string, string[]>;
  currentIndex: number;
  onSelectToken: (tokenId: string) => void;
  onDeselectToken: (tokenId: string) => void;
  onSwapLeft: (index: number) => void;
  onSwapRight: (index: number) => void;
  onPrev: () => void;
  onNext: () => void;
  onSubmit: () => void;
}

export function SentenceGameBoard({
  questions, userAnswers, currentIndex,
  onSelectToken, onDeselectToken, onSwapLeft, onSwapRight, onPrev, onNext,
}: SentenceGameBoardProps) {
  const q = questions[currentIndex];
  if (!q) return null;

  const currentAnswers = userAnswers[q.questionId] || [];
  const availableTokens = q.tokens.filter(t => !currentAnswers.includes(t.id));
  const isLast = currentIndex === questions.length - 1;
  const isComplete = availableTokens.length === 0;

  return (
    <div className="flex-1 flex flex-col items-center justify-start sm:justify-center w-full max-w-4xl mx-auto px-3 sm:px-6 py-2 sm:py-4 relative z-10 min-h-0">

      {/* Tiêu đề & Tiến độ */}
      <div className="w-full flex justify-between items-center mb-3 sm:mb-4 max-w-2xl">
        <h1 className="text-2xl sm:text-3xl font-black text-[#215b3b] font-heading drop-shadow-2xs">
          Sentence Forest
        </h1>
        <div className="bg-[#eef7e9] border-2 border-[#8BC34A] text-[#215b3b] px-4 py-1.5 rounded-full font-bold text-sm sm:text-base shadow-2xs">
          Câu {currentIndex + 1} / {questions.length}
        </div>
      </div>

      {q.prompt && (
        <p className="text-sm sm:text-base text-gray-600 mb-1 font-medium text-center">
          {q.prompt}
        </p>
      )}

      {q.translation && (
        <p className={`text-lg sm:text-2xl text-[#4a6b38] ${q.explanation ? 'mb-2 sm:mb-3' : 'mb-3 sm:mb-5'} font-semibold text-center italic drop-shadow-2xs`}>
          &quot;{q.translation}&quot;
        </p>
      )}

      {q.explanation && (
        <details className="mb-3 sm:mb-4 group w-full max-w-2xl bg-white/80 backdrop-blur-xs rounded-2xl shadow-2xs border border-gray-100 overflow-hidden">
          <summary className="flex items-center gap-2 cursor-pointer p-3 sm:p-3.5 text-[#215b3b] font-medium text-xs sm:text-sm hover:bg-gray-50/50 transition-colors list-none">
            <Info className="w-4 h-4 text-[#8BC34A]" />
            <span>Gợi ý / Giải thích</span>
          </summary>
          <div className="p-3 sm:p-4 pt-0 text-gray-600 border-t border-gray-100 mt-1 text-xs sm:text-sm">
            {q.explanation}
          </div>
        </details>
      )}

      {/* Vùng ghép từ — Drop Zone (ngăn flexbox đè bẹp, giới hạn max-h có cuộn) */}
      <div className="w-full max-w-2xl min-h-[130px] max-h-[220px] overflow-y-auto bg-white/95 backdrop-blur-xs rounded-3xl border-3 border-dashed border-[#8BC34A] p-4 sm:p-5 flex flex-wrap gap-2.5 sm:gap-3 items-center justify-center mb-3 sm:mb-5 transition-all shadow-inner relative flex-shrink-0">
        {currentAnswers.length === 0 && (
          <span className="text-gray-400 font-medium text-sm sm:text-base text-center select-none">
            Bấm chọn các từ bên dưới để ghép thành câu
          </span>
        )}
        {currentAnswers.map((tokenId, idx) => {
          const token = q.tokens.find(t => t.id === tokenId);
          if (!token) return null;
          return (
            <SelectedGameToken
              key={token.id}
              token={token}
              index={idx}
              total={currentAnswers.length}
              onSwapLeft={() => onSwapLeft(idx)}
              onSwapRight={() => onSwapRight(idx)}
              onDeselect={() => onDeselectToken(token.id)}
            />
          );
        })}
      </div>

      {/* Ngân hàng từ — Token Bank */}
      <div className="flex flex-wrap gap-2.5 sm:gap-3 items-center justify-center max-w-2xl min-h-[50px] max-h-[170px] overflow-y-auto p-1 mb-3 sm:mb-5">
        {availableTokens.length === 0 ? (
          <span className="text-xs sm:text-sm font-semibold text-[#5E7F26] bg-[#eef7e9] px-4 py-1.5 rounded-full shadow-2xs select-none">
            ✓ Đã xếp đủ từ — bấm vào từ để bỏ chọn hoặc nộp bài
          </span>
        ) : (
          availableTokens.map(token => (
            <BankGameToken
              key={token.id}
              token={token}
              onClick={() => onSelectToken(token.id)}
            />
          ))
        )}
      </div>

      {/* Thanh điều hướng */}
      <div className="w-full max-w-2xl flex items-center justify-between mt-auto pt-2 pb-2">
        <button
          onClick={onPrev}
          disabled={currentIndex === 0}
          className={`px-6 sm:px-8 py-2.5 sm:py-3 rounded-full font-bold text-sm sm:text-base transition-colors ${
            currentIndex === 0
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-50'
              : 'bg-white text-[#215b3b] shadow-md hover:bg-gray-50 border-2 border-[#eef7e9]'
          }`}
        >
          Câu trước
        </button>
        <button
          onClick={onNext}
          className={`px-8 sm:px-10 py-2.5 sm:py-3 rounded-full font-bold text-sm sm:text-base shadow-lg transition-all ${
            isComplete && isLast
              ? 'bg-[#215b3b] text-white hover:bg-[#1a4a2f] ring-4 ring-[#8BC34A]/30 scale-102'
              : isComplete
              ? 'bg-[#8BC34A] text-white hover:bg-[#7cb342] shadow-md'
              : 'bg-white text-[#215b3b] hover:bg-gray-50 border-2 border-[#eef7e9]'
          }`}
        >
          {isLast ? 'Nộp bài' : 'Câu tiếp theo'}
        </button>
      </div>
    </div>
  );
}
