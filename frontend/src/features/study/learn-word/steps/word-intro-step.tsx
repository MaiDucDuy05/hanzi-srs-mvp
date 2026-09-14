import { useEffect } from 'react';
import { Vocabulary } from '@/lib/api/types';

import { Volume2, ArrowRight } from 'lucide-react';
import { speakText } from '@/lib/utils/tts';
import { html } from 'pinyin-pro';

interface WordIntroStepProps {
  vocabulary: Vocabulary;
  onNext: () => void;
}

export function WordIntroStep({ vocabulary, onNext }: WordIntroStepProps) {
  useEffect(() => {
    // Tự động phát âm khi load từ
    speakText(vocabulary.hanzi);
  }, [vocabulary.hanzi]);

  // Convert hanzi to html pinyin ruby tags if not already provided
  const hanziHtml = html(vocabulary.hanzi);
  
  // Example might look like "你好 - Xin chào" or just plain text.
  // We can try to parse it if needed, but for now we render it.
  // We can also use pinyin-pro for the Chinese part if possible.
  
  return (
    <div className="flex flex-col min-h-full w-full max-w-3xl mx-auto items-center text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
      
      {/* Decorative background blurs */}
      <div className="absolute top-1/4 left-1/4 w-48 h-48 bg-green-200/40 rounded-full blur-3xl pointer-events-none -z-10"></div>
      <div className="absolute bottom-1/4 right-1/4 w-56 h-56 bg-emerald-200/30 rounded-full blur-3xl pointer-events-none -z-10"></div>

      <div className="w-full bg-white/80 backdrop-blur-xl border border-white/50 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] rounded-3xl p-6 md:p-8 relative overflow-hidden mb-4">
        
        {vocabulary.partOfSpeech && (
          <div className="absolute top-4 right-4">
            <span className="bg-gradient-to-r from-emerald-500 to-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm">
              {vocabulary.partOfSpeech}
            </span>
          </div>
        )}

        <div className="mb-6 mt-4">
          <div 
            className="text-7xl md:text-8xl font-serif text-[#1a4a2b] mb-6 leading-normal tracking-wide [text-shadow:_0_4px_8px_rgb(0_0_0_/_5%)] [&>ruby]:gap-2 [&>ruby>rt]:text-xl [&>ruby>rt]:text-gray-500 [&>ruby>rt]:font-['Tahoma','Arial','sans-serif'] [&>ruby>rt]:font-medium [&>ruby>rt]:tracking-normal pt-4"
            dangerouslySetInnerHTML={{ __html: hanziHtml }}
          />
          
          <div className="flex items-center justify-center gap-4 mb-2">
            <button 
              className="rounded-full w-10 h-10 bg-gradient-to-tr from-green-50 to-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm border border-emerald-100 hover:scale-110 hover:shadow-md transition-all active:scale-95"
              onClick={() => speakText(vocabulary.hanzi)}
            >
              <Volume2 className="w-5 h-5 fill-current" />
            </button>
            <span className="text-2xl md:text-3xl font-black text-gray-800 tracking-tight">{vocabulary.meaningVi}</span>
          </div>
        </div>

        {vocabulary.example && (
          <div className="w-full bg-gradient-to-br from-gray-50 to-white border border-gray-100 p-5 rounded-2xl shadow-sm text-left relative overflow-hidden group hover:border-emerald-200 transition-colors">
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-emerald-400 to-green-500"></div>
            
            <div className="flex justify-between items-center mb-2">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                Ví dụ minh họa
              </p>
              <button 
                className="p-1.5 bg-white rounded-full text-emerald-500 shadow-sm border border-gray-100 opacity-70 group-hover:opacity-100 transition-opacity hover:bg-emerald-50"
                onClick={() => speakText(vocabulary.example?.split('-')[0] || vocabulary.example || '')}
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>

            <div className="text-lg md:text-xl text-gray-800 leading-relaxed font-serif">
              {vocabulary.example.split('-').map((part, index) => {
                if (index === 0) {
                  return (
                    <div key={index} className="mb-2 font-medium text-gray-900" dangerouslySetInnerHTML={{ __html: html(part.trim()) }} />
                  );
                }
                return (
                  <div key={index} className="text-base text-gray-500 font-sans mt-2 border-l-2 border-gray-200 pl-3">
                    {part.trim()}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <button 
        onClick={onNext}
        className="w-full max-w-sm bg-gradient-to-r from-[#1a4a2b] to-[#2c7a47] hover:from-[#133820] hover:to-[#1a4a2b] text-white py-4 text-lg rounded-2xl shadow-[0_10px_25px_-5px_rgba(44,122,71,0.4)] hover:shadow-[0_15px_30px_-5px_rgba(44,122,71,0.6)] hover:-translate-y-1 transition-all font-bold flex items-center justify-center gap-2 mt-auto"
      >
        Tiếp tục <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
}
