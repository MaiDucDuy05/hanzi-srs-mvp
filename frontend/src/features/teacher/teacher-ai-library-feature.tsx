'use client';

import { 
  Wand2, 
  CloudUpload, 
  Filter, 
  ArrowUpDown, 
  Download, 
  Link as LinkIcon, 
  PenLine,
  FileText
} from 'lucide-react';

export function TeacherAILibraryFeature() {
  return (
    <div className="max-w-[1200px] pb-20 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-[34px] font-extrabold text-[#1f5333] tracking-tight mb-2">
          Resources & AI Tools
        </h1>
        <p className="text-[15px] text-gray-500 font-medium">
          Manage your teaching materials and generate AI stories for your students.
        </p>
      </div>

      {/* Top Section: Split 7-4 */}
      <div className="flex flex-col xl:flex-row gap-8 mb-16">
        
        {/* Left: AI Story Generator */}
        <div className="flex-[7]">
          <div className="bg-white rounded-[32px] p-8 border-t-[6px] border-[#c7cf35] shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] relative">
            
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <Wand2 className="h-7 w-7 text-[#78993a]" strokeWidth={2.5} />
                <div>
                  <h2 className="text-[22px] font-extrabold text-[#1f5333]">AI Story Generator</h2>
                  <p className="text-[13px] text-gray-500 font-medium">Generate a short Chinese story from a list of vocabulary.</p>
                </div>
              </div>
              <button className="h-10 w-10 bg-[#f3f4e1] rounded-full flex items-center justify-center text-[#78993a] hover:bg-[#eaf3c5] transition-colors">
                <PenLine className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-[13px] font-bold text-[#1f5333] mb-2">
                  Target Vocabulary (Comma separated)
                </label>
                <textarea 
                  rows={3}
                  placeholder="e.g. 家, 爸爸, 妈妈, 喜欢, 吃, 苹果"
                  className="w-full bg-white border border-gray-200 rounded-2xl p-4 text-[14px] outline-none focus:ring-2 focus:ring-[#eaf3c5] focus:border-[#78993a] transition-all resize-none shadow-sm"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[13px] font-bold text-[#1f5333] mb-2">HSK Level</label>
                  <select className="w-full bg-white border border-gray-200 rounded-full px-4 py-3 text-[14px] text-gray-700 outline-none focus:ring-2 focus:ring-[#eaf3c5] shadow-sm appearance-none cursor-pointer">
                    <option>HSK 1</option>
                    <option>HSK 2</option>
                    <option>HSK 3</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-[#1f5333] mb-2">Story Theme</label>
                  <select className="w-full bg-white border border-gray-200 rounded-full px-4 py-3 text-[14px] text-gray-700 outline-none focus:ring-2 focus:ring-[#eaf3c5] shadow-sm appearance-none cursor-pointer">
                    <option>Daily Life</option>
                    <option>Animals</option>
                    <option>Adventure</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button className="bg-[#1f5333] text-white px-8 py-3 rounded-full text-[14px] font-bold hover:bg-[#1b462b] transition-colors shadow-md flex items-center gap-2">
                  <Wand2 className="h-4 w-4" /> Generate Story
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Right: Upload Materials */}
        <div className="flex-[4]">
          <div className="h-full bg-white rounded-[32px] p-8 border border-gray-100 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] flex flex-col">
            <h3 className="font-extrabold text-[#1f5333] text-xl mb-1">Upload Materials</h3>
            <p className="text-[13px] text-gray-500 font-medium mb-6">Add PPTs or PDFs to your private library.</p>
            
            <div className="flex-1 border-2 border-dashed border-gray-200 rounded-[24px] bg-[#fbfbf8] hover:bg-[#f3f4e1]/50 transition-colors cursor-pointer flex flex-col items-center justify-center p-6 group">
              <div className="h-14 w-14 bg-white rounded-full flex items-center justify-center text-gray-400 group-hover:text-[#78993a] shadow-sm mb-4 transition-colors">
                <CloudUpload className="h-6 w-6" />
              </div>
              <p className="text-[14px] font-bold text-[#1f5333] mb-1">Drag & drop files here</p>
              <p className="text-[12px] text-gray-400 font-medium">or click to browse (Max 50MB)</p>
            </div>
          </div>
        </div>

      </div>

      {/* Community Library Section */}
      <div>
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl font-extrabold text-[#1f5333] mb-1">Forest Community Library</h2>
            <p className="text-[14px] text-gray-500 font-medium">Discover materials shared by other teachers.</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-full text-[12px] font-bold text-gray-600 hover:bg-gray-50 shadow-sm">
              <Filter className="h-3.5 w-3.5" /> Filter
            </button>
            <button className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-full text-[12px] font-bold text-gray-600 hover:bg-gray-50 shadow-sm">
              <ArrowUpDown className="h-3.5 w-3.5" /> Sort
            </button>
          </div>
        </div>

        {/* Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: PPT */}
          <div className="bg-white rounded-[24px] overflow-hidden border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col h-full">
            <div className="h-40 bg-[#8bc34a] p-6 relative flex items-end">
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full text-[11px] font-extrabold text-[#1f5333] flex items-center gap-1.5 shadow-sm">
                <div className="h-2 w-2 rounded-full bg-blue-500" /> PPT
              </div>
              <h3 className="text-xl font-extrabold text-[#1f5333] leading-tight">Family Members & Pets Introduction</h3>
            </div>
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="bg-[#eaf3c5] text-[#4a5a3a] px-3 py-1 rounded-full text-[11px] font-extrabold">HSK 1</span>
                <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-[11px] font-extrabold">Vocabulary</span>
              </div>
              <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-7 w-7 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600">LW</div>
                  <span className="text-[12px] font-medium text-gray-500">Lin Wang</span>
                </div>
                <button className="text-gray-400 hover:text-[#1f5333] transition-colors">
                  <Download className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Card 2: AI Story */}
          <div className="bg-white rounded-[24px] overflow-hidden border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col h-full">
            <div className="h-40 bg-[#cddc39] p-6 relative flex items-end">
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full text-[11px] font-extrabold text-[#1f5333] flex items-center gap-1.5 shadow-sm">
                <div className="h-2 w-2 rounded-full bg-yellow-500" /> AI Story
              </div>
              <h3 className="text-xl font-extrabold text-[#1f5333] leading-tight">The Little Cat Buys Apples</h3>
            </div>
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="bg-[#eaf3c5] text-[#4a5a3a] px-3 py-1 rounded-full text-[11px] font-extrabold">HSK 2</span>
                <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-[11px] font-extrabold">Reading</span>
                <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-[11px] font-extrabold">Animals</span>
              </div>
              <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-7 w-7 rounded-full bg-[#f3f4e1] flex items-center justify-center text-[10px] font-bold text-[#78993a]">CP</div>
                  <span className="text-[12px] font-medium text-gray-500">Cute Panda</span>
                </div>
                <button className="text-gray-400 hover:text-[#1f5333] transition-colors">
                  <LinkIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Card 3: PDF */}
          <div className="bg-white rounded-[24px] overflow-hidden border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col h-full">
            <div className="h-40 bg-[#cfd8dc] p-6 relative flex items-end">
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full text-[11px] font-extrabold text-[#1f5333] flex items-center gap-1.5 shadow-sm">
                <div className="h-2 w-2 rounded-full bg-red-500" /> PDF
              </div>
              <h3 className="text-xl font-extrabold text-[#1f5333] leading-tight">Numbers 1-100 Tracing Worksheets</h3>
            </div>
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="bg-[#eaf3c5] text-[#4a5a3a] px-3 py-1 rounded-full text-[11px] font-extrabold">HSK 1</span>
                <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-[11px] font-extrabold">Writing</span>
              </div>
              <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-7 w-7 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600">ZY</div>
                  <span className="text-[12px] font-medium text-gray-500">Zhang Ying</span>
                </div>
                <button className="text-gray-400 hover:text-[#1f5333] transition-colors">
                  <Download className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
