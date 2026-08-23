'use client';

import { useState } from 'react';
import { Vocabulary } from '@/lib/api/types';
import { WordIntroStep } from './steps/word-intro-step';
import { HanziPracticeStep } from './steps/hanzi-practice-step';
import { SentenceWritingStep } from './steps/sentence-writing-step';
import { ReverseTranslationStep } from './steps/reverse-translation-step';
import { StorySummary } from './story-summary';

import { ArrowLeft } from 'lucide-react';

interface LearnWordFlowProps {
  vocabularies: Vocabulary[];
  initialIndex?: number;
  onClose: () => void;
  onComplete: () => void;
}

export type StepType = 'INTRO' | 'HANZI' | 'SENTENCE' | 'REVERSE';

export function LearnWordFlow({ vocabularies, initialIndex = 0, onClose, onComplete }: LearnWordFlowProps) {
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
        // Next word
        if (currentWordIndex < vocabularies.length - 1) {
          setCurrentWordIndex((prev) => prev + 1);
          setCurrentStep('INTRO');
        } else {
          setIsFinished(true);
        }
        break;
    }
  };

  const handleSkipToNextWord = () => {
    if (currentWordIndex < vocabularies.length - 1) {
      setCurrentWordIndex((prev) => prev + 1);
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
        return <WordIntroStep vocabulary={currentWord} onNext={handleNextStep} />;
      case 'HANZI':
        return <HanziPracticeStep vocabulary={currentWord} onNext={handleNextStep} />;
      case 'SENTENCE':
        return <SentenceWritingStep vocabulary={currentWord} onNext={handleNextStep} />;
      case 'REVERSE':
        return <ReverseTranslationStep vocabulary={currentWord} onNext={handleNextStep} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full bg-white relative rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[70vh]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50">
        <button   onClick={onClose} className="text-gray-500 hover:text-gray-900">
          <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại
        </button>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-500">
            Từ {currentWordIndex + 1} / {vocabularies.length}
          </span>
          <div className="flex gap-1 ml-4">
            {(['INTRO', 'HANZI', 'SENTENCE', 'REVERSE'] as StepType[]).map((step, idx) => {
              const steps: StepType[] = ['INTRO', 'HANZI', 'SENTENCE', 'REVERSE'];
              const isActive = steps.indexOf(currentStep) >= idx;
              return (
                <div 
                  key={step} 
                  className={`h-2 w-8 rounded-full transition-colors ${isActive ? 'bg-[#8BC34A]' : 'bg-gray-200'}`} 
                />
              );
            })}
          </div>
        </div>
        <button   onClick={handleSkipToNextWord} className="text-gray-400 hover:text-gray-700">
          Bỏ qua từ này
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6 md:p-10 flex flex-col items-center">
        <div className="w-full max-w-4xl mx-auto h-full flex flex-col">
          {renderStep()}
        </div>
      </div>
    </div>
  );
}
