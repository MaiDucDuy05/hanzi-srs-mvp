import { useState, useEffect, type FormEvent } from 'react';
import { Modal } from '@/features/ui/components/modal';
import { Button } from '@/features/ui/components/button';
import { Field, Input, Select, Textarea } from '@/features/ui/components/form';
import { questionBankApi } from '@/lib/api/endpoints/question-bank';
import { resourceApi } from '@/lib/api/endpoints';

interface ChildQuestionModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  parentId: string;
  editChild?: any;
}

export function ChildQuestionModal({ open, onClose, onSuccess, parentId, editChild }: ChildQuestionModalProps) {
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [type, setType] = useState('SINGLE_CHOICE');
  const [difficulty, setDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>('MEDIUM');
  const [displayOrder, setDisplayOrder] = useState(0);
  const [explanation, setExplanation] = useState('');
  
  // MCQ state
  const [mcqText, setMcqText] = useState('');
  const [mcqOptions, setMcqOptions] = useState([{id:'A', text:''}, {id:'B', text:''}, {id:'C', text:''}, {id:'D', text:''}]);
  const [mcqCorrect, setMcqCorrect] = useState('A');

  // Fill in state
  const [fillInSentence, setFillInSentence] = useState('');
  const [fillInAccepted, setFillInAccepted] = useState('');

  // Ordering state
  const [orderingWords, setOrderingWords] = useState('');

  // Matching state
  const [matchingPairs, setMatchingPairs] = useState([{left:'', right:''}, {left:'', right:''}]);
  
  // True False state
  const [trueFalseAnswer, setTrueFalseAnswer] = useState('true');
  
  // Short Answer state
  const [shortAnswerText, setShortAnswerText] = useState('');
  const [shortAnswerAccepted, setShortAnswerAccepted] = useState('');

  useEffect(() => {
    if (open) {
      if (editChild) {
        setType(editChild.type || 'SINGLE_CHOICE');
        setDifficulty(editChild.difficulty || 'MEDIUM');
        setDisplayOrder(editChild.displayOrder || 0);
        setExplanation(editChild.explanation || '');
        const content = editChild.content || {};
        
        if (editChild.type === 'SINGLE_CHOICE') {
          setMcqText(content.questionText || '');
          if (Array.isArray(content.options) && typeof content.options[0] === 'string') {
             setMcqOptions([
               { id: 'A', text: content.options[0] || '' },
               { id: 'B', text: content.options[1] || '' },
               { id: 'C', text: content.options[2] || '' },
               { id: 'D', text: content.options[3] || '' },
             ]);
          } else {
             setMcqOptions(content.options?.length > 0 ? content.options : [{id:'A', text:''}, {id:'B', text:''}, {id:'C', text:''}, {id:'D', text:''}]);
          }
          setMcqCorrect(content.correctAnswer || 'A');
        } else if (editChild.type === 'FILL_IN') {
          setFillInSentence(content.sentence || content.questionText || '');
          setFillInAccepted((content.acceptedAnswers || []).join(', '));
        } else if (editChild.type === 'ORDERING') {
          setOrderingWords((content.correctOrder || []).map((w: any) => typeof w === 'string' ? w : w.text).join(', '));
        } else if (editChild.type === 'MATCHING') {
          setMatchingPairs(content.pairs?.length > 0 ? content.pairs : [{left:'', right:''}, {left:'', right:''}]);
        } else if (editChild.type === 'TRUE_FALSE') {
          setMcqText(content.questionText || '');
          setTrueFalseAnswer(String(content.correctAnswer));
        } else if (editChild.type === 'SHORT_ANSWER') {
          setShortAnswerText(content.questionText || '');
          setShortAnswerAccepted(Array.isArray(content.acceptedAnswers) ? content.acceptedAnswers.join(', ') : (content.correctAnswer || ''));
        }
      } else {
        resetForm();
      }
      setError(null);
    }
  }, [open, editChild]);

  const resetForm = () => {
    setType('SINGLE_CHOICE');
    setDifficulty('MEDIUM');
    setDisplayOrder(0);
    setExplanation('');
    setMcqText('');
    setMcqOptions([{id:'A', text:''}, {id:'B', text:''}, {id:'C', text:''}, {id:'D', text:''}]);
    setMcqCorrect('A');
    setFillInSentence('');
    setFillInAccepted('');
    setOrderingWords('');
    setMatchingPairs([{left:'', right:''}, {left:'', right:''}]);
    setTrueFalseAnswer('true');
    setShortAnswerText('');
    setShortAnswerAccepted('');
  };

  const handleCreateQuestion = async (e: FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError(null);
    try {
      let content: any = {};
      if (type === 'SINGLE_CHOICE') {
        content = {
          questionText: mcqText,
          options: mcqOptions,
          correctAnswer: mcqCorrect,
        };
      } else if (type === 'FILL_IN') {
        content = {
          sentence: fillInSentence,
          acceptedAnswers: fillInAccepted.split(',').map(s => s.trim()).filter(Boolean),
        };
      } else if (type === 'ORDERING') {
        content = {
          correctOrder: orderingWords.split(',').map(s => s.trim()).filter(Boolean),
        };
      } else if (type === 'MATCHING') {
        content = {
          pairs: matchingPairs.filter(p => p.left && p.right),
        };
      } else if (type === 'TRUE_FALSE') {
        content = {
          questionText: mcqText,
          correctAnswer: trueFalseAnswer === 'true',
        };
      } else if (type === 'SHORT_ANSWER') {
        content = {
          questionText: shortAnswerText,
          acceptedAnswers: shortAnswerAccepted.split(',').map(s => s.trim()).filter(Boolean),
          correctAnswer: shortAnswerAccepted.split(',')[0]?.trim() || '',
        };
      }

      const qData = {
        type: type as any,
        parentId,
        difficulty,
        displayOrder,
        visibility: 'PRIVATE' as const, // Inherit in practice, but API requires it
        content,
        explanation: explanation || null,
      };

      if (editChild) {
        await questionBankApi.update(editChild.id, qData);
      } else {
        await questionBankApi.create(qData);
      }

      resetForm();
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi tạo câu hỏi phụ.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editChild ? "Sửa câu hỏi phụ" : "Tạo câu hỏi phụ"}
      wide
      footer={
        <>
          <Button variant="ghost" onClick={onClose} type="button">Hủy</Button>
          <Button form="create-child-form" type="submit" loading={creating}>{editChild ? "Lưu thay đổi" : "Tạo câu hỏi"}</Button>
        </>
      }
    >
      <form id="create-child-form" onSubmit={handleCreateQuestion} className="space-y-4">
        {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
        
        <div className="grid grid-cols-3 gap-4">
          <Field label="Loại câu hỏi *">
            <Select value={type} onChange={e => setType(e.target.value)} required>
              <option value="SINGLE_CHOICE">Trắc nghiệm (1 đáp án)</option>
              <option value="TRUE_FALSE">Đúng / Sai</option>
              <option value="SHORT_ANSWER">Trả lời ngắn</option>
              <option value="FILL_IN">Điền chỗ trống</option>
              <option value="ORDERING">Sắp xếp câu</option>
              <option value="MATCHING">Nối từ</option>
              <option value="SPEAKING">Nói (Speaking)</option>
              <option value="WRITING">Viết (Writing)</option>
            </Select>
          </Field>
          <Field label="Độ khó">
            <Select value={difficulty} onChange={e => setDifficulty(e.target.value as any)}>
              <option value="EASY">Dễ</option>
              <option value="MEDIUM">Trung bình</option>
              <option value="HARD">Khó</option>
            </Select>
          </Field>
          <Field label="Thứ tự (Order)">
            <Input type="number" value={displayOrder} onChange={e => setDisplayOrder(parseInt(e.target.value) || 0)} />
          </Field>
        </div>

        {/* Content Type Renderers */}
        {type === 'SINGLE_CHOICE' && (
          <div className="space-y-4 border p-4 rounded-md">
            <Field label="Nội dung câu hỏi phụ *">
              <Input required placeholder="Nhập câu hỏi" value={mcqText} onChange={e => setMcqText(e.target.value)} />
            </Field>
            <div className="space-y-2">
              <label className="text-sm font-medium">Các đáp án</label>
              {mcqOptions.map((opt, i) => (
                <div key={opt.id} className="flex gap-2 items-center">
                  <input type="radio" name="childMcqCorrect" checked={mcqCorrect === opt.id} onChange={() => setMcqCorrect(opt.id)} />
                  <span className="font-bold w-6">{opt.id}.</span>
                  <Input required value={opt.text} onChange={e => {
                    const newOpts = [...mcqOptions];
                    newOpts[i].text = e.target.value;
                    setMcqOptions(newOpts);
                  }} />
                </div>
              ))}
            </div>
          </div>
        )}

        {type === 'FILL_IN' && (
          <div className="space-y-4 border p-4 rounded-md">
            <Field label="Câu hỏi (dùng ___ để tạo chỗ trống) *">
              <Input required placeholder="我喜欢吃___。" value={fillInSentence} onChange={e => setFillInSentence(e.target.value)} />
            </Field>
            <Field label="Các đáp án chấp nhận (phân cách bằng dấu phẩy) *">
              <Input required placeholder="苹果, píngguǒ" value={fillInAccepted} onChange={e => setFillInAccepted(e.target.value)} />
            </Field>
          </div>
        )}

        {type === 'ORDERING' && (
          <div className="space-y-4 border p-4 rounded-md">
            <Field label="Các từ theo đúng thứ tự (phân cách bằng dấu phẩy) *">
              <Input required placeholder="我,喜欢,吃,苹果" value={orderingWords} onChange={e => setOrderingWords(e.target.value)} />
            </Field>
          </div>
        )}

        {type === 'MATCHING' && (
          <div className="space-y-4 border p-4 rounded-md">
            <p className="text-sm text-gray-500">Nhập các cặp từ tương ứng. Ít nhất 2 cặp.</p>
            {matchingPairs.map((pair, i) => (
              <div key={i} className="flex gap-2">
                <Input placeholder="Trái" required value={pair.left} onChange={e => {
                  const newP = [...matchingPairs]; newP[i].left = e.target.value; setMatchingPairs(newP);
                }} />
                <Input placeholder="Phải" required value={pair.right} onChange={e => {
                  const newP = [...matchingPairs]; newP[i].right = e.target.value; setMatchingPairs(newP);
                }} />
                {i >= 2 && (
                  <Button type="button" variant="ghost" onClick={() => setMatchingPairs(matchingPairs.filter((_, idx) => idx !== i))}>Xoá</Button>
                )}
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => setMatchingPairs([...matchingPairs, {left:'', right:''}])}>
              + Thêm cặp
            </Button>
          </div>
        )}

        {type === 'TRUE_FALSE' && (
          <div className="space-y-4 border p-4 rounded-md">
            <Field label="Nội dung câu hỏi phụ *">
              <Input required placeholder="VD: 1 + 1 = 2" value={mcqText} onChange={e => setMcqText(e.target.value)} />
            </Field>
            <Field label="Đáp án đúng *">
              <Select value={trueFalseAnswer} onChange={e => setTrueFalseAnswer(e.target.value)}>
                <option value="true">Đúng (True)</option>
                <option value="false">Sai (False)</option>
              </Select>
            </Field>
          </div>
        )}

        {type === 'SHORT_ANSWER' && (
          <div className="space-y-4 border p-4 rounded-md">
            <Field label="Câu hỏi *">
              <Input required placeholder="Nhập câu hỏi trả lời ngắn" value={shortAnswerText} onChange={e => setShortAnswerText(e.target.value)} />
            </Field>
            <Field label="Các đáp án đúng (phân cách bằng dấu phẩy) *">
              <Input required placeholder="VD: táo, quả táo" value={shortAnswerAccepted} onChange={e => setShortAnswerAccepted(e.target.value)} />
            </Field>
          </div>
        )}

        <Field label="Giải thích đáp án (tùy chọn)">
          <Textarea rows={2} value={explanation} onChange={e => setExplanation(e.target.value)} />
        </Field>
      </form>
    </Modal>
  );
}
