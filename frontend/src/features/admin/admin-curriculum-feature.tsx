'use client';

import { useEffect, useState } from 'react';
import { curriculumApi } from '@/lib/api/endpoints';
import { adminContentApi } from '@/lib/api/endpoints/admin-content';
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
import { CsvImportModal } from './components/csv-import-modal';
import { AdminCoursesTable } from './components/admin-courses-table';
import { AdminGrammarsTable } from './components/admin-grammars-table';
import { AdminTopicsTable } from './components/admin-topics-table';
import { AdminQuestionsTable } from './components/admin-questions-table';
import { VocabulariesTable } from './components/vocabularies-table';
import { AdminLessonsView } from './components/admin-lessons-view';

export function AdminCurriculumFeature() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [activeTab, setActiveTab] = useState('Bài học');
  const tabs = ['Khóa học', 'Bài học', 'Từ vựng', 'Ngữ pháp', 'Chủ đề', 'Câu hỏi Public'];

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

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 px-6 text-sm font-bold border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-[#11321e] text-[#11321e]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
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
        {activeTab === 'Khóa học' && (
          <div className="space-y-6">
            <AdminCoursesTable />
          </div>
        )}
        {/* Tab Content */}
        {activeTab === 'Bài học' && (
          <AdminLessonsView />
        )}

        {activeTab === 'Từ vựng' && (
          <VocabulariesTable />
        )}

        {activeTab === 'Ngữ pháp' && (
          <AdminGrammarsTable />
        )}

        {activeTab === 'Chủ đề' && (
          <AdminTopicsTable />
        )}

        {activeTab === 'Câu hỏi Public' && (
          <AdminQuestionsTable />
        )}

        {/* Mặc định cho các tab khác */}
        {![...tabs].includes(activeTab) && (
          <div className="text-center p-10 bg-white rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100">
            <h3 className="text-lg font-bold text-[#11321e] mb-2">Đang xây dựng...</h3>
            <p className="text-gray-500 text-sm">Tính năng quản lý {activeTab} đang được hoàn thiện.</p>
          </div>
        )}
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
