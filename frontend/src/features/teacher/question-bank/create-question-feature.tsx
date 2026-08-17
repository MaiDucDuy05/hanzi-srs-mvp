'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { questionBankApi, type QuestionBankItem } from '@/lib/api/endpoints/question-bank';
import { Card, CardBody } from '@/features/ui/components/card';
import { Button } from '@/features/ui/components/button';
import { Input, Field } from '@/features/ui/components/form';
import { useAuth } from '@/lib/auth/auth-context';

export function CreateQuestionFeature() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [type, setType] = useState<QuestionBankItem['type']>('SINGLE_CHOICE');
  const [hskLevel, setHskLevel] = useState<string>('1');
  const [difficulty, setDifficulty] = useState<'EASY'|'MEDIUM'|'HARD'>('MEDIUM');
  const [visibility, setVisibility] = useState<'PUBLIC'|'PRIVATE'>('PRIVATE');
  const [tags, setTags] = useState<string>('');
  const [explanation, setExplanation] = useState<string>('');

  // Type-specific states
  const [mcqText, setMcqText] = useState('');
  const [mcqOptions, setMcqOptions] = useState([{id:'A', text:''}, {id:'B', text:''}, {id:'C', text:''}, {id:'D', text:''}]);
  const [mcqCorrect, setMcqCorrect] = useState('A');

  const [fillInSentence, setFillInSentence] = useState('');
  const [fillInAccepted, setFillInAccepted] = useState('');

  const [orderingWords, setOrderingWords] = useState('');

  const [matchingPairs, setMatchingPairs] = useState([{left:'', right:''}, {left:'', right:''}]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

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
    }

    try {
      await questionBankApi.create({
        type,
        hskLevel: hskLevel ? Number(hskLevel) : null,
        difficulty,
        visibility: user?.role === 'ADMIN' ? visibility : 'PRIVATE',
        tags: tags.split(',').map(s => s.trim()).filter(Boolean),
        explanation: explanation || null,
        content,
      });
      router.push('/teacher/questions');
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6 pb-20">
      <header>
        <Link href="/teacher/questions" className="text-sm text-brand hover:underline">← Quay lại danh sách</Link>
        <h1 className="text-2xl font-bold mt-2">Thêm câu hỏi mới</h1>
      </header>

      {error && <div className="p-3 bg-red-100 text-red-600 rounded">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardBody className="space-y-4">
            <h2 className="font-semibold text-lg border-b pb-2">Thông tin chung</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <Field label="Loại câu hỏi">
                <select value={type} onChange={e => setType(e.target.value as any)} className="w-full border rounded p-2">
                  <option value="SINGLE_CHOICE">Trắc nghiệm</option>
                  <option value="FILL_IN">Điền chỗ trống</option>
                  <option value="ORDERING">Sắp xếp câu</option>
                  <option value="MATCHING">Nối từ</option>
                </select>
              </Field>
              <Field label="Độ khó">
                <select value={difficulty} onChange={e => setDifficulty(e.target.value as any)} className="w-full border rounded p-2">
                  <option value="EASY">Dễ</option>
                  <option value="MEDIUM">Trung bình</option>
                  <option value="HARD">Khó</option>
                </select>
              </Field>
              <Field label="HSK Level (1-9)">
                <Input type="number" min={1} max={9} value={hskLevel} onChange={e => setHskLevel(e.target.value)} />
              </Field>
              {user?.role === 'ADMIN' && (
                <Field label="Quyền riêng tư">
                  <select value={visibility} onChange={e => setVisibility(e.target.value as any)} className="w-full border rounded p-2">
                    <option value="PUBLIC">Public (Dùng chung)</option>
                    <option value="PRIVATE">Private (Chỉ mình tôi)</option>
                  </select>
                </Field>
              )}
            </div>

            <Field label="Tags (phân cách bằng dấu phẩy)">
              <Input placeholder="ngữ pháp, từ vựng..." value={tags} onChange={e => setTags(e.target.value)} />
            </Field>

            <Field label="Giải thích đáp án (tùy chọn)">
              <textarea 
                className="w-full border rounded p-2 text-sm" 
                rows={3} 
                value={explanation} 
                onChange={e => setExplanation(e.target.value)}
                placeholder="Giải thích chi tiết cho học sinh..."
              />
            </Field>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="space-y-4">
            <h2 className="font-semibold text-lg border-b pb-2">Nội dung câu hỏi</h2>
            
            {type === 'SINGLE_CHOICE' && (
              <div className="space-y-4">
                <Field label="Nội dung câu hỏi">
                  <Input required placeholder="VD: 你好 nghĩa là gì?" value={mcqText} onChange={e => setMcqText(e.target.value)} />
                </Field>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Các đáp án</label>
                  {mcqOptions.map((opt, i) => (
                    <div key={opt.id} className="flex gap-2 items-center">
                      <input 
                        type="radio" 
                        name="mcqCorrect" 
                        checked={mcqCorrect === opt.id} 
                        onChange={() => setMcqCorrect(opt.id)} 
                      />
                      <span className="font-bold w-6">{opt.id}.</span>
                      <Input 
                        required 
                        value={opt.text} 
                        onChange={e => {
                          const newOpts = [...mcqOptions];
                          newOpts[i].text = e.target.value;
                          setMcqOptions(newOpts);
                        }} 
                      />
                    </div>
                  ))}
                  <p className="text-xs text-gray-500 mt-2">Chọn Radio button để đánh dấu đáp án đúng.</p>
                </div>
              </div>
            )}

            {type === 'FILL_IN' && (
              <div className="space-y-4">
                <Field label="Câu hỏi (dùng ___ để tạo chỗ trống)">
                  <Input required placeholder="我喜欢吃___。" value={fillInSentence} onChange={e => setFillInSentence(e.target.value)} />
                </Field>
                <Field label="Các đáp án chấp nhận (phân cách bằng dấu phẩy)">
                  <Input required placeholder="苹果, píngguǒ" value={fillInAccepted} onChange={e => setFillInAccepted(e.target.value)} />
                </Field>
              </div>
            )}

            {type === 'ORDERING' && (
              <div className="space-y-4">
                <Field label="Các từ theo đúng thứ tự (phân cách bằng dấu phẩy)">
                  <Input required placeholder="我,喜欢,吃,苹果" value={orderingWords} onChange={e => setOrderingWords(e.target.value)} />
                  <p className="text-xs text-gray-500 mt-1">Hệ thống sẽ tự động xáo trộn các từ này khi làm bài.</p>
                </Field>
              </div>
            )}

            {type === 'MATCHING' && (
              <div className="space-y-4">
                <p className="text-sm text-gray-500">Nhập các cặp từ tương ứng. Ít nhất 2 cặp.</p>
                {matchingPairs.map((pair, i) => (
                  <div key={i} className="flex gap-2">
                    <Input placeholder="Trái (VD: 苹果)" required value={pair.left} onChange={e => {
                      const newP = [...matchingPairs]; newP[i].left = e.target.value; setMatchingPairs(newP);
                    }} />
                    <Input placeholder="Phải (VD: Táo)" required value={pair.right} onChange={e => {
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
          </CardBody>
        </Card>

        <div className="flex justify-end gap-3">
          <Link href="/teacher/questions">
            <Button variant="ghost" type="button">Hủy</Button>
          </Link>
          <Button type="submit" loading={loading}>Lưu câu hỏi</Button>
        </div>
      </form>
    </div>
  );
}
