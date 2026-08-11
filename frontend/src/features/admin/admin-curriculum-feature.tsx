'use client';

import { useEffect, useState } from 'react';
import { curriculumApi } from '@/lib/api/endpoints';
import type { Lesson, HskLevel } from '@/lib/api/types';
import { PageLoading } from '@/features/ui/components/spinner';
import { ErrorState } from '@/features/ui/components/error-state';
import { 
  Search, 
  Plus, 
  MoreVertical, 
  Eye, 
  Edit2, 
  Trash2, 
  CloudUpload,
  FileImage,
  FileAudio,
  FileUp
} from 'lucide-react';

export function AdminCurriculumFeature() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [levels, setLevels] = useState<HskLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [activeFilter, setActiveFilter] = useState('Tất cả');
  const filters = ['Tất cả', 'HSK 1', 'HSK 2', 'HSK 3', 'Theo Chủ Đề'];

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [lesRes, levRes] = await Promise.all([
          curriculumApi.listLessons({}),
          curriculumApi.listLevels()
        ]);
        if (cancelled) return;
        setLessons(lesRes);
        setLevels(levRes);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Lỗi tải dữ liệu.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const getLevelName = (levelId: string) => {
    const lvl = levels.find(l => l.id === levelId);
    return lvl ? lvl.code : 'Chủ đề: Ẩm thực'; // Fallback for UI if no level matched
  };

  if (loading) return <PageLoading label="Đang tải dữ liệu chương trình..." />;
  if (error) return <ErrorState message={error} onRetry={() => location.reload()} />;

  return (
    <div className="flex flex-col xl:flex-row gap-8 pb-10 max-w-[1400px]">
      
      {/* Main Content Column */}
      <div className="flex-1 space-y-8">
        
        {/* Header */}
        <div>
          <h1 className="text-[32px] leading-tight font-extrabold text-[#11321e] mb-2">
            Quản lý Chương trình
          </h1>
          <p className="text-sm text-gray-500 font-medium">
            Xây dựng và tinh chỉnh hành trình học tập.
          </p>
        </div>

        {/* Search & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-full text-sm bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#c7cf35] shadow-sm transition-shadow"
              placeholder="Tìm bài học, HSK..."
            />
          </div>
          <button className="bg-[#11321e] text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-[#1f4e31] transition-colors shadow-sm flex items-center justify-center gap-2">
            <Plus className="h-4 w-4" strokeWidth={3} />
            Tạo bài giảng
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {filters.map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-5 py-1.5 rounded-full text-[13px] font-bold border transition-colors ${
                activeFilter === filter 
                  ? 'bg-[#c7cf35] text-[#11321e] border-[#c7cf35] shadow-sm' 
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lessons.map(lesson => (
            <div key={lesson.id} className="bg-white rounded-3xl p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100 flex flex-col relative group">
              
              <div className="flex justify-between items-start mb-4">
                <span className="bg-[#d2e0e4] text-[#4a5a3a] px-3 py-1 rounded-full text-[11px] font-bold">
                  {getLevelName(lesson.levelId)}
                </span>
                <button className="text-gray-400 hover:text-gray-700 transition-colors">
                  <MoreVertical className="h-5 w-5" />
                </button>
              </div>

              <h3 className="text-lg font-bold text-[#11321e] mb-2 leading-tight">
                {lesson.title}
              </h3>
              
              <p className="text-[13px] text-gray-500 font-medium mb-8 line-clamp-3">
                {lesson.description || 'Bài học nhập môn về các từ vựng cơ bản và ngữ pháp trong tiếng Trung.'}
              </p>

              <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 text-[#11321e]">
                  <Eye className="h-4 w-4" strokeWidth={2.5} />
                  <span className="text-[11px] font-extrabold">{Math.floor(Math.random() * 20) + 10} Flashcards</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <button className="h-8 w-8 rounded-full bg-[#f3f4e1] flex items-center justify-center text-[#4a5a3a] hover:bg-[#dde8a6] transition-colors">
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button className="h-8 w-8 rounded-full bg-[#f3f4e1] flex items-center justify-center text-[#4a5a3a] hover:bg-red-100 hover:text-red-500 transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

            </div>
          ))}

          {/* Add New Card Button */}
          <button className="bg-[#f3f4e1]/50 border-2 border-dashed border-[#dde8a6] rounded-3xl p-6 flex flex-col items-center justify-center text-center hover:bg-[#f3f4e1] transition-colors min-h-[220px]">
            <div className="h-10 w-10 rounded-full bg-[#c7cf35] text-[#11321e] flex items-center justify-center mb-4">
              <Plus className="h-6 w-6" strokeWidth={2.5} />
            </div>
            <span className="text-[#11321e] font-bold text-[15px]">Tạo Khóa<br/>Học Mới</span>
          </button>
        </div>
      </div>

      {/* Right Sidebar - Upload */}
      <div className="w-full xl:w-[320px] shrink-0">
        <div className="bg-white rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100 p-6 sticky top-6">
          
          <div className="flex items-center gap-2 mb-2 text-[#11321e]">
            <CloudUpload className="h-5 w-5" strokeWidth={2.5} />
            <h2 className="font-bold text-[15px]">Tải Lên Nhanh</h2>
          </div>
          
          <p className="text-[12px] text-gray-500 font-medium mb-6">
            Kéo thả âm thanh, hình ảnh vào đây để lưu trữ đám mây.
          </p>

          <div className="bg-[#fcfbe8] border-2 border-dashed border-[#eaf3c5] rounded-3xl p-8 flex flex-col items-center justify-center text-center mb-8">
            <FileUp className="h-10 w-10 text-gray-400 mb-4" strokeWidth={1.5} />
            <p className="text-sm font-bold text-[#11321e] mb-1">Kéo thả file vào đây</p>
            <p className="text-[10px] text-gray-400 font-medium mb-6">Hỗ trợ JPG, PNG, MP3 (Tối đa 10MB)</p>
            
            <button className="bg-white text-[#11321e] border border-gray-200 px-5 py-2 rounded-full text-[12px] font-bold shadow-sm hover:bg-gray-50 transition-colors">
              Chọn File
            </button>
          </div>

          <div>
            <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-4">
              Tải Lên Gần Đây
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-[#e3eadd] flex items-center justify-center text-[#78993a] shrink-0">
                  <FileImage className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold text-[#11321e] truncate">panda_happy.png</p>
                  <p className="text-[10px] font-medium text-gray-400">Đã tải lên • 1.2 MB</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-[#ffdfdf] flex items-center justify-center text-[#e55353] shrink-0">
                  <FileAudio className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold text-[#11321e] truncate">ni_hao_audio.mp3</p>
                  <p className="text-[10px] font-medium text-gray-400">Đã tải lên • 450 KB</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
