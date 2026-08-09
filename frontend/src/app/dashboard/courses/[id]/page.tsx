'use client';

import React, { use } from 'react';
import Link from 'next/link';

const LESSONS = [
  { id: 1, title: 'Lesson 1: Greetings', description: 'Learn basic greetings in Chinese.', updated: 'Oct 26, 2023', status: 'start' },
  { id: 2, title: 'Lesson 2: Numbers', description: 'Learn basic numbers in Chinese.', updated: 'Oct 26, 2023', status: 'continue' },
  { id: 3, title: 'Lesson 3: Family', description: 'Learn how to address family members.', updated: 'Oct 26, 2023', status: 'start' },
  { id: 4, title: 'Lesson 4: Time', description: 'Learn how to tell time in Chinese.', updated: 'Oct 26, 2023', status: 'continue' },
];

export default function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // Unwrap params using React.use
  const resolvedParams = use(params);
  const courseLevel = resolvedParams.id || '1';
  
  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center gap-6 mb-10">
        <div className="relative w-24 h-24 flex-shrink-0 flex items-center justify-center">
          <div className="absolute inset-0 bg-[#eef7e9] rounded-full transform -rotate-12 scale-110 z-0"></div>
          <img 
            src="/assets/illustrations/bamboo/bamboo.png" 
            alt="Bamboo" 
            className="w-auto h-32 object-contain relative z-10"
          />
        </div>
        <h1 className="text-4xl font-black text-[#215b3b] font-heading">
          HSK {courseLevel}: Beginner
        </h1>
      </div>

      {/* Lessons List */}
      <div className="flex flex-col gap-4">
        {LESSONS.map((lesson) => (
          <div 
            key={lesson.id} 
            className="bg-white rounded-[2rem] p-6 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow"
          >
            {/* Left Content */}
            <div className="flex-1">
              <h2 className="text-xl font-bold text-[#215b3b] mb-1">{lesson.title}</h2>
              <p className="text-[#4a6b38] mb-2">{lesson.description}</p>
              <p className="text-xs text-gray-400">Updated by Teacher: {lesson.updated}</p>
            </div>

            {/* Right Content */}
            <div className="flex items-center gap-6 flex-shrink-0 ml-4">
              {/* Circular Progress Indicator */}
              <div className="relative w-12 h-12 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="#eef7e9"
                    strokeWidth="6"
                    fill="none"
                  />
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="#8BC34A"
                    strokeWidth="6"
                    fill="none"
                    strokeDasharray={2 * Math.PI * 20}
                    strokeDashoffset={lesson.status === 'continue' ? (2 * Math.PI * 20) * 0.7 : 2 * Math.PI * 20}
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              {/* Action Button */}
              <Link href={`/study/${lesson.id}`}>
                <button 
                  className={`w-32 py-3 px-6 text-white font-bold rounded-full transition-colors shadow-sm ${
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
      </div>
    </div>
  );
}
