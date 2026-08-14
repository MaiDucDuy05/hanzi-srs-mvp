'use client';

import React from 'react';
import { SentenceToken, SwapArrow } from './sentence-token';
import { CheckCircle, XCircle } from 'lucide-react';
import type { ModeResult, QuestionItem } from '@/features/practice/components/practice-models';
import type { SentenceQuestion } from '@/lib/api/types';

interface SentenceResultsProps {
  engine: {
    result: ModeResult | null;
    sentenceQuestions: SentenceQuestion[];
    elapsed: number;
  };
  onExit: () => void;
}

export function SentenceResults({ engine, onExit }: SentenceResultsProps) {
  const resultsData = (engine.result?.answerData as any)?.results || [];

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
          const qResult = resultsData.find((r: any) => r.questionId === q.questionId);
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
  onSelectToken, onDeselectToken, onSwapLeft, onSwapRight, onPrev, onNext, onSubmit,
}: SentenceGameBoardProps) {
  const q = questions[currentIndex];
  if (!q) return null;

  const currentAnswers = userAnswers[q.questionId] || [];
  const availableTokens = q.tokens.filter(t => !currentAnswers.includes(t.id));
  const isLast = currentIndex === questions.length - 1;
  const isComplete = availableTokens.length === 0;

  return (
    <div className="flex-1 flex flex-col items-center justify-center w-full max-w-5xl mx-auto px-4 py-6 sm:py-8 relative z-10 h-full min-h-screen">

      {/* Header */}
      <div className="w-full flex justify-between items-center mb-8 max-w-2xl">
        <h1 className="text-3xl font-black text-[#215b3b] font-heading drop-shadow-sm">Sentence Forest</h1>
        <div className="bg-[#eef7e9] border-2 border-[#8BC34A] text-[#215b3b] px-5 py-2 rounded-full font-bold shadow-sm">
          Câu {currentIndex + 1} / {questions.length}
        </div>
      </div>

      {/* Drop Zone */}
      <div className="w-full max-w-2xl min-h-[160px] bg-white rounded-3xl border-4 border-dashed border-[#8BC34A] p-6 flex flex-wrap gap-4 items-center justify-center mb-12 transition-all shadow-inner relative">
        {currentAnswers.length === 0 && (
          <span className="text-gray-400 font-medium text-lg">Bấm chọn các từ bên dưới để ghép thành câu</span>
        )}
        {currentAnswers.map((tokenId, idx) => {
          const token = q.tokens.find(t => t.id === tokenId);
          if (!token) return null;
          return (
            <div key={token.id} className="flex items-center gap-1">
              {idx > 0 && <SwapArrow direction="left" onClick={(e) => { e.stopPropagation(); onSwapLeft(idx); }} visible={currentAnswers.length > 1} />}
              <SentenceToken text={token.text} selected onClick={() => onDeselectToken(token.id)} />
              {idx < currentAnswers.length - 1 && <SwapArrow direction="right" onClick={(e) => { e.stopPropagation(); onSwapRight(idx); }} visible={currentAnswers.length > 1} />}
            </div>
          );
        })}
      </div>

      {/* Token Bank */}
      <div className="flex flex-wrap gap-4 items-center justify-center max-w-2xl min-h-[80px]">
        {availableTokens.map(token => (
          <SentenceToken key={token.id} text={token.text} onClick={() => onSelectToken(token.id)} />
        ))}
      </div>

      {/* Navigation */}
      <div className="mt-16 h-16 flex items-center justify-center w-full max-w-2xl">
        <div className="flex justify-between w-full">
          <button
            onClick={onPrev}
            disabled={currentIndex === 0}
            className={`px-8 py-3 rounded-full font-bold transition-colors ${currentIndex === 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-50' : 'bg-white text-[#215b3b] shadow-md hover:bg-gray-50 border-2 border-[#eef7e9]'}`}
          >
            Câu trước
          </button>
          <button
            onClick={onNext}
            className={`px-10 py-3 rounded-full font-bold shadow-lg transition-all ${isComplete && isLast ? 'bg-[#215b3b] text-white hover:bg-[#1a4a2f] animate-bounce ring-4 ring-[#aadd4a]/30' : 'bg-white text-[#215b3b] hover:bg-gray-50 border-2 border-[#eef7e9]'}`}
          >
            {isLast ? 'Nộp bài' : 'Câu tiếp theo'}
          </button>
        </div>
      </div>
    </div>
  );
}
