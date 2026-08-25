'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useEffect } from 'react';
import { questionBankApi, type QuestionBankItem } from '@/lib/api/endpoints/question-bank';
import { resourceApi } from '@/lib/api/endpoints';
import { Card, CardBody } from '@/features/ui/components/card';
import { Button } from '@/features/ui/components/button';
import { Input, Field } from '@/features/ui/components/form';
import { useAuth } from '@/lib/auth/auth-context';

export function CreateQuestionFeature() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [type, setType] = useState<QuestionBankItem['type']>('SINGLE_CHOICE');
  const [hskLevel, setHskLevel] = useState<string>('1');
  const [difficulty, setDifficulty] = useState<'EASY'|'MEDIUM'|'HARD'>('MEDIUM');
  const [visibility, setVisibility] = useState<'PUBLIC'|'PRIVATE'>('PRIVATE');
  const [tags, setTags] = useState<string>('');
  const [explanation, setExplanation] = useState<string>('');

  const [imageUrl, setImageUrl] = useState<string>('');
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [audioPlayLimit, setAudioPlayLimit] = useState<string>('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingAudio, setUploadingAudio] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fileType: 'image' | 'audio') => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (fileType === 'image') setUploadingImage(true);
    else setUploadingAudio(true);

    try {
      const ext = file.name.split('.').pop() || '';
      const uniqueName = `question-${fileType}-${Date.now()}.${ext}`;
      const { uploadUrl, key } = await resourceApi.requestUploadUrl({ fileName: uniqueName, contentType: file.type });
      
      await fetch(uploadUrl, { method: 'PUT', body: file });
      
      const publicUrl = `/api/v1/resources/public/${key}`;
      
      if (fileType === 'image') {
        setImageUrl(publicUrl);
      } else {
        setAudioUrl(publicUrl);
      }
    } catch (err) {
      alert(`Upload ${fileType} thất bại: ` + (err as Error).message);
    } finally {
      if (fileType === 'image') setUploadingImage(false);
      else setUploadingAudio(false);
    }
  };

  // Type-specific states
  const [mcqText, setMcqText] = useState('');
  const [mcqOptions, setMcqOptions] = useState([{id:'A', text:''}, {id:'B', text:''}, {id:'C', text:''}, {id:'D', text:''}]);
  const [mcqCorrect, setMcqCorrect] = useState('A');

  const [fillInSentence, setFillInSentence] = useState('');
  const [fillInAccepted, setFillInAccepted] = useState('');

  const [orderingWords, setOrderingWords] = useState('');

  const [matchingPairs, setMatchingPairs] = useState([{left:'', right:''}, {left:'', right:''}]);
  
  const [trueFalseAnswer, setTrueFalseAnswer] = useState('true');
  const [shortAnswerText, setShortAnswerText] = useState('');
  const [shortAnswerAccepted, setShortAnswerAccepted] = useState('');

  useEffect(() => {
    if (editId) {
      setLoading(true);
      questionBankApi.get(editId).then(q => {
        setType(q.type);
        setHskLevel(String(q.hskLevel || '1'));
        setDifficulty(q.difficulty);
        setVisibility(q.visibility);
        setTags((q.tags || []).join(', '));
        setExplanation(q.explanation || '');
        
        const content = q.content as any;
        setImageUrl(content.imageUrl || '');
        setAudioUrl(content.audioUrl || '');
        setAudioPlayLimit(content.audioPlayLimit ? String(content.audioPlayLimit) : '');

        if (q.type === 'SINGLE_CHOICE') {
          setMcqText(content.questionText || '');
          if (Array.isArray(content.options)) {
            if (typeof content.options[0] === 'string') {
              setMcqOptions([
                { id: 'A', text: content.options[0] || '' },
                { id: 'B', text: content.options[1] || '' },
                { id: 'C', text: content.options[2] || '' },
                { id: 'D', text: content.options[3] || '' },
              ]);
            } else {
              setMcqOptions(content.options.length > 0 ? content.options : [{id:'A', text:''}, {id:'B', text:''}, {id:'C', text:''}, {id:'D', text:''}]);
            }
          }
          setMcqCorrect(content.correctAnswer || 'A');
        } else if (q.type === 'FILL_IN') {
          setFillInSentence(content.sentence || content.questionText || '');
          setFillInAccepted((content.acceptedAnswers || []).join(', '));
        } else if (q.type === 'ORDERING') {
          setOrderingWords((content.correctOrder || []).map((w: any) => typeof w === 'string' ? w : w.text).join(', '));
        } else if (q.type === 'MATCHING') {
          setMatchingPairs(content.pairs && content.pairs.length > 0 ? content.pairs : [{left:'', right:''}, {left:'', right:''}]);
        } else if (q.type === 'TRUE_FALSE') {
          setMcqText(content.questionText || '');
          setTrueFalseAnswer(String(content.correctAnswer));
        } else if (q.type === 'SHORT_ANSWER') {
          setShortAnswerText(content.questionText || '');
          setShortAnswerAccepted(Array.isArray(content.acceptedAnswers) ? content.acceptedAnswers.join(', ') : (content.correctAnswer || ''));
        }
      }).catch(err => {
        setError('Không tải được câu hỏi');
      }).finally(() => setLoading(false));
    }
  }, [editId]);

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

    if (imageUrl) content.imageUrl = imageUrl;
    if (audioUrl) {
      content.audioUrl = audioUrl;
      if (audioPlayLimit) content.audioPlayLimit = Number(audioPlayLimit);
    }

    try {
      const payload = {
        type,
        hskLevel: hskLevel ? Number(hskLevel) : null,
        difficulty,
        visibility: user?.role === 'ADMIN' ? visibility : 'PRIVATE',
        tags: tags.split(',').map(s => s.trim()).filter(Boolean),
        explanation: explanation || null,
        content,
      };

      if (editId) {
        await questionBankApi.update(editId, payload);
      } else {
        await questionBankApi.create(payload);
      }
      
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
        <h1 className="text-2xl font-bold mt-2">{editId ? 'Sửa câu hỏi' : 'Thêm câu hỏi mới'}</h1>
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
                  <option value="TRUE_FALSE">Đúng / Sai</option>
                  <option value="SHORT_ANSWER">Trả lời ngắn</option>
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
            
            <div className="grid grid-cols-2 gap-4">
              <Field label="Hình ảnh đính kèm (Tùy chọn)">
                {imageUrl ? (
                  <div className="flex flex-col gap-2">
                    <img src={imageUrl} alt="preview" className="h-20 object-contain rounded border" />
                    <Button type="button" variant="outline" size="sm" onClick={() => setImageUrl('')}>Xóa ảnh</Button>
                  </div>
                ) : (
                  <Input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'image')} disabled={uploadingImage} />
                )}
                {uploadingImage && <span className="text-xs text-brand-600">Đang tải...</span>}
              </Field>

              <Field label="Âm thanh đính kèm (Tùy chọn)">
                {audioUrl ? (
                  <div className="flex flex-col gap-2">
                    <audio src={audioUrl} controls className="h-10 w-full" />
                    <Button type="button" variant="outline" size="sm" onClick={() => setAudioUrl('')}>Xóa âm thanh</Button>
                  </div>
                ) : (
                  <Input type="file" accept="audio/*" onChange={(e) => handleFileUpload(e, 'audio')} disabled={uploadingAudio} />
                )}
                {uploadingAudio && <span className="text-xs text-brand-600">Đang tải...</span>}
              </Field>
            </div>

            {audioUrl && (
              <Field label="Giới hạn số lần nghe (Để trống = Vô hạn)">
                <Input type="number" min={1} value={audioPlayLimit} onChange={(e) => setAudioPlayLimit(e.target.value)} placeholder="VD: 2" />
              </Field>
            )}
            
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

            {type === 'TRUE_FALSE' && (
              <div className="space-y-4">
                <Field label="Nội dung câu hỏi">
                  <Input required placeholder="VD: 1 + 1 = 2" value={mcqText} onChange={e => setMcqText(e.target.value)} />
                </Field>
                <Field label="Đáp án đúng">
                  <select value={trueFalseAnswer} onChange={e => setTrueFalseAnswer(e.target.value)} className="w-full border rounded p-2">
                    <option value="true">Đúng (True)</option>
                    <option value="false">Sai (False)</option>
                  </select>
                </Field>
              </div>
            )}

            {type === 'SHORT_ANSWER' && (
              <div className="space-y-4">
                <Field label="Câu hỏi">
                  <Input required placeholder="Nhập câu hỏi trả lời ngắn" value={shortAnswerText} onChange={e => setShortAnswerText(e.target.value)} />
                </Field>
                <Field label="Các đáp án đúng (phân cách bằng dấu phẩy)">
                  <Input required placeholder="VD: táo, quả táo, apple" value={shortAnswerAccepted} onChange={e => setShortAnswerAccepted(e.target.value)} />
                  <p className="text-xs text-gray-500 mt-1">Học sinh nhập đúng 1 trong các từ này sẽ được tính điểm.</p>
                </Field>
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
