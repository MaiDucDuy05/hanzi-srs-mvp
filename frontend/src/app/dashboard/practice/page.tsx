'use client';

import React from 'react';
import Link from 'next/link';

export default function PracticeHubPage() {
  const MODES = [
    { id: 'assignment', icon: '👩‍🏫', title: "Teacher's Assignments", desc: "Exercises assigned by teacher" },
    { id: 'topic', icon: '📚', title: "By Topic", desc: "Choose a specific vocabulary topic" },
    { id: 'hsk', icon: '📈', title: "By HSK Level", desc: "Practice words by difficulty" },
    { id: 'mistakes', icon: '📖', title: "Mistake Book", desc: "Review words you got wrong" },
  ];

  return (
    <div className="w-full flex flex-col min-h-full py-4 sm:py-0">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-6 pl-2">
        <div className="relative w-16 h-16 flex-shrink-0 flex items-center justify-center">
          <div className="absolute inset-0 bg-[#e5f5eb] rounded-full transform -rotate-12 scale-110 z-0 opacity-70"></div>
          <img 
            src="/assets/illustrations/bamboo/bamboo.png" 
            alt="Bamboo" 
            className="w-auto h-20 object-contain relative z-10"
          />
        </div>
        <h1 className="text-4xl font-black text-[#3e5c46] font-heading tracking-tight">
          Practice Hub
        </h1>
      </div>

      {/* Progress Bar */}
      <div className="relative w-full h-12 bg-white rounded-full p-1.5 shadow-sm mb-10 overflow-hidden flex items-center border border-white">
        <div 
          className="absolute left-1.5 top-1.5 bottom-1.5 rounded-full bg-[#aadd4a] transition-all duration-1000 ease-out" 
          style={{ width: '80%' }}
        ></div>
        <div className="relative z-10 font-bold text-white pl-4 drop-shadow-md tracking-wide">
          Daily Practice Goal: 40/50 XP
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 flex-1 mb-8">
        {MODES.map((mode) => (
          <Link 
            href={`/dashboard/practice/lessons?mode=${mode.id}`}
            key={mode.id}
            className="flex flex-col sm:flex-row items-center sm:items-start gap-6 p-6 sm:p-8 rounded-[2.5rem] border-4 border-transparent hover:border-[#aadd4a] bg-white transition-all shadow-sm hover:shadow-md group text-center sm:text-left"
          >
            <div className="w-24 h-24 flex-shrink-0 bg-[#f9fdf5] rounded-full flex items-center justify-center text-5xl group-hover:scale-110 transition-transform">
              {mode.icon}
            </div>
            <div className="flex flex-col justify-center h-full sm:pt-2">
              <span className="font-bold text-[#215b3b] text-2xl mb-2">{mode.title}</span>
              <span className="text-gray-500 font-medium text-lg">{mode.desc}</span>
            </div>
          </Link>
        ))}
      </div>
      
    </div>
  );
}
