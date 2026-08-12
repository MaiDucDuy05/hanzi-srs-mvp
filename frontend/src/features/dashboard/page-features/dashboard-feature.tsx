'use client';

import React, { useState, useEffect } from 'react';
import { studentApi, LessonProgressItem } from '@/lib/api/endpoints/student';
import type { StudentProgress } from '@/lib/api/types';

const BambooShoot = ({ className }: { className?: string }) => (
  <img
    src="/assets/nature/trees/bamboo_shot.png"
    alt="Bamboo Shoot"
    className={`${className} object-contain`}
  />
);

const CircularProgress = ({ value, label }: { value: number; label: string }) => {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg className="w-32 h-32 transform -rotate-90">
        <circle cx="64" cy="64" r={radius} stroke="rgba(255,255,255,0.4)" strokeWidth="16" fill="none" />
        <circle
          cx="64"
          cy="64"
          r={radius}
          stroke="#7CB342"
          strokeWidth="16"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-2xl font-black text-[#215b3b]">{value}%</span>
      </div>
    </div>
  );
};

export function DashboardFeature() {
  const [progress, setProgress] = useState<StudentProgress | null>(null);
  const [recommendedLessons, setRecommendedLessons] = useState<LessonProgressItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      studentApi.getProgress(),
      studentApi.getRecommendedLessons(),
    ])
      .then(([p, lessons]) => {
        setProgress(p);
        setRecommendedLessons(lessons);
      })
      .catch((err) => console.error('[Dashboard] load failed', err))
      .finally(() => setLoading(false));
  }, []);

  const remainingXp = progress ? Math.max(0, progress.dailyGoal - progress.dailyXp) : 0;
  const remainingText = remainingXp > 0 ? `${remainingXp} more XP needed` : 'Goal reached! 🎉';

  return (
    <div className="flex flex-col gap-6 h-full justify-center">
      <header className="flex justify-between items-center mb-2 relative">
        <h1 className="font-[family-name:var(--font-nunito)] text-4xl font-black text-[#215b3b]">
          Welcome back, Learner!
        </h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Today&apos;s Goal */}
        <div className="bg-[#d4ed8f] rounded-[2rem] p-6 shadow-sm flex flex-col items-center justify-center">
          <h2 className="font-bold text-[#215b3b] mb-2 font-[family-name:var(--font-nunito)] text-2xl">
            Today&apos;s Goal
          </h2>
          {loading ? (
            <div className="w-32 h-32 flex items-center justify-center">
              <span className="text-gray-400 text-sm">Loading...</span>
            </div>
          ) : (
            <>
              <CircularProgress value={progress?.progressPercent ?? 0} label={remainingText} />
              <p className="mt-2 text-[#4a6b38] text-sm font-medium">
                {progress?.dailyXp ?? 0} / {progress?.dailyGoal ?? 50} XP — {remainingText}
              </p>
            </>
          )}
        </div>

        {/* Daily Streak */}
        <div className="bg-white rounded-[2rem] p-6 shadow-sm flex items-center gap-6">
          <div className="flex-shrink-0">
            <BambooShoot className="w-auto h-32" />
          </div>
          <div className="flex flex-col justify-center">
            <h2 className="font-bold text-[#215b3b] font-[family-name:var(--font-nunito)] text-2xl">
              Daily Streak
            </h2>
            <div className="text-xl font-black text-[#215b3b]">
              {loading ? '—' : progress?.currentStreak ?? 0} Days
            </div>
            <div className="text-xl font-black text-[#215b3b] mb-1">Streak!</div>
            <p className="text-gray-500 text-sm font-medium">Keep growing!</p>
          </div>
        </div>

        {/* Ready for Review */}
        <div className="bg-white rounded-[2rem] p-6 shadow-sm flex flex-col items-center justify-center text-center">
          <h2 className="font-black text-[#215b3b] font-[family-name:var(--font-nunito)] text-2xl mb-6">
            Ready for Review
          </h2>
          <button className="bg-[#8BC34A] hover:bg-[#7CB342] text-white font-bold py-3 px-8 rounded-full shadow-md transition-transform hover:scale-105">
            Review Now
          </button>
        </div>
      </div>

      {/* Recommended Lessons */}
      <div className="mt-4">
        <h2 className="font-black text-[#215b3b] font-[family-name:var(--font-nunito)] text-2xl mb-6">
          Recommended Lessons
        </h2>
        {loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : recommendedLessons.length === 0 ? (
          <p className="text-gray-400">No lessons available yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recommendedLessons.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-[2rem] p-4 shadow-sm flex items-center gap-4 hover:-translate-y-1 transition-transform cursor-pointer"
              >
                <img
                  src="/assets/illustrations/bamboo/bamboo.png"
                  alt="Bamboo"
                  className="h-32 w-auto flex-shrink-0 object-contain"
                />
                <div className="flex-1">
                  <h3 className="font-bold text-[#215b3b] text-lg">{item.title}</h3>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-[#8BC34A] h-2 rounded-full transition-all"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
