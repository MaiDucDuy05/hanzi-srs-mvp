'use client';

import { useState } from 'react';
import { GrammarPoint } from '@/lib/api/types';
import { GrammarIntroStep } from './steps/grammar-intro-step';
import { GrammarExamplesStep } from './steps/grammar-examples-step';
import { GrammarPracticeStep } from './steps/grammar-practice-step';
import { GrammarSummary } from './grammar-summary';
import { ArrowLeft } from 'lucide-react';

interface LearnGrammarFlowProps {
  grammarPoints: GrammarPoint[];
  initialIndex?: number;
  onClose: () => void;
  onComplete: () => void;
}

export type GrammarStepType = 'INTRO' | 'EXAMPLES' | 'PRACTICE';

export function LearnGrammarFlow({ grammarPoints, initialIndex = 0, onClose, onComplete }: LearnGrammarFlowProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [currentStep, setCurrentStep] = useState<GrammarStepType>('INTRO');
  const [isFinished, setIsFinished] = useState(false);

  if (grammarPoints.length === 0) return null;

  const currentGrammar = grammarPoints[currentIndex];

  const handleNextStep = () => {
    switch (currentStep) {
      case 'INTRO':
        setCurrentStep('EXAMPLES');
        break;
      case 'EXAMPLES':
        setCurrentStep('PRACTICE');
        break;
      case 'PRACTICE':
        if (currentIndex < grammarPoints.length - 1) {
          setCurrentIndex((prev) => prev + 1);
          setCurrentStep('INTRO');
        } else {
          setIsFinished(true);
        }
        break;
    }
  };

  const handleSkip = () => {
    if (currentIndex < grammarPoints.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setCurrentStep('INTRO');
    } else {
      setIsFinished(true);
    }
  };

  if (isFinished) {
    return <GrammarSummary grammarPoints={grammarPoints} onClose={onComplete} />;
  }

  const renderStep = () => {
    switch (currentStep) {
      case 'INTRO':
        return <GrammarIntroStep grammar={currentGrammar} onNext={handleNextStep} />;
      case 'EXAMPLES':
        return <GrammarExamplesStep grammar={currentGrammar} onNext={handleNextStep} />;
      case 'PRACTICE':
        return <GrammarPracticeStep grammar={currentGrammar} onNext={handleNextStep} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full bg-white relative rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[70vh]">
      <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50">
        <button onClick={onClose} className="text-gray-500 hover:text-gray-900 flex items-center">
          <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại
        </button>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-500">
            Ngữ pháp {currentIndex + 1} / {grammarPoints.length}
          </span>
          <div className="flex gap-1 ml-4">
            {(['INTRO', 'EXAMPLES', 'PRACTICE'] as GrammarStepType[]).map((step, idx) => {
              const steps: GrammarStepType[] = ['INTRO', 'EXAMPLES', 'PRACTICE'];
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
        <button onClick={handleSkip} className="text-gray-400 hover:text-gray-700 text-sm">
          Bỏ qua
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 md:p-10 flex flex-col items-center">
        <div className="w-full max-w-4xl mx-auto h-full flex flex-col">
          {renderStep()}
        </div>
      </div>
    </div>
  );
}
