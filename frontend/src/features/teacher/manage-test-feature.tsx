'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import { testApi } from '@/lib/api/endpoints';
import type { Test, TestAttempt, TestQuestion } from '@/lib/api/types';
import { Card, CardBody } from '@/features/ui/components/card';
import { Button } from '@/features/ui/components/button';
import { Modal } from '@/features/ui/components/modal';
import { Field, Input, Select } from '@/features/ui/components/form';
import { Tabs } from '@/features/ui/components/tabs';
import { PageLoading } from '@/features/ui/components/spinner';
import { ErrorState } from '@/features/ui/components/error-state';
import { Badge } from '@/features/ui/components/badge';
import { formatDateTime } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';
import { AdminViolationBadge } from '@/components/shared/admin-violation-badge';
import { StudentExamResultFeature } from '@/features/student/student-exam-result-feature';
import { SortableQuestionList } from './components/sortable-question-list';
import { QuestionPickerModal } from './components/question-picker-modal';

export function ManageTestFeature() {
  const { testId } = useParams<{ testId: string }>();
  const [test, setTest] = useState<Test | null>(null);
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [attempts, setAttempts] = useState<TestAttempt[]>([]);
  const [tab, setTab] = useState('questions');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showQuestion, setShowQuestion] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  const [selectedAttemptId, setSelectedAttemptId] = useState<string | null>(null);
  const [assignForm, setAssignForm] = useState({ classroomId: '', studentId: '', startTime: '', endTime: '' });
  const [qform, setQform] = useState({
    questionType: 'SINGLE_CHOICE',
    content: '',
    points: '2',
    options: '',
    correct: '',
  });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [t, qs, ats] = await Promise.all([
        testApi.get(testId),
        testApi.listQuestions({ testId }),
        testApi.listAttempts({ testId }),
      ]);
      setTest(t);
      setQuestions(qs.slice().sort((a, b) => a.displayOrder - b.displayOrder));
      setAttempts(ats);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Lỗi tải dữ liệu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [testId]);

  const togglePublish = async () => {
    if (!test) return;
    try {
      await testApi.update(test.id, { status: test.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED' });
      void load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Cập nhật trạng thái thất bại.');
    }
  };

  const addQuestion = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const type = qform.questionType as TestQuestion['questionType'];
      const optionsList = qform.options
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const correct = qform.correct.trim();
      const correctAnswer =
        type === 'SHORT_ANSWER'
          ? { accepted: correct.split('|').map((s) => s.trim()).filter(Boolean) }
          : { answer: type === 'TRUE_FALSE' ? correct === 'true' : correct };
      await testApi.createQuestion({
        testId,
        questionType: type,
        content: qform.content,
        options: optionsList.length ? { list: optionsList } : null,
        correctAnswer,
        points: Number(qform.points),
        displayOrder: questions.length + 1,
      });
      setShowQuestion(false);
      setQform({ questionType: 'SINGLE_CHOICE', content: '', points: '2', options: '', correct: '' });
      void load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Thêm câu hỏi thất bại.');
    } finally {
      setSaving(false);
    }
  };

  const deleteQuestion = async (q: TestQuestion) => {
    if (!window.confirm('Xóa câu hỏi này?')) return;
    try {
      await testApi.deleteQuestion(q.id);
      void load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Xóa câu hỏi thất bại.');
    }
  };

  const handleReorder = async (newOrder: TestQuestion[]) => {
    // Optimistic update
    setQuestions(newOrder);
    try {
      await testApi.updateQuestionOrder(testId, newOrder.map((q) => q.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Lỗi cập nhật thứ tự.');
      void load(); // revert
    }
  };

  const handleSelectFromPicker = async (q: any) => { // q is QuestionBankItem
    try {
      // Map properties properly from Question Bank Item to TestQuestion
      let contentString = '';
      let optionsObj = null;
      let correctAnswerObj = null;

      if (q.type === 'SINGLE_CHOICE') {
        contentString = q.content?.questionText || '';
        optionsObj = q.content?.options || null;
        correctAnswerObj = q.content?.correctAnswer || null;
      } else if (q.type === 'FILL_IN') {
        contentString = q.content?.sentence || '';
        correctAnswerObj = q.content?.acceptedAnswers || null;
      } else if (q.type === 'ORDERING') {
        contentString = 'Sắp xếp câu: ' + (q.content?.correctOrder || []).join(' / ');
        correctAnswerObj = q.content?.correctOrder || null;
      } else if (q.type === 'MATCHING') {
        contentString = 'Nối từ tương ứng';
        correctAnswerObj = q.content?.pairs || null;
      }

      await testApi.createQuestion({
        testId,
        questionType: q.type,
        content: contentString,
        options: optionsObj,
        correctAnswer: correctAnswerObj,
        points: q.difficulty === 'HARD' ? 3 : q.difficulty === 'MEDIUM' ? 2 : 1,
        displayOrder: questions.length + 1,
      });
      setShowPicker(false);
      void load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi thêm câu hỏi.');
    }
  };

  const handleAssign = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await testApi.assign(testId, {
        classroomId: assignForm.classroomId || null,
        studentId: assignForm.studentId || null,
        startTime: new Date(assignForm.startTime).toISOString(),
        endTime: new Date(assignForm.endTime).toISOString(),
      });
      setShowAssign(false);
      alert('Giao bài thành công!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Giao bài thất bại.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageLoading label="Đang tải..." />;
  if (error || !test)
    return <ErrorState message={error ?? 'Không tìm thấy đề.'} onRetry={() => void load()} />;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{test.name}</h1>
          <p className="mt-1 text-sm text-gray-500">
            {test.description ?? ''} · {questions.length} câu · {test.timeLimitMinutes} phút
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => void togglePublish()}>
            {test.status === 'PUBLISHED' ? 'Chuyển sang nháp' : 'Xuất bản'}
          </Button>
          <Button size="sm" onClick={() => setShowAssign(true)}>
            Giao bài
          </Button>
        </div>
      </header>

      <AdminViolationBadge 
        hiddenByAdmin={(test as any).hiddenByAdmin} 
        hideReason={(test as any).hideReason} 
      />

      <Tabs
        tabs={[
          { key: 'questions', label: 'Câu hỏi', badge: questions.length },
          { key: 'attempts', label: 'Lần làm bài', badge: attempts.length },
        ]}
        active={tab}
        onChange={setTab}
      />

      {tab === 'questions' && (
        <div className="space-y-4">
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="outline" onClick={() => setShowPicker(true)}>Chọn từ Ngân hàng</Button>
            <Button size="sm" onClick={() => setShowQuestion(true)}>+ Câu hỏi</Button>
          </div>
          <SortableQuestionList
            questions={questions}
            onReorder={handleReorder}
            onDelete={deleteQuestion}
          />
        </div>
      )}

      {tab === 'attempts' && (
        <div className="space-y-2">
          {attempts.map((a) => (
            <Card key={a.id} className="cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => setSelectedAttemptId(a.id)}>
              <CardBody>
                <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Badge tone={a.status === 'SUBMITTED' || a.status === 'GRADED' ? 'green' : 'amber'}>{a.status}</Badge>
                    <span className="text-gray-600">{formatDateTime(a.startedAt)}</span>
                  </div>
                  <div className="flex gap-3 text-gray-500">
                    <span>⏱ {Math.floor(a.durationSeconds / 60)} phút</span>
                    <span>🎯 {a.score}%</span>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
          {attempts.length === 0 && (
            <p className="text-sm text-gray-500">Chưa có học viên làm bài.</p>
          )}
        </div>
      )}

      <Modal
        open={showQuestion}
        onClose={() => setShowQuestion(false)}
        title="Thêm câu hỏi"
        wide
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowQuestion(false)}>Hủy</Button>
            <Button form="question-form" type="submit" loading={saving}>Thêm</Button>
          </>
        }
      >
        <form id="question-form" onSubmit={addQuestion} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Loại câu hỏi">
              <Select
                value={qform.questionType}
                onChange={(e) => setQform({ ...qform, questionType: e.target.value })}
              >
                <option value="SINGLE_CHOICE">Trắc nghiệm</option>
                <option value="TRUE_FALSE">Đúng / Sai</option>
                <option value="SHORT_ANSWER">Trả lời ngắn</option>
              </Select>
            </Field>
            <Field label="Điểm">
              <Input type="number" min={0} required value={qform.points} onChange={(e) => setQform({ ...qform, points: e.target.value })} />
            </Field>
          </div>
          <Field label="Nội dung câu hỏi">
            <Input required value={qform.content} onChange={(e) => setQform({ ...qform, content: e.target.value })} placeholder={'"你好" nghĩa là gì？'} />
          </Field>
          {qform.questionType !== 'SHORT_ANSWER' && (
            <Field label="Các lựa chọn (phân cách bằng dấu phẩy)" hint="Ví dụ: Cảm ơn, Xin chào, Tạm biệt">
              <Input value={qform.options} onChange={(e) => setQform({ ...qform, options: e.target.value })} placeholder="A, B, C, D" />
            </Field>
          )}
          <Field
            label={
              qform.questionType === 'TRUE_FALSE'
                ? 'Đáp án đúng (true/false)'
                : qform.questionType === 'SHORT_ANSWER'
                  ? 'Đáp án đúng (phân cách bằng |)'
                  : 'Đáp án đúng (ghi đúng nội dung lựa chọn)'
            }
          >
            <Input required value={qform.correct} onChange={(e) => setQform({ ...qform, correct: e.target.value })} placeholder={qform.questionType === 'TRUE_FALSE' ? 'true' : 'Xin chào'} />
          </Field>
          <p className={cn('text-xs text-gray-400')}>
            Lưu ý: câu trắc nghiệm chấm bằng cách so khớp nội dung lựa chọn.
          </p>
        </form>
      </Modal>

      <QuestionPickerModal
        open={showPicker}
        onClose={() => setShowPicker(false)}
        onSelect={handleSelectFromPicker}
      />

      <Modal
        open={showAssign}
        onClose={() => setShowAssign(false)}
        title="Giao bài kiểm tra"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowAssign(false)}>Hủy</Button>
            <Button form="assign-form" type="submit" loading={saving}>Giao bài</Button>
          </>
        }
      >
        <form id="assign-form" onSubmit={handleAssign} className="space-y-4">
          <Field label="ID Học viên (Student ID)">
            <Input value={assignForm.studentId} onChange={(e) => setAssignForm({ ...assignForm, studentId: e.target.value })} placeholder="UUID học viên" />
          </Field>
          <Field label="ID Lớp học (Classroom ID - Chưa hỗ trợ đầy đủ)">
            <Input value={assignForm.classroomId} onChange={(e) => setAssignForm({ ...assignForm, classroomId: e.target.value })} placeholder="UUID lớp học" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Thời gian mở đề">
              <Input type="datetime-local" required value={assignForm.startTime} onChange={(e) => setAssignForm({ ...assignForm, startTime: e.target.value })} />
            </Field>
            <Field label="Thời gian đóng đề">
              <Input type="datetime-local" required value={assignForm.endTime} onChange={(e) => setAssignForm({ ...assignForm, endTime: e.target.value })} />
            </Field>
          </div>
        </form>
      </Modal>
      <Modal
        open={!!selectedAttemptId}
        onClose={() => setSelectedAttemptId(null)}
        title="Chi tiết bài làm"
        wide
      >
        {selectedAttemptId && (
          <StudentExamResultFeature 
            attemptId={selectedAttemptId} 
            onBack={() => setSelectedAttemptId(null)} 
          />
        )}
      </Modal>

    </div>
  );
}
