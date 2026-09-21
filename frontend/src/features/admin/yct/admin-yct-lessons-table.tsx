'use client';

import React, { useState, useEffect } from 'react';
import { adminYctApi, type YctLevel, type YctLesson } from '@/lib/api/endpoints/yct';
import { Edit2, Trash2, Plus, Search, BookOpen, Layers } from 'lucide-react';
import { Button } from '@/features/ui/components/button';
import { Spinner } from '@/features/ui/components/spinner';
import { EditYctLessonModal } from './edit-yct-lesson-modal';

interface AdminYctLessonsTableProps {
  levels: YctLevel[];
}

export function AdminYctLessonsTable({ levels }: AdminYctLessonsTableProps) {
  const [lessons, setLessons] = useState<YctLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterLevel, setFilterLevel] = useState('');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<YctLesson | null>(null);

  const fetchLessons = async () => {
    setLoading(true);
    try {
      const res = await adminYctApi.getLessons({
        levelId: filterLevel || undefined,
        search: search || undefined,
        limit: 100,
      });
      setLessons(res.items || []);
    } catch (err) {
      console.error('Failed to fetch YCT lessons:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLessons();
  }, [filterLevel]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLessons();
  };

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Bạn có chắc chắn muốn xoá bài học "${title}"?`)) {
      try {
        await adminYctApi.deleteLesson(id);
        fetchLessons();
      } catch (err) {
        console.error('Failed to delete lesson:', err);
        alert('Có lỗi xảy ra khi xoá bài học');
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Thanh công cụ */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
        <form onSubmit={handleSearchSubmit} className="flex gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm bài học..."
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#215b3b]"
            />
          </div>
          <Button type="submit" size="sm" variant="secondary" className="rounded-xl font-bold">
            Tìm
          </Button>
        </form>

        <div className="flex items-center gap-3">
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="p-2 border border-gray-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#215b3b]"
          >
            <option value="">Tất cả cấp độ YCT</option>
            {levels.map((lvl) => (
              <option key={lvl.id} value={lvl.id}>
                {lvl.code} - {lvl.name}
              </option>
            ))}
          </select>

          <Button
            onClick={() => {
              setSelectedLesson(null);
              setModalOpen(true);
            }}
            className="bg-[#11321e] hover:bg-[#1a4a2f] text-white font-bold rounded-xl whitespace-nowrap"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Thêm bài học
          </Button>
        </div>
      </div>

      {/* Bảng danh sách */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 flex justify-center">
            <Spinner />
          </div>
        ) : lessons.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="font-semibold">Chưa có bài học nào phù hợp.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600 uppercase text-xs border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 font-bold">STT</th>
                  <th className="px-4 py-3 font-bold">Cấp độ</th>
                  <th className="px-4 py-3 font-bold">Tên bài học</th>
                  <th className="px-4 py-3 font-bold">Mô tả</th>
                  <th className="px-4 py-3 font-bold">Trạng thái</th>
                  <th className="px-4 py-3 font-bold text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {lessons.map((lesson) => (
                  <tr key={lesson.id} className="hover:bg-[#f3f8d7]/20 transition-colors">
                    <td className="px-4 py-3 font-bold text-gray-500">
                      {lesson.displayOrder}
                    </td>
                    <td className="px-4 py-3">
                      <span className="bg-[#e5f5eb] text-[#215b3b] font-bold px-2.5 py-1 rounded-full text-xs">
                        {lesson.level?.code || 'YCT'}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-black text-gray-900">
                      {lesson.title}
                    </td>
                    <td className="px-4 py-3 text-gray-500 max-w-xs truncate">
                      {lesson.description || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                          lesson.status === 'PUBLISHED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {lesson.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => {
                            setSelectedLesson(lesson);
                            setModalOpen(true);
                          }}
                          className="p-1.5 text-gray-500 hover:text-[#215b3b] hover:bg-[#e5f5eb] rounded-lg"
                          title="Chỉnh sửa"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(lesson.id, lesson.title)}
                          className="p-1.5 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                          title="Xoá bài học"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <EditYctLessonModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={fetchLessons}
        lesson={selectedLesson}
        levels={levels}
      />
    </div>
  );
}
