import { useState, useEffect } from 'react';
import { Modal } from '@/features/ui/components/modal';
import { Button } from '@/features/ui/components/button';
import { questionBankApi } from '@/lib/api/endpoints/question-bank';
import { testApi } from '@/lib/api/endpoints/test';
import { QuestionBankModal as QuestionBankContent } from './question-bank-modal';

interface TestAddBankModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  testId: string;
  existingQuestionIds: string[];
}

export function TestAddBankModal({ open, onClose, onSuccess, testId, existingQuestionIds }: TestAddBankModalProps) {
  const [bankQuestions, setBankQuestions] = useState<any[]>([]);
  const [selectedBankIds, setSelectedBankIds] = useState<string[]>([]);
  const [savingBank, setSavingBank] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setLoading(true);
      setError(null);
      questionBankApi.list({ limit: 500 })
        .then((allBank) => {
          setBankQuestions(allBank);
          setSelectedBankIds(existingQuestionIds);
        })
        .catch((err) => {
          setError(err instanceof Error ? err.message : 'Lỗi tải ngân hàng câu hỏi.');
        })
        .finally(() => setLoading(false));
    }
  }, [open, existingQuestionIds]);

  const handleAddFromBank = async () => {
    setSavingBank(true);
    setError(null);
    try {
      const newIds = selectedBankIds.filter((id) => !existingQuestionIds.includes(id));
      if (newIds.length > 0) {
        await testApi.addQuestions(testId, newIds);
        onSuccess();
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi thêm câu hỏi.');
    } finally {
      setSavingBank(false);
    }
  };

  const newCount = selectedBankIds.filter((id) => !existingQuestionIds.includes(id)).length;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Thêm từ Ngân hàng câu hỏi"
      wide
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Hủy
          </Button>
          <Button loading={savingBank} onClick={handleAddFromBank}>
            Thêm ({newCount})
          </Button>
        </>
      }
    >
      {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
      {loading ? (
        <div className="py-8 text-center text-gray-500">Đang tải...</div>
      ) : (
        <QuestionBankContent
          questions={bankQuestions}
          selectedIds={selectedBankIds}
          onSelectionChange={setSelectedBankIds}
        />
      )}
    </Modal>
  );
}
