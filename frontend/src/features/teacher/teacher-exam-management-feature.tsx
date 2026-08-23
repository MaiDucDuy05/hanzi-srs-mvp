'use client';

import { useState, useEffect, type FormEvent } from 'react';
import Link from 'next/link';
import { 
  Library, 
  Plus, 
  FileText, 
  Clock, 
  Calendar, 
  X, 
  Settings, 
  Award, 
  FileEdit, 
  Trash2, 
  PlayCircle, 
  Lock,
  Send,
  Gamepad2
} from 'lucide-react';
import { testApi } from '@/lib/api/endpoints/test';
import type { Test, TestStatus } from '@/lib/api/types';
import { useAuth } from '@/lib/auth/auth-context';
import { formatDate } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';
import { AdminViolationBadge } from '@/components/shared/admin-violation-badge';

// Modals
import { ExamCreateModal } from './components/exam-create-modal';
import { ExamQuestionModal } from './components/exam-question-modal';
import { ExamAssignModal } from './components/exam-assign-modal';
import { LiveQuizConfigModal } from './components/live-quiz-config-modal';

type ExamFilter = 'All' | 'Drafts' | 'Active' | 'Completed';

export function TeacherExamManagementFeature() {
  const { user } = useAuth();
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<ExamFilter>('All');
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTestId, setEditingTestId] = useState<string | null>(null);
  
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [managingTestId, setManagingTestId] = useState<string | null>(null);

  const [assigningTestId, setAssigningTestId] = useState<string | null>(null);
  const [hostingTestId, setHostingTestId] = useState<string | null>(null);

  const loadTests = () => {
    if (!user) return;
    setLoading(true);
    testApi
      .list({ teacherId: user.id, limit: 100 })
      .then(setTests)
      .catch((e) => setError(e instanceof Error ? e.message : 'Lỗi tải bài kiểm tra.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadTests();
  }, [user]);

  const openCreateModal = () => {
    setEditingTestId(null);
    setShowCreateModal(true);
  };

  const openEditModal = (test: Test) => {
    setEditingTestId(test.id);
    setShowCreateModal(true);
  };

  const openQuestionModal = (testId: string) => {
    setManagingTestId(testId);
    setShowQuestionModal(true);
  };

  const handleDeleteExam = async (test: Test) => {
    if (!window.confirm(`Xóa đề "${test.name}"?`)) return;
    try {
      await testApi.remove(test.id);
      loadTests();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Xóa thất bại.');
    }
  };

  const handleChangeStatus = async (test: Test, newStatus: TestStatus) => {
    const actionNames = {
      PUBLISHED: 'Phát hành',
      CLOSED: 'Đóng',
      DRAFT: 'Chuyển về nháp'
    };
    if (!window.confirm(`${actionNames[newStatus]} bài thi "${test.name}"?`)) return;
    
    try {
      await testApi.update(test.id, { status: newStatus });
      loadTests();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Cập nhật trạng thái thất bại.');
    }
  };

  const filteredTests = tests.filter((t) => {
    switch (filter) {
      case 'Drafts':
        return t.status === 'DRAFT';
      case 'Active':
        return t.status === 'PUBLISHED';
      case 'Completed':
        return t.status === 'CLOSED';
      default:
        return true;
    }
  });

  const getStatusColor = (status: TestStatus) => {
    switch (status) {
      case 'DRAFT':
        return { bg: '#fff4f4', text: '#e55353', border: '#ffd5d5' };
      case 'PUBLISHED':
        return { bg: '#eaf3c5', text: '#4a5a3a', border: '#dde8a6' };
      case 'CLOSED':
        return { bg: '#f0f2f5', text: '#64748b', border: '#e2e8f0' };
      default:
        return { bg: '#f0f2f5', text: '#64748b', border: '#e2e8f0' };
    }
  };

  const getStatusLabel = (status: TestStatus) => {
    switch (status) {
      case 'DRAFT':
        return 'Nháp';
      case 'PUBLISHED':
        return 'Hoạt động';
      case 'CLOSED':
        return 'Đóng';
      default:
        return status;
    }
  };

  const getIndicatorColor = (status: TestStatus) => {
    switch (status) {
      case 'DRAFT':
        return '#e55353';
      case 'PUBLISHED':
        return '#78993a';
      case 'CLOSED':
        return '#94a3b8';
      default:
        return '#94a3b8';
    }
  };

  return (
    <div className="space-y-8">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-[32px] bg-[#1f5333] p-10 text-white shadow-xl mb-10">
        <div className="absolute -right-10 -top-24 h-96 w-96 rounded-full bg-white/5 blur-3xl pointer-events-none" />
        <div className="absolute right-40 -bottom-24 h-64 w-64 rounded-full bg-[#c7cf35]/10 blur-2xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-white/90 text-xs font-bold uppercase tracking-wider mb-4 backdrop-blur-sm">
            <Award className="h-3.5 w-3.5" />
            Teacher Dashboard
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-white">
            Exam Management
          </h1>
          <p className="text-lg text-white/80 font-medium leading-relaxed max-w-xl">
            Design, schedule, and grade assessments for your students. Create engaging tests in minutes.
          </p>
        </div>
      </div>

      {/* Exam Repository Section */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="font-bold text-[#1f5333] text-[18px] flex items-center gap-2">
            <FileText className="h-5 w-5 text-[#558866]" /> Exam Repository
          </h2>
          <div className="flex bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
            {(['All', 'Drafts', 'Active', 'Completed'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  'px-5 py-2 rounded-lg text-[13px] font-bold transition-all',
                  filter === f
                    ? 'bg-[#1f5333] text-white shadow-sm'
                    : 'text-gray-500 hover:text-[#1f5333] hover:bg-gray-50'
                )}
              >
                {f === 'All' ? 'Tất cả' : f === 'Drafts' ? 'Nháp' : f === 'Active' ? 'Hoạt động' : 'Đóng'}
              </button>
            ))}
          </div>
        </div>

        {loading && (
          <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center">
            <div className="animate-pulse">
              <div className="h-4 w-32 bg-gray-200 rounded mx-auto mb-4"></div>
              <div className="h-3 w-48 bg-gray-200 rounded mx-auto"></div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-600">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="space-y-3">
            {filteredTests.length === 0 ? (
              <div className="rounded-2xl p-8 border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] text-center">
                <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="text-gray-600 font-medium text-[15px]">Chưa có bài kiểm tra nào</p>
                <p className="text-gray-500 text-[13px] mt-1">Bấm "+ Đề mới" để tạo</p>
              </div>
            ) : (
              filteredTests.map((test, index) => {
                const statusColors = getStatusColor(test.status);
                const indicatorColor = getIndicatorColor(test.status);
                return (
                  <div
                    key={test.id}
                    className={cn(
                      'rounded-2xl p-4 pr-5 border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-300 group cursor-pointer relative overflow-hidden',
                      index % 2 === 1 ? 'bg-gray-50' : 'bg-white hover:shadow-md hover:border-[#dde8a6]'
                    )}
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ backgroundColor: indicatorColor }} />
                    <div className="flex items-center gap-4 pl-3">
                      <div
                        className={cn(
                          'h-12 w-12 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform',
                          test.status === 'DRAFT'
                            ? 'bg-[#fff4f4] text-[#e55353]'
                            : test.status === 'PUBLISHED'
                            ? 'bg-[#f4f7ed] text-[#78993a]'
                            : 'bg-white border border-gray-200 text-gray-400'
                        )}
                      >
                        <FileText className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-[16px] text-[#1f5333]">{test.name}</h3>
                          <span
                            className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider border"
                            style={{ backgroundColor: statusColors.bg, color: statusColors.text, borderColor: statusColors.border }}
                          >
                            {getStatusLabel(test.status)}
                          </span>
                        </div>
                        {test.description && (
                          <p className="text-[13px] text-gray-600 line-clamp-1 mb-2">{test.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-[13px] text-gray-500 font-medium mb-3">
                          <span className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5" /> {test.timeLimitMinutes} phút
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" /> HSK {test.hskLevel || '-'}
                          </span>
                          {test.accessCode && <span>🔑 {test.accessCode}</span>}
                          <span>Tạo {formatDate(test.createdAt)}</span>
                        </div>
                        <AdminViolationBadge 
                          hiddenByAdmin={test.hiddenByAdmin} 
                          hideReason={test.hideReason} 
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:opacity-0 group-hover:opacity-100 transition-opacity pl-15 sm:pl-0">
                      {!test.hiddenByAdmin && (
                        <>
                          {test.status === 'PUBLISHED' && (
                            <button
                              onClick={() => setHostingTestId(test.id)}
                              className="p-2 text-[#1f5333] hover:bg-[#eaf3c5] rounded-lg transition-colors font-bold flex items-center gap-1"
                              title="Host Live Quiz (Khởi động)"
                            >
                              <Gamepad2 className="h-5 w-5" />
                            </button>
                          )}
                          {test.status === 'DRAFT' && (
                            <button
                              onClick={() => handleChangeStatus(test, 'PUBLISHED')}
                              className="p-2 text-gray-400 hover:text-[#78993a] hover:bg-[#f4f7ed] rounded-lg transition-colors"
                              title="Phát hành bài thi"
                            >
                              <PlayCircle className="h-4 w-4" />
                            </button>
                          )}
                          {(test.status === 'PUBLISHED' || test.status === 'CLOSED') && (
                            <button
                              onClick={() => handleChangeStatus(test, test.status === 'PUBLISHED' ? 'CLOSED' : 'PUBLISHED')}
                              className="p-2 text-gray-400 hover:text-[#e55353] hover:bg-[#fff4f4] rounded-lg transition-colors"
                              title={test.status === 'PUBLISHED' ? "Đóng bài thi" : "Mở lại bài thi"}
                            >
                              <Lock className="h-4 w-4" />
                            </button>
                          )}
                          
                          <button
                            onClick={() => setAssigningTestId(test.id)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Giao bài kiểm tra"
                          >
                            <Send className="h-4 w-4" />
                          </button>

                          <Link href={`/teacher/exams/${test.id}`}>
                            <button
                              className="p-2 text-gray-400 hover:text-[#1f5333] hover:bg-gray-100 rounded-lg transition-colors"
                              title="Chi tiết bài kiểm tra"
                            >
                              <FileEdit className="h-4 w-4" />
                            </button>
                          </Link>
                          <button
                            onClick={() => openQuestionModal(test.id)}
                            className="p-2 text-gray-400 hover:text-[#1f5333] hover:bg-gray-100 rounded-lg transition-colors"
                            title="Quản lý câu hỏi"
                          >
                            <Library className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteExam(test)}
                            className="p-2 text-gray-400 hover:text-[#e55353] hover:bg-red-50 rounded-lg transition-colors"
                            title="Xóa"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-8 right-8">
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#1f5333] text-white font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
        >
          <Plus className="h-5 w-5" /> Đề mới
        </button>
      </div>

      {/* Modals extracted to components */}
      <ExamCreateModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={loadTests}
        editingTestId={editingTestId}
        tests={tests}
      />

      <ExamQuestionModal
        open={showQuestionModal}
        onClose={() => {
          setShowQuestionModal(false);
          setManagingTestId(null);
        }}
        onSuccess={loadTests}
        testId={managingTestId}
      />

      <ExamAssignModal 
        open={!!assigningTestId}
        onClose={() => setAssigningTestId(null)}
        testId={assigningTestId}
      />

      {hostingTestId && (
        <LiveQuizConfigModal
          open={!!hostingTestId}
          onClose={() => setHostingTestId(null)}
          testId={hostingTestId}
        />
      )}
    </div>
  );
}
