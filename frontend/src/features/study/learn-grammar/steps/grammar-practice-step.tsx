'use client';

import React, { useState, useEffect } from 'react';
import { GrammarPoint } from '@/lib/api/types';
import { apiFetch } from '@/lib/api/client';
import { Loader2, CheckCircle2, XCircle, ChevronRight } from 'lucide-react';
import { html } from 'pinyin-pro';

interface GrammarPracticeStepProps {
  grammar: GrammarPoint;
  onNext: () => void;
}

interface PracticeData {
  promptVi: string;
  expectedZh: string;
}

interface GradeResult {
  isCorrect: boolean;
  score: number;
  feedback: string;
}

export function GrammarPracticeStep({ grammar, onNext }: GrammarPracticeStepProps) {
  const [practice, setPractice] = useState<PracticeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [userAnswer, setUserAnswer] = useState('');
  const [isGrading, setIsGrading] = useState(false);
  const [gradeResult, setGradeResult] = useState<GradeResult | null>(null);

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    
    apiFetch('/study/grammar-practice-generate', {
      method: 'POST',
      body: JSON.stringify({
        title: grammar.title,
        structure: grammar.structure || '',
      }),
    })
      .then((data: any) => {
        if (mounted && data.promptVi) {
          setPractice(data);
        }
      })
      .catch(console.error)
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [grammar]);

  const handleSubmit = async () => {
    if (!userAnswer.trim() || !practice) return;
    
    setIsGrading(true);
    try {
      const result = await apiFetch('/study/grammar-practice-grade', {
        method: 'POST',
        body: JSON.stringify({
          title: grammar.title,
          structure: grammar.structure || '',
          promptVi: practice.promptVi,
          userAnswer: userAnswer.trim(),
        }),
      });
      setGradeResult(result as GradeResult);
    } catch (error) {
      console.error(error);
    } finally {
      setIsGrading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !gradeResult) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col h-full w-full max-w-2xl mx-auto animate-in fade-in zoom-in-95 duration-300">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black text-gray-800 mb-2">Thử thách dịch thuật</h2>
        <p className="text-gray-500">Dịch câu sau sang tiếng Trung dùng cấu trúc "{grammar.title}"</p>
      </div>

      <div className="flex-1 flex flex-col justify-start">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-emerald-600">
            <Loader2 className="w-12 h-12 animate-spin mb-4" />
            <p className="font-medium animate-pulse">AI đang chuẩn bị câu hỏi...</p>
          </div>
        ) : practice ? (
          <>
            <div className="bg-blue-50/50 p-8 rounded-2xl border border-blue-100 mb-8 text-center">
              <p className="text-2xl text-blue-900 font-medium leading-relaxed">
                "{practice.promptVi}"
              </p>
            </div>

            <div className="relative mb-6">
              <textarea
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={!!gradeResult || isGrading}
                placeholder="Nhập câu tiếng Trung của bạn vào đây..."
                className="w-full min-h-[120px] p-6 text-xl rounded-2xl border-2 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all disabled:bg-gray-50 disabled:cursor-not-allowed resize-none"
              />
            </div>

            {!gradeResult ? (
              <button
                onClick={handleSubmit}
                disabled={!userAnswer.trim() || isGrading}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:text-gray-500 text-white font-bold rounded-2xl text-lg shadow-[0_8px_30px_rgb(5,150,105,0.3)] transition-all hover:scale-105 active:scale-95 flex items-center justify-center"
              >
                {isGrading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    AI đang chấm điểm...
                  </>
                ) : (
                  'Kiểm tra đáp án'
                )}
              </button>
            ) : (
              <div className={`p-6 rounded-2xl border-2 animate-in slide-in-from-bottom-4 ${gradeResult.isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <div className="flex items-center gap-3 mb-4">
                  {gradeResult.isCorrect ? (
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                  ) : (
                    <XCircle className="w-8 h-8 text-red-600" />
                  )}
                  <h3 className={`text-xl font-black ${gradeResult.isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                    {gradeResult.isCorrect ? 'Xuất sắc!' : 'Chưa chính xác lắm!'}
                  </h3>
                  <div className="ml-auto font-black text-2xl" style={{ color: gradeResult.score >= 80 ? '#16a34a' : gradeResult.score >= 50 ? '#ca8a04' : '#dc2626' }}>
                    {gradeResult.score}/100
                  </div>
                </div>
                
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {gradeResult.feedback}
                </p>

                <div className="mt-8">
                  <button
                    onClick={onNext}
                    className="w-full flex items-center justify-center gap-2 py-4 bg-[#8BC34A] hover:bg-[#7CB342] text-white font-bold rounded-2xl text-lg shadow-[0_8px_30px_rgb(139,195,74,0.3)] transition-all hover:scale-105 active:scale-95"
                  >
                    Tiếp tục học <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center text-gray-500">Lỗi tải câu hỏi.</div>
        )}
      </div>
    </div>
  );
}
