import { useState } from 'react';
import { Vocabulary } from '@/lib/api/types';

import { ArrowRight, Languages, Lightbulb, CheckCircle2 } from 'lucide-react';
import { html } from 'pinyin-pro';

interface ReverseTranslationStepProps {
  vocabulary: Vocabulary;
  onNext: () => void;
}

export function ReverseTranslationStep({ vocabulary, onNext }: ReverseTranslationStepProps) {
  const [answer, setAnswer] = useState('');
  const [isPassed, setIsPassed] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // Robustly extract Chinese sentence and Vietnamese hint
  let targetZh = vocabulary.hanzi;
  let hintVi = vocabulary.meaningVi;

  if (vocabulary.example) {
    const parts = vocabulary.example.split('-');
    if (parts.length >= 2) {
      const part0 = parts[0].trim();
      const part1 = parts[1].trim();
      // Part with Chinese characters is the target sentence
      if (/[\u4e00-\u9fa5]/.test(part0)) {
        targetZh = part0;
        hintVi = part1 || vocabulary.meaningVi;
      } else if (/[\u4e00-\u9fa5]/.test(part1)) {
        targetZh = part1;
        hintVi = part0 || vocabulary.meaningVi;
      }
    } else if (/[\u4e00-\u9fa5]/.test(vocabulary.example)) {
      targetZh = vocabulary.example.trim();
    }
  }

  const normalize = (text: string) => {
    return text.replace(/[，。！？\s\.,!\?]/g, '').toLowerCase();
  };

  const handleCheck = () => {
    const normAns = normalize(answer);
    const normTarget = normalize(targetZh);
    const normHanzi = normalize(vocabulary.hanzi);

    if (normAns && (normAns === normTarget || normAns === normHanzi)) {
      setIsPassed(true);
    } else {
      setShowHint(true);
    }
  };

  return (
    <div className="flex flex-col min-h-full w-full max-w-3xl mx-auto items-center animate-in fade-in slide-in-from-bottom-8 duration-700 relative">
      
      {/* Decorative background blurs */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400/5 rounded-full blur-3xl pointer-events-none -z-10"></div>
      <div className="absolute bottom-1/4 left-0 w-72 h-72 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none -z-10"></div>

      <div className="w-full bg-white/80 backdrop-blur-xl border border-white/50 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] rounded-3xl p-6 md:p-8 mb-4">
        
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="p-3 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl shadow-sm border border-emerald-100 mb-4">
            <Languages className="w-6 h-6 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-black text-[#1a4a2b] tracking-tight mb-2">Dịch sang tiếng Trung</h2>
          <p className="text-gray-500 text-base">
            Dựa vào nghĩa tiếng Việt, hãy viết lại câu tiếng Trung gốc.
          </p>
        </div>

        <div className="w-full bg-gradient-to-r from-gray-50 to-white border-2 border-dashed border-emerald-300 rounded-2xl shadow-sm p-4 md:p-6 mb-6 text-center relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-400"></div>
          <h3 className="text-xl md:text-2xl font-black text-gray-800 tracking-tight leading-relaxed">{hintVi}</h3>
        </div>

        <div className="w-full relative mb-6 group">
          <input
            value={answer}
            onChange={(e) => {
              setAnswer(e.target.value);
              setIsPassed(false);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                if (isPassed) {
                  onNext();
                } else if (answer.trim()) {
                  handleCheck();
                }
              }
            }}
            placeholder="Gõ tiếng Trung vào đây..."
            className="w-full bg-white border-2 border-gray-100 rounded-xl px-6 py-4 text-xl outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/20 transition-all text-center font-serif text-gray-800 placeholder:font-sans placeholder:text-gray-300 shadow-sm"
          />
          {isPassed && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500 animate-in zoom-in">
              <div className="bg-emerald-50 p-1 rounded-full">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>
          )}
        </div>

        {showHint && !isPassed && (
          <div className="w-full bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-4 mb-4 shadow-sm animate-in zoom-in-95 duration-300 max-h-[120px] overflow-y-auto">
            <div className="flex items-center gap-2 text-yellow-600 font-black mb-2 text-sm">
              <Lightbulb className="w-5 h-5" /> Gợi ý:
            </div>
            <div 
              className="text-xl md:text-2xl text-gray-800 tracking-wider text-center font-serif [&>ruby]:gap-1 [&>ruby>rt]:text-sm [&>ruby>rt]:text-gray-500 [&>ruby>rt]:font-['Tahoma','Arial','sans-serif'] [&>ruby>rt]:tracking-normal pt-2"
              dangerouslySetInnerHTML={{ __html: html(targetZh) }}
            />
          </div>
        )}
      </div>

      <div className="flex flex-col items-center gap-2 w-full mt-auto">
        <div className="flex gap-3 w-full">
          {!isPassed ? (
            <>
              <button 
                type="button"
                onClick={() => setShowHint(true)}
                className="flex-1 py-3.5 text-base sm:text-lg rounded-2xl font-bold border-2 border-gray-200 text-gray-600 bg-white hover:bg-gray-50 hover:border-gray-300 shadow-sm transition-all cursor-pointer"
              >
                Xem gợi ý
              </button>
              <button 
                type="button"
                onClick={handleCheck}
                disabled={!answer.trim()}
                className="flex-1 bg-gray-900 hover:bg-black text-white py-3.5 text-base sm:text-lg rounded-2xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.3)] hover:shadow-[0_15px_30px_-5px_rgba(0,0,0,0.4)] hover:-translate-y-0.5 transition-all font-bold disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:shadow-none cursor-pointer"
              >
                Kiểm tra
              </button>
            </>
          ) : (
            <button 
              type="button"
              onClick={onNext}
              className="w-full bg-[#1f5333] hover:bg-[#163f26] text-white py-3.5 text-base sm:text-lg rounded-2xl shadow-[0_10px_25px_-5px_rgba(31,83,51,0.4)] hover:shadow-[0_15px_30px_-5px_rgba(31,83,51,0.6)] hover:-translate-y-0.5 transition-all font-bold flex items-center justify-center gap-2 animate-in fade-in duration-500 cursor-pointer"
            >
              Hoàn thành từ này <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>

        {!isPassed && (
          <button
            type="button"
            onClick={onNext}
            className="text-xs font-semibold text-gray-500 hover:text-gray-800 py-1 transition-colors cursor-pointer"
          >
            Bỏ qua bước dịch này →
          </button>
        )}
      </div>
    </div>
  );
}
