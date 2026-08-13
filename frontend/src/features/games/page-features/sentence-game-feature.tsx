'use client';

import React, { useState } from 'react';
import { usePracticeEngine } from '@/features/practice/components/practice-engine';
import { SourceType } from '@/lib/api/types';
import { ChevronLeft, ChevronRight, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function SentenceGameFeature({
  sourceType,
  sourceId,
}: {
  sourceType: SourceType;
  sourceId: string;
}) {
  const router = useRouter();
  const engine = usePracticeEngine({
    practiceType: 'SENTENCE_ORDERING',
    sourceType,
    sourceId,
    sessionKey: 'sentence-ordering-session',
  });

  const [currentIndex, setCurrentIndex] = useState(0);

  if (engine.status === 'loading') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full min-h-[500px]">
        <Loader2 className="w-10 h-10 animate-spin text-[#8BC34A] mb-4" />
        <p className="text-lg font-medium text-[#4a6b38]">Đang tải câu hỏi...</p>
      </div>
    );
  }

  if (engine.status === 'error') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full min-h-[500px]">
        <div className="bg-red-50 p-6 rounded-2xl border-2 border-red-200 text-center max-w-md">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-700 font-medium mb-6">{engine.error}</p>
          <button 
            onClick={() => router.push('/dashboard')}
            className="px-6 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-semibold"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  if (engine.status === 'limit') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full min-h-[500px]">
        <div className="bg-orange-50 p-6 rounded-2xl border-2 border-orange-200 text-center max-w-md">
          <p className="text-orange-700 font-medium mb-6">Bạn đã hết lượt luyện tập hôm nay.</p>
          <button 
            onClick={() => router.push('/dashboard')}
            className="px-6 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors font-semibold"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  // Màn hình kết quả
  if (engine.status === 'finished' && engine.result) {
    const resultsData = (engine.result.answerData as any)?.results || [];
    return (
      <div className="flex-1 flex flex-col items-center w-full max-w-4xl mx-auto px-4 py-8 relative z-10">
        <h1 className="text-3xl font-black text-[#215b3b] mb-6 font-heading">Kết quả làm bài</h1>
        <div className="bg-white rounded-3xl shadow-sm p-6 w-full max-w-2xl mb-10 text-center border-4 border-[#8BC34A]">
          <p className="text-3xl font-bold mb-3 text-[#215b3b]">Điểm số: {engine.result.score}/10</p>
          <p className="text-[#4a6b38] font-medium text-lg">Số câu đúng: {engine.result.correctCount} / {engine.result.correctCount + engine.result.wrongCount}</p>
        </div>

        <div className="w-full max-w-3xl space-y-6">
          {engine.sentenceQuestions.map((q, idx) => {
            const qResult = resultsData.find((r: any) => r.questionId === q.questionId);
            const isCorrect = qResult?.isCorrect;
            
            // Reconstruct the correct sentence
            const correctOrderIds = qResult?.correctOrder || [];
            const correctSentence = correctOrderIds
              .map((id: string) => q.tokens.find((t) => t.id === id)?.text)
              .join('');

            return (
              <div key={q.questionId} className={`p-6 rounded-2xl border-2 shadow-sm ${isCorrect ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'}`}>
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-bold text-lg text-gray-800">Câu {idx + 1}</h3>
                  {isCorrect ? (
                    <div className="flex items-center gap-1 text-green-600 font-bold">
                      <CheckCircle className="w-5 h-5" /> Đúng
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-red-600 font-bold">
                      <XCircle className="w-5 h-5" /> Sai
                    </div>
                  )}
                </div>
                <p className="text-2xl font-bold font-['Ma_Shan_Zheng','KaiTi',sans-serif] mb-3 text-gray-900 tracking-wider">
                  {correctSentence || "Không có dữ liệu đáp án"}
                </p>
                {q.translation && (
                  <p className="text-gray-700 italic mb-2"><span className="font-semibold not-italic">Dịch:</span> {q.translation}</p>
                )}
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
          onClick={() => router.push('/dashboard')}
          className="mt-10 px-10 py-4 bg-[#215b3b] text-white font-bold text-lg rounded-full shadow-lg hover:bg-[#1a4a2f] transition-all transform hover:-translate-y-1"
        >
          Trở về trang chủ
        </button>
      </div>
    );
  }

  // Màn hình làm bài (status === 'running')
  const currentQuestion = engine.sentenceQuestions[currentIndex];
  if (!currentQuestion) return null;

  const currentAnswers = engine.userAnswers[currentQuestion.questionId] || [];
  const availableTokens = currentQuestion.tokens.filter(
    (t) => !currentAnswers.includes(t.id)
  );
  
  const handleSelect = (tokenId: string) => {
    engine.setUserAnswers({
      ...engine.userAnswers,
      [currentQuestion.questionId]: [...currentAnswers, tokenId],
    });
  };

  const handleDeselect = (tokenId: string) => {
    engine.setUserAnswers({
      ...engine.userAnswers,
      [currentQuestion.questionId]: currentAnswers.filter((id) => id !== tokenId),
    });
  };

  const moveLeft = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (index === 0) return;
    const newAnswers = [...currentAnswers];
    [newAnswers[index - 1], newAnswers[index]] = [newAnswers[index], newAnswers[index - 1]];
    engine.setUserAnswers({
      ...engine.userAnswers,
      [currentQuestion.questionId]: newAnswers,
    });
  };

  const moveRight = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (index === currentAnswers.length - 1) return;
    const newAnswers = [...currentAnswers];
    [newAnswers[index], newAnswers[index + 1]] = [newAnswers[index + 1], newAnswers[index]];
    engine.setUserAnswers({
      ...engine.userAnswers,
      [currentQuestion.questionId]: newAnswers,
    });
  };

  const handleNext = () => {
    if (currentIndex < engine.sentenceQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Bấm Nộp Bài ở câu cuối
      engine.handleComplete({
        correctCount: 0,
        wrongCount: 0,
        moveCount: 0,
        score: 0,
        answerData: {},
      });
    }
  };

  const isComplete = availableTokens.length === 0;

  return (
    <div className="flex-1 flex flex-col items-center justify-center w-full max-w-5xl mx-auto px-4 py-6 sm:py-8 relative z-10 h-full min-h-screen">
      <div className="w-full flex justify-between items-center mb-8 max-w-2xl">
        <h1 className="text-3xl font-black text-[#215b3b] font-heading drop-shadow-sm">Sentence Forest</h1>
        <div className="bg-[#eef7e9] border-2 border-[#8BC34A] text-[#215b3b] px-5 py-2 rounded-full font-bold shadow-sm">
          Câu {currentIndex + 1} / {engine.sentenceQuestions.length}
        </div>
      </div>
      
      {/* Vùng đáp án (Drop Zone) */}
      <div className="w-full max-w-2xl min-h-[160px] bg-white rounded-3xl border-4 border-dashed border-[#8BC34A] p-6 flex flex-wrap gap-4 items-center justify-center mb-12 transition-all shadow-inner relative">
        {currentAnswers.length === 0 && (
          <span className="text-gray-400 font-medium text-lg">Bấm chọn các từ bên dưới để ghép thành câu</span>
        )}
        {currentAnswers.map((tokenId, idx) => {
          const token = currentQuestion.tokens.find((t) => t.id === tokenId);
          if (!token) return null;
          return (
            <div 
              key={token.id}
              onClick={() => handleDeselect(token.id)}
              className="group relative flex flex-col items-center justify-center bg-[#aadd4a] text-white rounded-2xl cursor-pointer hover:bg-[#97cf34] shadow-md transition-all select-none min-w-[70px] min-h-[70px]"
            >
              <div className="px-6 py-4 text-3xl font-bold font-['Ma_Shan_Zheng','KaiTi',sans-serif]">{token.text}</div>
              
              {/* Nút mũi tên chuyển đổi vị trí */}
              <div className="absolute -bottom-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                {idx > 0 && (
                  <button 
                    onClick={(e) => moveLeft(idx, e)}
                    className="bg-white text-[#215b3b] rounded-full p-1.5 shadow-md border border-gray-200 hover:bg-gray-100 active:bg-gray-200"
                  >
                    <ChevronLeft size={16} strokeWidth={3} />
                  </button>
                )}
                {idx < currentAnswers.length - 1 && (
                  <button 
                    onClick={(e) => moveRight(idx, e)}
                    className="bg-white text-[#215b3b] rounded-full p-1.5 shadow-md border border-gray-200 hover:bg-gray-100 active:bg-gray-200"
                  >
                    <ChevronRight size={16} strokeWidth={3} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Ngân hàng từ (Available Words) */}
      <div className="flex flex-wrap gap-4 items-center justify-center max-w-2xl min-h-[80px]">
        {availableTokens.map((token) => (
          <div 
            key={token.id}
            onClick={() => handleSelect(token.id)}
            className="px-6 py-4 bg-white border-4 border-[#eef7e9] text-[#215b3b] text-3xl font-bold font-['Ma_Shan_Zheng','KaiTi',sans-serif] rounded-2xl cursor-pointer hover:border-[#8BC34A] hover:bg-[#f9fdf5] shadow-sm transform hover:-translate-y-1 transition-all select-none"
          >
            {token.text}
          </div>
        ))}
      </div>

      <div className="mt-16 h-16 flex items-center justify-center w-full max-w-2xl">
        <div className="flex justify-between w-full">
          <button 
            onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
            disabled={currentIndex === 0}
            className={`px-8 py-3 rounded-full font-bold transition-colors ${currentIndex === 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-50' : 'bg-white text-[#215b3b] shadow-md hover:bg-gray-50 border-2 border-[#eef7e9]'}`}
          >
            Câu trước
          </button>

          <button 
            onClick={handleNext}
            className={`px-10 py-3 rounded-full font-bold shadow-lg transition-all ${
              isComplete && currentIndex === engine.sentenceQuestions.length - 1
                ? 'bg-[#215b3b] text-white hover:bg-[#1a4a2f] animate-bounce ring-4 ring-[#aadd4a]/30' 
                : 'bg-white text-[#215b3b] hover:bg-gray-50 border-2 border-[#eef7e9]'
            }`}
          >
            {currentIndex === engine.sentenceQuestions.length - 1 ? 'Nộp bài' : 'Câu tiếp theo'}
          </button>
        </div>
      </div>
    </div>
  );
}
