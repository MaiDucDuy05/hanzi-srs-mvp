'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { usePracticeEngine } from '@/features/practice/components/practice-engine';
import { activityKey } from '@/lib/utils/constants';
import type { SourceType } from '@/lib/api/types';
import { BambooBackground } from '../components/game-decorations';
import { FillGameBoard, FillResults } from '../components/fill-game-board';

interface FillGameFeatureProps {
  sourceId: string;
  sourceType: SourceType;
}

export function FillGameFeature({ sourceId, sourceType }: FillGameFeatureProps) {
  const router = useRouter();
  
  const {
    status,
    error,
    limit,
    fillBlankQuestions,
    fillBlankAnswers,
    setFillBlankAnswers,
    result,
    elapsed,
    handleComplete,
  } = usePracticeEngine({
    practiceType: 'FILL_BLANK',
    sourceType,
    sourceId,
    sessionKey: `fill-blank-${sourceId}`,
  });

  const [currentIndex, setCurrentIndex] = useState(0);

  const handleAnswer = useCallback((questionId: string, tokenId: string, isLast: boolean) => {
    const newAnswers = { ...fillBlankAnswers, [questionId]: tokenId };
    setFillBlankAnswers(newAnswers);
    
    if (isLast) {
      handleComplete({
        correctCount: 0,
        wrongCount: 0,
        moveCount: 0,
        score: 0,
        answerData: newAnswers,
      });
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [fillBlankAnswers, setFillBlankAnswers, handleComplete]);

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#8bc34a] border-t-transparent"></div>
        <p className="mt-4 text-[#215b3b] font-bold">Đang tải bài tập...</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-500">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">Không thể bắt đầu</h3>
        <p className="text-gray-500 mb-6">{error || 'Có lỗi xảy ra khi tải dữ liệu.'}</p>
        <button onClick={() => router.back()} className="px-6 py-2 bg-[#215b3b] text-white rounded-xl font-bold">Quay lại</button>
      </div>
    );
  }

  if (status === 'limit' && limit) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6">
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4 text-orange-500">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">Hết lượt chơi</h3>
        <p className="text-gray-500 mb-6">Bạn đã hết lượt chơi hôm nay.</p>
        <button onClick={() => router.back()} className="px-6 py-2 bg-[#215b3b] text-white rounded-xl font-bold">Trở về</button>
      </div>
    );
  }

  if (status === 'finished' && result) {
    return (
      <div className="relative w-full min-h-[600px] flex flex-col">
        <BambooBackground />
        <FillResults
          result={result}
          fillBlankQuestions={fillBlankQuestions}
          elapsed={elapsed}
          onExit={() => router.back()}
        />
      </div>
    );
  }

  const currentQuestion = fillBlankQuestions[currentIndex];
  if (!currentQuestion) return null;

  return (
    <div className="relative max-w-4xl mx-auto min-h-[600px] bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 flex flex-col">
      <BambooBackground />
      <div className="absolute top-0 left-0 w-full h-2 bg-gray-100">
        <div
          className="h-full bg-gradient-to-r from-[#8bc34a] to-[#215b3b] transition-all duration-300"
          style={{ width: `${(currentIndex / fillBlankQuestions.length) * 100}%` }}
        />
      </div>

      <div className="flex-1 p-6 md:p-10 z-10 flex flex-col">
        <div className="flex justify-between items-center mb-8">
          <span className="px-4 py-1.5 bg-[#eef7e9] text-[#215b3b] font-bold rounded-full text-sm">
            Câu {currentIndex + 1} / {fillBlankQuestions.length}
          </span>
          <button
            onClick={() => router.back()}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            Đóng
          </button>
        </div>

        <div className="flex-1 flex flex-col justify-center">
          <FillGameBoard
            question={currentQuestion}
            onAnswer={(tokenId) => handleAnswer(currentQuestion.questionId, tokenId, currentIndex === fillBlankQuestions.length - 1)}
          />
        </div>
      </div>
    </div>
  );
}
