'use client';
import React, { useState } from 'react';
import { DecorativeLeaves } from './game-icons';
import { BookType, AlignLeft } from 'lucide-react';

export const VOCAB_GAMES = [
  { id: 'flashcard', title: 'Flashcard', icon: <img src="/assets/game/flashcard.png" alt="Flashcard" className="w-full h-full object-contain" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display='none'; }} /> },
  { id: 'balloon', title: 'Balloon', icon: <img src="/assets/game/ballon.png" alt="Balloon" className="w-full h-full object-contain" /> },
  { id: 'match', title: 'Nối từ', icon: <img src="/assets/game/match.png" alt="Match" className="w-full h-full object-contain" /> },
  { id: 'memory', title: 'Memory', icon: <img src="/assets/game/memory.png" alt="Memory" className="w-full h-full object-contain" /> },
  { id: 'stroke', title: 'Viết Hán', icon: <img src="/assets/game/stroke.png" alt="Stroke" className="w-full h-full object-contain" /> },
  { id: 'listening', title: 'Nghe', icon: <img src="/assets/game/listen.png" alt="Listening" className="w-full h-full object-contain" /> },
];

export const SENTENCE_GAMES = [
  { id: 'sentence', title: 'Sắp xếp câu', icon: <img src="/assets/game/sentence.png" alt="Sentence" className="w-full h-full object-contain" /> },
  { id: 'write-sentence', title: 'Viết câu', icon: <div className="w-16 h-16 rounded-full bg-[#eef7e9] flex items-center justify-center text-4xl">✍️</div> },
  { id: 'fill', title: 'Điền chỗ trống', icon: <div className="w-16 h-16 rounded-full bg-[#eef7e9] flex items-center justify-center text-4xl">📝</div> },
];

/** @deprecated Use VOCAB_GAMES or SENTENCE_GAMES */
export const GAMES = [...VOCAB_GAMES, ...SENTENCE_GAMES];

interface GameSelectionModalProps {
  selectedLesson: { id: string; title: string };
  onClose: () => void;
  onGameSelect: (gameId: string) => void;
}

export function GameSelectionModal({ selectedLesson, onClose, onGameSelect }: GameSelectionModalProps) {
  const [tab, setTab] = useState<'vocab' | 'sentence'>('vocab');
  const games = tab === 'sentence' ? SENTENCE_GAMES : VOCAB_GAMES;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-3xl rounded-[2.5rem] shadow-2xl p-6 sm:p-10 animate-in fade-in zoom-in duration-200">
        <button onClick={onClose} className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <div className="text-center mb-6">
          <h2 className="text-3xl font-black text-[#215b3b] font-heading">Practice <span className="text-[#8bc34a]">&quot;{selectedLesson.title}&quot;</span></h2>
        </div>

        {/* Category tabs inside modal */}
        <div className="flex gap-2 mb-6 bg-gray-50 rounded-2xl p-1.5 border border-gray-100">
          <button
            onClick={() => setTab('vocab')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all ${
              tab === 'vocab' ? 'bg-[#215b3b] text-white shadow-md' : 'text-gray-500 hover:text-[#215b3b]'
            }`}
          >
            <BookType className="w-4 h-4" />
            Luyện từ vựng
          </button>
          <button
            onClick={() => setTab('sentence')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all ${
              tab === 'sentence' ? 'bg-[#215b3b] text-white shadow-md' : 'text-gray-500 hover:text-[#215b3b]'
            }`}
          >
            <AlignLeft className="w-4 h-4" />
            Luyện câu
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {games.map((game) => (
            <button key={game.id} onClick={() => onGameSelect(game.id)} className="rounded-[2rem] p-6 shadow-sm border-4 border-transparent hover:border-[#aadd4a] bg-[#f9fdf5] hover:bg-white transition-all hover:shadow-md flex flex-col items-center justify-center text-center relative group">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"><DecorativeLeaves /></div>
              <div className="h-20 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">{game.icon}</div>
              <h3 className="text-lg font-bold text-[#111] mt-2 group-hover:text-[#4a6b38] transition-colors">{game.title}</h3>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
