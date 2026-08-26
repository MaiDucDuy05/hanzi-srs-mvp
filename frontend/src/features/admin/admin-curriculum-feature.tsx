'use client';

import { useState } from 'react';
import { PageLoading } from '@/features/ui/components/spinner';
import { ErrorState } from '@/features/ui/components/error-state';
import { 
  CloudUpload,
  FileImage,
  FileAudio,
  FileUp
} from 'lucide-react';
import { AdminCoursesTable } from './components/admin-courses-table';
import { AdminGrammarsTable } from './components/admin-grammars-table';
import { AdminTopicsTable } from './components/admin-topics-table';
import { VocabulariesTable } from './components/vocabularies-table';
import { AdminLessonsView } from './components/admin-lessons-view';

export function AdminCurriculumFeature() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [activeTab, setActiveTab] = useState('Bài học');
  const tabs = ['Khóa học', 'Bài học', 'Từ vựng', 'Ngữ pháp', 'Chủ đề'];

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

        {/* Mặc định cho các tab khác */}
        {![...tabs].includes(activeTab) && (
          <div className="text-center p-10 bg-white rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100">
            <h3 className="text-lg font-bold text-[#11321e] mb-2">Đang xây dựng...</h3>
            <p className="text-gray-500 text-sm">Tính năng quản lý {activeTab} đang được hoàn thiện.</p>
          </div>
        )}
      </div>

    </div>
  );
}
