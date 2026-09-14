'use client';

import { useState } from 'react';
import { Vocabulary } from '@/lib/api/types';
import { WordIntroStep } from './steps/word-intro-step';
import { HanziPracticeStep } from './steps/hanzi-practice-step';
import { SentenceWritingStep } from './steps/sentence-writing-step';
import { ReverseTranslationStep } from './steps/reverse-translation-step';
import { StorySummary } from './story-summary';
import { srsApi } from '@/lib/api/endpoints/srs';
import { ArrowLeft, BookOpen, PenTool, Edit3, Languages, FastForward } from 'lucide-react';

interface LearnWordFlowProps {
  vocabularies: Vocabulary[];
  initialIndex?: number;
  onClose: () => void;
  onComplete: () => void;
}

export type StepType = 'INTRO' | 'HANZI' | 'SENTENCE' | 'REVERSE';

const STEP_CONFIG = [
  { key: 'INTRO' as StepType, label: 'Giới thiệu', icon: BookOpen },
  { key: 'HANZI' as StepType, label: 'Nét viết', icon: PenTool },
  { key: 'SENTENCE' as StepType, label: 'Đặt câu', icon: Edit3 },
  { key: 'REVERSE' as StepType, label: 'Dịch câu', icon: Languages },
];

export function LearnWordFlow({
  vocabularies,
  initialIndex = 0,
  onClose,
  onComplete,
}: LearnWordFlowProps) {
  const [currentWordIndex, setCurrentWordIndex] = useState(initialIndex);
  const [currentStep, setCurrentStep] = useState<StepType>('INTRO');
  const [isFinished, setIsFinished] = useState(false);

  if (vocabularies.length === 0) return null;

  const currentWord = vocabularies[currentWordIndex];

  const handleNextStep = () => {
    switch (currentStep) {
      case 'INTRO':
        setCurrentStep('HANZI');
        break;
      case 'HANZI':
        setCurrentStep('SENTENCE');
        break;
      case 'SENTENCE':
        setCurrentStep('REVERSE');
        break;
      case 'REVERSE':
        // Submit SRS rating for this word
        srsApi.submitReview(currentWord.id, 'GOOD').catch(console.error);
        if (currentWordIndex < vocabularies.length - 1) {
          setCurrentWordIndex(prev => prev + 1);
          setCurrentStep('INTRO');
        } else {
          setIsFinished(true);
        }
        break;
    }
  };

  const handleSkipToNextWord = () => {
    // Treat skip as easy/good to initialize SRS
    srsApi.submitReview(currentWord.id, 'EASY').catch(console.error);
    if (currentWordIndex < vocabularies.length - 1) {
      setCurrentWordIndex(prev => prev + 1);
      setCurrentStep('INTRO');
    } else {
      setIsFinished(true);
    }
  };

  if (isFinished) {
    return <StorySummary vocabularies={vocabularies} onClose={onComplete} />;
  }

  const renderStep = () => {
    switch (currentStep) {
      case 'INTRO':
        return <WordIntroStep key={`intro-${currentWord.id}`} vocabulary={currentWord} onNext={handleNextStep} />;
      case 'HANZI':
        return <HanziPracticeStep key={`hanzi-${currentWord.id}`} vocabulary={currentWord} onNext={handleNextStep} />;
      case 'SENTENCE':
        return <SentenceWritingStep key={`sentence-${currentWord.id}`} vocabulary={currentWord} onNext={handleNextStep} />;
      case 'REVERSE':
        return <ReverseTranslationStep key={`reverse-${currentWord.id}`} vocabulary={currentWord} onNext={handleNextStep} />;
      default:
        return null;
    }
  };

  const currentStepIndex = STEP_CONFIG.findIndex(s => s.key === currentStep);

  return (
    <div className="flex flex-col h-full bg-white relative rounded-3xl shadow-sm border border-gray-100 overflow-hidden min-h-[75vh]">
      
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-gray-100 bg-gray-50/70 backdrop-blur-sm z-20">
        <button
          onClick={onClose}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Quay lại</span>
        </button>

        {/* Center: Word Counter & Step Indicators */}
        <div className="flex items-center gap-4">
          <span className="text-xs sm:text-sm font-bold text-gray-700 bg-white px-3 py-1 rounded-full border border-gray-200/80 shadow-xs">
            Từ {currentWordIndex + 1} / {vocabularies.length}
          </span>

          <div className="hidden md:flex items-center gap-1.5 bg-white px-2 py-1 rounded-full border border-gray-200/60 shadow-xs">
            {STEP_CONFIG.map((step, idx) => {
              const Icon = step.icon;
              const isPast = currentStepIndex > idx;
              const isCurrent = currentStepIndex === idx;

              return (
                <div
                  key={step.key}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
                    isCurrent
                      ? 'bg-[#1f5333] text-white shadow-xs'
                      : isPast
                      ? 'bg-emerald-50 text-emerald-800'
                      : 'text-gray-400'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{step.label}</span>
                </div>
              );
            })}
          </div>

          {/* Mobile step dot indicator */}
          <div className="flex md:hidden gap-1">
            {STEP_CONFIG.map((step, idx) => (
              <div
                key={step.key}
                className={`h-1.5 w-6 rounded-full transition-colors ${
                  currentStepIndex >= idx ? 'bg-[#1f5333]' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Skip action */}
        <button
          onClick={handleSkipToNextWord}
          className="text-xs font-semibold text-gray-400 hover:text-gray-700 transition-colors cursor-pointer flex items-center gap-1"
          title="Bỏ qua từ này và chuyển sang từ kế tiếp"
        >
          <span className="hidden sm:inline">Bỏ qua từ này</span>
          <FastForward className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex flex-col items-center justify-center">
        <div className="w-full max-w-4xl mx-auto min-h-full flex flex-col justify-center py-2">
          {renderStep()}
        </div>
      </div>
    </div>
  );
}
