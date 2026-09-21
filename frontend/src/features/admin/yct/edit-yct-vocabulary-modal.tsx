'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Modal } from '@/features/ui/components/modal';
import { Button } from '@/features/ui/components/button';
import { Spinner } from '@/features/ui/components/spinner';
import { resolveYctImageUrl } from '@/lib/utils/yct-image';
import { adminYctApi, type YctLevel, type YctLesson, type YctVocabulary } from '@/lib/api/endpoints/yct';
import { UploadCloud, Image as ImageIcon, CheckCircle, AlertCircle, Trash2 } from 'lucide-react';

interface EditYctVocabularyModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  vocabulary?: YctVocabulary | null;
  levels: YctLevel[];
  lessons: YctLesson[];
}

export function EditYctVocabularyModal({
  open,
  onClose,
  onSuccess,
  vocabulary,
  levels,
  lessons,
}: EditYctVocabularyModalProps) {
  const [levelId, setLevelId] = useState('');
  const [lessonId, setLessonId] = useState('');
  const [hanzi, setHanzi] = useState('');
  const [pinyin, setPinyin] = useState('');
  const [meaningVi, setMeaningVi] = useState('');
  const [imageKey, setImageKey] = useState('');
  const [partOfSpeech, setPartOfSpeech] = useState('');
  const [example, setExample] = useState('');
  const [status, setStatus] = useState('PUBLISHED');

  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (vocabulary) {
      setLevelId(vocabulary.levelId || (levels[0]?.id || ''));
      setLessonId(vocabulary.lessonId || '');
      setHanzi(vocabulary.hanzi || '');
      setPinyin(vocabulary.pinyin || '');
      setMeaningVi(vocabulary.meaningVi || '');
      setImageKey(vocabulary.imageKey || '');
      setPartOfSpeech(vocabulary.partOfSpeech || '');
      setExample(vocabulary.example || '');
      setStatus(vocabulary.status || 'PUBLISHED');
    } else {
      setLevelId(levels[0]?.id || '');
      setLessonId(lessons[0]?.id || '');
      setHanzi('');
      setPinyin('');
      setMeaningVi('');
      setImageKey('');
      setPartOfSpeech('');
      setExample('');
      setStatus('PUBLISHED');
    }
    setError(null);
  }, [vocabulary, levels, lessons, open]);

  // Lọc bài học theo level được chọn
  const filteredLessons = lessons.filter((l) => !levelId || l.levelId === levelId);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Kiểm tra định dạng file
    if (!file.type.startsWith('image/')) {
      setError('Chỉ chấp nhận file hình ảnh (JPG, PNG, WebP, GIF)');
      return;
    }

    // Giới hạn 5MB
    if (file.size > 5 * 1024 * 1024) {
      setError('Kích thước ảnh không được vượt quá 5MB');
      return;
    }

    setUploadingImage(true);
    setError(null);

    try {
      const res = await adminYctApi.uploadImage(file);
      setImageKey(resolveYctImageUrl(res.url));
    } catch (err: any) {
      console.error('Failed to upload image to S3:', err);
      setError(err?.message || 'Không thể tải ảnh lên S3');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hanzi.trim()) {
      setError('Vui lòng nhập chữ Hán');
      return;
    }
    if (!pinyin.trim()) {
      setError('Vui lòng nhập phiên âm Pinyin');
      return;
    }
    if (!meaningVi.trim()) {
      setError('Vui lòng nhập nghĩa tiếng Việt');
      return;
    }

    setSaving(true);
    setError(null);

    const payload = {
      levelId: levelId || undefined,
      lessonId: lessonId || undefined,
      hanzi,
      pinyin,
      meaningVi,
      imageKey: imageKey || undefined,
      partOfSpeech: partOfSpeech || undefined,
      example: example || undefined,
      status: status as any,
    };

    try {
      if (vocabulary?.id) {
        await adminYctApi.updateVocabulary(vocabulary.id, payload);
      } else {
        await adminYctApi.createVocabulary(payload);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Failed to save YCT vocabulary:', err);
      setError(err?.message || 'Có lỗi xảy ra khi lưu từ vựng');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      wide
      title={vocabulary ? 'Chỉnh sửa từ vựng YCT' : 'Thêm từ vựng YCT mới'}
      footer={
        <div className="flex justify-end gap-3 w-full">
          <Button variant="secondary" onClick={onClose} disabled={saving || uploadingImage}>
            Huỷ bỏ
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={saving || uploadingImage}
            className="bg-[#11321e] hover:bg-[#1a4a2f] text-white font-bold"
          >
            {saving ? 'Đang lưu...' : vocabulary ? 'Cập nhật' : 'Tạo từ vựng'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 text-rose-700 text-sm rounded-xl border border-rose-200">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Cấp độ YCT
            </label>
            <select
              value={levelId}
              onChange={(e) => {
                setLevelId(e.target.value);
                setLessonId('');
              }}
              className="w-full p-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#215b3b] text-sm font-medium"
            >
              <option value="">-- Chọn Cấp độ --</option>
              {levels.map((lvl) => (
                <option key={lvl.id} value={lvl.id}>
                  {lvl.code} - {lvl.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Bài học thuộc cấp độ
            </label>
            <select
              value={lessonId}
              onChange={(e) => setLessonId(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#215b3b] text-sm font-medium"
            >
              <option value="">-- Không gắn vào bài học nào --</option>
              {filteredLessons.map((les) => (
                <option key={les.id} value={les.id}>
                  {les.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Chữ Hán *
            </label>
            <input
              type="text"
              value={hanzi}
              onChange={(e) => setHanzi(e.target.value)}
              placeholder="VD: 猫"
              className="w-full p-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#215b3b] text-sm font-bold text-gray-900 text-lg"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Pinyin *
            </label>
            <input
              type="text"
              value={pinyin}
              onChange={(e) => setPinyin(e.target.value)}
              placeholder="VD: māo"
              className="w-full p-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#215b3b] text-sm font-semibold text-[#215b3b]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Từ loại
            </label>
            <input
              type="text"
              value={partOfSpeech}
              onChange={(e) => setPartOfSpeech(e.target.value)}
              placeholder="VD: danh từ"
              className="w-full p-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#215b3b] text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
            Nghĩa tiếng Việt *
          </label>
          <input
            type="text"
            value={meaningVi}
            onChange={(e) => setMeaningVi(e.target.value)}
            placeholder="VD: con mèo"
            className="w-full p-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#215b3b] text-sm font-medium"
            required
          />
        </div>

        {/* UPLOAD ẢNH MINH HOẠ CHO TRẺ EM (S3) */}
        <div className="border-2 border-dashed border-[#c3e3c8] bg-[#f3f8d7]/40 rounded-2xl p-4">
          <label className="block text-xs font-black text-[#11321e] uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <ImageIcon className="w-4 h-4 text-[#215b3b]" />
            <span>Hình ảnh minh hoạ (Lưu trữ S3)</span>
          </label>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            {/* Preview Box */}
            <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-[#c3e3c8] bg-white flex items-center justify-center relative shadow-sm shrink-0 p-1">
              {imageKey ? (
                <img
                  src={resolveYctImageUrl(imageKey)}
                  alt="Minh hoạ"
                  className="max-w-full max-h-full w-auto h-auto object-contain"
                />
              ) : (
                <span className="text-gray-300 text-xs font-bold text-center px-1">
                  Chưa có ảnh
                </span>
              )}

              {imageKey && (
                <button
                  type="button"
                  onClick={() => setImageKey('')}
                  className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-full hover:bg-rose-700 shadow-xs"
                  title="Xoá ảnh"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Upload Controls */}
            <div className="flex-1 w-full">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              <div className="flex flex-wrap gap-2 mb-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="rounded-xl font-bold border border-[#c3e3c8] text-[#215b3b] hover:bg-[#e5f5eb]"
                >
                  {uploadingImage ? (
                    <>
                      <Spinner className="w-4 h-4 mr-2 border-2" />
                      Đang tải lên S3...
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-4 h-4 mr-1.5" />
                      Tải ảnh lên S3
                    </>
                  )}
                </Button>
              </div>

              <input
                type="text"
                value={imageKey}
                onChange={(e) => setImageKey(e.target.value)}
                placeholder="Hoặc dán URL/S3 Key trực tiếp tại đây..."
                className="w-full p-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#215b3b] text-xs"
              />
              <p className="text-[11px] text-gray-400 mt-1">
                Hỗ trợ mọi định dạng và tỉ lệ ảnh (tự động giữ nguyên khung hình tự nhiên, không bị cắt mép), dung lượng &lt; 5MB.
              </p>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
            Câu ví dụ
          </label>
          <textarea
            value={example}
            onChange={(e) => setExample(e.target.value)}
            placeholder="VD: 我家有一只小猫。(Nhà tôi có một con mèo nhỏ.)"
            rows={2}
            className="w-full p-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#215b3b] text-sm"
          />
        </div>

        <div className="w-48">
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
            Trạng thái
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#215b3b] text-sm"
          >
            <option value="PUBLISHED">Công khai (PUBLISHED)</option>
            <option value="DRAFT">Bản nháp (DRAFT)</option>
            <option value="HIDDEN">Ẩn (HIDDEN)</option>
          </select>
        </div>
      </form>
    </Modal>
  );
}
