import { useState, useEffect } from 'react';
import { Vocabulary } from '@/lib/api/types';

import { BookOpen, Loader2, PlayCircle, Trophy, Settings, Sparkles } from 'lucide-react';
import { apiFetch } from '@/lib/api/client';
import { html } from 'pinyin-pro';
import { speakText } from '@/lib/utils/tts';

interface StorySummaryProps {
  vocabularies: Vocabulary[];
  onClose: () => void;
}

export function StorySummary({ vocabularies, onClose }: StorySummaryProps) {
  const [configMode, setConfigMode] = useState(true);
  const [topic, setTopic] = useState('Giao tiếp hàng ngày');
  const [level, setLevel] = useState('HSK 1');
  
  const [storyZh, setStoryZh] = useState('');
  const [storyVi, setStoryVi] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchStory = async () => {
    setConfigMode(false);
    setLoading(true);
    
    try {
      const words = vocabularies.map(v => v.hanzi);
      // Gọi API sinh truyện từ LLM, truyền thêm topic và level
      const res = await apiFetch<{ storyZh: string; storyVi: string }>('/study/generate-story', { 
        method: 'POST', 
        body: JSON.stringify({ words, topic, level }) 
      });
      setStoryZh(res.storyZh);
      setStoryVi(res.storyVi);
    } catch (error) {
      console.warn('Failed to generate story, using fallback', error);
      // Fallback demo
      const fallbackZh = `今天天气很好。我学习了这些词：${vocabularies.map(v => v.hanzi).join('，')}。`;
      const fallbackVi = `Hôm nay thời tiết rất đẹp. Tôi đã học những từ này: ${vocabularies.map(v => v.meaningVi).join(', ')}.`;
      setStoryZh(fallbackZh);
      setStoryVi(fallbackVi);
    } finally {
      setLoading(false);
    }
  };

  if (configMode) {
    return (
      <div className="flex flex-col h-full w-full max-w-xl mx-auto items-center justify-center animate-in fade-in slide-in-from-bottom-8 duration-700 relative pb-4">
        
        {/* Decorative background blurs */}
        <div className="absolute top-10 right-1/4 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none -z-10"></div>
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-green-400/10 rounded-full blur-3xl pointer-events-none -z-10"></div>

        <div className="text-center mb-8 mt-4">
          <div className="inline-block p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-full shadow-sm border border-emerald-100 mb-6">
            <Settings className="w-12 h-12 text-emerald-600 drop-shadow-sm" />
          </div>
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#1a4a2b] to-[#2c7a47] tracking-tight mb-3">
            Tạo câu chuyện ôn tập
          </h1>
          <p className="text-gray-500 text-base max-w-md mx-auto">
            Cấu hình chủ đề và độ khó để AI tạo ra câu chuyện phù hợp nhất dành cho bạn, sử dụng các từ vựng vừa học.
          </p>
        </div>

        <div className="w-full bg-white/90 backdrop-blur-xl border border-white/60 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] rounded-3xl p-8 mb-8 relative">
          
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-2">Chủ đề mong muốn</label>
            <input 
              type="text" 
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="VD: Mua sắm, Du lịch, Công sở..."
              className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/20 transition-all font-medium text-gray-800"
            />
          </div>

          <div className="mb-2">
            <label className="block text-sm font-bold text-gray-700 mb-2">Độ khó (Level)</label>
            <select 
              value={level}
              onChange={e => setLevel(e.target.value)}
              className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/20 transition-all font-medium text-gray-800 appearance-none bg-white"
            >
              <option value="HSK 1">HSK 1 (Rất dễ)</option>
              <option value="HSK 2">HSK 2 (Dễ)</option>
              <option value="HSK 3">HSK 3 (Trung bình)</option>
              <option value="HSK 4">HSK 4 (Khó vừa)</option>
              <option value="HSK 5">HSK 5 (Khó)</option>
              <option value="HSK 6">HSK 6 (Rất khó)</option>
            </select>
          </div>

        </div>

        <button 
          onClick={fetchStory}
          className="w-full bg-gradient-to-r from-[#1a4a2b] to-[#2c7a47] hover:from-[#133820] hover:to-[#1a4a2b] text-white py-4 text-lg rounded-2xl shadow-[0_10px_25px_-5px_rgba(44,122,71,0.4)] hover:shadow-[0_15px_30px_-5px_rgba(44,122,71,0.6)] hover:-translate-y-1 transition-all font-bold flex items-center justify-center gap-2 mt-auto shrink-0"
        >
          <Sparkles className="w-5 h-5" /> Bắt đầu tạo truyện
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col h-full items-center justify-center bg-transparent animate-in fade-in relative">
        <div className="absolute top-10 right-1/4 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none -z-10"></div>
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-green-400/10 rounded-full blur-3xl pointer-events-none -z-10"></div>

        <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.08)] rounded-3xl p-10 flex flex-col items-center max-w-md w-full text-center">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-emerald-100 rounded-full animate-ping opacity-70"></div>
            <div className="relative bg-gradient-to-br from-emerald-50 to-teal-50 p-4 rounded-full border border-emerald-100">
              <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
            </div>
          </div>
          <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#1a4a2b] to-[#2c7a47] tracking-tight mb-3">
            Đang gợi ý câu chuyện để ôn tập...
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full max-w-6xl mx-auto items-center justify-center animate-in fade-in slide-in-from-bottom-8 duration-700 relative pb-4">
      
      {/* Decorative background blurs */}
      <div className="absolute top-10 right-1/4 w-80 h-80 bg-yellow-400/10 rounded-full blur-3xl pointer-events-none -z-10"></div>
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none -z-10"></div>

      <div className="text-center mb-6 mt-2">
        <h1 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#1a4a2b] to-[#2c7a47] tracking-tight mb-2">
          Tuyệt vời! Bạn đã học xong.
        </h1>
        <p className="text-gray-500 text-base md:text-lg max-w-2xl mx-auto">
          Đọc câu chuyện dưới đây để ôn lại toàn bộ từ vựng nhé.
        </p>
      </div>

      <div className="w-full bg-white/90 backdrop-blur-xl border border-white/60 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.08)] rounded-3xl overflow-hidden flex flex-col mb-4 relative max-h-[50vh]">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-400 to-green-500"></div>
        
        <div className="p-6 md:p-8 flex flex-col h-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4 border-b border-gray-100 pb-4 shrink-0">
            <h3 className="text-xl font-black flex items-center gap-2 text-gray-800 tracking-tight">
              <div className="p-1.5 bg-emerald-50 rounded-lg">
                <BookOpen className="w-5 h-5 text-emerald-600" />
              </div>
              Câu chuyện ôn tập
            </h3>
            <button 
              className="flex items-center justify-center px-4 py-2 text-sm bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 font-bold rounded-lg border border-emerald-100 hover:scale-105 hover:shadow-md transition-all active:scale-95"
              onClick={() => speakText(storyZh)}
            >
              <PlayCircle className="w-4 h-4 mr-2" /> Nghe đọc toàn bộ
            </button>
          </div>
          
          <div className="overflow-y-auto pr-2 pb-2 -mr-2 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div 
              className="text-xl md:text-2xl font-serif text-gray-800 leading-[3rem] text-justify tracking-wide [&>ruby]:gap-2 [&>ruby>rt]:text-sm [&>ruby>rt]:text-gray-500 [&>ruby>rt]:font-['Tahoma','Arial','sans-serif'] [&>ruby>rt]:font-medium [&>ruby>rt]:tracking-normal"
              dangerouslySetInnerHTML={{ __html: html(storyZh) }}
            />

            <div className="bg-gray-50/80 rounded-2xl p-6 border border-gray-100/50 relative group hover:border-emerald-200 transition-colors h-fit">
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-gray-300 to-gray-400 group-hover:from-emerald-400 group-hover:to-green-500 transition-colors rounded-l-2xl"></div>
              <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                Bản dịch tiếng Việt
              </h4>
              <p className="text-base text-gray-600 leading-relaxed font-sans italic">
                {storyVi}
              </p>
            </div>
          </div>
        </div>
      </div>

      <button 
        onClick={onClose}
        className="w-full max-w-sm mx-auto bg-gradient-to-r from-[#1a4a2b] to-[#2c7a47] hover:from-[#133820] hover:to-[#1a4a2b] text-white py-4 text-lg rounded-2xl shadow-[0_10px_25px_-5px_rgba(44,122,71,0.4)] hover:shadow-[0_15px_30px_-5px_rgba(44,122,71,0.6)] hover:-translate-y-1 transition-all font-bold mt-auto shrink-0"
      >
        Hoàn tất bài học
      </button>
    </div>
  );
}
