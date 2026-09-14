import { useState, useEffect } from 'react';
import { Modal } from '@/features/ui/components/modal';
import { Button } from '@/features/ui/components/button';
import { Badge } from '@/features/ui/components/badge';
import { questionBankApi, type QuestionBankItem } from '@/lib/api/endpoints/question-bank';
import { Lightbulb, Check } from 'lucide-react';

interface QuestionPreviewModalProps {
  open: boolean;
  onClose: () => void;
  question: QuestionBankItem | null;
}

function QuestionContentPreview({ q, index }: { q: QuestionBankItem, index?: number }) {
  return (
    <div className="space-y-4">
      {index !== undefined && (
        <div className="text-sm font-bold text-gray-500 uppercase tracking-widest border-b pb-2 mb-4">Câu hỏi {index + 1}</div>
      )}
      
      {/* Media (Image & Audio) */}
      {((q.content as any).imageUrl || (q.content as any).audioUrl) && (
        <div className="space-y-4 mb-6">
          {(q.content as any).imageUrl && (
            <img src={(q.content as any).imageUrl} alt="preview" className="max-w-full h-auto rounded border" style={{ maxHeight: '300px' }} />
          )}
          {(q.content as any).audioUrl && (
            <div className="flex flex-col gap-1">
              <audio src={(q.content as any).audioUrl} controls className="w-full" />
              {(q.content as any).audioPlayLimit && (
                <span className="text-xs text-amber-600 font-medium">Giới hạn số lần nghe: {(q.content as any).audioPlayLimit} lần</span>
              )}
            </div>
          )}
        </div>
      )}

      {q.type === 'SINGLE_CHOICE' && (
        <div className="space-y-4">
          <p className="font-medium text-lg">{(q.content as any).questionText}</p>
          <div className="space-y-2">
            {((q.content as any).options || []).map((opt: any, idx: number) => {
              const optId = typeof opt === 'string' ? String.fromCharCode(65 + idx) : opt.id;
              const optText = typeof opt === 'string' ? opt : opt.text;
              const correctAnswer = (q.content as any).correctAnswer;
              const isCorrect = correctAnswer === optId || correctAnswer === optText;
          
              return (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border ${
                    isCorrect ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                  } flex items-center justify-between`}
                >
                  <span><strong className="mr-2">{optId}.</strong> {optText}</span>
                  {isCorrect && <Check className="w-5 h-5 text-emerald-600 font-bold stroke-[3]" />}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {q.type === 'TRUE_FALSE' && (
        <div className="space-y-4">
          <p className="font-medium text-lg">{(q.content as any).questionText || 'Đúng hay Sai?'}</p>
          <div className="p-4 bg-gray-50 rounded-lg text-lg">
            <strong>Đáp án đúng: </strong>
            {String((q.content as any).correctAnswer) === 'true' ? 'Đúng (True)' : 'Sai (False)'}
          </div>
        </div>
      )}

      {q.type === 'SHORT_ANSWER' && (
        <div className="space-y-4">
          <p className="font-medium text-lg">{(q.content as any).questionText || 'Trả lời ngắn:'}</p>
          <div className="p-4 bg-gray-50 rounded-lg text-lg">
            <strong>Đáp án đúng: </strong>
            {Array.isArray((q.content as any).acceptedAnswers) 
              ? ((q.content as any).acceptedAnswers).join(', ') 
              : ((q.content as any).correctAnswer || '(Chưa có đáp án)')}
          </div>
        </div>
      )}

      {q.type === 'FILL_IN' && (
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg text-lg">
            {(q.content as any).sentence?.split('...').map((part: string, idx: number, arr: string[]) => (
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
              {((q.content as any).acceptedAnswers || []).map((ans: string, idx: number) => (
                <Badge key={idx} tone="green">{ans}</Badge>
              ))}
            </div>
          </div>
        </div>
      )}

      {q.type === 'ORDERING' && (
        <div className="space-y-4">
          <p className="text-sm text-gray-500 uppercase tracking-wide">Thứ tự đúng của câu:</p>
          <div className="flex flex-wrap gap-2">
            {((q.content as any).correctOrder || []).map((word: any, idx: number) => (
              <span key={idx} className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg border border-blue-200 shadow-sm font-medium">
                {typeof word === 'string' ? word : word.text}
              </span>
            ))}
          </div>
        </div>
      )}

      {q.type === 'MATCHING' && (
        <div className="space-y-4">
          <p className="text-sm text-gray-500 uppercase tracking-wide">Các cặp nối tương ứng:</p>
          <div className="grid grid-cols-2 gap-4">
            {((q.content as any).pairs || []).map((pair: { left: string; right: string }, idx: number) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="flex-1 p-3 bg-gray-50 border rounded-lg text-center font-medium">{pair.left}</div>
                <span className="text-gray-400 font-bold">↔</span>
                <div className="flex-1 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-center font-medium">{pair.right}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {q.type === 'GROUP' && (
        <div className="space-y-4">
          <p className="font-medium text-lg whitespace-pre-wrap">{(q.content as any).questionText}</p>
          
          {q.children && q.children.length > 0 ? (
            <div className="space-y-6 mt-6">
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 flex justify-between items-center">
                <p className="text-sm font-medium text-gray-500">Nhóm này có <strong className="text-brand-600">{q.children.length}</strong> câu hỏi con.</p>
              </div>
              
              <div className="space-y-8 pl-4 border-l-2 border-gray-100">
                {q.children.map((child, idx) => (
                  <div key={child.id || idx}>
                    <QuestionContentPreview q={child} index={idx} />
                    
                    {/* Explanation cho từng câu con (nếu có) */}
                    {child.explanation && (
                      <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-100">
                        <div className="flex items-center gap-2 text-amber-800 font-medium mb-1 text-sm">
                          <Lightbulb className="w-3.5 h-3.5 text-amber-600" /> Giải thích
                        </div>
                        <p className="text-amber-900 whitespace-pre-wrap text-[13px]">{child.explanation}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-100 mt-4">
              <p className="text-sm font-medium text-amber-600">Nhóm này chưa có câu hỏi nào.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function QuestionPreviewModal({ open, onClose, question }: QuestionPreviewModalProps) {
  const [fullQuestion, setFullQuestion] = useState<QuestionBankItem | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && question) {
      if (question.type === 'GROUP') {
        setLoading(true);
        questionBankApi.get(question.id)
          .then(setFullQuestion)
          .catch(() => setFullQuestion(question))
          .finally(() => setLoading(false));
      } else {
        setFullQuestion(question);
      }
    } else {
      setFullQuestion(null);
    }
  }, [open, question]);

  if (!fullQuestion && !loading) return null;

  const displayQ = fullQuestion || question;
  if (!displayQ) return null;

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
          <Badge tone={displayQ.type === 'SINGLE_CHOICE' ? 'blue' : displayQ.type === 'GROUP' ? 'blue' : 'gray'}>
            {displayQ.type === 'SINGLE_CHOICE' && 'Trắc nghiệm'}
            {displayQ.type === 'FILL_IN' && 'Điền từ'}
            {displayQ.type === 'ORDERING' && 'Sắp xếp'}
            {displayQ.type === 'MATCHING' && 'Nối từ'}
            {displayQ.type === 'TRUE_FALSE' && 'Đúng/Sai'}
            {displayQ.type === 'SHORT_ANSWER' && 'Trả lời ngắn'}
            {displayQ.type === 'GROUP' && 'Câu hỏi chùm'}
          </Badge>
          <Badge tone={displayQ.difficulty === 'EASY' ? 'green' : displayQ.difficulty === 'HARD' ? 'red' : 'amber'}>
            {displayQ.difficulty === 'EASY' ? 'Dễ' : displayQ.difficulty === 'HARD' ? 'Khó' : 'Trung bình'}
          </Badge>
          {displayQ.hskLevel && <Badge tone="blue">HSK {displayQ.hskLevel}</Badge>}
          <Badge tone={displayQ.visibility === 'PUBLIC' ? 'green' : 'gray'}>
            {displayQ.visibility}
          </Badge>
          {displayQ.tags && displayQ.tags.length > 0 && displayQ.tags.map(t => (
            <span key={t} className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">#{t}</span>
          ))}
        </div>

        {/* Content based on Type */}
        <div className="text-base text-gray-800">
          {loading && (
            <div className="py-8 text-center text-gray-500 animate-pulse">
              Đang tải nội dung...
            </div>
          )}

          {!loading && (
            <>
              <QuestionContentPreview q={displayQ} />
            </>
          )}
        </div>

        {/* Explanation */}
        {displayQ.explanation && (
          <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-100">
            <div className="flex items-center gap-2 text-amber-800 font-medium mb-1">
              <Lightbulb className="w-4 h-4 text-amber-600" /> Giải thích
            </div>
            <p className="text-amber-900 whitespace-pre-wrap text-sm">{displayQ.explanation}</p>
          </div>
        )}

      </div>
    </Modal>
  );
}
