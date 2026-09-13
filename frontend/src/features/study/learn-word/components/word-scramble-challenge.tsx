'use client';

import { useState, useMemo } from 'react';
import { Vocabulary } from '@/lib/api/types';
import { Volume2, CheckCircle2, RotateCcw, ArrowRight, HelpCircle } from 'lucide-react';
import { speakText } from '@/lib/utils/tts';

interface WordScrambleChallengeProps {
  vocabulary: Vocabulary;
  onComplete: () => void;
  onSkip: () => void;
}

const DISTRACTORS = ['他', '我们', '很', '不', '看', '说', '有', '在', '个'];

function getInitialBank(cleanTargetZh: string) {
  const chars = Array.from(cleanTargetZh);
  const distractors = DISTRACTORS.filter(d => !chars.includes(d)).slice(0, 2);
  const combined = [...chars, ...distractors];
  // Deterministic pure shuffle based on character codes
  const seed = chars.reduce((acc, c) => acc + c.charCodeAt(0), 17);
  for (let i = combined.length - 1; i > 0; i--) {
    const j = Math.abs((seed * 31 + i * 13) % (i + 1));
    [combined[i], combined[j]] = [combined[j], combined[i]];
  }
  return combined.map((char, index) => ({ id: `${char}-${index}`, char }));
}

export function WordScrambleChallenge({
  vocabulary,
  onComplete,
  onSkip,
}: WordScrambleChallengeProps) {
  const hasExample = Boolean(vocabulary.example);
  const exampleParts = vocabulary.example?.split('-') || [];
  const targetZhRaw = hasExample ? (exampleParts[0]?.trim() || vocabulary.hanzi) : vocabulary.hanzi;
  // Strip punctuation for matching
  const cleanTargetZh = targetZhRaw.replace(/[，。！？\s]/g, '');
  const meaningVi = hasExample ? (exampleParts[1]?.trim() || vocabulary.meaningVi) : vocabulary.meaningVi;

  const initialBank = useMemo(() => getInitialBank(cleanTargetZh), [cleanTargetZh]);

  const [availableBank, setAvailableBank] = useState(initialBank);
  const [selectedChips, setSelectedChips] = useState<{ id: string; char: string }[]>([]);
  const [status, setStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');

  const handleSelect = (chip: { id: string; char: string }) => {
    if (status === 'correct') return;
    setAvailableBank(prev => prev.filter(c => c.id !== chip.id));
    setSelectedChips(prev => [...prev, chip]);
    setStatus('idle');
  };

  const handleDeselect = (chip: { id: string; char: string }) => {
    if (status === 'correct') return;
    setSelectedChips(prev => prev.filter(c => c.id !== chip.id));
    setAvailableBank(prev => [...prev, chip]);
    setStatus('idle');
  };

  const handleReset = () => {
    setAvailableBank(initialBank);
    setSelectedChips([]);
    setStatus('idle');
  };

  const handleCheck = () => {
    const currentSentence = selectedChips.map(c => c.char).join('');
    if (currentSentence === cleanTargetZh) {
      setStatus('correct');
      speakText(targetZhRaw);
    } else {
      setStatus('wrong');
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
      <div className="w-full bg-white rounded-3xl border border-gray-100 shadow-[0_15px_40px_-15px_rgba(0,0,0,0.08)] p-6 md:p-8">
        
        {/* Title */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full uppercase tracking-wider">
            {hasExample ? 'Thử thách ghép câu' : 'Thử thách ghép từ'}
          </span>
          <button
            onClick={() => speakText(targetZhRaw)}
            className="text-gray-400 hover:text-emerald-700 transition-colors p-1 cursor-pointer"
            title={hasExample ? 'Nghe câu mẫu' : 'Nghe phát âm từ'}
          >
            <Volume2 className="w-5 h-5" />
          </button>
        </div>

        {/* Prompt */}
        <div className="mb-6">
          <p className="text-xs text-gray-400 font-medium mb-1">
            {hasExample
              ? 'Ghép các khối từ để tạo thành câu hoàn chỉnh:'
              : 'Ghép các chữ Hán đúng tương ứng với nghĩa:'}
          </p>
          <p className="text-xl sm:text-2xl font-black text-gray-800">
            &ldquo;{meaningVi}&rdquo;
          </p>
        </div>

        {/* Selected sentence drop zone */}
        <div className={`min-h-[72px] p-4 rounded-2xl border-2 border-dashed flex flex-wrap items-center gap-2 mb-6 transition-all ${
          status === 'correct'
            ? 'bg-emerald-50/60 border-emerald-400'
            : status === 'wrong'
            ? 'bg-red-50/60 border-red-300'
            : 'bg-gray-50 border-gray-200'
        }`}>
          {selectedChips.length === 0 ? (
            <span className="text-gray-400 text-sm italic">Chọn các khối từ bên dưới để ghép vào đây...</span>
          ) : (
            selectedChips.map(chip => (
              <button
                key={chip.id}
                onClick={() => handleDeselect(chip)}
                className="px-4 py-2.5 bg-white border border-emerald-300 text-emerald-950 font-serif text-2xl font-bold rounded-xl shadow-xs hover:border-red-300 hover:text-red-700 transition-all active:scale-95 cursor-pointer"
              >
                {chip.char}
              </button>
            ))
          )}
        </div>

        {/* Status banner */}
        {status === 'correct' && (
          <div className="mb-6 p-3 bg-emerald-100 text-emerald-800 rounded-xl flex items-center gap-2 text-sm font-bold animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            Chính xác! Rất tuyệt vời.
          </div>
        )}
        {status === 'wrong' && (
          <div className="mb-6 p-3 bg-red-100 text-red-800 rounded-xl flex items-center justify-between text-sm font-medium animate-in fade-in">
            <span>Chưa chính xác, hãy thử đổi vị trí các từ nhé!</span>
            <button
              onClick={handleReset}
              className="text-xs text-red-700 underline font-bold flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Xếp lại
            </button>
          </div>
        )}

        {/* Word Bank Chips */}
        <div className="flex flex-wrap gap-2.5 justify-center py-2 mb-6">
          {availableBank.map(chip => (
            <button
              key={chip.id}
              onClick={() => handleSelect(chip)}
              className="px-4 py-3 bg-white border-2 border-gray-200 hover:border-emerald-600 hover:bg-emerald-50 text-gray-800 hover:text-emerald-950 font-serif text-2xl font-bold rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer"
            >
              {chip.char}
            </button>
          ))}
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <button
            onClick={onSkip}
            className="text-xs font-semibold text-gray-400 hover:text-gray-700 flex items-center gap-1 cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5" /> Bỏ qua thử thách
          </button>

          {status === 'correct' ? (
            <button
              onClick={onComplete}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-transform active:scale-95"
            >
              Tiếp tục <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              disabled={selectedChips.length === 0}
              onClick={handleCheck}
              className="px-6 py-2.5 bg-[#1f5333] hover:bg-[#163f25] disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold rounded-xl shadow-sm transition-all cursor-pointer disabled:cursor-not-allowed"
            >
              Kiểm tra
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
