'use client';

import { useState } from 'react';
import { 
  Timer, 
  FileText, 
  Award, 
  Edit3, 
  Eye,
  Volume2,
  Image as ImageIcon,
  Edit2,
  ArrowRight,
  Plus
} from 'lucide-react';

export function TeacherExamsFeature() {
  const [filter, setFilter] = useState('All');
  const filters = ['All', 'Drafts', 'Active', 'Completed'];

  return (
    <div className="max-w-[1100px] pb-20 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-[34px] font-extrabold text-[#1f5333] tracking-tight mb-2">Exam Management</h1>
        <p className="text-[15px] text-gray-500 font-medium">Design, schedule, and grade assessments for your panda cubs.</p>
      </div>

      {/* Quick Create Templates */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-4 text-[#4a5a3a]">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          <h2 className="font-bold text-[15px]">Quick Create Templates</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] text-left hover:border-[#c7cf35] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
            <div className="h-10 w-10 bg-[#f3f4e1] rounded-full flex items-center justify-center text-[#78993a] mb-4 group-hover:bg-[#c7cf35] group-hover:text-[#1f5333] transition-colors">
              <Timer className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-[#1f5333] text-lg mb-2">Create 10-Minute Warm-up</h3>
            <p className="text-[13px] text-gray-500 font-medium leading-relaxed">Quick vocabulary and tone recall exercises to start the day.</p>
          </button>

          <button className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] text-left hover:border-[#c7cf35] hover:shadow-md transition-all group">
            <div className="h-10 w-10 bg-[#eef5e9] rounded-full flex items-center justify-center text-[#558866] mb-4 group-hover:bg-[#558866] group-hover:text-white transition-colors">
              <FileText className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-[#1f5333] text-lg mb-2">Create Unit Test</h3>
            <p className="text-[13px] text-gray-500 font-medium leading-relaxed">Comprehensive assessment covering multiple lesson chapters.</p>
          </button>

          <button className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] text-left hover:border-[#c7cf35] hover:shadow-md transition-all group">
            <div className="h-10 w-10 bg-[#f0f2f5] rounded-full flex items-center justify-center text-[#64748b] mb-4 group-hover:bg-[#64748b] group-hover:text-white transition-colors">
              <Award className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-[#1f5333] text-lg mb-2">Create Mock HSK</h3>
            <p className="text-[13px] text-gray-500 font-medium leading-relaxed">Official format simulation with standardized grading tools.</p>
          </button>
        </div>
      </div>

      {/* Featured Exam */}
      <div className="bg-white border border-[#dde8a6] rounded-[32px] p-8 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.06)] mb-12 flex flex-col lg:flex-row gap-8 relative overflow-hidden">
        
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#fcfce8] to-transparent opacity-50 pointer-events-none rounded-bl-full" />

        <div className="flex-1 relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-[#c7cf35] text-[#1f5333] px-3 py-1 rounded-md text-[11px] font-extrabold tracking-wide uppercase">Scheduled</span>
            <span className="text-[13px] text-gray-500 font-medium flex items-center gap-1.5">
              <Timer className="h-3.5 w-3.5" /> Open for Class 1B on Oct 25, 08:00 AM
            </span>
          </div>

          <h2 className="text-[32px] font-extrabold text-[#1f5333] tracking-tight mb-4">Autumn Midterm HSK 2</h2>
          
          <p className="text-[14px] text-gray-600 font-medium mb-8 max-w-lg leading-relaxed">
            Final review required before publication. Ensure audio clips for the listening comprehension section are correctly linked.
          </p>

          <div className="flex items-center gap-4">
            <button className="bg-[#1f5333] text-white px-6 py-2.5 rounded-full text-[14px] font-bold hover:bg-[#1f4e31] transition-colors flex items-center gap-2 shadow-sm">
              <Edit3 className="h-4 w-4" /> Edit Draft
            </button>
            <button className="bg-white text-[#1f5333] border border-gray-200 px-6 py-2.5 rounded-full text-[14px] font-bold hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm">
              Preview
            </button>
          </div>
        </div>

        <div className="w-full lg:w-[320px] bg-[#fbfbf8] rounded-3xl p-6 border border-[#f3f4e1] shrink-0 relative z-10">
          <h3 className="font-bold text-[#1f5333] text-[15px] mb-5">Question Configuration</h3>
          
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#78993a]">
                <Volume2 className="h-4 w-4" />
                <span className="text-[13px] font-bold">Listening (Audio)</span>
              </div>
              <span className="text-[12px] font-bold text-gray-500">15 Qs</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#78993a]">
                <ImageIcon className="h-4 w-4" />
                <span className="text-[13px] font-bold">Reading (Images)</span>
              </div>
              <span className="text-[12px] font-bold text-gray-500">20 Qs</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-400">
                <Edit2 className="h-4 w-4" />
                <span className="text-[13px] font-bold">Stroke Puzzles</span>
              </div>
              <span className="text-[12px] font-bold text-gray-400">0 Qs</span>
            </div>
          </div>

          <button className="text-[12px] font-bold text-[#78993a] flex items-center gap-1 hover:text-[#558866] transition-colors">
            Manage Structure <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

      </div>

      {/* Exam Repository */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="font-bold text-[#1f5333] text-[16px]">Exam Repository</h2>
          
          <div className="flex bg-[#fbfbf8] p-1.5 rounded-full border border-gray-100">
            {filters.map(f => (
              <button 
                key={f}
                onClick={() => setFilter(f)}
                className={`px-5 py-1.5 rounded-full text-[12px] font-bold transition-all ${
                  filter === f 
                    ? 'bg-[#fcfce8] text-[#78993a] shadow-sm border border-[#eaf3c5]' 
                    : 'text-gray-500 hover:text-[#1f5333]'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          
          {/* List Item 1 */}
          <div className="bg-white rounded-full p-4 pl-6 pr-8 border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-lg hover:-translate-y-1 hover:border-[#eaf3c5] transition-all duration-300 group cursor-pointer">
            <div className="flex items-center gap-5">
              <div className="h-10 w-10 bg-[#eef5e9] rounded-full flex items-center justify-center text-[#558866]">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-[#1f5333] text-[15px] group-hover:text-[#78993a] transition-colors">Unit 4: Food & Drink Test</h3>
                <p className="text-[12px] text-gray-400 font-medium mt-0.5">Class 2A • 30 Mins</p>
              </div>
            </div>
            <span className="bg-[#fff4f4] text-[#e55353] px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 border border-[#ffd5d5]">
              <span className="h-1.5 w-1.5 bg-[#e55353] rounded-full" /> Draft
            </span>
          </div>

          {/* List Item 2 */}
          <div className="bg-white rounded-full p-4 pl-6 pr-8 border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md hover:border-[#eaf3c5] transition-all group cursor-pointer">
            <div className="flex items-center gap-5">
              <div className="h-10 w-10 bg-[#f3f4e1] rounded-full flex items-center justify-center text-[#78993a]">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-[#11321e] text-[15px] group-hover:text-[#78993a] transition-colors">Weekly HSK 1 Simulation</h3>
                <p className="text-[12px] text-gray-400 font-medium mt-0.5">All Beginners • Closes in 2 days</p>
              </div>
            </div>
            <span className="bg-[#eaf3c5] text-[#4a5a3a] px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 border border-[#dde8a6]">
              <span className="h-1.5 w-1.5 bg-[#78993a] rounded-full" /> Active
            </span>
          </div>

          {/* List Item 3 */}
          <div className="bg-white rounded-full p-4 pl-6 pr-8 border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md hover:border-[#eaf3c5] transition-all group cursor-pointer opacity-70 hover:opacity-100">
            <div className="flex items-center gap-5">
              <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                <Timer className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-600 text-[15px] group-hover:text-[#78993a] transition-colors">Morning Warm-up: Tones</h3>
                <p className="text-[12px] text-gray-400 font-medium mt-0.5">Class 1B • Oct 20</p>
              </div>
            </div>
            <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 border border-gray-200">
              Completed
            </span>
          </div>

        </div>
      </div>

      {/* Floating Action Button */}
      <button className="fixed bottom-10 right-10 bg-[#11321e] text-white px-6 py-4 rounded-full shadow-[0_8px_30px_rgba(17,50,30,0.3)] hover:bg-[#1f4e31] hover:scale-105 transition-all flex items-center gap-2 font-bold z-50">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
        New Exam
      </button>

    </div>
  );
}
