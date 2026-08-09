'use client';

import React, { useState } from 'react';

const VOCAB_DATA = [
  { id: 1, hanzi: '你好', pinyin: 'nǐ hǎo', meaning: 'Hello / Hi', example: '你好，朋友！(Chào bạn!)', type: 'vocab', partOfSpeech: 'Greeting', masteryLevel: 2 },
  { id: 2, hanzi: '书', pinyin: 'shū', meaning: 'Book', example: '我喜欢看书。(I like reading books.)', type: 'vocab', partOfSpeech: 'Noun', masteryLevel: 1 },
  { id: 3, hanzi: '学习', pinyin: 'xuéxí', meaning: 'To learn / To study', example: '学习中文。(Study Chinese.)', type: 'vocab', partOfSpeech: 'Verb', masteryLevel: 3 },
  { id: 4, hanzi: '大', pinyin: 'dà', meaning: 'Big / Large', example: '这个苹果很大。(This apple is very big.)', type: 'vocab', partOfSpeech: 'Adjective', masteryLevel: 2 },
  { id: 5, hanzi: '谢谢', pinyin: 'xièxiè', meaning: 'Thank you', example: '谢谢你的帮助。(Thank you for your help.)', type: 'vocab', partOfSpeech: 'Phrase', masteryLevel: 4 },
  { id: 6, hanzi: '吗', pinyin: 'ma', meaning: 'Question particle', example: '你好吗？(Bạn khỏe không?)', type: 'grammar', status: 'Not Studied' },
  { id: 7, hanzi: '是...的', pinyin: 'shì...de', meaning: 'The "Shi... De" Structure', example: 'Emphasize details of a past event.', type: 'grammar', hsk: 'HSK 2', status: 'Needs Review' },
  { id: 8, hanzi: '了', pinyin: 'le', meaning: 'The Particle "Le"', example: 'Indicate a completed action.', type: 'grammar', hsk: 'HSK 1', status: 'Understood' },
];

export function StudyLessonFeature({ params }: { params: Promise<{ lessonId: string }> }) {
  const resolvedParams = React.use(params);
  
  const [mode, setMode] = useState<'list' | 'flashcard'>('list');
  const [listTab, setListTab] = useState<'vocab' | 'grammar'>('vocab');
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const currentCard = VOCAB_DATA[currentIndex];

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
      if (currentIndex === VOCAB_DATA.length - 1) {
        setMode('list');
        setCurrentIndex(0);
      } else {
        setCurrentIndex((prev) => prev + 1);
      }
    }, 200);
  };

  if (mode === 'list') {
    const vocabList = VOCAB_DATA.filter(item => item.type === 'vocab');
    const grammarList = VOCAB_DATA.filter(item => item.type === 'grammar');
    
    return (
      <div className="w-full flex flex-col pt-0 pb-32 px-4 relative">
        <div className="w-full max-w-5xl mx-auto bg-white rounded-3xl shadow-sm p-6 sm:p-10 min-h-[600px] relative z-10">
          
          {/* Tab Switcher */}
          <div className="flex gap-4 mb-8 justify-center">
            <button 
              onClick={() => setListTab('vocab')} 
              className={`px-8 py-3 rounded-full font-bold transition-all border-2 ${listTab === 'vocab' ? 'bg-white border-gray-100 shadow-sm text-[#215b3b]' : 'bg-[#f9f9f9] border-transparent text-gray-500 hover:bg-gray-100'}`}
            >
              Từ vựng ({vocabList.length})
            </button>
            <button 
              onClick={() => setListTab('grammar')} 
              className={`px-8 py-3 rounded-full font-bold transition-all border-2 ${listTab === 'grammar' ? 'bg-white border-gray-100 shadow-sm text-[#215b3b]' : 'bg-[#f9f9f9] border-transparent text-gray-500 hover:bg-gray-100'}`}
            >
              Ngữ pháp ({grammarList.length})
            </button>
          </div>

          {/* Filters (only for Vocab) */}
          {listTab === 'vocab' && (
            <div className="flex flex-col lg:flex-row gap-4 mb-10">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input 
                  type="text" 
                  placeholder="Search Chinese words, pinyin, meaning..." 
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8BC34A] focus:border-transparent font-medium"
                />
              </div>
              <div className="flex gap-4">
                <select className="px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-600 font-medium focus:outline-none cursor-pointer">
                  <option>HSK Level: All</option>
                </select>
                <select className="px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-600 font-medium focus:outline-none cursor-pointer">
                  <option>Tag: All</option>
                </select>
                <select className="px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-600 font-medium focus:outline-none cursor-pointer">
                  <option>Mastery: All</option>
                </select>
              </div>
            </div>
          )}

          {/* Title */}
          <div className="mb-8">
            <h1 className="text-2xl font-black text-[#111] mb-2 font-heading">
              {listTab === 'vocab' ? 'Vocabulary Library List' : 'Grammar Points'}
            </h1>
            <p className="text-gray-500 text-sm">
              {listTab === 'vocab' ? 'Your personal collection of Chinese words and phrases' : 'Key grammar structures to master'}
            </p>
          </div>

          {listTab === 'vocab' ? (
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#f9fdf5] text-xs font-bold text-[#4a6b38] uppercase tracking-wider border-b-2 border-white">
                    <th className="p-4 rounded-tl-xl whitespace-nowrap">Hanzi <span className="inline-block ml-1 opacity-50">↕</span></th>
                    <th className="p-4 whitespace-nowrap">Pinyin <span className="inline-block ml-1 opacity-50">↕</span></th>
                    <th className="p-4 whitespace-nowrap">Meaning <span className="inline-block ml-1 opacity-50">↕</span></th>
                    <th className="p-4 whitespace-nowrap">Part of Speech <span className="inline-block ml-1 opacity-50">↕</span></th>
                    <th className="p-4 whitespace-nowrap">Mastery Level <span className="inline-block ml-1 opacity-50">↕</span></th>
                    <th className="p-4 rounded-tr-xl text-center whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {vocabList.map((item) => (
                    <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <span className="text-3xl font-bold text-[#111]">{item.hanzi}</span>
                      </td>
                      <td className="p-4">
                        <span className="text-base font-semibold text-[#215b3b]">{item.pinyin}</span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm font-bold text-gray-700">{item.meaning}</span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm font-bold text-gray-500">{item.partOfSpeech}</span>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-1 items-end h-6">
                          {[1, 2, 3, 4].map(level => (
                            <div 
                              key={level} 
                              className={`w-3 rounded-sm ${level <= (item.masteryLevel || 0) ? 'bg-[#8BC34A]' : 'bg-[#e5f5eb]'}`}
                              style={{ height: `${25 + (level - 1) * 25}%` }}
                            ></div>
                          ))}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center gap-2">
                          <button className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-[#215b3b] transition-colors">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </button>
                          <button className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-[#215b3b] transition-colors">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {grammarList.map((item) => (
                <div key={item.id} className="w-full bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow rounded-2xl p-6 flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-2xl font-black text-[#215b3b] font-[family-name:var(--font-nunito)]">
                        {item.meaning} ({item.hanzi})
                      </h3>
                      {item.hsk && (
                        <span className="px-3 py-1 rounded-full bg-[#5e7f26] text-white text-xs font-bold">
                          {item.hsk}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 font-medium">
                      {item.example}
                    </p>
                  </div>
                  
                  <div className="flex-shrink-0 flex items-center gap-3">
                    {item.status === 'Understood' ? (
                      <span className="flex items-center gap-1.5 px-4 py-2 bg-[#dcfce7] text-[#166534] rounded-full text-sm font-bold">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        Understood
                      </span>
                    ) : item.status === 'Needs Review' ? (
                      <span className="flex items-center gap-1.5 px-4 py-2 bg-[#fef3c7] text-[#92400e] rounded-full text-sm font-bold">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Needs Review
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 text-gray-500 rounded-full text-sm font-bold">
                        Not Studied
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Floating Action Button */}
        <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 z-50">
          <button 
            onClick={() => setMode('flashcard')}
            className="px-12 py-4 bg-[#8BC34A] hover:bg-[#7CB342] text-white text-lg font-bold rounded-full shadow-[0_8px_30px_rgb(139,195,74,0.3)] transition-transform hover:scale-105 flex items-center gap-2"
          >
            Bắt đầu ôn tập Flashcard
          </button>
        </div>
      </div>
    );
  }

  // Flashcard Mode
  return (
    <div className="w-full flex flex-col items-center gap-10 h-full justify-center mt-[-40px]">
      <div className="text-center mb-[-10px]">
        <p className="text-[#5e7f26] font-bold text-lg">
          Thẻ {currentIndex + 1} / {VOCAB_DATA.length}
        </p>
      </div>

      <div 
        className="relative w-full max-w-2xl aspect-[4/3] perspective-1000 cursor-pointer"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div className={`w-full h-full transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
          
          {/* Front */}
          <div className="absolute inset-0 bg-white rounded-[3rem] shadow-xl flex flex-col items-center justify-center backface-hidden p-8 border-[6px] border-[#eef7e9]">
            <h2 className="text-8xl sm:text-[140px] font-black text-[#215b3b] font-[family-name:var(--font-nunito)]">
              {currentCard.hanzi}
            </h2>
            <div className="absolute top-8 right-8">
               <button 
                 className="p-4 bg-[#f3fef6] rounded-full text-[#7CB342] hover:bg-[#eef7e9] transition-colors shadow-sm" 
                 onClick={(e) => { e.stopPropagation(); /* play audio */ }}
                 aria-label="Play pronunciation"
               >
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                   <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5 10v4a2 2 0 002 2h2l4 4V4L9 8H7a2 2 0 00-2 2z" />
                 </svg>
               </button>
            </div>
            <p className="mt-8 text-gray-300 font-bold tracking-widest text-sm uppercase">Nhấn để lật thẻ</p>
          </div>

          {/* Back */}
          <div className="absolute inset-0 bg-[#f3fef6] rounded-[3rem] shadow-xl flex flex-col items-center justify-center backface-hidden p-8 border-[6px] border-[#8BC34A] rotate-y-180">
            <h3 className="text-5xl sm:text-6xl font-black text-[#7CB342] mb-6 font-[family-name:var(--font-nunito)]">
              {currentCard.pinyin}
            </h3>
            <p className="text-3xl sm:text-4xl font-bold text-[#215b3b] mb-10 text-center px-4">
              {currentCard.meaning}
            </p>
            <div className="bg-white/80 p-6 rounded-3xl w-full max-w-lg text-center shadow-sm">
              <p className="text-[#4a6b38] text-xl font-medium">{currentCard.example}</p>
            </div>
            <p className="absolute bottom-6 text-[#8BC34A]/50 font-bold tracking-widest text-sm uppercase">
              {currentCard.type === 'grammar' ? 'Ngữ pháp' : 'Từ vựng'}
            </p>
          </div>

        </div>
      </div>

      <div className={`flex w-full max-w-2xl gap-6 transition-all duration-300 transform ${isFlipped ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
        <button 
          onClick={handleNext}
          className="flex-1 py-5 rounded-full bg-white text-[#d32f2f] font-black text-xl shadow-md hover:bg-red-50 border-2 border-transparent hover:border-red-100 transition-all hover:-translate-y-1"
        >
          Quên (Lại)
        </button>
        <button 
          onClick={handleNext}
          className="flex-1 py-5 rounded-full bg-[#8BC34A] text-white font-black text-xl shadow-md hover:bg-[#7CB342] hover:-translate-y-1 transition-all border-2 border-transparent"
        >
          Đã nhớ (Tốt)
        </button>
      </div>

      <button 
        onClick={() => { setMode('list'); setCurrentIndex(0); }} 
        className="mt-2 text-gray-500 font-bold hover:text-gray-700 underline underline-offset-4 transition-colors"
      >
        Thoát Flashcard
      </button>
    </div>
  );
}
