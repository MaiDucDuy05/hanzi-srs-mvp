import { useState, useEffect, type FormEvent } from 'react';
import { Modal } from '@/features/ui/components/modal';
import { Button } from '@/features/ui/components/button';
import { Field, Input, Select } from '@/features/ui/components/form';
import type { Test } from '@/lib/api/types';
import { testApi } from '@/lib/api/endpoints/test';

interface ExamCreateModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingTestId: string | null;
  tests: Test[];
}

export function ExamCreateModal({ open, onClose, onSuccess, editingTestId, tests }: ExamCreateModalProps) {
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  useEffect(() => {
    if (open) {
      if (editingTestId) {
        const test = tests.find((t) => t.id === editingTestId);
        if (test) {
          setForm({
            name: test.name,
            description: test.description || '',
            timeLimitMinutes: String(test.timeLimitMinutes),
            attemptLimit: String(test.attemptLimit),
            accessCode: test.accessCode || '',
            hskLevel: String(test.hskLevel || 1),
            shuffleQuestions: test.shuffleQuestions || false,
            showAnswersAfter: test.showAnswersAfter || false,
          });
        }
      } else {
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
      }
      setError(null);
    }
  }, [open, editingTestId, tests]);

  const handleSaveExam = async (e: FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError(null);
    try {
      const data = {
        name: form.name,
        description: form.description || null,
        timeLimitMinutes: Number(form.timeLimitMinutes),
        attemptLimit: Number(form.attemptLimit),
        accessCode: form.accessCode || null,
        status: 'DRAFT' as const,
        showScoreImmediately: true,
        hskLevel: Number(form.hskLevel),
        shuffleQuestions: form.shuffleQuestions,
        showAnswersAfter: form.showAnswersAfter,
      };
      
      if (editingTestId) {
        await testApi.update(editingTestId, data);
      } else {
        await testApi.create(data);
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi lưu bài kiểm tra.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editingTestId ? 'Chỉnh sửa bài kiểm tra' : 'Tạo bài kiểm tra mới'}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Hủy
          </Button>
          <Button form="exam-form" type="submit" loading={creating}>
            {editingTestId ? 'Cập nhật' : 'Tạo đề'}
          </Button>
        </>
      }
    >
      <form id="exam-form" onSubmit={handleSaveExam} className="space-y-4">
        {error && <div className="text-red-500 text-sm">{error}</div>}
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
            placeholder="Nội dung bài kiểm tra..."
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
            <Select value={form.hskLevel} onChange={(e) => setForm({ ...form, hskLevel: e.target.value })}>
              {[1, 2, 3, 4, 5, 6].map((level) => (
                <option key={level} value={level}>
                  HSK {level}
                </option>
              ))}
            </Select>
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
  );
}
