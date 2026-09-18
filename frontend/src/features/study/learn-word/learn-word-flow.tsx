'use client';

import { useState } from 'react';
import { Vocabulary } from '@/lib/api/types';
import { WordIntroStep } from './steps/word-intro-step';
import { HanziPracticeStep } from './steps/hanzi-practice-step';
import { SentenceWritingStep } from './steps/sentence-writing-step';
import { ReverseTranslationStep } from './steps/reverse-translation-step';
import { StorySummary } from './story-summary';
import { srsApi } from '@/lib/api/endpoints/srs';
import { ArrowLeft, BookOpen, PenTool, Edit3, Languages, FastForward, SkipForward } from 'lucide-react';

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
      <div className="flex items-center justify-between px-3 sm:px-6 py-3.5 border-b border-gray-100 bg-gray-50/70 backdrop-blur-sm z-20 gap-2">
        <button
          onClick={onClose}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors cursor-pointer shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Quay lại</span>
        </button>

        {/* Center: Word Counter & Clickable Step Indicators */}
        <div className="flex items-center gap-2 sm:gap-4">
          <span className="text-xs sm:text-sm font-bold text-gray-700 bg-white px-2.5 sm:px-3 py-1 rounded-full border border-gray-200/80 shadow-xs shrink-0">
            Từ {currentWordIndex + 1} / {vocabularies.length}
          </span>

          <div className="hidden md:flex items-center gap-1 bg-white px-1.5 py-1 rounded-full border border-gray-200/60 shadow-xs">
            {STEP_CONFIG.map((step, idx) => {
              const Icon = step.icon;
              const isPast = currentStepIndex > idx;
              const isCurrent = currentStepIndex === idx;

              return (
                <button
                  key={step.key}
                  type="button"
                  onClick={() => setCurrentStep(step.key)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-[#1f5333] text-white shadow-xs'
                      : isPast
                      ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                      : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                  }`}
                  title={`Chuyển sang bước: ${step.label}`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{step.label}</span>
                </button>
              );
            })}
          </div>

          {/* Mobile clickable step dot indicator */}
          <div className="flex md:hidden gap-1.5">
            {STEP_CONFIG.map((step, idx) => (
              <button
                key={step.key}
                type="button"
                onClick={() => setCurrentStep(step.key)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  currentStepIndex === idx
                    ? 'w-6 bg-[#1f5333]'
                    : currentStepIndex > idx
                    ? 'w-3 bg-emerald-300'
                    : 'w-2 bg-gray-200'
                }`}
                title={step.label}
              />
            ))}
          </div>
        </div>

        {/* Skip actions: Bỏ qua bước & Bỏ qua từ */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            type="button"
            onClick={handleNextStep}
            className="inline-flex items-center gap-1 text-xs font-semibold text-gray-600 hover:text-[#1f5333] bg-white hover:bg-emerald-50 px-2.5 py-1.5 rounded-full border border-gray-200 shadow-2xs transition-colors cursor-pointer"
            title="Bỏ qua bước hiện tại và chuyển sang bước tiếp theo"
          >
            <span>Bỏ qua bước</span>
            <SkipForward className="w-3.5 h-3.5 text-[#1f5333]" />
          </button>

          <button
            type="button"
            onClick={handleSkipToNextWord}
            className="text-xs font-semibold text-gray-400 hover:text-gray-700 transition-colors cursor-pointer hidden sm:flex items-center gap-1 pl-1"
            title="Bỏ qua toàn bộ các bước của từ này và chuyển sang từ kế tiếp"
          >
            <span>Bỏ qua từ</span>
            <FastForward className="w-3.5 h-3.5" />
          </button>
        </div>
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
