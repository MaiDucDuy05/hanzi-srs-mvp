'use client';

import Link from 'next/link';

const COURSES = [
  { id: 1, level: 'HSK 1', progress: 50, completedLessons: 12, totalLessons: 24 },
  { id: 2, level: 'HSK 2', progress: 50, completedLessons: 12, totalLessons: 24 },
  { id: 3, level: 'HSK 3', progress: 60, completedLessons: 12, totalLessons: 24 },
  { id: 4, level: 'HSK 4', progress: 40, completedLessons: 12, totalLessons: 24 },
  { id: 5, level: 'HSK 5', progress: 75, completedLessons: 12, totalLessons: 24 },
  { id: 6, level: 'HSK 6', progress: 80, completedLessons: 12, totalLessons: 24 },
  { id: 7, level: 'HSK 7', progress: 80, completedLessons: 12, totalLessons: 24 },
  { id: 8, level: 'HSK 8', progress: 100, completedLessons: 24, totalLessons: 24 },
  { id: 9, level: 'HSK 9', progress: 100, completedLessons: 24, totalLessons: 24 },
];

export default function CoursesPage() {
  return (
    <div className="w-full">
      <h1 className="text-4xl font-black text-[#215b3b] mb-8 font-heading">Courses</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
        {COURSES.map((course) => (
          <Link href={`/dashboard/courses/${course.id}`} key={course.id}>
            <div className="bg-white rounded-[2rem] p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow h-full cursor-pointer">
              
              <div className="flex items-center gap-4 mb-5">
                {/* Bamboo Image on Blob */}
                <div className="relative w-20 h-24 flex-shrink-0 flex items-center justify-center">
                  <img 
                    src="/assets/illustrations/bamboo/bamboo.png" 
                    alt="Bamboo" 
                    className="w-auto h-48 object-contain relative z-10"
                  />
                </div>

                {/* Course Info */}
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-black text-[#215b3b] mb-2">{course.level}</h2>
                  
                  {/* Progress Bar & Percentage */}
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex-1 h-2.5 bg-[#eef7e9] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#8BC34A] rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                    <span className="text-[10px] font-bold text-[#4a6b38] w-7 text-right">
                      {course.progress}%
                    </span>
                  </div>
                  
                  <p className="text-xs font-semibold text-gray-500">
                    {course.completedLessons}/{course.totalLessons} Lessons
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <button className="w-full py-3 px-4 bg-[#8BC34A] hover:bg-[#7CB342] text-white font-bold rounded-full transition-colors text-sm shadow-sm pointer-events-none">
                Continue Learning
              </button>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
