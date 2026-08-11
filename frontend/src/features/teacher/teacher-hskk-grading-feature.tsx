'use client';

import { 
  ClipboardList, 
  RotateCcw, 
  Play, 
  RotateCw, 
  History, 
  Send,
  Bold,
  Italic,
  Mic,
  Sparkles
} from 'lucide-react';

export function TeacherHskkGradingFeature() {
  return (
    <div className="max-w-[1200px] pb-20 animate-in fade-in duration-300 h-full flex flex-col">
      
      <div className="flex flex-col lg:flex-row gap-8 flex-1">
        
        {/* Left Column: Pending Tasks */}
        <div className="w-full lg:w-[350px] shrink-0">
          <div className="bg-white rounded-[32px] border border-gray-100 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] h-full min-h-[600px] flex flex-col overflow-hidden">
            
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#1f5333]">
                <ClipboardList className="h-5 w-5" strokeWidth={2.5} />
                <h2 className="font-extrabold text-[16px]">Pending Tasks</h2>
              </div>
              <span className="bg-[#eef5e9] text-[#558866] px-3 py-1 rounded-full text-[11px] font-extrabold">12 Left</span>
            </div>

            <div className="p-4 space-y-3 overflow-y-auto flex-1">
              
              {/* Task 1: Active */}
              <div className="bg-[#fcfce8] border border-[#eaf3c5] rounded-3xl p-5 shadow-sm cursor-pointer relative">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-[#78993a] rounded-r-md" />
                <div className="flex items-start justify-between mb-3 pl-2">
                  <div className="flex items-center gap-3">
                    <img 
                      src="https://api.dicebear.com/7.x/notionists/svg?seed=MeiLin" 
                      alt="Mei Lin" 
                      className="h-10 w-10 rounded-full bg-white border border-[#eaf3c5]"
                    />
                    <div>
                      <h3 className="font-extrabold text-[#1f5333] text-[15px]">Mei Lin</h3>
                      <p className="text-[11px] text-gray-500 font-medium">10 mins ago</p>
                    </div>
                  </div>
                  <span className="bg-[#c7cf35] text-[#1f5333] px-2.5 py-1 rounded-md text-[10px] font-extrabold">HSK 3</span>
                </div>
                <p className="text-[13px] text-gray-600 font-medium pl-2">Task 2: Describe a memorable trip...</p>
              </div>

              {/* Task 2 */}
              <div className="bg-white border border-gray-100 rounded-3xl p-5 hover:border-gray-200 hover:shadow-sm transition-all cursor-pointer">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-[#f0f2f5] flex items-center justify-center text-gray-500 font-bold text-lg">
                      L
                    </div>
                    <div>
                      <h3 className="font-extrabold text-gray-700 text-[15px]">Leo Zhang</h3>
                      <p className="text-[11px] text-gray-400 font-medium">Yesterday, 14:30</p>
                    </div>
                  </div>
                  <span className="bg-gray-100 text-gray-500 px-2.5 py-1 rounded-md text-[10px] font-extrabold">HSK 2</span>
                </div>
                <p className="text-[13px] text-gray-500 font-medium">Task 1: Self Introduction...</p>
              </div>

              {/* Task 3 */}
              <div className="bg-white border border-gray-100 rounded-3xl p-5 hover:border-gray-200 hover:shadow-sm transition-all cursor-pointer">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <img 
                      src="https://api.dicebear.com/7.x/notionists/svg?seed=ChenWei" 
                      alt="Chen Wei" 
                      className="h-10 w-10 rounded-full bg-[#f0f2f5] border border-gray-200"
                    />
                    <div>
                      <h3 className="font-extrabold text-gray-700 text-[15px]">Chen Wei</h3>
                      <p className="text-[11px] text-gray-400 font-medium">Yesterday, 09:15</p>
                    </div>
                  </div>
                  <span className="bg-[#c7cf35] text-[#1f5333] px-2.5 py-1 rounded-md text-[10px] font-extrabold">HSK 3</span>
                </div>
                <p className="text-[13px] text-gray-500 font-medium">Task 3: Reading Aloud...</p>
              </div>

            </div>

          </div>
        </div>

        {/* Right Column: Grading Area */}
        <div className="flex-1 flex flex-col gap-6">
          
          {/* Header */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <h1 className="text-[28px] font-extrabold text-[#1f5333] tracking-tight">Mei Lin's Submission</h1>
                <span className="bg-[#f3f4e1] border border-[#eaf3c5] text-[#78993a] px-3 py-1 rounded-full text-[11px] font-extrabold flex items-center gap-1.5 shadow-sm">
                  <Sparkles className="h-3 w-3" /> First Attempt
                </span>
              </div>
              <button className="flex items-center gap-2 text-[13px] font-bold text-gray-500 hover:text-[#1f5333] transition-colors">
                <History className="h-4 w-4" /> View Past
              </button>
            </div>
            <p className="text-[15px] text-gray-600 font-medium">HSKK Level 3 • Task 2: Descriptive Monologue</p>
          </div>

          {/* Audio Player Block */}
          <div className="bg-[#fcfce8] border border-[#eaf3c5] rounded-[40px] p-8 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.02)] relative overflow-hidden">
            {/* Background decorative circles */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
            <div className="absolute bottom-0 right-10 w-32 h-32 bg-[#eaf3c5]/50 rounded-full blur-xl translate-y-1/2 pointer-events-none" />

            <div className="relative z-10">
              
              {/* Waveform Visualization (Mock) */}
              <div className="h-24 flex items-center justify-center gap-1 mb-8">
                {Array.from({ length: 60 }).map((_, i) => {
                  const height = Math.max(10, Math.sin(i * 0.2) * 40 + Math.random() * 30 + 20);
                  const isPlayed = i < 20; // 33% played
                  return (
                    <div 
                      key={i} 
                      className={`w-1.5 rounded-full transition-all ${isPlayed ? 'bg-[#78993a]' : 'bg-[#dde8a6]'}`}
                      style={{ height: `${height}%` }}
                    />
                  );
                })}
                {/* Playhead */}
                <div className="absolute left-[33%] top-0 bottom-0 w-0.5 bg-[#1f5333] shadow-md z-20">
                  <div className="absolute -top-1 -translate-x-1/2 w-2.5 h-2.5 bg-[#1f5333] rounded-full" />
                  <div className="absolute -bottom-1 -translate-x-1/2 w-2.5 h-2.5 bg-[#1f5333] rounded-full" />
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-[13px] font-bold text-[#78993a]">
                  <span>01:15</span>
                  <div className="w-12 h-1 bg-[#dde8a6] rounded-full">
                    <div className="w-1/3 h-full bg-[#78993a] rounded-full" />
                  </div>
                  <span className="text-gray-400">03:45</span>
                </div>

                <div className="flex items-center gap-6">
                  <button className="text-[#78993a] hover:text-[#1f5333] transition-colors">
                    <RotateCcw className="h-5 w-5" />
                  </button>
                  <button className="h-14 w-14 bg-[#1f5333] rounded-full flex items-center justify-center text-white shadow-lg hover:bg-[#1b462b] hover:scale-105 transition-all">
                    <Play className="h-6 w-6 fill-current ml-1" />
                  </button>
                  <button className="text-[#78993a] hover:text-[#1f5333] transition-colors">
                    <RotateCw className="h-5 w-5" />
                  </button>
                </div>

                <div className="flex items-center gap-2 bg-white/50 backdrop-blur-sm rounded-full p-1 border border-[#eaf3c5]">
                  <button className="px-3 py-1 rounded-full text-[12px] font-bold text-gray-500 hover:text-[#1f5333]">0.5x</button>
                  <button className="px-3 py-1 rounded-full bg-white text-[#1f5333] text-[12px] font-extrabold shadow-sm">1x</button>
                  <button className="px-3 py-1 rounded-full text-[12px] font-bold text-gray-500 hover:text-[#1f5333]">2x</button>
                </div>
              </div>

            </div>
          </div>

          <div className="flex flex-col xl:flex-row gap-6 flex-1">
            
            {/* Assessment Rubric */}
            <div className="flex-1 bg-white rounded-[32px] p-6 border border-gray-100 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)]">
              <div className="flex items-center gap-2 text-[#1f5333] mb-6 border-b border-gray-100 pb-4">
                <ClipboardList className="h-5 w-5" strokeWidth={2.5} />
                <h2 className="font-extrabold text-[16px]">Assessment Rubric</h2>
              </div>
              
              <div className="space-y-6">
                
                {/* Rubric 1 */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[13px] font-bold text-gray-700">Fluency & Rhythm</span>
                    <span className="text-[13px] font-extrabold text-[#78993a] bg-[#eef5e9] px-2 py-0.5 rounded">4 / 5</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button 
                        key={num} 
                        className={`flex-1 h-10 rounded-full border flex items-center justify-center text-[14px] font-bold transition-all ${
                          num === 4 
                            ? 'bg-[#1f5333] border-[#1f5333] text-white shadow-md' 
                            : 'bg-white border-gray-200 text-gray-500 hover:border-[#1f5333] hover:text-[#1f5333]'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Rubric 2 */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[13px] font-bold text-gray-700">Pronunciation & Tones</span>
                    <span className="text-[13px] font-bold text-gray-400">-- / 5</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button 
                        key={num} 
                        className="flex-1 h-10 rounded-full border bg-white border-gray-200 text-gray-500 hover:border-[#1f5333] hover:text-[#1f5333] flex items-center justify-center text-[14px] font-bold transition-all"
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Rubric 3 */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[13px] font-bold text-gray-700">Vocabulary & Accuracy</span>
                    <span className="text-[13px] font-bold text-gray-400">-- / 5</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button 
                        key={num} 
                        className="flex-1 h-10 rounded-full border bg-white border-gray-200 text-gray-500 hover:border-[#1f5333] hover:text-[#1f5333] flex items-center justify-center text-[14px] font-bold transition-all"
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            {/* Teacher Notes */}
            <div className="flex-1 bg-white rounded-[32px] p-6 border border-gray-100 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-[#1f5333]">
                  <PenLine className="h-5 w-5" strokeWidth={2.5} />
                  <h2 className="font-extrabold text-[16px]">Teacher Notes</h2>
                </div>
                <button className="text-gray-400 hover:text-[#1f5333] transition-colors">
                  <Sparkles className="h-4 w-4" />
                </button>
              </div>
              
              <div className="flex-1 bg-[#fcfce8] border border-[#eaf3c5] rounded-3xl p-5 flex flex-col relative focus-within:ring-2 focus-within:ring-[#c7cf35] transition-all">
                <textarea 
                  className="w-full flex-1 bg-transparent border-none resize-none outline-none text-[14px] font-medium text-[#4a5a3a] placeholder:text-[#a0af80]"
                  placeholder="Type your feedback here..."
                  defaultValue={"Great job describing the mountain trip, Mei Lin!\nHowever, watch out for the third tone on '水' (shuǐ)..."}
                />
                
                <div className="flex items-center gap-3 mt-4 pt-4 border-t border-[#eaf3c5]">
                  <button className="h-8 w-8 rounded-full bg-white border border-[#eaf3c5] flex items-center justify-center text-gray-500 hover:text-[#1f5333] shadow-sm">
                    <Bold className="h-4 w-4" />
                  </button>
                  <button className="h-8 w-8 rounded-full bg-white border border-[#eaf3c5] flex items-center justify-center text-gray-500 hover:text-[#1f5333] shadow-sm">
                    <Italic className="h-4 w-4" />
                  </button>
                  <button className="h-8 w-8 rounded-full bg-white border border-[#eaf3c5] flex items-center justify-center text-gray-500 hover:text-[#1f5333] shadow-sm ml-auto">
                    <Mic className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

          </div>
          
          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-4 mt-2 mb-8">
            <button className="bg-white border-2 border-gray-200 text-gray-600 px-6 py-3 rounded-full text-[14px] font-bold hover:border-gray-300 hover:bg-gray-50 transition-all">
              Save Draft
            </button>
            <button className="bg-[#1f5333] text-white px-8 py-3 rounded-full text-[14px] font-bold hover:bg-[#1b462b] transition-all shadow-lg shadow-[#1f5333]/20 flex items-center gap-2">
              <Send className="h-4 w-4" /> Send to Student
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}

// Temporary PenLine component to avoid error if not exported from above
function PenLine(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  )
}
