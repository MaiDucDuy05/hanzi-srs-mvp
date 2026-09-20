'use client';

import React, { useState, useEffect } from 'react';
import { adminYctApi, type YctLevel, type YctLesson, type YctVocabulary } from '@/lib/api/endpoints/yct';
import { Edit2, Trash2, Plus, Search, Image as ImageIcon, Volume2 } from 'lucide-react';
import { Button } from '@/features/ui/components/button';
import { Spinner } from '@/features/ui/components/spinner';
import { speakText } from '@/lib/utils/tts';
import { EditYctVocabularyModal } from './edit-yct-vocabulary-modal';
import { resolveYctImageUrl } from '@/lib/utils/yct-image';

interface AdminYctVocabulariesTableProps {
  levels: YctLevel[];
  lessons: YctLesson[];
}

export function AdminYctVocabulariesTable({ levels, lessons }: AdminYctVocabulariesTableProps) {
  const [vocabularies, setVocabularies] = useState<YctVocabulary[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterLevel, setFilterLevel] = useState('');
  const [filterLesson, setFilterLesson] = useState('');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedVocab, setSelectedVocab] = useState<YctVocabulary | null>(null);

  const fetchVocabularies = async () => {
    setLoading(true);
    try {
      const res = await adminYctApi.getVocabularies({
        levelId: filterLevel || undefined,
        lessonId: filterLesson || undefined,
        search: search || undefined,
        limit: 100,
      });
      setVocabularies(res.items || []);
    } catch (err) {
      console.error('Failed to fetch YCT vocabularies:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVocabularies();
  }, [filterLevel, filterLesson]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchVocabularies();
  };

  const handleDelete = async (id: string, hanzi: string) => {
    if (confirm(`Bạn có chắc muốn xoá từ vựng "${hanzi}"?`)) {
      try {
        await adminYctApi.deleteVocabulary(id);
        fetchVocabularies();
      } catch (err) {
        console.error('Failed to delete vocabulary:', err);
        alert('Có lỗi xảy ra khi xoá từ vựng');
      }
    }
  };

  const filteredLessons = lessons.filter((l) => !filterLevel || l.levelId === filterLevel);

  return (
    <div className="space-y-4">
      {/* Thanh lọc & tìm kiếm */}
      <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-3 bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
        <form onSubmit={handleSearchSubmit} className="flex gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo chữ Hán, pinyin hoặc nghĩa..."
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#215b3b]"
            />
          </div>
          <Button type="submit" size="sm" variant="secondary" className="rounded-xl font-bold">
            Tìm
          </Button>
        </form>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={filterLevel}
            onChange={(e) => {
              setFilterLevel(e.target.value);
              setFilterLesson('');
            }}
            className="p-2 border border-gray-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#215b3b]"
          >
            <option value="">Tất cả cấp độ YCT</option>
            {levels.map((lvl) => (
              <option key={lvl.id} value={lvl.id}>
                {lvl.code}
              </option>
            ))}
          </select>

          <select
            value={filterLesson}
            onChange={(e) => setFilterLesson(e.target.value)}
            className="p-2 border border-gray-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#215b3b] max-w-[200px]"
          >
            <option value="">Tất cả bài học</option>
            {filteredLessons.map((les) => (
              <option key={les.id} value={les.id}>
                {les.title}
              </option>
            ))}
          </select>

          <Button
            onClick={() => {
              setSelectedVocab(null);
              setModalOpen(true);
            }}
            className="bg-[#11321e] hover:bg-[#1a4a2f] text-white font-bold rounded-xl whitespace-nowrap"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Thêm từ vựng YCT
          </Button>
        </div>
      </div>

      {/* Bảng danh sách từ vựng */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 flex justify-center">
            <Spinner />
          </div>
        ) : vocabularies.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            <ImageIcon className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="font-semibold">Chưa có từ vựng nào.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600 uppercase text-xs border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 font-bold">Hình ảnh (S3)</th>
                  <th className="px-4 py-3 font-bold">Chữ Hán</th>
                  <th className="px-4 py-3 font-bold">Pinyin</th>
                  <th className="px-4 py-3 font-bold">Nghĩa tiếng Việt</th>
                  <th className="px-4 py-3 font-bold">Cấp độ & Bài học</th>
                  <th className="px-4 py-3 font-bold">Trạng thái</th>
                  <th className="px-4 py-3 font-bold text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {vocabularies.map((vocab) => (
                  <tr key={vocab.id} className="hover:bg-[#f3f8d7]/20 transition-colors">
                    <td className="px-4 py-3">
                      {vocab.imageKey ? (
                        <img
                          src={resolveYctImageUrl(vocab.imageKey)}
                          alt={vocab.hanzi}
                          className="w-12 h-12 rounded-xl object-contain border border-[#eaf3c5] shadow-xs bg-gray-50/50 p-0.5"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 text-xs">
                          Chưa có
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-black text-gray-900">{vocab.hanzi}</span>
                        <button
                          onClick={() => speakText(vocab.hanzi)}
                          className="p-1 rounded-full text-gray-400 hover:text-[#215b3b] hover:bg-[#e5f5eb]"
                          title="Phát âm"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-bold text-[#215b3b]">{vocab.pinyin}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{vocab.meaningVi}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-xs text-[#215b3b]">
                          {vocab.level?.code || 'YCT'}
                        </span>
                        <span className="text-xs text-gray-500 truncate max-w-[150px]">
                          {vocab.lesson?.title || 'Chưa gán bài'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                          vocab.status === 'PUBLISHED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {vocab.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => {
                            setSelectedVocab(vocab);
                            setModalOpen(true);
                          }}
                          className="p-1.5 text-gray-500 hover:text-[#215b3b] hover:bg-[#e5f5eb] rounded-lg"
                          title="Chỉnh sửa"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(vocab.id, vocab.hanzi)}
                          className="p-1.5 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                          title="Xoá từ vựng"
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

      <EditYctVocabularyModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={fetchVocabularies}
        vocabulary={selectedVocab}
        levels={levels}
        lessons={lessons}
      />
    </div>
  );
}
