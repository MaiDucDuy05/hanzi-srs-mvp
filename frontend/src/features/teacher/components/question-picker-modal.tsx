import { useState, useEffect } from 'react';
import { questionBankApi, type QuestionBankItem } from '@/lib/api/endpoints/question-bank';
import { Modal } from '@/features/ui/components/modal';
import { Button } from '@/features/ui/components/button';
import { PageLoading } from '@/features/ui/components/spinner';
import { ErrorState } from '@/features/ui/components/error-state';
import { Badge } from '@/features/ui/components/badge';

interface QuestionPickerModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (q: QuestionBankItem) => void;
}

export function QuestionPickerModal({ open, onClose, onSelect }: QuestionPickerModalProps) {
  const [questions, setQuestions] = useState<QuestionBankItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setLoading(true);
      questionBankApi.list({ limit: 50 })
        .then((data) => {
          setQuestions(data || []);
        })
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
    }
  }, [open]);

  return (
    <Modal open={open} onClose={onClose} title="Chọn từ Ngân hàng câu hỏi" wide footer={<Button variant="ghost" onClick={onClose}>Đóng</Button>}>
      {loading && <PageLoading label="Đang tải..." />}
      {error && <ErrorState message={error} />}
      {!loading && !error && (
        <div className="space-y-2 max-h-[60vh] overflow-y-auto">
          {questions.map((q) => (
            <div key={q.id} className="p-3 border rounded flex items-center justify-between gap-4">
              <div>
                <p className="font-medium text-sm">
                  {q.type === 'SINGLE_CHOICE' && (q.content as any).questionText}
                  {q.type === 'FILL_IN' && (q.content as any).sentence}
                  {q.type === 'ORDERING' && ((q.content as any).correctOrder || []).join(' / ')}
                  {q.type === 'MATCHING' && 'Nối từ tương ứng'}
                </p>
                <div className="flex gap-2 mt-1 text-xs text-gray-500">
                  <Badge tone="blue">{q.type}</Badge>
                  {q.hskLevel && <Badge tone="gray">HSK {q.hskLevel}</Badge>}
                  <Badge tone={q.difficulty === 'EASY' ? 'green' : q.difficulty === 'HARD' ? 'red' : 'amber'}>{q.difficulty}</Badge>
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={() => onSelect(q)}>
                Chọn
              </Button>
            </div>
          ))}
          {questions.length === 0 && <p className="text-sm text-gray-500">Ngân hàng câu hỏi trống.</p>}
        </div>
      )}
    </Modal>
  );
}
