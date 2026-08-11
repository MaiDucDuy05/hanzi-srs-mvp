'use client';

import { 
  Lightbulb,
  ArrowRight,
  FileText,
  Upload,
  CheckCircle,
  Users,
  Trophy,
  ClipboardList
} from 'lucide-react';

export function TeacherClassesFeature() {
  return (
    <div className="max-w-[1200px] pb-20 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="bg-white border-2 border-[#eaf3c5] rounded-[40px] p-10 mb-10 flex items-center justify-between shadow-[0_8px_30px_rgba(0,0,0,0.02)] relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-[36px] font-extrabold text-[#1f5333] tracking-tight mb-3">
            Good Morning, Teacher Panda.
          </h1>
          <p className="text-[15px] text-gray-500 font-medium">
            The forest is peaceful today. You have <span className="font-bold text-[#1f5333]">3 pending tasks</span>.
          </p>
        </div>
        
        {/* Decorative Image Container */}
        <div className="h-32 w-32 rounded-full overflow-hidden border-4 border-white shadow-lg relative z-10 shrink-0">
          <img 
            src="https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80" 
            alt="Panda resting in forest" 
            className="h-full w-full object-cover"
          />
        </div>

        {/* Background blobs */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#fcfce8] rounded-full blur-3xl opacity-60 pointer-events-none" />
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Column (Main Content) */}
        <div className="flex-1 space-y-10">
          
          {/* AI Insights */}
          <div>
            <div className="flex items-center gap-2 mb-4 text-[#78993a]">
              <Lightbulb className="h-5 w-5" strokeWidth={2.5} />
              <h2 className="font-bold text-[16px]">AI Insights</h2>
            </div>
            
            <div className="bg-white border-2 border-[#dde8a6] rounded-[24px] p-6 shadow-sm flex items-start gap-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="h-12 w-12 bg-[#fcfce8] rounded-full flex items-center justify-center text-[#78993a] shrink-0 border border-[#eaf3c5]">
                <Lightbulb className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-[17px] font-extrabold text-[#1f5333] mb-2">Focus Area: Tone Sandhi</h3>
                <p className="text-[14px] text-gray-600 font-medium leading-relaxed max-w-xl mb-4">
                  Based on last week's test results for <span className="font-bold text-[#1f5333]">Grade 10</span> - <span className="font-bold text-[#1f5333]">HSK 1</span>, 45% of students struggled with third-tone sandhi rules.
                </p>
                <button className="bg-white border-2 border-[#1f5333] text-[#1f5333] px-5 py-2 rounded-full text-[13px] font-bold shadow-sm hover:bg-[#1f5333] hover:text-white transition-colors">
                  Review Lesson Suggestion
                </button>
              </div>
            </div>
          </div>

          {/* Active Canopies */}
          <div>
            <div className="flex items-center gap-2 mb-4 text-[#4a5a3a]">
              <Users className="h-5 w-5" strokeWidth={2.5} />
              <h2 className="font-bold text-[16px]">Active Canopies</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Class Card 1 */}
              <div className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="font-extrabold text-[#1f5333] text-xl mb-2">Grade 10</h3>
                    <div className="flex items-center gap-2 text-gray-500 font-medium text-[13px]">
                      <Users className="h-4 w-4" /> 24 Students
                    </div>
                  </div>
                  <div className="bg-[#f0f2f5] px-3 py-1.5 rounded-lg border border-gray-200">
                    <span className="text-[11px] font-extrabold text-gray-500 tracking-wide">HSK 1</span>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[13px] text-gray-500 font-medium">Next: Greetings</span>
                  <ArrowRight className="h-5 w-5 text-[#1f5333] group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Class Card 2 */}
              <div className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="font-extrabold text-[#1f5333] text-xl mb-2">Adult Evening</h3>
                    <div className="flex items-center gap-2 text-gray-500 font-medium text-[13px]">
                      <Users className="h-4 w-4" /> 12 Students
                    </div>
                  </div>
                  <div className="bg-[#eaf3c5] px-3 py-1.5 rounded-lg border border-[#dde8a6]">
                    <span className="text-[11px] font-extrabold text-[#4a5a3a] tracking-wide">Adv. Conv.</span>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[13px] text-gray-500 font-medium">Next: Business Etiquette</span>
                  <ArrowRight className="h-5 w-5 text-[#1f5333] group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Right Column (Widgets) */}
        <div className="w-full lg:w-[350px] shrink-0 space-y-8">
          
          {/* Quick Actions */}
          <div>
            <div className="flex items-center gap-2 mb-4 text-[#1f5333]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>
              <h2 className="font-bold text-[16px]">Quick Actions</h2>
            </div>
            
            <div className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] space-y-4">
              
              <button className="w-full flex items-center gap-4 bg-white border border-gray-200 p-3 rounded-full hover:border-[#1f5333] hover:shadow-sm transition-all group">
                <div className="h-10 w-10 bg-[#1f5333] rounded-full flex items-center justify-center text-white shrink-0">
                  <FileText className="h-5 w-5" />
                </div>
                <span className="font-bold text-[14px] text-[#1f5333] group-hover:text-[#11321e]">New Exam</span>
              </button>

              <button className="w-full flex items-center gap-4 bg-white border border-gray-200 p-3 rounded-full hover:border-[#c7cf35] hover:shadow-sm transition-all group">
                <div className="h-10 w-10 bg-[#eaf3c5] rounded-full flex items-center justify-center text-[#4a5a3a] shrink-0">
                  <Upload className="h-5 w-5" />
                </div>
                <span className="font-bold text-[14px] text-gray-700 group-hover:text-[#1f5333]">Upload PPT</span>
              </button>

              <button className="w-full flex items-center gap-4 bg-white border border-gray-200 p-3 rounded-full hover:border-gray-400 hover:shadow-sm transition-all group">
                <div className="h-10 w-10 bg-[#f0f2f5] rounded-full flex items-center justify-center text-gray-500 shrink-0">
                  <CheckCircle className="h-5 w-5" />
                </div>
                <span className="font-bold text-[14px] text-gray-700 group-hover:text-[#1f5333]">Grade HSKK</span>
              </button>

            </div>
          </div>

          {/* Forest Activity */}
          <div>
            <div className="flex items-center gap-2 mb-4 text-[#78993a]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              <h2 className="font-bold text-[16px]">Forest Activity</h2>
            </div>
            
            <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)]">
              
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-100 before:to-transparent">
                
                {/* Item 1 */}
                <div className="relative flex items-start justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full border-4 border-white bg-[#eaf3c5] text-[#78993a] shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 absolute -left-3 md:left-1/2">
                    <Trophy className="h-3 w-3" strokeWidth={3} />
                  </div>
                  <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-2.5rem)] pl-4 md:pl-0 md:group-even:pr-4 md:group-odd:pl-4">
                    <p className="text-[13px] text-gray-600 font-medium leading-relaxed">
                      <span className="font-bold text-[#1f5333]">Mei Lin</span> achieved perfect score on Vocab Quiz 3.
                    </p>
                    <time className="text-[11px] font-bold text-gray-400 mt-1 block">10 mins ago</time>
                  </div>
                </div>

                {/* Item 2 */}
                <div className="relative flex items-start justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full border-4 border-white bg-[#f0f2f5] text-gray-400 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 absolute -left-3 md:left-1/2">
                    <ClipboardList className="h-3 w-3" strokeWidth={3} />
                  </div>
                  <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-2.5rem)] pl-4 md:pl-0 md:group-even:pr-4 md:group-odd:pl-4">
                    <p className="text-[13px] text-gray-600 font-medium leading-relaxed">
                      <span className="font-bold text-[#1f5333]">5 pending</span> HSKK audio submissions to review.
                    </p>
                    <time className="text-[11px] font-bold text-gray-400 mt-1 block">2 hours ago</time>
                  </div>
                </div>

                {/* Item 3 */}
                <div className="relative flex items-start justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full border-4 border-white bg-[#f0f2f5] text-gray-400 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 absolute -left-3 md:left-1/2">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                  </div>
                  <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-2.5rem)] pl-4 md:pl-0 md:group-even:pr-4 md:group-odd:pl-4">
                    <p className="text-[13px] text-gray-600 font-medium leading-relaxed">
                      Adult Evening class completed Unit 2.
                    </p>
                    <time className="text-[11px] font-bold text-gray-400 mt-1 block">Yesterday</time>
                  </div>
                </div>

              </div>

              <div className="mt-8 text-center border-t border-gray-100 pt-5">
                <button className="text-[12px] font-bold text-[#78993a] hover:text-[#1f5333] transition-colors">
                  View All Activity
                </button>
              </div>

            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
