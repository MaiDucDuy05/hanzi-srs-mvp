'use client';

import { useState, useEffect } from 'react';
import { Library, Plus, FileText, Clock, Calendar, Check, X } from 'lucide-react';
import { testApi } from '@/lib/api/endpoints/test';
import { questionBankApi } from '@/lib/api/endpoints/question-bank';
import type { Test, TestStatus } from '@/lib/api/types';
import type { QuestionBankItem } from '@/lib/api/endpoints/question-bank';
import { useAuth } from '@/lib/auth/auth-context';
import { ExamFilter } from './types';
import { EXAM_FILTERS, getDifficultyColor, getQuestionPreview, getStatusColor, getStatusLabel, getIndicatorColor } from './utils';
import { ExamHeader } from './components/exam-header';
import { QuickTemplates } from './components/quick-templates';
import { FeaturedExam } from './components/featured-exam';
import { ExamList } from './components/exam-list';
import { FloatingActionButton } from './components/floating-action-button';
import { QuestionSelector } from './components/question-selector';
import { Input } from '@/features/ui/components/form';
import { Button } from '@/features/ui/components/button';
import { Modal } from '@/features/ui/components/modal';
import { Field } from '@/features/ui/components/form';
import { formatDate } from '@/lib/utils/format';
import { AdminViolationBadge } from '@/components/shared/admin-violation-badge';

export function TeacherExamsFeature() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<ExamFilter>('All');
  const [loading, setLoading] = useState(true);
  const [tests, setTests] = useState<Test[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Create exam modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    timeLimitMinutes: '30',
    attemptLimit: '1',
    accessCode: '',
    hskLevel: '1',
    shuffleQuestions: false,
    showAnswersAfter: false,
  });

  // Question selector for newly created exam
  const [createdExamId, setCreatedExamId] = useState<string | null>(null);
  const [showQuestionSelector, setShowQuestionSelector] = useState(false);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);
  const [allQuestions, setAllQuestions] = useState<QuestionBankItem[]>([]);

  // Quick templates
  const templates = [
    {
      id: 'warmup-10min',
      title: '10-Min Warm-up',
      description: 'Vocabulary & tone recall exercises.',
      icon: 'TIMER' as const,
      accentColor: '#78993a',
      bgColor: '#f4f7ed',
      hoverBorderColor: '#c7cf35',
    },
    {
      id: 'unit-test',
      title: 'Unit Test',
      description: 'Comprehensive assessment covering chapters.',
      icon: 'FILE_TEXT' as const,
      accentColor: '#558866',
      bgColor: '#eef5e9',
      hoverBorderColor: '#558866',
    },
    {
      id: 'mock-hsk',
      title: 'Mock HSK',
      description: 'Official format simulation.',
      icon: 'AWARD' as const,
      accentColor: '#64748b',
      bgColor: '#f0f2f5',
      hoverBorderColor: '#64748b',
    },
  ];

  // Load tests from API
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

  // Load questions for selector (optionally with existing test questions pre-selected)
  const loadQuestions = async (preSelectedIds?: string[]) => {
    try {
      const questions = await questionBankApi.list({ limit: 500 });
      setAllQuestions(questions);
      // If we have pre-selected IDs (existing questions in test), use them
      if (preSelectedIds && preSelectedIds.length > 0) {
        setSelectedQuestionIds(preSelectedIds);
      }
    } catch (error) {
      console.error('Failed to load questions:', error);
    }
  };

  // Open question selector for an existing test (with existing questions pre-selected)
  const openQuestionSelector = async (testId: string) => {
    try {
      // Load existing test questions
      const existingQuestions = await testApi.listQuestions({ testId });
      const existingQuestionIds = existingQuestions.map((q: any) => q.questionId);

      // Load all questions from bank
      const questions = await questionBankApi.list({ limit: 500 });
      setAllQuestions(questions);
      setSelectedQuestionIds(existingQuestionIds);
      setCreatedExamId(testId);
      setShowQuestionSelector(true);
    } catch (error) {
      console.error('Failed to load test questions:', error);
      // Fallback: just open without pre-selection
      loadQuestions([]);
      setCreatedExamId(testId);
      setShowQuestionSelector(true);
    }
  };

  // Create exam (step 1)
  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setCreating(true);
    try {
      const newTest = await testApi.create({
        name: form.name,
        description: form.description || null,
        timeLimitMinutes: Number(form.timeLimitMinutes),
        attemptLimit: Number(form.attemptLimit),
        accessCode: form.accessCode || null,
        status: 'DRAFT',
        showScoreImmediately: true,
        hskLevel: Number(form.hskLevel),
        shuffleQuestions: form.shuffleQuestions,
        showAnswersAfter: form.showAnswersAfter,
      });

      // Reset form
      setForm({
        name: '',
        description: '',
        timeLimitMinutes: '30',
        attemptLimit: '1',
        accessCode: '',
        hskLevel: '1',
        shuffleQuestions: false,
        showAnswersAfter: false,
      });

      // Close create modal
      setShowCreateModal(false);

      // Open question selector for the new exam
      setCreatedExamId(newTest.id);
      setSelectedQuestionIds([]);
      await loadQuestions();
      setShowQuestionSelector(true);

      // Refresh list
      loadTests();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Tạo bài kiểm tra thất bại.');
    } finally {
      setCreating(false);
    }
  };

  // Add questions to exam (step 2)
  const handleAddQuestions = async () => {
    if (!createdExamId) return;

    try {
      if (selectedQuestionIds.length > 0) {
        await testApi.replaceQuestions(createdExamId, selectedQuestionIds);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Thêm câu hỏi thất bại.');
    } finally {
      setShowQuestionSelector(false);
      setCreatedExamId(null);
      setSelectedQuestionIds([]);
      loadTests();
    }
  };

  // Delete exam
  const handleDeleteExam = async (test: Test) => {
    if (!window.confirm(`Xóa đề "${test.name}"?`)) return;
    try {
      await testApi.remove(test.id);
      loadTests();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Xóa thất bại.');
    }
  };

  // Filter tests
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

  return (
    <div className="max-w-[1100px] pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <ExamHeader />

      <QuickTemplates templates={templates} onTemplateClick={() => setShowCreateModal(true)} />

      {/* Exam List */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="font-bold text-[#1f5333] text-[18px] flex items-center gap-2">
            <FileText className="h-5 w-5 text-[#558866]" /> Exam Repository
          </h2>

          <div className="flex bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
            {EXAM_FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-5 py-2 rounded-lg text-[13px] font-bold transition-all ${
                  filter === f
                    ? 'bg-[#1f5333] text-white shadow-sm'
                    : 'text-gray-500 hover:text-[#1f5333] hover:bg-gray-50'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center">
            <div className="animate-pulse">
              <div className="h-4 w-32 bg-gray-200 rounded mx-auto mb-4"></div>
              <div className="h-3 w-48 bg-gray-200 rounded mx-auto"></div>
            </div>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-600">
            {error}
          </div>
        )}

        {/* Test list */}
        {!loading && !error && (
          <div className="space-y-3">
            {filteredTests.map((test, index) => {
              const statusColors = getStatusColor(test.status === 'PUBLISHED' ? 'ACTIVE' : test.status);
              const indicatorColor = getIndicatorColor(test.status === 'PUBLISHED' ? 'ACTIVE' : test.status);

              return (
                <div
                  key={test.id}
                  className={`rounded-2xl p-4 pr-5 border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-300 group cursor-pointer relative overflow-hidden ${
                    index % 2 === 1 ? 'bg-gray-50' : 'bg-white hover:shadow-md hover:border-[#dde8a6]'
                  }`}
                >
                  {/* Left indicator */}
                  <div
                    className="absolute left-0 top-0 bottom-0 w-1.5"
                    style={{ backgroundColor: indicatorColor }}
                  />

                  <div className="flex items-center gap-4 pl-3">
                    <div
                      className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform ${
                        test.status === 'DRAFT'
                          ? 'bg-[#fff4f4] text-[#e55353]'
                          : test.status === 'PUBLISHED'
                          ? 'bg-[#f4f7ed] text-[#78993a]'
                          : 'bg-white border border-gray-200 text-gray-400'
                      }`}
                    >
                      <FileText className="h-6 w-6" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`font-bold text-[16px] group-hover:text-[${indicatorColor}] transition-colors ${
                          test.status === 'CLOSED' ? 'text-gray-600' : 'text-[#1f5333]'
                        }`}>
                          {test.name}
                        </h3>
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider border"
                          style={{
                            backgroundColor: statusColors.bg,
                            color: statusColors.text,
                            borderColor: statusColors.border,
                          }}
                        >
                          {getStatusLabel(test.status === 'PUBLISHED' ? 'ACTIVE' : test.status)}
                        </span>
                        <AdminViolationBadge 
                          hiddenByAdmin={test.hiddenByAdmin} 
                          hideReason={test.hideReason} 
                        />
                      </div>
                      <div className="flex items-center gap-4 text-[13px] text-gray-500 font-medium">
                        {test.hskLevel && (
                          <span className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" /> HSK {test.hskLevel}
                          </span>
                        )}
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" /> {test.timeLimitMinutes} Mins
                        </span>
                        <span>Tạo {formatDate(test.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 sm:opacity-0 group-hover:opacity-100 transition-opacity pl-15 sm:pl-0">
                    <button
                      onClick={() => openQuestionSelector(test.id)}
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
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredTests.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-[15px] font-medium">Chưa có bài kiểm tra nào</p>
                <p className="text-[13px] text-gray-400 mt-1">Bấm "+ Đề mới" để tạo</p>
              </div>
            )}
          </div>
        )}
      </div>

      <FloatingActionButton onClick={() => setShowCreateModal(true)} />

      {/* Create Exam Modal */}
      <Modal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Tạo bài kiểm tra mới"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowCreateModal(false)}>
              Hủy
            </Button>
            <Button
              form="create-exam-form"
              type="submit"
              loading={creating}
              disabled={!form.name.trim()}
            >
              Tạo đề
            </Button>
          </>
        }
      >
        <form id="create-exam-form" onSubmit={handleCreateExam} className="space-y-4">
          <Field label="Tên đề">
            <Input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Kiểm tra giữa kỳ HSK 1"
            />
          </Field>
          <Field label="Mô tả">
            <Input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Đề 25 phút..."
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Thời gian (phút)">
              <Input
                type="number"
                min={1}
                required
                value={form.timeLimitMinutes}
                onChange={(e) => setForm({ ...form, timeLimitMinutes: e.target.value })}
              />
            </Field>
            <Field label="Số lần làm tối đa">
              <Input
                type="number"
                min={1}
                required
                value={form.attemptLimit}
                onChange={(e) => setForm({ ...form, attemptLimit: e.target.value })}
              />
            </Field>
            <Field label="HSK Level">
              <Input
                type="number"
                min={1}
                max={6}
                required
                value={form.hskLevel}
                onChange={(e) => setForm({ ...form, hskLevel: e.target.value })}
              />
            </Field>
            <Field label="Mã truy cập (tùy chọn)">
              <Input
                value={form.accessCode}
                onChange={(e) => setForm({ ...form, accessCode: e.target.value })}
                placeholder="HSK1-2026"
              />
            </Field>
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.shuffleQuestions}
                onChange={(e) => setForm({ ...form, shuffleQuestions: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm font-medium">Đảo câu hỏi</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.showAnswersAfter}
                onChange={(e) => setForm({ ...form, showAnswersAfter: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm font-medium">Hiện đáp án sau khi nộp</span>
            </label>
          </div>
        </form>
      </Modal>

      {/* Question Selector Modal */}
      {showQuestionSelector && (
        <QuestionSelector
          questions={allQuestions.map((q) => ({
            id: q.id,
            type: q.type,
            questionType: q.questionType || q.type,
            sourceType: q.sourceType,
            hskLevel: q.hskLevel,
            lessonId: q.lessonId,
            topicId: q.topicId,
            content: q.content,
            explanation: q.explanation,
            difficulty: q.difficulty,
            visibility: q.visibility,
            tags: q.tags,
            isActive: q.isActive,
            createdAt: q.createdAt,
          }))}
          selectedIds={selectedQuestionIds}
          onSelectionChange={setSelectedQuestionIds}
          onClose={() => {
            setShowQuestionSelector(false);
            setCreatedExamId(null);
          }}
          onConfirm={handleAddQuestions}
          examId={createdExamId}
        />
      )}
    </div>
  );
}
