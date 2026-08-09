'use client';

import React, { useState } from 'react';

const VOCAB_DATA = [
  { id: 1, hanzi: '你好', pinyin: 'nǐ hǎo', meaning: 'Hello / Hi', example: '你好，朋友！(Chào bạn!)', type: 'vocab', partOfSpeech: 'Greeting', masteryLevel: 2 },
  { id: 2, hanzi: '书', pinyin: 'shū', meaning: 'Book', example: '我喜欢看书。(I like reading books.)', type: 'vocab', partOfSpeech: 'Noun', masteryLevel: 1 },
  { id: 3, hanzi: '学习', pinyin: 'xuéxí', meaning: 'To learn / To study', example: '学习中文。(Study Chinese.)', type: 'vocab', partOfSpeech: 'Verb', masteryLevel: 3 },
  { id: 4, hanzi: '大', pinyin: 'dà', meaning: 'Big / Large', example: '这个苹果很大。(This apple is very big.)', type: 'vocab', partOfSpeech: 'Adjective', masteryLevel: 2 },
  { id: 5, hanzi: '谢谢', pinyin: 'xièxiè', meaning: 'Thank you', example: '谢谢你的帮助。(Thank you for your help.)', type: 'vocab', partOfSpeech: 'Phrase', masteryLevel: 4 },
  { id: 6, hanzi: '吗', pinyin: 'ma', meaning: 'Question particle / Trợ từ nghi vấn', example: '你好吗？(Bạn khỏe không?)', type: 'grammar' },
  { id: 7, hanzi: '是...的', pinyin: 'shì...de', meaning: 'The "Shi... De" Structure', example: 'Emphasize the details of a past event, such as time, place, or manner.', type: 'grammar', hsk: 'HSK 2', status: 'Needs Review' },
  { id: 8, hanzi: '了', pinyin: 'le', meaning: 'The Particle "Le"', example: 'Indicate a completed action or a change of state.', type: 'grammar', hsk: 'HSK 1', status: 'Understood' },
];

export default function StudyLessonPage({ params }: { params: Promise<{ lessonId: string }> }) {
  const resolvedParams = React.use(params);
  
  // Trạng thái hiển thị: 'list' (danh sách học) hoặc 'flashcard' (ôn tập)
  const [mode, setMode] = useState<'list' | 'flashcard'>('list');
  const [listTab, setListTab] = useState<'vocab' | 'grammar'>('vocab');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const currentCard = VOCAB_DATA[currentIndex];

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
      if (currentIndex === VOCAB_DATA.length - 1) {
        // Hoàn thành bộ thẻ, quay về danh sách
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
      <div className="w-full h-full flex flex-col pt-0 pb-24 px-4 overflow-y-auto custom-scrollbar">
        <div className="w-full max-w-6xl mx-auto bg-white rounded-3xl shadow-sm p-6 sm:p-8 min-h-[600px]">
          
          <div className="mb-8 text-center flex flex-col items-center">

            {/* Tab Switcher */}
            <div className="flex bg-gray-50 p-1 rounded-full w-full max-w-sm">
              <button 
                onClick={() => setListTab('vocab')}
                className={`flex-1 py-2 px-4 rounded-full font-bold text-base transition-all ${
                  listTab === 'vocab' 
                    ? 'bg-white text-[#215b3b] shadow-sm' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                Từ vựng ({vocabList.length})
              </button>
              <button 
                onClick={() => setListTab('grammar')}
                className={`flex-1 py-2 px-4 rounded-full font-bold text-base transition-all ${
                  listTab === 'grammar' 
                    ? 'bg-white text-[#215b3b] shadow-sm' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                Ngữ pháp ({grammarList.length})
              </button>
            </div>
          </div>

          {listTab === 'vocab' ? (
            <div className="flex flex-col">
              {/* Search & Filters */}
              <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input type="text" placeholder="Search Chinese words, pinyin, meaning..." className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#8BC34A] focus:ring-1 focus:ring-[#8BC34A] transition-all" />
                </div>
                <div className="flex gap-4">
                  <select className="border border-gray-200 rounded-lg px-4 py-2 text-gray-600 focus:outline-none focus:border-[#8BC34A] cursor-pointer bg-white">
                    <option>HSK Level: All</option>
                  </select>
                  <select className="border border-gray-200 rounded-lg px-4 py-2 text-gray-600 focus:outline-none focus:border-[#8BC34A] cursor-pointer bg-white">
                    <option>Tag: All</option>
                  </select>
                  <select className="border border-gray-200 rounded-lg px-4 py-2 text-gray-600 focus:outline-none focus:border-[#8BC34A] cursor-pointer bg-white">
                    <option>Mastery: All</option>
                  </select>
                </div>
              </div>

              {/* Title */}
              <div className="mb-6">
                <h2 className="text-2xl font-black text-gray-900 mb-1">Vocabulary Library List</h2>
                <p className="text-gray-500 font-medium">Your personal collection of Chinese words and phrases</p>
              </div>

              {/* Table */}
              <div className="overflow-x-auto border border-gray-100 rounded-2xl bg-[#fbfdfa]">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 bg-[#f4f9f1]">
                      <th className="py-4 px-6 text-xs font-bold text-gray-600 uppercase tracking-wider w-[15%]">HANZI <span className="inline-block align-middle opacity-50 ml-1">↕</span></th>
                      <th className="py-4 px-6 text-xs font-bold text-gray-600 uppercase tracking-wider w-[15%]">PINYIN <span className="inline-block align-middle opacity-50 ml-1">↕</span></th>
                      <th className="py-4 px-6 text-xs font-bold text-gray-600 uppercase tracking-wider w-[25%]">MEANING <span className="inline-block align-middle opacity-50 ml-1">↕</span></th>
                      <th className="py-4 px-6 text-xs font-bold text-gray-600 uppercase tracking-wider w-[15%]">PART OF SPEECH <span className="inline-block align-middle opacity-50 ml-1">↕</span></th>
                      <th className="py-4 px-6 text-xs font-bold text-gray-600 uppercase tracking-wider w-[15%]">MASTERY LEVEL <span className="inline-block align-middle opacity-50 ml-1">↕</span></th>
                      <th className="py-4 px-6 text-xs font-bold text-gray-600 uppercase tracking-wider w-[15%]">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vocabList.map((item, idx) => (
                      <tr key={item.id} className={`${idx !== vocabList.length - 1 ? 'border-b border-gray-100' : ''} hover:bg-white transition-colors bg-[#fbfdfa]`}>
                        <td className="py-6 px-6">
                          <span className="text-3xl font-black text-gray-900 font-[family-name:var(--font-nunito)]">
                            {item.hanzi}
                          </span>
                        </td>
                        <td className="py-6 px-6">
                          <span className="text-lg font-bold text-gray-700">{item.pinyin}</span>
                        </td>
                        <td className="py-6 px-6">
                          <p className="text-base font-bold text-gray-700">{item.meaning}</p>
                        </td>
                        <td className="py-6 px-6">
                          <span className="text-base font-bold text-gray-600">
                            {item.partOfSpeech}
                          </span>
                        </td>
                        <td className="py-6 px-6">
                          <div className="flex items-end gap-1 h-6">
                            {[1, 2, 3, 4].map(level => (
                              <div 
                                key={level} 
                                className={`w-3 rounded-t-sm transition-all duration-300 ${level <= (item.masteryLevel || 0) ? 'bg-[#7CB342]' : 'bg-[#eef7e9]'}`}
                                style={{ height: `${40 + level * 20}%` }}
                              >
                                {/* Bamboo nodes decoration */}
                                <div className={`w-full h-[2px] mt-1 ${level <= (item.masteryLevel || 0) ? 'bg-[#5e7f26]' : 'bg-white/50'}`}></div>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="py-6 px-6">
                          <div className="flex items-center gap-3">
                            <button className="w-9 h-9 rounded-full border-2 border-gray-700 text-gray-700 flex items-center justify-center hover:bg-gray-100 transition-colors" title="Play audio">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </button>
                            <button className="w-9 h-9 rounded-lg border-2 border-gray-700 text-gray-700 flex items-center justify-center hover:bg-gray-100 transition-colors" title="View flashcard">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-6 text-gray-500 font-medium text-sm">
                <div>Showing 1-{vocabList.length} of 250 words</div>
                <div className="flex items-center gap-3">
                  <button className="text-gray-300 hover:text-gray-500 transition-colors">Prev</button>
                  <span className="text-gray-300">|</span>
                  <button className="text-gray-900 font-bold hover:text-[#8BC34A] transition-colors">1</button>
                  <span className="text-gray-300">|</span>
                  <button className="hover:text-[#8BC34A] transition-colors">2</button>
                  <span className="text-gray-300">|</span>
                  <button className="hover:text-[#8BC34A] transition-colors">3</button>
                  <span className="text-gray-300">|</span>
                  <span>...</span>
                  <span className="text-gray-300">|</span>
                  <button className="hover:text-[#8BC34A] transition-colors">25</button>
                  <span className="text-gray-300">|</span>
                  <button className="text-gray-900 font-bold hover:text-[#8BC34A] transition-colors">Next</button>
                </div>
              </div>
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
        <div className="fixed bottom-8 left-0 right-0 flex justify-center z-20 pointer-events-none">
          <button 
            onClick={() => setMode('flashcard')}
            className="pointer-events-auto py-4 px-10 rounded-full bg-[#8BC34A] text-white font-black text-xl shadow-lg shadow-[#8BC34A]/30 hover:bg-[#7CB342] hover:-translate-y-1 transition-all"
          >
            Bắt đầu ôn tập Flashcard
          </button>
        </div>
      </div>
    );
  }

  // Chế độ Flashcard
  return (
    <div className="w-full flex flex-col items-center gap-10 h-full justify-center mt-[-40px]">
      {/* Tiêu đề trạng thái */}
      <div className="text-center mb-[-10px]">
        <p className="text-[#5e7f26] font-bold text-lg">
          Thẻ {currentIndex + 1} / {VOCAB_DATA.length}
        </p>
      </div>

      {/* Flashcard Area */}
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

      {/* Action Buttons */}
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
    </div>
  );
}
