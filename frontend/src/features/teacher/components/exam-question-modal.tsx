import { useState, useEffect } from 'react';
import { Modal } from '@/features/ui/components/modal';
import { Button } from '@/features/ui/components/button';
import { Badge } from '@/features/ui/components/badge';
import type { QuestionBankItem } from '@/lib/api/endpoints/question-bank';
import { questionBankApi } from '@/lib/api/endpoints/question-bank';
import { testApi } from '@/lib/api/endpoints/test';

interface ExamQuestionModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  testId: string | null;
}

export function ExamQuestionModal({ open, onClose, onSuccess, testId }: ExamQuestionModalProps) {
  const [allQuestions, setAllQuestions] = useState<QuestionBankItem[]>([]);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && testId) {
      setLoading(true);
      setError(null);
      Promise.all([
        testApi.listQuestions({ testId }),
        questionBankApi.list({ limit: 500 }),
      ])
        .then(([existingQuestions, allQs]) => {
          setAllQuestions(allQs);
          setSelectedQuestionIds(existingQuestions.map((q: any) => q.questionId));
        })
        .catch((err) => {
          setError(err instanceof Error ? err.message : 'Lỗi tải câu hỏi.');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [open, testId]);

  const handleSaveQuestions = async () => {
    if (!testId) return;
    setSaving(true);
    setError(null);
    try {
      await testApi.replaceQuestions(testId, selectedQuestionIds);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi lưu câu hỏi.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Chọn câu hỏi cho bài kiểm tra"
      wide
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Hủy
          </Button>
          <Button loading={saving} onClick={handleSaveQuestions}>
            Lưu ({selectedQuestionIds.length} câu)
          </Button>
        </>
      }
    >
      {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
      
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {loading ? (
          <p className="text-center text-gray-500 py-8">Đang tải...</p>
        ) : allQuestions.length === 0 ? (
          <p className="text-center text-gray-500 py-8">Không có câu hỏi nào</p>
        ) : (
          allQuestions.map((q) => (
            <label
              key={q.id}
              className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedQuestionIds.includes(q.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedQuestionIds([...selectedQuestionIds, q.id]);
                  } else {
                    setSelectedQuestionIds(selectedQuestionIds.filter((id) => id !== q.id));
                  }
                }}
                className="mt-1 rounded"
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{q.type}</p>
                <p className="text-sm text-gray-700 mt-1 line-clamp-2">
                  {(q.content as any)?.questionText || (q.content as any)?.prompt || (q.content as any)?.question || '(Không có nội dung)'}
                </p>
              </div>
              <Badge tone="gray">{q.difficulty || 'N/A'}</Badge>
            </label>
          ))
        )}
      </div>
    </Modal>
  );
}
