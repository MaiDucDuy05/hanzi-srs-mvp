import React from 'react';

interface StudyLessonFilterBarProps {
  search: string;
  onSearchChange: (val: string) => void;
}

export function StudyLessonFilterBar({ search, onSearchChange }: StudyLessonFilterBarProps) {
  return (
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
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
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
  );
}
