'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import { ArrowLeft, Plus, Trash2, GripVertical, BookOpen } from 'lucide-react';
import { testApi } from '@/lib/api/endpoints/test';
import { questionBankApi } from '@/lib/api/endpoints/question-bank';
import type { Test, TestQuestion } from '@/lib/api/types';
import { Button } from '@/features/ui/components/button';
import { Modal } from '@/features/ui/components/modal';
import { Field, Input, Select, Textarea } from '@/features/ui/components/form';
import { Card, CardBody } from '@/features/ui/components/card';
import { PageLoading } from '@/features/ui/components/spinner';
import { ErrorState } from '@/features/ui/components/error-state';
import { Badge } from '@/features/ui/components/badge';
import { cn } from '@/lib/utils/cn';
import { QuestionRenderer } from './components/question-renderer';
import { QuestionBankModal } from './components/question-bank-modal';

export function TestDetailFeature() {
  const { testId } = useParams<{ testId: string }>();
  const router = useRouter();

  const [test, setTest] = useState<Test | null>(null);
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Question bank modal
  const [showBankModal, setShowBankModal] = useState(false);
  const [bankQuestions, setBankQuestions] = useState<any[]>([]);
  const [selectedBankIds, setSelectedBankIds] = useState<string[]>([]);
  const [savingBank, setSavingBank] = useState(false);

  // Create question modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState({
    type: 'SINGLE_CHOICE',
    content: '',
    options: '',
    correctAnswer: '',
    explanation: '',
    points: '1',
  });

  const load = async () => {
    try {
      setLoading(true);
      const [t, qs] = await Promise.all([testApi.get(testId), testApi.listQuestions({ testId })]);
      setTest(t);
      setQuestions(qs.sort((a, b) => a.displayOrder - b.displayOrder));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Lỗi tải dữ liệu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [testId]);

  // Open question bank modal
  const openBankModal = async () => {
    try {
      const allBank = await questionBankApi.list({ limit: 500 });
      setBankQuestions(allBank);
      setSelectedBankIds(questions.map((q) => q.questionId));
      setShowBankModal(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi tải ngân hàng câu hỏi.');
    }
  };

  // Save selected from bank
  const handleAddFromBank = async () => {
    setSavingBank(true);
    try {
      const newIds = selectedBankIds.filter((id) => !questions.map((q) => q.questionId).includes(id));
      if (newIds.length > 0) {
        await testApi.addQuestions(testId, newIds);
        await load();
      }
      setShowBankModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi thêm câu hỏi.');
    } finally {
      setSavingBank(false);
    }
  };

  // Create new question inline
  const handleCreateQuestion = async (e: FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const optionsArr = createForm.options
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);

      const qData = {
        type: createForm.type as any,
        visibility: 'PRIVATE' as const,
        difficulty: 'MEDIUM' as const,
        content: {
          questionText: createForm.content,
          options: optionsArr.length > 0 ? optionsArr : null,
          correctAnswer: createForm.correctAnswer || null,
        },
        explanation: createForm.explanation || null,
      };

      const newQ = await questionBankApi.create(qData);
      await testApi.createQuestion({
        testId,
        questionId: newQ.id,
        points: Number(createForm.points),
        displayOrder: questions.length + 1,
      });

      setShowCreateModal(false);
      setCreateForm({
        type: 'SINGLE_CHOICE',
        content: '',
        options: '',
        correctAnswer: '',
        explanation: '',
        points: '1',
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi tạo câu hỏi.');
    } finally {
      setCreating(false);
    }
  };

  // Delete question
  const handleDeleteQuestion = async (q: TestQuestion) => {
    if (!window.confirm('Xóa câu hỏi này khỏi bài kiểm tra?')) return;
    try {
      await testApi.deleteQuestion(q.id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi xóa câu hỏi.');
    }
  };

  if (loading) return <PageLoading label="Đang tải chi tiết bài kiểm tra..." />;
  if (error || !test) return <ErrorState message={error || 'Không tìm thấy bài kiểm tra'} onRetry={load} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" /> Quay lại
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">{test.name}</h1>
          <p className="text-gray-600 text-sm mt-1">{test.description}</p>
        </div>
        <Badge tone={test.status === 'DRAFT' ? 'red' : test.status === 'PUBLISHED' ? 'green' : 'gray'}>
          {test.status === 'DRAFT' ? 'Nháp' : test.status === 'PUBLISHED' ? 'Hoạt động' : 'Đóng'}
        </Badge>
      </div>

      {/* Test Info */}
      <Card>
        <CardBody>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-gray-500 uppercase font-bold">Thời gian</p>
              <p className="text-lg font-semibold text-gray-900">{test.timeLimitMinutes} phút</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-bold">HSK Level</p>
              <p className="text-lg font-semibold text-gray-900">HSK {test.hskLevel || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-bold">Số câu</p>
              <p className="text-lg font-semibold text-gray-900">{questions.length}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-bold">Số lần</p>
              <p className="text-lg font-semibold text-gray-900">{test.attemptLimit}x</p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Questions Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <BookOpen className="h-5 w-5" /> Câu hỏi ({questions.length})
          </h2>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={openBankModal}>
              + Từ Ngân hàng
            </Button>
            <Button size="sm" onClick={() => setShowCreateModal(true)}>
              + Câu mới
            </Button>
          </div>
        </div>

        {questions.length === 0 ? (
          <Card>
            <CardBody className="text-center py-12">
              <BookOpen className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-600 font-medium">Chưa có câu hỏi nào</p>
              <p className="text-gray-500 text-sm">Thêm câu hỏi từ ngân hàng hoặc tạo câu mới</p>
            </CardBody>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 relative">
            {questions.map((q, idx) => (
              <div key={q.id} className="group relative">
                <QuestionRenderer question={q} index={idx} />
                <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white p-1 rounded shadow-sm border border-gray-100">
                  <div className="flex items-center gap-1 px-2 border-r border-gray-200">
                    <span className="text-xs font-medium text-gray-500 uppercase">Điểm:</span>
                    <input
                      type="number"
                      min={1}
                      defaultValue={q.points}
                      onBlur={async (e) => {
                        const newPoints = Number(e.target.value);
                        if (newPoints && newPoints !== q.points) {
                          try {
                            await testApi.updateQuestion(q.id, { points: newPoints });
                            await load();
                          } catch (err) {
                            alert('Lỗi cập nhật điểm');
                            e.target.value = String(q.points);
                          }
                        }
                      }}
                      onKeyDown={async (e) => {
                        if (e.key === 'Enter') {
                          e.currentTarget.blur();
                        }
                      }}
                      className="w-12 border border-gray-200 rounded px-1 py-0.5 text-sm text-center outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <button onClick={() => handleDeleteQuestion(q)}>
                    <Button size="sm" variant="danger" className="h-8 px-2">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add from Bank Modal */}
      <Modal
        open={showBankModal}
        onClose={() => setShowBankModal(false)}
        title="Thêm từ Ngân hàng câu hỏi"
        wide
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowBankModal(false)}>
              Hủy
            </Button>
            <Button loading={savingBank} onClick={handleAddFromBank}>
              Thêm ({selectedBankIds.filter((id) => !questions.map((q) => q.questionId).includes(id)).length})
            </Button>
          </>
        }
      >
        <QuestionBankModal
          questions={bankQuestions}
          selectedIds={selectedBankIds}
          onSelectionChange={setSelectedBankIds}
        />
      </Modal>

      {/* Create Question Modal */}
      <Modal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Tạo câu hỏi mới"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowCreateModal(false)}>
              Hủy
            </Button>
            <Button form="create-question-form" type="submit" loading={creating}>
              Tạo
            </Button>
          </>
        }
      >
        <form id="create-question-form" onSubmit={handleCreateQuestion} className="space-y-4">
          <Field label="Loại câu hỏi">
            <Select
              value={createForm.type}
              onChange={(e) => setCreateForm({ ...createForm, type: e.target.value as any })}
            >
              <option value="SINGLE_CHOICE">Trắc nghiệm (1 đáp án)</option>
              <option value="TRUE_FALSE">Đúng / Sai</option>
              <option value="SHORT_ANSWER">Trả lời ngắn</option>
              <option value="FILL_IN">Điền chỗ trống</option>
              <option value="ORDERING">Sắp xếp câu</option>
            </Select>
          </Field>

          <Field label="Nội dung câu hỏi">
            <Textarea
              required
              value={createForm.content}
              onChange={(e) => setCreateForm({ ...createForm, content: e.target.value })}
              placeholder="Nhập câu hỏi..."
              rows={3}
            />
          </Field>

          {createForm.type === 'SINGLE_CHOICE' && (
            <Field label="Các lựa chọn (mỗi dòng một lựa chọn)">
              <Textarea
                value={createForm.options}
                onChange={(e) => setCreateForm({ ...createForm, options: e.target.value })}
                placeholder="A&#10;B&#10;C&#10;D"
                rows={4}
              />
            </Field>
          )}

          <Field label="Đáp án đúng">
            <Input
              required
              value={createForm.correctAnswer}
              onChange={(e) => setCreateForm({ ...createForm, correctAnswer: e.target.value })}
              placeholder={createForm.type === 'TRUE_FALSE' ? 'true/false' : 'Nhập đáp án'}
            />
          </Field>

          <Field label="Giải thích (tùy chọn)">
            <Textarea
              value={createForm.explanation}
              onChange={(e) => setCreateForm({ ...createForm, explanation: e.target.value })}
              placeholder="Giải thích tại sao câu trả lời này đúng..."
              rows={2}
            />
          </Field>

          <Field label="Điểm">
            <Input
              type="number"
              min={1}
              value={createForm.points}
              onChange={(e) => setCreateForm({ ...createForm, points: e.target.value })}
            />
          </Field>
        </form>
      </Modal>
    </div>
  );
}
