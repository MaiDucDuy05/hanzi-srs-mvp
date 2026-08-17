'use client';

import { Award } from 'lucide-react';

export function ExamHeader() {
  return (
    <div className="relative mb-10 overflow-hidden rounded-[32px] bg-[#1f5333] p-10 text-white shadow-xl">
      {/* Decorative background vectors */}
      <div className="absolute -right-10 -top-24 h-96 w-96 rounded-full bg-white/5 blur-3xl pointer-events-none" />
      <div className="absolute right-40 -bottom-24 h-64 w-64 rounded-full bg-[#c7cf35]/10 blur-2xl pointer-events-none" />

      <div className="relative z-10 max-w-2xl">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-white/90 text-xs font-bold uppercase tracking-wider mb-4 backdrop-blur-sm">
          <Award className="h-3.5 w-3.5" />
          Teacher Dashboard
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-white">
          Exam Management
        </h1>
        <p className="text-lg text-white/80 font-medium leading-relaxed max-w-xl">
          Design, schedule, and grade assessments for your panda cubs. Create engaging tests in minutes.
        </p>
      </div>
    </div>
  );
}
