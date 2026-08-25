import { useState, type FormEvent } from 'react';
import { Modal } from '@/features/ui/components/modal';
import { Button } from '@/features/ui/components/button';
import { Field, Input, Select, Textarea } from '@/features/ui/components/form';
import { questionBankApi } from '@/lib/api/endpoints/question-bank';
import { testApi } from '@/lib/api/endpoints/test';
import { resourceApi } from '@/lib/api/endpoints';

interface TestCreateQuestionModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  testId: string;
  nextDisplayOrder: number;
}

export function TestCreateQuestionModal({ open, onClose, onSuccess, testId, nextDisplayOrder }: TestCreateQuestionModalProps) {
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createForm, setCreateForm] = useState({
    type: 'SINGLE_CHOICE',
    content: '',
    options: '',
    correctAnswer: '',
    explanation: '',
    points: '1',
    imageUrl: '',
    audioUrl: '',
    audioPlayLimit: '',
  });

  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingAudio, setUploadingAudio] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'audio') => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (type === 'image') setUploadingImage(true);
    else setUploadingAudio(true);

    try {
      const ext = file.name.split('.').pop() || '';
      const uniqueName = `question-${type}-${Date.now()}.${ext}`;
      const { uploadUrl, key } = await resourceApi.requestUploadUrl({ fileName: uniqueName, contentType: file.type });
      
      await fetch(uploadUrl, { method: 'PUT', body: file });
      
      const publicUrl = `/api/v1/resources/public/${key}`;
      
      if (type === 'image') {
        setCreateForm({ ...createForm, imageUrl: publicUrl });
      } else {
        setCreateForm({ ...createForm, audioUrl: publicUrl });
      }
    } catch (err) {
      alert(`Upload ${type} thất bại: ` + (err as Error).message);
    } finally {
      if (type === 'image') setUploadingImage(false);
      else setUploadingAudio(false);
    }
  };

  const handleCreateQuestion = async (e: FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError(null);
    try {
      const optionsArr = createForm.options
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);

      let contentData: any = {
        questionText: createForm.content,
      };

      if (createForm.type === 'SINGLE_CHOICE') {
        contentData.options = optionsArr.length > 0 ? optionsArr : null;
        contentData.correctAnswer = createForm.correctAnswer || null;
      } else if (createForm.type === 'TRUE_FALSE') {
        contentData.correctAnswer = createForm.correctAnswer === 'true';
      } else if (createForm.type === 'FILL_IN') {
        contentData.acceptedAnswers = createForm.correctAnswer ? createForm.correctAnswer.split(',').map(s => s.trim()).filter(Boolean) : [];
        contentData.correctAnswer = createForm.correctAnswer || null; // for fallback in UI
      } else if (createForm.type === 'ORDERING') {
        const orderArr = createForm.correctAnswer.split(' ').map(s => s.trim()).filter(Boolean);
        contentData.correctOrder = orderArr.length >= 2 ? orderArr : [createForm.correctAnswer, '(cần nhập nhiều từ)'];
        contentData.items = [...contentData.correctOrder].sort(() => Math.random() - 0.5);
      } else if (createForm.type === 'SHORT_ANSWER') {
        contentData.acceptedAnswers = createForm.correctAnswer ? [createForm.correctAnswer] : [];
        contentData.correctAnswer = createForm.correctAnswer || null;
      } else {
        contentData.correctAnswer = createForm.correctAnswer || null;
      }

      const qData = {
        type: createForm.type as any,
        visibility: 'PRIVATE' as const,
        difficulty: 'MEDIUM' as const,
        content: {
          ...contentData,
          imageUrl: createForm.imageUrl || undefined,
          audioUrl: createForm.audioUrl || undefined,
          audioPlayLimit: createForm.audioPlayLimit ? Number(createForm.audioPlayLimit) : undefined,
        },
        explanation: createForm.explanation || null,
      };

      const newQ = await questionBankApi.create(qData);
      await testApi.createQuestion({
        testId,
        questionId: newQ.id,
        points: Number(createForm.points),
        displayOrder: nextDisplayOrder,
      });

      setCreateForm({
        type: 'SINGLE_CHOICE',
        content: '',
        options: '',
        correctAnswer: '',
        explanation: '',
        points: '1',
        imageUrl: '',
        audioUrl: '',
        audioPlayLimit: '',
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi tạo câu hỏi.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Tạo câu hỏi mới"
      wide
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Hủy
          </Button>
          <Button form="create-question-form" type="submit" loading={creating}>
            Tạo
          </Button>
        </>
      }
    >
      <form id="create-question-form" onSubmit={handleCreateQuestion} className="space-y-4">
        {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
        <Field label="Loại câu hỏi">
          <Select
            value={createForm.type}
            onChange={(e) => setCreateForm({ ...createForm, type: e.target.value as any })}
          >
            <option value="SINGLE_CHOICE">Trắc nghiệm (1 đáp án)</option>
            <option value="TRUE_FALSE">Đúng / Sai</option>
            <option value="SHORT_ANSWER">Trả lời ngắn</option>
            <option value="FILL_IN">Điền chỗ trống</option>
            <option value="ORDERING">Sắp xếp câu</option>
          </Select>
        </Field>

        <Field label="Nội dung câu hỏi">
          <Textarea
            required
            value={createForm.content}
            onChange={(e) => setCreateForm({ ...createForm, content: e.target.value })}
            placeholder={
              createForm.type === 'FILL_IN' 
                ? 'Nhập câu hỏi, dùng [blank] hoặc ___ để biểu diễn chỗ trống...' 
                : 'Nhập câu hỏi...'
            }
            rows={3}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Hình ảnh đính kèm (Tùy chọn)">
            {createForm.imageUrl ? (
              <div className="flex flex-col gap-2">
                <img src={createForm.imageUrl} alt="preview" className="h-20 object-contain rounded border" />
                <Button type="button" variant="outline" size="sm" onClick={() => setCreateForm({ ...createForm, imageUrl: '' })}>Xóa ảnh</Button>
              </div>
            ) : (
              <Input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'image')} disabled={uploadingImage} />
            )}
            {uploadingImage && <span className="text-xs text-brand-600">Đang tải...</span>}
          </Field>

          <Field label="Âm thanh đính kèm (Tùy chọn)">
            {createForm.audioUrl ? (
              <div className="flex flex-col gap-2">
                <audio src={createForm.audioUrl} controls className="h-10 w-full" />
                <Button type="button" variant="outline" size="sm" onClick={() => setCreateForm({ ...createForm, audioUrl: '' })}>Xóa âm thanh</Button>
              </div>
            ) : (
              <Input type="file" accept="audio/*" onChange={(e) => handleFileUpload(e, 'audio')} disabled={uploadingAudio} />
            )}
            {uploadingAudio && <span className="text-xs text-brand-600">Đang tải...</span>}
          </Field>
        </div>

        {createForm.audioUrl && (
          <Field label="Giới hạn số lần nghe (Để trống = Vô hạn)">
            <Input type="number" min={1} value={createForm.audioPlayLimit} onChange={(e) => setCreateForm({ ...createForm, audioPlayLimit: e.target.value })} placeholder="VD: 2" />
          </Field>
        )}

        {createForm.type === 'SINGLE_CHOICE' && (
          <Field label="Các lựa chọn (mỗi dòng một lựa chọn)">
            <Textarea
              value={createForm.options}
              onChange={(e) => setCreateForm({ ...createForm, options: e.target.value })}
              placeholder="Ví dụ:&#10;Hà Nội&#10;Hồ Chí Minh&#10;Đà Nẵng"
              rows={4}
            />
          </Field>
        )}

        {createForm.type === 'TRUE_FALSE' ? (
          <Field label="Đáp án đúng">
            <Select
              required
              value={createForm.correctAnswer}
              onChange={(e) => setCreateForm({ ...createForm, correctAnswer: e.target.value })}
            >
              <option value="">-- Chọn đáp án --</option>
              <option value="true">Đúng (True)</option>
              <option value="false">Sai (False)</option>
            </Select>
          </Field>
        ) : createForm.type === 'ORDERING' ? (
          <Field label="Đáp án đúng (Thứ tự đúng)">
            <Input
              required
              value={createForm.correctAnswer}
              onChange={(e) => setCreateForm({ ...createForm, correctAnswer: e.target.value })}
              placeholder="Ví dụ: Tôi đi học (Nhập câu hoàn chỉnh)"
            />
            <p className="text-xs text-gray-500 mt-1">Học sinh sẽ xếp các từ trong câu hỏi theo thứ tự này.</p>
          </Field>
        ) : createForm.type === 'FILL_IN' ? (
          <Field label="Đáp án đúng (Các từ điền vào chỗ trống)">
            <Input
              required
              value={createForm.correctAnswer}
              onChange={(e) => setCreateForm({ ...createForm, correctAnswer: e.target.value })}
              placeholder="Nếu có nhiều chỗ trống, ngăn cách bằng dấu phẩy (,)"
            />
          </Field>
        ) : (
          <Field label="Đáp án đúng">
            <Input
              required
              value={createForm.correctAnswer}
              onChange={(e) => setCreateForm({ ...createForm, correctAnswer: e.target.value })}
              placeholder={createForm.type === 'SINGLE_CHOICE' ? 'Nhập chính xác nội dung của 1 lựa chọn bên trên' : 'Nhập đáp án'}
            />
          </Field>
        )}

        <Field label="Giải thích (tùy chọn)">
          <Textarea
            value={createForm.explanation}
            onChange={(e) => setCreateForm({ ...createForm, explanation: e.target.value })}
            placeholder="Giải thích tại sao câu trả lời này đúng..."
            rows={2}
          />
        </Field>

        <Field label="Điểm">
          <Input
            type="number"
            min={1}
            value={createForm.points}
            onChange={(e) => setCreateForm({ ...createForm, points: e.target.value })}
          />
        </Field>
      </form>
    </Modal>
  );
}
