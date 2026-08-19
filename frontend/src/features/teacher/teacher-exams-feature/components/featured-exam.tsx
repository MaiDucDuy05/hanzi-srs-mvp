'use client';

import { Calendar, Clock, Edit3, Eye, Volume2, Image as ImageIcon, Edit2, Plus } from 'lucide-react';

export function FeaturedExam() {
  return (
    <div className="mb-12">
      <h2 className="font-bold text-[#1f5333] text-[18px] mb-5 flex items-center gap-2">
        <Calendar className="h-5 w-5 text-[#558866]" /> Upcoming Assessment
      </h2>

      <div className="bg-gradient-to-br from-white to-[#fafbfa] border border-[#eaf3c5] rounded-[32px] p-8 shadow-[0_4px_24px_-6px_rgba(0,0,0,0.05)] flex flex-col lg:flex-row gap-8 relative overflow-hidden group hover:border-[#c7cf35] transition-colors duration-500">

        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-[#fcfce8] to-transparent opacity-60 pointer-events-none rounded-bl-full transition-opacity duration-500 group-hover:opacity-100" />

        {/* Main Content */}
        <div className="flex-1 relative z-10 flex flex-col justify-center">
          <div className="flex flex-wrap items-center gap-3 mb-5">
            <span className="bg-[#c7cf35]/20 text-[#5a5e12] border border-[#c7cf35]/40 px-3.5 py-1.5 rounded-lg text-[12px] font-bold tracking-wide flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#78993a] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#78993a]"></span>
              </span>
              SCHEDULED
            </span>
            <span className="text-[14px] text-gray-500 font-medium flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-gray-100 shadow-sm">
              <Clock className="h-4 w-4 text-[#78993a]" />
              Open for <strong className="text-[#1f5333]">Class 1B</strong> on Oct 25, 08:00 AM
            </span>
          </div>

          <h3 className="text-[32px] font-extrabold text-[#1f5333] tracking-tight mb-3">
            Autumn Midterm HSK 2
          </h3>

          <p className="text-[15px] text-gray-500 font-medium mb-8 max-w-xl leading-relaxed">
            Final review required before publication. Ensure audio clips for the listening comprehension section are correctly linked.
          </p>

          <div className="flex flex-wrap items-center gap-4 mt-auto">
            <button className="bg-[#1f5333] text-white px-7 py-3 rounded-xl text-[14px] font-bold hover:bg-[#153f25] hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2">
              <Edit3 className="h-4 w-4" /> Edit Content
            </button>
            <button className="bg-white text-[#1f5333] border border-gray-200 px-7 py-3 rounded-xl text-[14px] font-bold hover:bg-gray-50 hover:border-gray-300 transition-colors flex items-center gap-2 shadow-sm">
              <Eye className="h-4 w-4" /> Preview
            </button>
          </div>
        </div>

        {/* Exam Structure Panel */}
        <div className="w-full lg:w-[340px] bg-white/60 backdrop-blur-md rounded-2xl p-6 border border-[#eaf3c5]/50 shadow-sm shrink-0 relative z-10 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h4 className="font-bold text-[#1f5333] text-[15px]">Exam Structure</h4>
            <span className="bg-[#f4f7ed] text-[#558866] text-[12px] font-bold px-2.5 py-1 rounded-md">35 Qs</span>
          </div>

          <div className="space-y-4 mb-8 flex-1">
            <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-gray-100 shadow-sm hover:border-[#c7cf35] transition-colors cursor-default">
              <div className="flex items-center gap-3 text-[#78993a]">
                <div className="p-2 bg-[#f4f7ed] rounded-lg">
                  <Volume2 className="h-4 w-4" />
                </div>
                <span className="text-[14px] font-bold text-[#1f5333]">Listening</span>
              </div>
              <span className="text-[13px] font-bold text-gray-500">15 Qs</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-gray-100 shadow-sm hover:border-[#c7cf35] transition-colors cursor-default">
              <div className="flex items-center gap-3 text-[#78993a]">
                <div className="p-2 bg-[#f4f7ed] rounded-lg">
                  <ImageIcon className="h-4 w-4" />
                </div>
                <span className="text-[14px] font-bold text-[#1f5333]">Reading</span>
              </div>
              <span className="text-[13px] font-bold text-gray-500">20 Qs</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 shadow-sm opacity-60">
              <div className="flex items-center gap-3 text-gray-500">
                <div className="p-2 bg-white rounded-lg border border-gray-100">
                  <Edit2 className="h-4 w-4" />
                </div>
                <span className="text-[14px] font-bold">Stroke Puzzles</span>
              </div>
              <span className="text-[13px] font-bold">0 Qs</span>
            </div>
          </div>

          <button className="w-full py-3 rounded-xl border-2 border-dashed border-[#dde8a6] text-[#78993a] text-[13px] font-bold hover:bg-[#f4f7ed] hover:border-[#c7cf35] transition-all flex items-center justify-center gap-2">
            <Plus className="h-4 w-4" /> Add Section
          </button>
        </div>

      </div>
    </div>
  );
}
