'use client';

import React, { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

const LeafIcon = () => (
  <svg width="64" height="64" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M50 85 C50 85, 45 40, 20 20 C20 20, 35 30, 45 45 C45 45, 30 15, 50 10 C70 15, 55 45, 55 45 C65 30, 80 20, 80 20 C55 40, 50 85, 50 85 Z" fill="#bce195" stroke="#4a6b38" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M50 85 L50 95" stroke="#4a6b38" strokeWidth="4" strokeLinecap="round"/>
  </svg>
);

const BambooIcon = () => (
  <svg width="64" height="64" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="42" y="20" width="6" height="20" rx="3" fill="#8bc34a" stroke="#4a6b38" strokeWidth="3"/>
    <rect x="42" y="42" width="6" height="22" rx="3" fill="#8bc34a" stroke="#4a6b38" strokeWidth="3"/>
    <rect x="42" y="66" width="6" height="20" rx="3" fill="#8bc34a" stroke="#4a6b38" strokeWidth="3"/>
    <rect x="54" y="30" width="6" height="18" rx="3" fill="#bce195" stroke="#4a6b38" strokeWidth="3"/>
    <rect x="54" y="50" width="6" height="20" rx="3" fill="#bce195" stroke="#4a6b38" strokeWidth="3"/>
    <path d="M42 30 Q30 20 20 25" fill="none" stroke="#4a6b38" strokeWidth="3" strokeLinecap="round"/>
    <path d="M48 50 Q60 40 70 45" fill="none" stroke="#4a6b38" strokeWidth="3" strokeLinecap="round"/>
    <path d="M42 70 Q30 65 25 75" fill="none" stroke="#4a6b38" strokeWidth="3" strokeLinecap="round"/>
  </svg>
);

const TreeIcon = () => (
  <svg width="64" height="64" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M45 60 L45 90 L55 90 L55 60 Z" fill="#8d6e63" stroke="#5d4037" strokeWidth="4" strokeLinejoin="round"/>
    <circle cx="50" cy="40" r="25" fill="#8bc34a" stroke="#4a6b38" strokeWidth="4"/>
    <circle cx="35" cy="50" r="15" fill="#8bc34a" stroke="#4a6b38" strokeWidth="4"/>
    <circle cx="65" cy="50" r="15" fill="#8bc34a" stroke="#4a6b38" strokeWidth="4"/>
  </svg>
);

const SproutIcon = () => (
  <svg width="64" height="64" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 80 Q50 90 80 80" fill="none" stroke="#4a6b38" strokeWidth="4" strokeLinecap="round"/>
    <path d="M50 80 Q45 50 25 35 Q40 30 50 50 Q60 30 75 35 Q55 50 50 80 Z" fill="#bce195" stroke="#4a6b38" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const BrushIcon = () => (
  <svg width="64" height="64" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M70 20 L40 50" stroke="#8d6e63" strokeWidth="8" strokeLinecap="round"/>
    <path d="M75 15 L85 25 L45 65 L35 55 Z" fill="#8d6e63" stroke="#5d4037" strokeWidth="3" strokeLinejoin="round"/>
    <path d="M35 55 C25 65 20 80 15 85 C20 80 35 75 45 65 Z" fill="#e0e0e0" stroke="#757575" strokeWidth="3" strokeLinejoin="round"/>
  </svg>
);

const BirdIcon = () => (
  <svg width="64" height="64" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M30 80 L70 80" stroke="#4a6b38" strokeWidth="4" strokeLinecap="round"/>
    <path d="M40 80 L40 70 M60 80 L60 70" stroke="#4a6b38" strokeWidth="4" strokeLinecap="round"/>
    <path d="M35 50 C35 30 65 30 65 50 C65 60 75 70 65 70 L35 70 C25 70 35 60 35 50 Z" fill="#bce195" stroke="#4a6b38" strokeWidth="4" strokeLinejoin="round"/>
    <circle cx="58" cy="42" r="3" fill="#4a6b38"/>
    <path d="M68 45 L78 42 L68 50" fill="#ffa000" stroke="#e65100" strokeWidth="2" strokeLinejoin="round"/>
    <path d="M40 55 C30 55 25 50 20 45 C25 60 35 65 45 60 Z" fill="#8bc34a" stroke="#4a6b38" strokeWidth="3" strokeLinejoin="round"/>
  </svg>
);

const DecorativeLeaves = () => (
  <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute -top-6 -right-6 opacity-70 transform rotate-45">
    <path d="M50 80 Q45 50 25 35 Q40 30 50 50 Q60 30 75 35 Q55 50 50 80 Z" fill="#bce195" stroke="#4a6b38" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const GAMES = [
  { id: 'flashcard', title: 'Flashcards', icon: <LeafIcon /> },
  { id: 'match', title: 'Match', icon: <BambooIcon /> },
  { id: 'memory', title: 'Memory', icon: <TreeIcon /> },
  { id: 'sentence', title: 'Sentence', icon: <SproutIcon /> },
  { id: 'stroke', title: 'Stroke', icon: <BrushIcon /> },
  { id: 'listening', title: 'Listening', icon: <BirdIcon /> },
];

const MOCK_DATA: Record<string, { id: string; title: string; count: number; desc: string }[]> = {
  hsk: [{ id: 'hsk1', title: 'HSK 1', count: 150, desc: 'Basic vocabulary for beginners' }, { id: 'hsk2', title: 'HSK 2', count: 300, desc: 'Elementary vocabulary' }, { id: 'hsk3', title: 'HSK 3', count: 600, desc: 'Intermediate vocabulary' }, { id: 'hsk4', title: 'HSK 4', count: 1200, desc: 'Advanced vocabulary' }],
  topic: [{ id: 'food', title: 'Food & Drinks', count: 45, desc: 'Words related to eating' }, { id: 'travel', title: 'Travel', count: 30, desc: 'Words for getting around' }, { id: 'family', title: 'Family', count: 20, desc: 'Family members and relatives' }, { id: 'animals', title: 'Animals', count: 25, desc: 'Common animals' }],
  assignment: [{ id: 'hw1', title: 'Homework 1', count: 10, desc: 'Assigned on Oct 10' }, { id: 'hw2', title: 'Homework 2', count: 15, desc: 'Assigned on Oct 12' }],
  mistakes: [{ id: 'recent', title: 'Recent Mistakes', count: 20, desc: 'Words you got wrong this week' }, { id: 'all', title: 'All Mistakes', count: 85, desc: 'Complete list of all mistakes' }],
};

const MODE_TITLES: Record<string, string> = { hsk: 'Select HSK Level', topic: 'Select a Topic', assignment: "Teacher's Assignments", mistakes: 'Mistake Book' };

export function LessonSelectionFeature() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [selectedLesson, setSelectedLesson] = useState<{ id: string; title: string } | null>(null);
  const mode = searchParams.get('mode') || 'topic';
  const title = MODE_TITLES[mode] || 'Select Lesson';
  const lessons = MOCK_DATA[mode] || [];

  const handleLessonClick = (lessonId: string, lessonTitle: string) => {
    if (mode === 'assignment') {
      router.push(`/games/flashcard?mode=assignment&lesson=${lessonId}`);
    } else {
      setSelectedLesson({ id: lessonId, title: lessonTitle });
    }
  };

  const handleGameSelect = (gameId: string) => {
    if (selectedLesson) {
      router.push(`/games/${gameId}?mode=${mode}&lesson=${selectedLesson.id}`);
      setSelectedLesson(null);
    }
  };

  return (
    <div className="w-full flex flex-col min-h-full py-4 sm:py-0 relative">
      <div className="flex items-center gap-4 mb-8 pl-2">
        <button onClick={() => router.back()} className="w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-full bg-white shadow-sm hover:bg-gray-50 text-[#215b3b] transition-colors border-2 border-transparent hover:border-[#aadd4a]">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <h1 className="text-3xl sm:text-4xl font-black text-[#3e5c46] font-heading tracking-tight">{title}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 mb-8">
        {lessons.length > 0 ? lessons.map((lesson) => (
          <button key={lesson.id} onClick={() => handleLessonClick(lesson.id, lesson.title)} className="text-left bg-white rounded-[2rem] p-6 sm:p-8 shadow-sm border-4 border-transparent hover:border-[#aadd4a] hover:shadow-md transition-all group flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-[#215b3b] mb-1 group-hover:text-[#4a6b38] transition-colors">{lesson.title}</h2>
              <p className="text-gray-500 font-medium">{lesson.desc}</p>
            </div>
            <div className="flex items-center gap-4 flex-shrink-0">
              <span className="hidden sm:inline-block px-4 py-1.5 bg-[#e5f5eb] text-[#215b3b] font-bold rounded-full text-sm whitespace-nowrap">{lesson.count} words</span>
              <div className="w-12 h-12 rounded-full bg-[#aadd4a] flex items-center justify-center text-white transform group-hover:scale-110 transition-transform shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
              </div>
            </div>
          </button>
        )) : <div className="col-span-1 md:col-span-2 text-center py-20 text-gray-500 font-medium text-xl">No lessons available for this mode yet.</div>}
      </div>

      {selectedLesson && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedLesson(null)} />
          <div className="relative bg-white w-full max-w-3xl rounded-[2.5rem] shadow-2xl p-6 sm:p-10 animate-in fade-in zoom-in duration-200">
            <button onClick={() => setSelectedLesson(null)} className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-black text-[#215b3b] font-heading">Practice <span className="text-[#8bc34a]">"{selectedLesson.title}"</span></h2>
              <p className="text-gray-500 mt-2 text-lg font-medium">Which game would you like to play?</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {GAMES.map((game) => (
                <button key={game.id} onClick={() => handleGameSelect(game.id)} className="bg-white rounded-[2rem] p-6 shadow-sm border-4 border-transparent hover:border-[#aadd4a] bg-[#f9fdf5] hover:bg-white transition-all hover:shadow-md flex flex-col items-center justify-center text-center relative group">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"><DecorativeLeaves /></div>
                  <div className="h-20 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">{game.icon}</div>
                  <h3 className="text-lg font-bold text-[#111] mt-2 group-hover:text-[#4a6b38] transition-colors">{game.title}</h3>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
