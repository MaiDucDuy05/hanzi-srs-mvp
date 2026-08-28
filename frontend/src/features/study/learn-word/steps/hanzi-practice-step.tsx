import { useState, useRef, useEffect } from 'react';
import { Vocabulary } from '@/lib/api/types';

import { ArrowRight, PenTool } from 'lucide-react';
import { HanziWriterCanvas } from '@/features/games/components/hanzi-writer-canvas';
import { HanziWriterAnimation } from '@/features/games/components/hanzi-writer-animation';

interface HanziPracticeStepProps {
  vocabulary: Vocabulary;
  onNext: () => void;
}

export function HanziPracticeStep({ vocabulary, onNext }: HanziPracticeStepProps) {
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [completedChars, setCompletedChars] = useState<Record<number, boolean>>({});
  const [key, setKey] = useState(0); // for clearing canvas

  const chars = Array.from(vocabulary.hanzi || '');
  const currentChar = chars[currentCharIndex];
  const isAllCompleted = chars.length > 0 && Object.keys(completedChars).length === chars.length;

  const handleCompleteChar = () => {
    setCompletedChars(prev => ({ ...prev, [currentCharIndex]: true }));
    if (currentCharIndex < chars.length - 1) {
      setTimeout(() => setCurrentCharIndex(prev => prev + 1), 500);
    }
  };

  const clearCanvas = () => setKey(k => k + 1);

  // Skip this step if no Hanzi (e.g. only Pinyin somehow)
  useEffect(() => {
    if (chars.length === 0) {
      onNext();
    }
  }, [chars.length, onNext]);

  return (
    <div className="flex flex-col min-h-full items-center animate-in fade-in slide-in-from-bottom-8 duration-700 w-full relative">
      
      {/* Decorative background blurs */}
      <div className="absolute top-10 left-10 w-48 h-48 bg-[#8b7e66]/10 rounded-full blur-3xl pointer-events-none -z-10"></div>
      <div className="absolute bottom-10 right-10 w-48 h-48 bg-[#4caf50]/10 rounded-full blur-3xl pointer-events-none -z-10"></div>

      <div className="w-full bg-white/70 backdrop-blur-xl border border-white/60 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] rounded-3xl p-6 md:p-8 mb-4 flex flex-col items-center">
        
        <div className="flex items-center gap-2 mb-6 text-center">
          <div className="p-2 bg-gradient-to-br from-[#f0ebe1] to-white rounded-xl shadow-sm border border-[#e8e4d9]">
            <PenTool className="w-5 h-5 text-[#5a5038]" />
          </div>
          <h2 className="text-2xl font-black text-[#2c281e] tracking-tight">Luyện viết chữ Hán</h2>
        </div>

        <div className="flex gap-2 mb-6">
          {chars.map((char, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentCharIndex(idx)}
              className={`w-12 h-12 text-2xl font-serif rounded-xl flex items-center justify-center transition-all duration-300 ${
                idx === currentCharIndex
                  ? 'border-2 border-[#8BC34A] bg-gradient-to-br from-[#8BC34A]/20 to-[#8BC34A]/5 text-[#1f5333] shadow-[0_8px_16px_-4px_rgba(139,195,74,0.3)] scale-110'
                  : completedChars[idx]
                  ? 'border border-gray-200 bg-gray-50/80 text-gray-400'
                  : 'border border-[#d0c9b7] bg-white text-gray-700 hover:border-[#8BC34A]/50 hover:bg-[#8BC34A]/5 hover:-translate-y-1'
              }`}
            >
              {char}
            </button>
          ))}
        </div>

        <div className="flex flex-col md:flex-row gap-6 justify-center items-start w-full max-w-3xl">
          
          <div className="flex flex-col items-center flex-1">
            <div className="relative bg-[#fdfbf7] border-2 border-[#d0c9b7] rounded-2xl w-[220px] h-[220px] shadow-sm flex items-center justify-center overflow-hidden group hover:border-[#a3977c] transition-colors">
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-0 w-full border-t border-dashed border-[#d0c9b7]" />
                <div className="absolute left-1/2 top-0 h-full border-l border-dashed border-[#d0c9b7]" />
                <div className="absolute top-0 left-0 w-full h-full border-[1px] border-[#d0c9b7]/30 scale-[0.9]" />
                <div className="absolute top-0 left-0 w-full h-full border-[1px] border-[#d0c9b7]/30 scale-[0.8]" />
              </div>
              
              <div className="relative z-10 scale-110">
                {currentChar && !completedChars[currentCharIndex] ? (
                  <HanziWriterCanvas
                    key={`${currentChar}-${key}`}
                    char={currentChar}
                    size={200}
                    onComplete={handleCompleteChar}
                  />
                ) : (
                  <div className="text-7xl font-serif text-transparent bg-clip-text bg-gradient-to-b from-[#4caf50] to-[#2e7d32] opacity-80">{currentChar}</div>
                )}
              </div>
            </div>
            <button 
              onClick={clearCanvas} 
              disabled={completedChars[currentCharIndex]}
              className="mt-4 px-6 py-2 text-sm bg-white border border-[#e8e4d9] rounded-full font-bold text-[#7a6f58] hover:bg-[#f9f8f5] hover:text-[#5a5038] hover:border-[#d0c9b7] transition-all shadow-sm disabled:opacity-40 disabled:hover:bg-white flex items-center gap-2"
            >
              Viết lại nét sai
            </button>
          </div>

          <div className="bg-gradient-to-b from-[#f9f8f5] to-[#f4f1e8] border border-[#e8e4d9] p-5 rounded-2xl shadow-sm w-full md:w-[200px] flex flex-col items-center">
            <h3 className="text-[11px] font-black text-[#8b7e66] uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8BC34A]"></span>
              Gợi ý nét viết
            </h3>
            <div className="relative bg-white border-2 border-[#d0c9b7] rounded-xl w-[140px] h-[140px] shadow-sm overflow-hidden">
              <div className="absolute inset-0 pointer-events-none opacity-60">
                <div className="absolute top-1/2 left-0 w-full border-t border-dashed border-[#d0c9b7]" />
                <div className="absolute left-1/2 top-0 h-full border-l border-dashed border-[#d0c9b7]" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center scale-90">
                {currentChar && <HanziWriterAnimation char={currentChar} speed="normal" />}
              </div>
            </div>
          </div>
          
        </div>
      </div>

      <button 
        onClick={onNext}
        disabled={!isAllCompleted}
        className="w-full max-w-sm bg-gradient-to-r from-[#1a4a2b] to-[#2c7a47] hover:from-[#133820] hover:to-[#1a4a2b] text-white py-4 text-lg rounded-2xl shadow-[0_10px_25px_-5px_rgba(44,122,71,0.4)] hover:shadow-[0_15px_30px_-5px_rgba(44,122,71,0.6)] hover:-translate-y-1 transition-all font-bold flex items-center justify-center gap-2 mt-auto disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-[0_10px_25px_-5px_rgba(44,122,71,0.4)]"
      >
        Tiếp tục <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
}
