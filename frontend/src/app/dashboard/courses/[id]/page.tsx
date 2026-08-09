'use client';

import React, { use, useState, useMemo } from 'react';
import Link from 'next/link';

// Generate 120 mock lessons for demonstration
const TOPICS = ['Greetings', 'Numbers', 'Family', 'Time', 'Food', 'Travel', 'Shopping', 'Hobbies', 'Work', 'Weather'];
const LESSONS = Array.from({ length: 120 }, (_, i) => {
  const topic = TOPICS[i % TOPICS.length];
  const isStarted = i % 3 !== 0;
  return {
    id: i + 1,
    title: `Lesson ${i + 1}: ${topic}`,
    description: `Learn essential vocabulary and grammar for ${topic.toLowerCase()}.`,
    updated: 'Oct 26, 2023',
    status: isStarted ? 'continue' : 'start',
    progress: isStarted ? Math.floor(Math.random() * 80) + 10 : 0
  };
});

export default function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // Unwrap params using React.use
  const resolvedParams = use(params);
  const courseLevel = resolvedParams.id || '1';
  
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25; // 5 columns x 5 rows

  // Filter lessons based on search
  const filteredLessons = useMemo(() => {
    if (!searchQuery.trim()) return LESSONS;
    const lowerQuery = searchQuery.toLowerCase();
    return LESSONS.filter(l => 
      l.title.toLowerCase().includes(lowerQuery) || 
      l.description.toLowerCase().includes(lowerQuery)
    );
  }, [searchQuery]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredLessons.length / itemsPerPage);
  const currentLessons = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredLessons.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredLessons, currentPage]);

  // Reset to page 1 on search
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="w-full flex flex-col min-h-full">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-6">
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 flex items-center justify-center">
            <div className="absolute inset-0 bg-[#eef7e9] rounded-full transform -rotate-12 scale-110 z-0"></div>
            <img 
              src="/assets/illustrations/bamboo/bamboo.png" 
              alt="Bamboo" 
              className="w-auto h-24 sm:h-32 object-contain relative z-10"
            />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#215b3b] font-heading">
            HSK {courseLevel}: Beginner
          </h1>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80 flex-shrink-0">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search lessons..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white border-2 border-transparent focus:border-[#8BC34A] focus:outline-none focus:ring-0 shadow-sm transition-all text-[#215b3b] font-medium placeholder:font-normal"
          />
        </div>
      </div>

      {/* Grid Matrix Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6 flex-1">
        {currentLessons.map((lesson) => (
          <div 
            key={lesson.id} 
            className="bg-white rounded-[2rem] p-5 shadow-sm flex flex-col items-center text-center hover:shadow-md transition-all hover:-translate-y-1"
          >
            {/* Top: Progress Indicator */}
            <div className="relative w-16 h-16 mb-4 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="32" cy="32" r="28" stroke="#eef7e9" strokeWidth="6" fill="none" />
                <circle
                  cx="32" cy="32" r="28" 
                  stroke={lesson.status === 'start' ? 'transparent' : '#8BC34A'}
                  strokeWidth="6" 
                  fill="none" 
                  strokeDasharray={2 * Math.PI * 28}
                  strokeDashoffset={lesson.status === 'continue' ? (2 * Math.PI * 28) * (1 - lesson.progress / 100) : 2 * Math.PI * 28}
                  strokeLinecap="round"
                />
              </svg>
              {lesson.status === 'continue' && (
                <span className="absolute text-sm font-bold text-[#4a6b38]">{lesson.progress}%</span>
              )}
            </div>

            {/* Middle: Text Content */}
            <h2 className="text-lg font-bold text-[#215b3b] mb-1 line-clamp-1" title={lesson.title}>{lesson.title}</h2>
            <p className="text-[#4a6b38] text-sm mb-4 line-clamp-2">{lesson.description}</p>
            
            {/* Bottom: Action Button */}
            <div className="mt-auto w-full pt-2">
              <Link href={`/study/${lesson.id}`} className="w-full block">
                <button 
                  className={`w-full py-2.5 px-4 text-white font-bold rounded-full transition-colors shadow-sm ${
                    lesson.status === 'start' 
                      ? 'bg-[#8BC34A] hover:bg-[#7CB342]' 
                      : 'bg-[#9ccc65] hover:bg-[#8BC34A]'
                  }`}
                >
                  {lesson.status === 'start' ? 'Start' : 'Continue'}
                </button>
              </Link>
            </div>
          </div>
        ))}
        {currentLessons.length === 0 && (
          <div className="col-span-full py-12 text-center text-[#4a6b38]">
            No lessons found matching "{searchQuery}"
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-10 mb-4 flex items-center justify-center md:justify-end gap-2 text-sm font-medium text-[#4a6b38]">
          <span className="mr-4 hidden sm:inline">
            Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredLessons.length)} of {filteredLessons.length} lessons
          </span>
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            className="px-3 py-1 rounded-lg hover:bg-white disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
          >
            Prev
          </button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(page => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1)
              .map((page, index, array) => (
                <React.Fragment key={page}>
                  {index > 0 && array[index - 1] !== page - 1 && (
                    <span className="px-2 text-gray-400">...</span>
                  )}
                  <button
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                      currentPage === page ? 'bg-[#8BC34A] text-white font-bold' : 'hover:bg-white'
                    }`}
                  >
                    {page}
                  </button>
                </React.Fragment>
              ))}
          </div>

          <button 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            className="px-3 py-1 rounded-lg hover:bg-white disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
