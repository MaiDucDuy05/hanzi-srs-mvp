import { Modal } from '@/features/ui/components/modal';
import { Button } from '@/features/ui/components/button';
import { Badge } from '@/features/ui/components/badge';
import type { QuestionBankItem } from '@/lib/api/endpoints/question-bank';

interface QuestionPreviewModalProps {
  open: boolean;
  onClose: () => void;
  question: QuestionBankItem | null;
}

export function QuestionPreviewModal({ open, onClose, question }: QuestionPreviewModalProps) {
  if (!question) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Chi tiết câu hỏi"
      wide
      footer={<Button variant="outline" onClick={onClose}>Đóng</Button>}
    >
      <div className="space-y-6">
        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-2 pb-4 border-b border-gray-100">
          <Badge tone={question.type === 'SINGLE_CHOICE' ? 'blue' : 'gray'}>
            {question.type === 'SINGLE_CHOICE' && 'Trắc nghiệm'}
            {question.type === 'FILL_IN' && 'Điền từ'}
            {question.type === 'ORDERING' && 'Sắp xếp'}
            {question.type === 'MATCHING' && 'Nối từ'}
          </Badge>
          <Badge tone={question.difficulty === 'EASY' ? 'green' : question.difficulty === 'HARD' ? 'red' : 'amber'}>
            {question.difficulty === 'EASY' ? 'Dễ' : question.difficulty === 'HARD' ? 'Khó' : 'Trung bình'}
          </Badge>
          {question.hskLevel && <Badge tone="blue">HSK {question.hskLevel}</Badge>}
          <Badge tone={question.visibility === 'PUBLIC' ? 'green' : 'gray'}>
            {question.visibility}
          </Badge>
          {question.tags && question.tags.length > 0 && question.tags.map(t => (
            <span key={t} className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">#{t}</span>
          ))}
        </div>

        {/* Content based on Type */}
        <div className="text-base text-gray-800">
          {question.type === 'SINGLE_CHOICE' && (
            <div className="space-y-4">
              <p className="font-medium text-lg">{(question.content as any).questionText}</p>
              <div className="space-y-2">
                {((question.content as any).options || []).map((opt: any) => {
                  const isCorrect = (question.content as any).correctAnswer === opt.id;
                  return (
                    <div
                      key={opt.id}
                      className={`p-3 rounded-lg border ${
                        isCorrect ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                      } flex items-center justify-between`}
                    >
                      <span><strong className="mr-2">{opt.id}.</strong> {opt.text}</span>
                      {isCorrect && <span className="text-green-600 font-bold text-xl">✓</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {question.type === 'FILL_IN' && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg text-lg">
                {(question.content as any).sentence?.split('...').map((part: string, idx: number, arr: string[]) => (
                  <span key={idx}>
                    {part}
                    {idx < arr.length - 1 && (
                      <span className="inline-block border-b-2 border-gray-400 w-12 mx-2"></span>
                    )}
                  </span>
                ))}
              </div>
              <div>
                <strong className="text-sm text-gray-500 uppercase tracking-wide">Các đáp án đúng:</strong>
                <div className="flex flex-wrap gap-2 mt-2">
                  {((question.content as any).acceptedAnswers || []).map((ans: string, idx: number) => (
                    <Badge key={idx} tone="green">{ans}</Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          {question.type === 'ORDERING' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500 uppercase tracking-wide">Thứ tự đúng của câu:</p>
              <div className="flex flex-wrap gap-2">
                {((question.content as any).correctOrder || []).map((word: any, idx: number) => (
                  <span key={idx} className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg border border-blue-200 shadow-sm font-medium">
                    {typeof word === 'string' ? word : word.text}
                  </span>
                ))}
              </div>
            </div>
          )}

          {question.type === 'MATCHING' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500 uppercase tracking-wide">Các cặp nối tương ứng:</p>
              <div className="grid grid-cols-2 gap-4">
                {((question.content as any).pairs || []).map((pair: { left: string; right: string }, idx: number) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="flex-1 p-3 bg-gray-50 border rounded-lg text-center font-medium">{pair.left}</div>
                    <span className="text-gray-400 font-bold">↔</span>
                    <div className="flex-1 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-center font-medium">{pair.right}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Explanation */}
        {question.explanation && (
          <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-100">
            <div className="flex items-center gap-2 text-amber-800 font-medium mb-1">
              <span className="text-xl">💡</span> Giải thích
            </div>
            <p className="text-amber-900 whitespace-pre-wrap text-sm">{question.explanation}</p>
          </div>
        )}
      </div>
    </Modal>
  );
}
