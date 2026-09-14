'use client';

import { useEffect, useState } from 'react';
import { resourceApi } from '@/lib/api/endpoints';
import { PageLoading } from '@/features/ui/components/spinner';
import { ErrorState } from '@/features/ui/components/error-state';
import { Pagination } from '@/features/ui/components/pagination';
import type { Student, Mistake } from './types';
import { sortByFailCount } from './utils';
import { StudentCard } from './components/student-card';
import { StudentDetailModal } from './components/student-detail-modal';
import { ErrorNotebookModal } from './components/error-notebook-modal';
import { MistakeCard } from './components/mistake-card';

export function TeacherStudentsFeature() {
  const [students, setStudents] = useState<Student[]>([]);
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [previewMistakes, setPreviewMistakes] = useState<Mistake[]>([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [studentModalOpen, setStudentModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      if (search !== searchInput) {
        setSearch(searchInput);
        setPage(1);
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [searchInput, search]);

  useEffect(() => {
    let cancelled = false;
    const loadData = async () => {
      setLoading(true);
      try {
        const [studentsData, mistakesData] = await Promise.all([
          resourceApi.listStudentStats({ page, limit, search }),
          resourceApi.listMistakes({ limit: 5 }),
        ]);
        if (cancelled) return;
        setStudents(Array.isArray(studentsData?.data) ? studentsData.data : []);
        if (studentsData?.meta) setMeta(studentsData.meta);
        setPreviewMistakes(sortByFailCount(Array.isArray(mistakesData) ? mistakesData : []));
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Lỗi tải danh sách học viên.');
      } finally {
        if (!cancelled) {
          setLoading(false);
          setIsInitialLoad(false);
        }
      }
    };
    loadData();
    return () => { cancelled = true; };
  }, [page, limit, search]);

  if (isInitialLoad) return <PageLoading label="Đang tải dữ liệu học viên..." />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;

  return (
    <>
      <ErrorNotebookModal open={modalOpen} onClose={() => setModalOpen(false)} />
      <StudentDetailModal
        open={studentModalOpen}
        onClose={() => { setStudentModalOpen(false); setSelectedStudent(null); }}
        student={selectedStudent}
      />

      <div className="mb-8">
        <h1 className="text-[34px] font-extrabold text-[#1f5333] tracking-tight mb-2">Tiến độ học sinh</h1>
        <p className="text-[15px] text-gray-500 font-medium">Tất cả học sinh trong hệ thống</p>
      </div>

      {/* Main Content */}
      <div className="flex flex-col xl:flex-row gap-8">
        {/* Left: Students */}
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2 text-[#4a5a3a]">
              <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <h2 className="font-bold text-[16px]">Danh sách học sinh</h2>
              <span className="text-[12px] text-gray-400 font-medium whitespace-nowrap">({meta.total || students.length} học sinh)</span>
            </div>
            
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Tìm kiếm học viên..."
                className="px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1f5333] min-w-[200px]"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              <select
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1f5333]"
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
              >
                <option value={10}>10</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {students.length ? (
              students.map((s) => (
                <StudentCard
                  key={s.id}
                  student={s}
                  onClick={(student) => { setSelectedStudent(student); setStudentModalOpen(true); }}
                />
              ))
            ) : (
              <p className="text-gray-500 text-sm italic col-span-2">Chưa có học viên nào trong danh sách.</p>
            )}
          </div>
          {meta.totalPages > 1 && (
            <Pagination
              page={page}
              totalPages={meta.totalPages}
              onPage={setPage}
            />
          )}
        </div>

        {/* Right: Error Notebook */}
        <div className="w-full xl:w-[350px] shrink-0 xl:sticky xl:top-4 xl:self-start">
          <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)]">
            <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
              <svg className="h-6 w-6 text-[#e55353]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <h2 className="font-extrabold text-xl text-[#1f5333]">Sổ lỗi sai</h2>
            </div>
            <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-5">Nhấn để xem chi tiết</h3>
            <div className="space-y-3 mb-8 max-h-[520px] overflow-y-auto pr-1">
              {previewMistakes.length ? (
                previewMistakes.map((m, i) => <MistakeCard key={m.id} mistake={m} index={i} />)
              ) : (
                <p className="text-sm text-gray-400 italic text-center py-6">Chưa có lỗi sai nào được ghi nhận.</p>
              )}
            </div>
            {previewMistakes.length > 0 && (
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="mt-4 w-full bg-[#1f5333] text-white px-4 py-3 rounded-full text-[13px] font-bold hover:bg-[#2a6b42] transition-all shadow-sm"
              >
                Xem toàn bộ lỗi sai →
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
