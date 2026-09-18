'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { speakText } from '@/lib/utils/tts';
import { BambooProgressBar } from '@/features/ui/components/bamboo-progress-bar';
import { GameSummary } from '@/features/games/components/game-summary';
import { ListeningSpeakerDisplay } from '../components/listening-speaker-display';
import { ListeningOptionsGrid } from '../components/listening-options-grid';
import {
  generateListeningQuestions,
  type ListeningVocabItem,
  type ListeningQuestion,
} from '../utils/listening-question-generator';

export interface ListeningGameFeatureProps {
  vocabularies: ListeningVocabItem[];
  allVocabularies?: ListeningVocabItem[];
  questionCount?: number;
  onExit?: () => void;
}

export function ListeningGameFeature({
  vocabularies,
  allVocabularies,
  questionCount = 20,
  onExit,
}: ListeningGameFeatureProps) {
  const [questions, setQuestions] = useState<ListeningQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [startTime] = useState<number>(() => Date.now());
  const [elapsed, setElapsed] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  // Khởi tạo danh sách câu hỏi
  const initQuestions = useCallback(() => {
    const generated = generateListeningQuestions(
      vocabularies,
      allVocabularies && allVocabularies.length > 0 ? allVocabularies : vocabularies,
      questionCount
    );
    setQuestions(generated);
    setCurrentIndex(0);
    setSelectedOptionId(null);
    setCorrectCount(0);
    setWrongCount(0);
    setIsFinished(false);
  }, [vocabularies, allVocabularies, questionCount]);

  useEffect(() => {
    initQuestions();
  }, [initQuestions]);

  const currentQ = questions[currentIndex];
  const total = questions.length;
  const isAnswered = selectedOptionId !== null;

  // Phát âm từ hiện tại
  const playAudio = useCallback(
    (customSpeed?: number) => {
      if (!currentQ) return;
      setIsPlaying(true);
      speakText(currentQ.vocab.hanzi, customSpeed ?? playbackSpeed);
      setTimeout(() => setIsPlaying(false), 1200);
    },
    [currentQ, playbackSpeed]
  );

  // Tự động phát âm khi chuyển sang câu mới
  useEffect(() => {
    if (currentQ && !isFinished) {
      const timer = setTimeout(() => {
        playAudio();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, currentQ, isFinished, playAudio]);

  // Xử lý chọn đáp án
  const handleSelectOption = (optId: string) => {
    if (isAnswered || !currentQ) return;
    setSelectedOptionId(optId);

    const chosen = currentQ.options.find((o) => o.id === optId);
    if (chosen?.isCorrect) {
      setCorrectCount((prev) => prev + 1);
    } else {
      setWrongCount((prev) => prev + 1);
    }
  };

  // Chuyển câu tiếp theo
  const handleNext = useCallback(() => {
    if (!isAnswered) return;
    if (currentIndex < total - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOptionId(null);
    } else {
      setElapsed(Math.round((Date.now() - startTime) / 1000));
      setIsFinished(true);
    }
  }, [isAnswered, currentIndex, total, startTime]);

  // Phím tắt bàn phím
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isFinished || !currentQ) return;

      if (['1', '2', '3', '4'].includes(e.key) && !isAnswered) {
        const idx = parseInt(e.key, 10) - 1;
        if (currentQ.options[idx]) {
          handleSelectOption(currentQ.options[idx].id);
        }
      } else if (e.code === 'Space') {
        e.preventDefault();
        playAudio();
      } else if (e.key === 'Enter' && isAnswered) {
        e.preventDefault();
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFinished, currentQ, isAnswered, playAudio, handleNext]);

  // Màn hình kết thúc
  if (isFinished) {
    const score = total > 0 ? Math.round((correctCount / total) * 100) : 0;
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 min-h-[65vh]">
        <GameSummary
          title={score >= 80 ? 'Xuất sắc!' : score >= 50 ? 'Khá lắm!' : 'Cố gắng lên nhé!'}
          subtitle="Hoàn thành Luyện Nghe (Listening Game)"
          result={{
            score,
            correctCount,
            wrongCount,
            moveCount: total,
            answerData: {},
          }}
          elapsed={elapsed}
          onReplay={initQuestions}
          onExit={onExit || (() => window.history.back())}
        />
      </div>
    );
  }

  if (!currentQ) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh] text-gray-500">
        Đang chuẩn bị câu hỏi...
      </div>
    );
  }

  const progressPercent = total > 0 ? Math.round(((currentIndex + 1) / total) * 100) : 0;

  return (
    <div className="flex-1 flex flex-col items-center justify-between w-full max-w-4xl mx-auto px-4 py-4 sm:py-6 relative z-10 min-h-[85vh]">
      {/* Top Header & Progress */}
      <div className="w-full">
        <div className="flex items-center justify-between gap-4 mb-2">
          {onExit && (
            <button
              onClick={onExit}
              className="p-2.5 rounded-full bg-white text-gray-600 hover:bg-gray-100 shadow-sm transition-colors border border-gray-100"
              title="Quay lại"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          <div className="flex items-center gap-2">
            <span className="px-3.5 py-1 rounded-full text-xs sm:text-sm font-black bg-[#215b3b]/10 text-[#215b3b]">
              Câu {currentIndex + 1} / {total}
            </span>
            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold ml-2">
              <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Đúng: {correctCount}
              </span>
              <span className="text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                Sai: {wrongCount}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-full p-1 shadow-sm text-xs font-bold">
            <button
              onClick={() => {
                setPlaybackSpeed(1.0);
                playAudio(1.0);
              }}
              className={`px-2.5 py-1 rounded-full transition-all ${
                playbackSpeed === 1.0 ? 'bg-[#215b3b] text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              1.0x
            </button>
            <button
              onClick={() => {
                setPlaybackSpeed(0.75);
                playAudio(0.75);
              }}
              className={`px-2.5 py-1 rounded-full transition-all ${
                playbackSpeed === 0.75 ? 'bg-[#215b3b] text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              0.75x
            </button>
          </div>
        </div>

        <div className="w-full -mt-2 -mb-4">
          <BambooProgressBar progress={progressPercent} label={`${currentIndex + 1}/${total}`} />
        </div>
      </div>

      {/* Main Question Area */}
      <ListeningSpeakerDisplay
        vocab={currentQ.vocab}
        isPlaying={isPlaying}
        isAnswered={isAnswered}
        onPlay={() => playAudio()}
      />

      {/* 4 Multiple Choice Options */}
      <ListeningOptionsGrid
        options={currentQ.options}
        selectedOptionId={selectedOptionId}
        onSelectOption={handleSelectOption}
      />

      {/* Next Question Action Bar */}
      <div className="h-16 flex items-center justify-center w-full max-w-md">
        {isAnswered ? (
          <button
            onClick={handleNext}
            className="w-full sm:w-auto px-8 py-3.5 bg-[#215b3b] hover:bg-[#1a4a2f] text-white text-lg font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 animate-in fade-in slide-in-from-bottom-2"
          >
            <span>{currentIndex < total - 1 ? 'Câu tiếp theo' : 'Xem kết quả'}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        ) : (
          <div className="text-xs text-gray-400 font-medium hidden sm:flex items-center gap-2">
            Mẹo: Dùng phím <kbd className="px-1.5 py-0.5 bg-white border rounded shadow-xs">1</kbd>-<kbd className="px-1.5 py-0.5 bg-white border rounded shadow-xs">4</kbd> để chọn, <kbd className="px-1.5 py-0.5 bg-white border rounded shadow-xs">Space</kbd> nghe lại
          </div>
        )}
      </div>
    </div>
  );
}
