'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { questionBankApi, type QuestionBankItem } from '@/lib/api/endpoints/question-bank';
import { resourceApi } from '@/lib/api/endpoints';
import { Card, CardBody } from '@/features/ui/components/card';
import { Button } from '@/features/ui/components/button';
import { Input, Field, Select, Textarea } from '@/features/ui/components/form';
import { useAuth } from '@/lib/auth/auth-context';
import { ChildQuestionList } from './components/child-question-list';
import { SingleChoiceFields, FillInFields, OrderingFields, MatchingFields, GroupFields, TrueFalseFields, ShortAnswerFields } from './components/question-type-fields';
import { Info, FileText, Image as ImageIcon, Volume2, Save, ArrowLeft } from 'lucide-react';

export function CreateQuestionFeature() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [type, setType] = useState<QuestionBankItem['type']>('SINGLE_CHOICE');
  const [skill, setSkill] = useState<string>('');
  const [hskLevel, setHskLevel] = useState<string>('1');
  const [difficulty, setDifficulty] = useState<'EASY'|'MEDIUM'|'HARD'>('MEDIUM');
  const [visibility, setVisibility] = useState<'PUBLIC'|'PRIVATE'>('PRIVATE');
  const [tags, setTags] = useState<string>('');
  const [explanation, setExplanation] = useState<string>('');

  const [children, setChildren] = useState<QuestionBankItem[]>([]);

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
        setSkill(q.skill || '');
        setHskLevel(String(q.hskLevel || '1'));
        setVisibility(q.visibility);
        setTags((q.tags || []).join(', '));
        setExplanation(q.explanation || '');
        setChildren(q.children || []);
        
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
        } else if (q.type === 'GROUP') {
          setMcqText(content.questionText || '');
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
      content = { questionText: mcqText, options: mcqOptions, correctAnswer: mcqCorrect };
    } else if (type === 'FILL_IN') {
      content = { sentence: fillInSentence, acceptedAnswers: fillInAccepted.split(',').map(s => s.trim()).filter(Boolean) };
    } else if (type === 'ORDERING') {
      content = { correctOrder: orderingWords.split(',').map(s => s.trim()).filter(Boolean) };
    } else if (type === 'MATCHING') {
      content = { pairs: matchingPairs.filter(p => p.left && p.right) };
    } else if (type === 'TRUE_FALSE') {
      content = { questionText: mcqText, correctAnswer: trueFalseAnswer === 'true' };
    } else if (type === 'SHORT_ANSWER') {
      content = { questionText: shortAnswerText, acceptedAnswers: shortAnswerAccepted.split(',').map(s => s.trim()).filter(Boolean), correctAnswer: shortAnswerAccepted.split(',')[0]?.trim() || '' };
    } else if (type === 'GROUP') {
      content = { questionText: mcqText };
    }

    if (imageUrl) content.imageUrl = imageUrl;
    if (audioUrl) {
      content.audioUrl = audioUrl;
      if (audioPlayLimit) content.audioPlayLimit = Number(audioPlayLimit);
    }

    try {
      const payload = {
        type,
        skill: skill || undefined,
        hskLevel: hskLevel ? Number(hskLevel) : null,
        difficulty,
        visibility: user?.role === 'ADMIN' ? visibility : 'PRIVATE',
        tags: tags.split(',').map(s => s.trim()).filter(Boolean),
        explanation: explanation || null,
        content,
      };

      if (editId) {
        await questionBankApi.update(editId, payload);
        if (type !== 'GROUP') {
          router.push('/teacher/questions');
        } else {
          setLoading(false);
          alert('Đã lưu thành công. Bạn có thể thêm hoặc sửa câu hỏi con ở bên dưới.');
        }
      } else {
        const res = await questionBankApi.create(payload);
        if (type === 'GROUP') {
          setLoading(false);
          router.replace(`/teacher/questions/create?edit=${res.id}`);
        } else {
          router.push('/teacher/questions');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-24">
      <header className="flex items-center gap-4 border-b border-gray-100 pb-4 mt-6">
        <Link href="/teacher/questions">
          <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-900 -ml-2">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại danh sách
          </Button>
        </Link>
        <div className="h-4 w-px bg-gray-200"></div>
        <h1 className="text-lg font-semibold text-gray-800">
          {editId ? 'Chỉnh sửa câu hỏi' : 'Thêm câu hỏi mới'}
        </h1>
      </header>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 flex items-center gap-3">
          <Info className="w-5 h-5 text-red-500" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* CỘT TRÁI: Thông tin chung */}
          <div className="lg:col-span-4 space-y-8">
            <Card className="overflow-hidden border-0 shadow-sm ring-1 ring-black/5">
              <div className="bg-gray-50/50 border-b border-gray-100 px-6 py-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <Info className="w-4 h-4" />
                </div>
                <h2 className="font-semibold text-lg text-gray-800">Thông tin chung</h2>
              </div>
              <CardBody className="p-6 space-y-6">
                <Field label="Loại câu hỏi *">
                  <Select value={type} onChange={e => setType(e.target.value as any)} required>
                    <option value="SINGLE_CHOICE">Trắc nghiệm (1 đáp án)</option>
                    <option value="TRUE_FALSE">Đúng / Sai</option>
                    <option value="SHORT_ANSWER">Trả lời ngắn</option>
                    <option value="FILL_IN">Điền chỗ trống</option>
                    <option value="ORDERING">Sắp xếp câu</option>
                    <option value="MATCHING">Nối từ</option>
                    <option value="WRITING">Viết</option>
                    <option value="GROUP">Câu hỏi Chung</option>
                  </Select>
                </Field>
                <Field label="Kỹ năng *">
                  <Select value={skill} onChange={e => setSkill(e.target.value)} required>
                    <option value="">-- Chọn kỹ năng --</option>
                    <option value="LISTENING">Nghe hiểu</option>
                    <option value="READING">Đọc hiểu</option>
                    <option value="WRITING">Viết</option>
                    <option value="GRAMMAR">Ngữ pháp</option>
                  </Select>
                </Field>
                <Field label="Độ khó">
                  <Select value={difficulty} onChange={e => setDifficulty(e.target.value as any)}>
                    <option value="EASY">Dễ</option>
                    <option value="MEDIUM">Trung bình</option>
                    <option value="HARD">Khó</option>
                  </Select>
                </Field>
                <Field label="HSK Level (1-9)">
                  <Input type="number" min={1} max={9} value={hskLevel} onChange={e => setHskLevel(e.target.value)} />
                </Field>
                {user?.role === 'ADMIN' && (
                  <Field label="Quyền riêng tư">
                    <Select value={visibility} onChange={e => setVisibility(e.target.value as any)}>
                      <option value="PUBLIC">Public (Dùng chung)</option>
                      <option value="PRIVATE">Private (Chỉ mình tôi)</option>
                    </Select>
                  </Field>
                )}
                <div className="grid grid-cols-1 gap-6">
                  <Field label="Tags (phân cách bằng dấu phẩy)">
                    <Input placeholder="ngữ pháp, từ vựng..." value={tags} onChange={e => setTags(e.target.value)} />
                  </Field>

                  <Field label="Giải thích đáp án (tùy chọn)">
                    <Textarea 
                      rows={2} 
                      value={explanation} 
                      onChange={e => setExplanation(e.target.value)}
                      placeholder="Giải thích chi tiết cho học sinh..."
                    />
                  </Field>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* CỘT PHẢI: Nội dung câu hỏi & danh sách câu hỏi con */}
          <div className="lg:col-span-8 space-y-8">
            <Card className="overflow-hidden border-0 shadow-sm ring-1 ring-black/5">
              <div className="bg-gray-50/50 border-b border-gray-100 px-6 py-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-600">
                  <FileText className="w-4 h-4" />
                </div>
                <h2 className="font-semibold text-lg text-gray-800">Nội dung câu hỏi</h2>
              </div>
              <CardBody className="p-6 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 bg-gray-50 rounded-2xl border border-gray-100/80">
                  <Field label={<span className="flex items-center gap-2"><ImageIcon className="w-4 h-4 text-gray-500"/> Hình ảnh đính kèm (Tùy chọn)</span>}>
                    {imageUrl ? (
                      <div className="flex flex-col gap-3 p-3 bg-white rounded-xl border shadow-sm">
                        <img src={imageUrl} alt="preview" className="h-32 object-contain rounded-lg" />
                        <Button type="button" variant="outline" size="sm" onClick={() => setImageUrl('')} className="w-full text-red-500 hover:text-red-600 hover:bg-red-50">Xóa ảnh</Button>
                      </div>
                    ) : (
                      <Input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'image')} disabled={uploadingImage} className="bg-white" />
                    )}
                    {uploadingImage && <span className="text-sm font-medium text-brand-600 mt-2 block animate-pulse">Đang tải ảnh lên...</span>}
                  </Field>

                  <Field label={<span className="flex items-center gap-2"><Volume2 className="w-4 h-4 text-gray-500"/> Âm thanh đính kèm (Tùy chọn)</span>}>
                    {audioUrl ? (
                      <div className="flex flex-col gap-3 p-3 bg-white rounded-xl border shadow-sm">
                        <audio src={audioUrl} controls className="h-12 w-full" />
                        <Button type="button" variant="outline" size="sm" onClick={() => setAudioUrl('')} className="w-full text-red-500 hover:text-red-600 hover:bg-red-50">Xóa âm thanh</Button>
                      </div>
                    ) : (
                      <Input type="file" accept="audio/*" onChange={(e) => handleFileUpload(e, 'audio')} disabled={uploadingAudio} className="bg-white" />
                    )}
                    {uploadingAudio && <span className="text-sm font-medium text-brand-600 mt-2 block animate-pulse">Đang tải âm thanh...</span>}
                  </Field>
                </div>

                {audioUrl && (
                  <div className="p-4 bg-orange-50/50 border border-orange-100 rounded-2xl">
                    <Field label="Giới hạn số lần nghe (Để trống = Vô hạn)">
                      <Input type="number" min={1} value={audioPlayLimit} onChange={(e) => setAudioPlayLimit(e.target.value)} placeholder="VD: 2" className="max-w-xs bg-white" />
                    </Field>
                  </div>
                )}
                
                <div className="pt-4 border-t border-gray-100">
                  {type === 'SINGLE_CHOICE' && (
                    <SingleChoiceFields mcqText={mcqText} setMcqText={setMcqText} mcqOptions={mcqOptions} setMcqOptions={setMcqOptions} mcqCorrect={mcqCorrect} setMcqCorrect={setMcqCorrect} />
                  )}
                  {type === 'FILL_IN' && (
                    <FillInFields fillInSentence={fillInSentence} setFillInSentence={setFillInSentence} fillInAccepted={fillInAccepted} setFillInAccepted={setFillInAccepted} />
                  )}
                  {type === 'ORDERING' && (
                    <OrderingFields orderingWords={orderingWords} setOrderingWords={setOrderingWords} />
                  )}
                  {type === 'MATCHING' && (
                    <MatchingFields matchingPairs={matchingPairs} setMatchingPairs={setMatchingPairs} />
                  )}
                  {type === 'GROUP' && (
                    <GroupFields mcqText={mcqText} setMcqText={setMcqText} />
                  )}
                  {type === 'TRUE_FALSE' && (
                    <TrueFalseFields mcqText={mcqText} setMcqText={setMcqText} trueFalseAnswer={trueFalseAnswer} setTrueFalseAnswer={setTrueFalseAnswer} />
                  )}
                  {type === 'SHORT_ANSWER' && (
                    <ShortAnswerFields shortAnswerText={shortAnswerText} setShortAnswerText={setShortAnswerText} shortAnswerAccepted={shortAnswerAccepted} setShortAnswerAccepted={setShortAnswerAccepted} />
                  )}
                </div>
              </CardBody>
            </Card>

            {editId && type === 'GROUP' && (
              <ChildQuestionList editId={editId} children={children} setChildren={setChildren} />
            )}
          </div>
        </div>

        {/* Sticky action bar */}
        <div className="sticky bottom-6 z-40 bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-gray-200/60 shadow-lg flex justify-end gap-3 items-center">
          <Link href="/teacher/questions">
            <Button variant="ghost" type="button" className="text-gray-600">Hủy / Trở về</Button>
          </Link>
          <Button type="submit" loading={loading} className="px-8 shadow-sm">
            <Save className="w-4 h-4 mr-2" />
            Lưu thông tin
          </Button>
        </div>
      </form>
    </div>
  );
}
