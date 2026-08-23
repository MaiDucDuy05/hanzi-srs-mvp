'use client';

import React, { useState } from 'react';
import { GrammarPoint } from '@/lib/api/types';
import { apiFetch } from '@/lib/api/client';
import { html } from 'pinyin-pro';
import { Loader2, Sparkles, Trophy } from 'lucide-react';
import { speakText } from '@/lib/utils/tts';

interface GrammarSummaryProps {
  grammarPoints: GrammarPoint[];
  onClose: () => void;
}

interface StoryResult {
  storyZh: string;
  storyVi: string;
}

export function GrammarSummary({ grammarPoints, onClose }: GrammarSummaryProps) {
  const [configMode, setConfigMode] = useState(true);
  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState('HSK 3');
  
  const [story, setStory] = useState<StoryResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    
    setConfigMode(false);
    setIsLoading(true);

    try {
      const data = await apiFetch('/study/grammar-story', {
        method: 'POST',
        body: JSON.stringify({
          grammarTitles: grammarPoints.map(g => g.title),
          topic,
          level,
        }),
      });
      setStory(data as StoryResult);
    } catch (error) {
      console.error(error);
      setConfigMode(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (configMode) {
    return (
      <div className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[70vh] p-8 items-center justify-center">
        <div className="w-full max-w-md text-center">
          <Trophy className="w-20 h-20 text-[#8BC34A] mx-auto mb-6" />
          <h2 className="text-3xl font-black text-gray-800 mb-4">Hoàn thành bài ngữ pháp!</h2>
          <p className="text-gray-500 mb-8">
            Tuyệt vời! Bạn vừa học xong {grammarPoints.length} cấu trúc ngữ pháp. Hãy để AI viết một câu chuyện thú vị áp dụng tất cả các ngữ pháp này nhé.
          </p>
          
          <div className="space-y-4 text-left bg-gray-50 p-6 rounded-2xl border border-gray-100 mb-8">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Chủ đề câu chuyện</label>
              <input 
                type="text" 
                value={topic}
                onChange={e => setTopic(e.target.value)}
                placeholder="VD: Đi siêu thị, Du lịch Bắc Kinh..."
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#8BC34A] focus:ring-0 outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Độ khó (Level)</label>
              <select 
                value={level}
                onChange={e => setLevel(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#8BC34A] focus:ring-0 outline-none transition-colors"
              >
                {['HSK 1', 'HSK 2', 'HSK 3', 'HSK 4', 'HSK 5', 'HSK 6'].map(l => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={!topic.trim()}
            className="w-full py-4 bg-gradient-to-r from-[#8BC34A] to-[#689F38] text-white font-bold rounded-2xl text-lg shadow-[0_8px_30px_rgb(139,195,74,0.3)] transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-5 h-5" /> Bắt đầu tạo truyện
          </button>
        </div>
      </div>
    );
  }

  if (isLoading || !story) {
    return (
      <div className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[70vh] items-center justify-center">
        <Loader2 className="w-16 h-16 text-[#8BC34A] animate-spin mb-6" />
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Đang sáng tác...</h3>
        <p className="text-gray-500 animate-pulse">AI đang dệt nên câu chuyện với các ngữ pháp bạn vừa học!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[70vh]">
      <div className="p-8 pb-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-gray-800 mb-2">Tổng kết Ngữ pháp</h2>
          <p className="text-gray-500">Câu chuyện: {topic}</p>
        </div>
        <button 
          onClick={onClose}
          className="px-6 py-2 bg-gray-900 text-white font-bold rounded-full hover:bg-gray-800 transition-colors"
        >
          Hoàn thành
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-8 bg-white">
        <div className="max-w-6xl mx-auto flex flex-col h-full">
          <div className="flex-1 bg-gradient-to-b from-emerald-50/50 to-transparent p-8 rounded-3xl border border-emerald-50 relative">
            <h3 className="text-sm font-black text-emerald-600 uppercase tracking-widest mb-6">
              Bản tiếng Trung
            </h3>
            
            <div className="overflow-y-auto pr-2 pb-2 -mr-2 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              <div 
                className="text-xl md:text-2xl font-serif text-gray-800 leading-[3rem] text-justify tracking-wide [&>ruby]:gap-2 [&>ruby>rt]:text-sm [&>ruby>rt]:text-gray-500 [&>ruby>rt]:font-['Tahoma','Arial','sans-serif'] [&>ruby>rt]:font-medium [&>ruby>rt]:tracking-normal"
                dangerouslySetInnerHTML={{ __html: html(story.storyZh) }}
              />

              <div className="bg-white/80 rounded-2xl p-6 border border-gray-100/50 relative group hover:border-emerald-200 transition-colors h-fit shadow-sm">
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-gray-300 to-gray-400 group-hover:from-emerald-400 group-hover:to-green-500 transition-colors rounded-l-2xl"></div>
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  Bản dịch tiếng Việt
                </h4>
                <p className="text-base text-gray-600 leading-relaxed font-sans italic">
                  {story.storyVi}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
