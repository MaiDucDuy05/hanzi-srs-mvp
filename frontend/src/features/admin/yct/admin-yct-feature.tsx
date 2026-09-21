'use client';

import React, { useState, useEffect } from 'react';
import { adminYctApi, type YctLevel, type YctLesson } from '@/lib/api/endpoints/yct';
import { AdminYctLessonsTable } from './admin-yct-lessons-table';
import { AdminYctVocabulariesTable } from './admin-yct-vocabularies-table';
import { AdminYctLevelsTable } from './admin-yct-levels-table';
import { BookOpen, Image as ImageIcon, Layers, Sparkles } from 'lucide-react';
import { Spinner } from '@/features/ui/components/spinner';

type AdminTab = 'lessons' | 'vocabularies' | 'levels';

export function AdminYctFeature() {
  const [activeTab, setActiveTab] = useState<AdminTab>('lessons');
  const [levels, setLevels] = useState<YctLevel[]>([]);
  const [lessons, setLessons] = useState<YctLesson[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [lvls, lesRes] = await Promise.all([
        adminYctApi.getLevels(),
        adminYctApi.getLessons({ limit: 200 }),
      ]);
      setLevels(lvls || []);
      setLessons(lesRes.items || []);
    } catch (err) {
      console.error('Failed to load YCT admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-6 pb-12 max-w-[1400px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
            Quản Lý Chương Trình YCT
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Tách biệt hoàn toàn với HSK — Quản lý 6 cấp độ (YCT1–YCT6), bài học, từ vựng kèm hình ảnh trực quan lưu trên AWS S3.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 gap-2">
        <button
          onClick={() => setActiveTab('lessons')}
          className={`py-3 px-5 text-sm font-bold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'lessons'
              ? 'border-[#11321e] text-[#11321e]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Bài học YCT ({lessons.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('vocabularies')}
          className={`py-3 px-5 text-sm font-bold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'vocabularies'
              ? 'border-[#11321e] text-[#11321e]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>Từ vựng & Hình ảnh S3</span>
        </button>

        <button
          onClick={() => setActiveTab('levels')}
          className={`py-3 px-5 text-sm font-bold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'levels'
              ? 'border-[#11321e] text-[#11321e]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>6 Cấp độ YCT</span>
        </button>
      </div>

      {/* Nội dung tab */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <Spinner className="w-10 h-10" />
        </div>
      ) : (
        <div>
          {activeTab === 'lessons' && (
            <AdminYctLessonsTable levels={levels} />
          )}

          {activeTab === 'vocabularies' && (
            <AdminYctVocabulariesTable levels={levels} lessons={lessons} />
          )}

          {activeTab === 'levels' && (
            <AdminYctLevelsTable levels={levels} onRefresh={fetchData} />
          )}
        </div>
      )}
    </div>
  );
}
