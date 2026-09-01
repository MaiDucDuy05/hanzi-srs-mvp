'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { resourceApi } from '@/lib/api/endpoints';
import { PageLoading } from '@/features/ui/components/spinner';
import { ErrorState } from '@/features/ui/components/error-state';
import { Button } from '@/features/ui/components/button';
import type { MistakeBookEntry } from '@/lib/api/types';
import { WritingMode } from '@/features/games/components/writing-mode';
import { FillGameBoard } from '@/features/games/components/fill-game-board';
import { SentenceGameBoard } from '@/features/games/components/sentence-game-board';
import { GameSummary } from '@/features/games/components/game-summary';

export function MistakeReviewFeature() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const filter = searchParams.get('filter') || 'recent';
  const t = useTranslations('Practice');

  const [mistakes, setMistakes] = useState<MistakeBookEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<{ id: string; correct: boolean }[]>([]);
  const [sessionFinished, setSessionFinished] = useState(false);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    let cancelled = false;
    resourceApi.startMistakeReview(filter)
      .then(res => {
        if (!cancelled) {
          setMistakes(res);
          setLoading(false);
        }
      })
      .catch(err => {
        if (!cancelled) {
          setError(err.message || t('errorLoadingMistakes'));
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, [filter]);

  const handleNext = async (isCorrect: boolean) => {
    const current = mistakes[currentIndex];
    // Submit to backend
    try {
      await resourceApi.submitMistakeReview(current.id, isCorrect);
    } catch (e) {
      console.error('Failed to submit review', e);
    }
    
    setResults(prev => [...prev, { id: current.id, correct: isCorrect }]);
    
    if (currentIndex < mistakes.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setSessionFinished(true);
    }
  };

  if (loading) return <PageLoading label={t('preparingReview')} />;
  if (error) return <ErrorState message={error} onRetry={() => router.back()} />;
  
  if (mistakes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <h2 className="text-2xl font-bold">{t('noMistakes')}</h2>
        <p className="text-gray-500">{t('noMistakesDesc')}</p>
        <Button onClick={() => router.push('/dashboard/practice')}>{t('goBack')}</Button>
      </div>
    );
  }

  if (sessionFinished) {
    const correctCount = results.filter(r => r.correct).length;
    const total = mistakes.length;
    const elapsed = Date.now() - startTime;
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <GameSummary
          title={t('greatJob')}
          subtitle={t('mistakeReviewCompleted')}
          result={{ correctCount, wrongCount: total - correctCount, moveCount: 0, score: Math.round(correctCount / total * 100), answerData: {} }}
          elapsed={elapsed}
          onReplay={() => window.location.reload()}
          onExit={() => router.push('/dashboard/practice')}
        />
      </div>
    );
  }

  const current = mistakes[currentIndex];

  const handleModeComplete = (result: any) => {
    const isCorrect = result.correctCount > 0;
    handleNext(isCorrect);
  };

  return (
    <div className="w-full flex flex-col h-full p-4 sm:p-8">
      <header className="flex flex-wrap items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#3e5c46] font-heading tracking-tight">{t('mistakeReviewTitle')} ({currentIndex + 1}/{mistakes.length})</h1>
        </div>
      </header>

      <div className="flex-1 rounded-[2.5rem] bg-white border border-gray-100 shadow-sm overflow-hidden relative p-4 sm:p-8">
        <MistakeQuestionRenderer key={current.id} mistake={current} onComplete={handleModeComplete} />
      </div>
    </div>
  );
}

function MistakeQuestionRenderer({ mistake, onComplete }: { mistake: MistakeBookEntry, onComplete: (res: any) => void }) {
  const t = useTranslations('Practice');
  const snapshot = mistake.questionSnapshot as any;

  if (mistake.sourceType === 'HANZI_WRITING') {
    const items = [{
      id: snapshot.vocabularyId || mistake.id,
      hanzi: snapshot.char || snapshot.hanzi,
      pinyin: snapshot.pinyin,
      meaning: snapshot.meaning,
      audioKey: snapshot.audioKey,
    }];
    return <WritingMode items={items} onStateChange={() => {}} onComplete={onComplete} />;
  }
  
  if (mistake.sourceType === 'SENTENCE_ORDERING') {
    // We need to pass the correct answer to check it locally.
    // However, SentenceOrderingMode blindly assumes true. We'll handle it by intercepting onAnswersChange if needed, 
    // but SentenceOrderingMode returns answers in onComplete.
    const questions = [{
      questionId: snapshot.questionId || mistake.id,
      tokens: snapshot.tokens || [],
      prompt: snapshot.prompt || '',
      translation: snapshot.translation,
      explanation: snapshot.explanation
    }];
    
    return (
      <SentenceReviewWrapper 
        mistake={mistake} 
        questions={questions as any} 
        onComplete={onComplete} 
      />
    );
  }

  if (mistake.sourceType === 'FILL_BLANK') {
    const question = {
      questionId: snapshot.questionId || mistake.id,
      prompt: snapshot.prompt || '___',
      options: snapshot.options || [],
      translation: snapshot.translation,
      explanation: snapshot.explanation,
    };
    
    // We need a small wrapper to handle feedback and onComplete
    return <FillBlankReviewWrapper mistake={mistake} question={question as any} onComplete={onComplete} />;
  }

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <p className="text-red-500 font-bold mb-4">{t('unsupportedQuestion')} ({mistake.sourceType})</p>
      <Button onClick={() => onComplete({ correctCount: 0 })}>{t('skip')}</Button>
    </div>
  );
}

function FillBlankReviewWrapper({ mistake, question, onComplete }: any) {
  const t = useTranslations('Practice');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  
  return (
    <div className="w-full flex flex-col items-center justify-center">
      <FillGameBoard 
        question={question} 
        onAnswer={(ans) => {
          if (feedback) return; // already answered
          const correctAns = (mistake.correctAnswer as any)?.correctTokenId;
          const isCorrect = ans === correctAns;
          setFeedback(isCorrect ? 'correct' : 'wrong');
          
          if (isCorrect) {
            setTimeout(() => onComplete({ correctCount: 1 }), 1000);
          } else {
            setTimeout(() => onComplete({ correctCount: 0 }), 2500);
          }
        }} 
      />
      {feedback === 'correct' && (
        <div className="mt-4 p-4 bg-green-100 text-green-700 rounded-xl font-bold w-full max-w-2xl text-center">
          {t('correct')}
        </div>
      )}
      {feedback === 'wrong' && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-xl font-bold w-full max-w-2xl text-center">
          {t('wrongAnswer')} {(mistake.correctAnswer as any)?.correctTokenId}
        </div>
      )}
    </div>
  );
}

function SentenceReviewWrapper({ mistake, questions, onComplete }: any) {
  const t = useTranslations('Practice');
  const [userAnswers, setUserAnswers] = useState<Record<string, string[]>>({});
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const q = questions[0];
  const qId = q.questionId;
  const currentAnswer = userAnswers[qId] || [];

  const handleSelect = (tokenId: string) => {
    if (feedback) return;
    setUserAnswers(prev => ({ ...prev, [qId]: [...(prev[qId] || []), tokenId] }));
  };

  const handleDeselect = (tokenId: string) => {
    if (feedback) return;
    setUserAnswers(prev => ({ ...prev, [qId]: (prev[qId] || []).filter(id => id !== tokenId) }));
  };

  const handleSwapLeft = (idx: number) => {
    if (feedback || idx === 0) return;
    setUserAnswers(prev => {
      const arr = [...(prev[qId] || [])];
      [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
      return { ...prev, [qId]: arr };
    });
  };
  
  const handleSwapRight = (idx: number) => {
    if (feedback || idx === currentAnswer.length - 1) return;
    setUserAnswers(prev => {
      const arr = [...(prev[qId] || [])];
      [arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]];
      return { ...prev, [qId]: arr };
    });
  };

  const handleSubmit = () => {
    if (feedback) return;
    
    // verify
    const correctOrder = (mistake.correctAnswer as any)?.correctOrder || [];
    const isCorrect = correctOrder.length > 0 && currentAnswer.length === correctOrder.length && currentAnswer.every((id: string, idx: number) => id === correctOrder[idx]);
    
    setFeedback(isCorrect ? 'correct' : 'wrong');
    
    if (isCorrect) {
       setTimeout(() => onComplete({ correctCount: 1 }), 1000);
    } else {
       setTimeout(() => onComplete({ correctCount: 0 }), 2500);
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-center relative">
      <SentenceGameBoard 
        questions={questions}
        userAnswers={userAnswers}
        currentIndex={0}
        onSelectToken={handleSelect}
        onDeselectToken={handleDeselect}
        onSwapLeft={handleSwapLeft}
        onSwapRight={handleSwapRight}
        onPrev={() => {}}
        onNext={handleSubmit}
        onSubmit={handleSubmit}
      />
      {feedback === 'correct' && (
        <div className="absolute bottom-32 p-4 bg-green-100 text-green-700 rounded-xl font-bold w-full max-w-2xl text-center z-50 shadow-lg border-2 border-green-500">
          {t('correct')}
        </div>
      )}
      {feedback === 'wrong' && (
        <div className="absolute bottom-32 p-4 bg-red-100 text-red-700 rounded-xl font-bold w-full max-w-2xl text-center z-50 shadow-lg border-2 border-red-500">
          {t('wrongAnswer')} {(mistake.correctAnswer as any)?.correctOrder?.map((id: string) => q.tokens.find((t: any) => t.id === id)?.text).join('')}
        </div>
      )}
    </div>
  );
}
