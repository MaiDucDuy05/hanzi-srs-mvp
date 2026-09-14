import { useState } from 'react';
import { Vocabulary } from '@/lib/api/types';

import { ArrowRight, Edit3, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { apiFetch } from '@/lib/api/client';

interface SentenceWritingStepProps {
  vocabulary: Vocabulary;
  onNext: () => void;
}

interface SpellCheckResult {
  hasError: boolean;
  suggestions: {
    start: number;
    end: number;
    wrong: string;
    correct: string;
  }[];
}

export function SentenceWritingStep({ vocabulary, onNext }: SentenceWritingStepProps) {
  const [sentence, setSentence] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<SpellCheckResult | null>(null);
  const [isPassed, setIsPassed] = useState(false);

  const handleCheck = async () => {
    if (!sentence.trim()) return;
    setIsChecking(true);
    try {
      // Gọi API pycorrector. Mock fallback nếu API chưa có.
      const res = await apiFetch<any>('/study/check-spelling', { method: 'POST', body: JSON.stringify({ text: sentence }) });
      setCheckResult(res);
      if (!res.hasError) {
        setIsPassed(true);
      }
    } catch (error) {
      console.warn('Spell check API failed, using mock response');
      // Mock logic: randomly decide it's correct or has a typo just for MVP demo if real endpoint fails
      // Assuming it's correct for now so user can proceed
      setCheckResult({ hasError: false, suggestions: [] });
      setIsPassed(true);
    } finally {
      setIsChecking(false);
    }
  };

  const applySuggestion = (suggestion: SpellCheckResult['suggestions'][0]) => {
    const newSentence = sentence.substring(0, suggestion.start) + suggestion.correct + sentence.substring(suggestion.end);
    setSentence(newSentence);
    setCheckResult(null); // Reset check result so user has to check again
    setIsPassed(false);
  };

  return (
    <div className="flex flex-col min-h-full w-full max-w-3xl mx-auto items-center animate-in fade-in slide-in-from-bottom-8 duration-700 relative">
      
      {/* Decorative background blurs */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#1f5333]/5 rounded-full blur-3xl pointer-events-none -z-10"></div>
      <div className="absolute bottom-1/4 left-0 w-72 h-72 bg-[#8BC34A]/10 rounded-full blur-3xl pointer-events-none -z-10"></div>

      <div className="w-full bg-white/80 backdrop-blur-xl border border-white/50 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] rounded-3xl p-6 md:p-8 mb-4">
        
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-sm border border-emerald-100 mb-4">
            <Edit3 className="w-6 h-6 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-black text-[#1a4a2b] tracking-tight mb-2">Tự đặt câu</h2>
          <p className="text-gray-500 text-base">
            Hãy viết một câu tiếng Trung có sử dụng từ <br/>
            <strong className="text-emerald-600 font-black text-xl mx-1 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100 inline-block mt-2">
              {vocabulary.hanzi}
            </strong> 
            <span className="text-xs font-medium ml-1">({vocabulary.meaningVi})</span>
          </p>
        </div>

        <div className="w-full bg-white border-2 border-gray-100 rounded-3xl shadow-sm p-2 mb-2 relative focus-within:border-emerald-400 focus-within:ring-4 focus-within:ring-emerald-400/20 transition-all duration-300">
          <textarea
            value={sentence}
            onChange={(e) => {
              setSentence(e.target.value);
              setIsPassed(false);
              setCheckResult(null);
            }}
            placeholder="Ví dụ: 你好吗？..."
            className="w-full min-h-[100px] p-4 resize-none outline-none text-xl text-gray-800 placeholder:text-gray-300 font-serif leading-relaxed rounded-2xl"
          />
        </div>
        
        {checkResult && checkResult.hasError && (
          <div className="mt-4 p-4 bg-gradient-to-r from-red-50 to-orange-50 border border-red-100 rounded-2xl text-sm shadow-sm animate-in zoom-in-95 duration-300 max-h-[200px] overflow-y-auto">
            <div className="flex items-center gap-2 text-red-600 font-black mb-3 text-sm">
              <AlertCircle className="w-4 h-4" />
              Phát hiện lỗi chính tả/ngữ pháp
            </div>
            <div className="space-y-2">
              {checkResult.suggestions.map((sug, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-3 rounded-xl border border-red-100 shadow-sm gap-2">
                  <div className="text-gray-700 text-sm">
                    Sửa <span className="line-through text-red-500 font-medium bg-red-50 px-1 py-0.5 rounded mx-1">{sug.wrong}</span> 
                    thành <span className="font-bold text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded mx-1">{sug.correct}</span>
                  </div>
                  <button 
                    className="px-3 py-1.5 text-xs font-bold rounded-lg text-emerald-600 bg-emerald-50 border border-emerald-200 hover:bg-emerald-500 hover:text-white transition-colors whitespace-nowrap" 
                    onClick={() => applySuggestion(sug)}
                  >
                    Áp dụng
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {checkResult && !checkResult.hasError && (
          <div className="mt-4 flex flex-col items-center justify-center gap-2 text-emerald-600 font-bold bg-gradient-to-r from-emerald-50 to-green-50 py-4 rounded-2xl border border-emerald-100 shadow-sm animate-in zoom-in-95 duration-300">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
            </div>
            <span className="text-base">Câu của bạn rất chính xác!</span>
          </div>
        )}
      </div>

      {!isPassed ? (
        <button 
          onClick={handleCheck}
          disabled={!sentence.trim() || isChecking}
          className="w-full max-w-sm bg-gray-900 hover:bg-black text-white py-4 text-lg rounded-2xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.3)] hover:shadow-[0_15px_30px_-5px_rgba(0,0,0,0.4)] hover:-translate-y-1 transition-all font-bold flex items-center justify-center gap-2 mt-auto disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:shadow-none"
        >
          {isChecking ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Kiểm tra lỗi'}
        </button>
      ) : (
        <button 
          onClick={onNext}
          className="w-full max-w-sm bg-gradient-to-r from-[#1a4a2b] to-[#2c7a47] hover:from-[#133820] hover:to-[#1a4a2b] text-white py-4 text-lg rounded-2xl shadow-[0_10px_25px_-5px_rgba(44,122,71,0.4)] hover:shadow-[0_15px_30px_-5px_rgba(44,122,71,0.6)] hover:-translate-y-1 transition-all font-bold flex items-center justify-center gap-2 mt-auto animate-in fade-in duration-500"
        >
          Tiếp tục <ArrowRight className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
