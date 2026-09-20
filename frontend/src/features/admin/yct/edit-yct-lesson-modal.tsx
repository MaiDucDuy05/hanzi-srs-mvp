'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/features/ui/components/modal';
import { Button } from '@/features/ui/components/button';
import { adminYctApi, type YctLevel, type YctLesson } from '@/lib/api/endpoints/yct';

interface EditYctLessonModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  lesson?: YctLesson | null;
  levels: YctLevel[];
}

export function EditYctLessonModal({
  open,
  onClose,
  onSuccess,
  lesson,
  levels,
}: EditYctLessonModalProps) {
  const [levelId, setLevelId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [displayOrder, setDisplayOrder] = useState(0);
  const [status, setStatus] = useState('PUBLISHED');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (lesson) {
      setLevelId(lesson.levelId || (levels[0]?.id || ''));
      setTitle(lesson.title || '');
      setDescription(lesson.description || '');
      setDisplayOrder(lesson.displayOrder || 0);
      setStatus(lesson.status || 'PUBLISHED');
    } else {
      setLevelId(levels[0]?.id || '');
      setTitle('');
      setDescription('');
      setDisplayOrder(0);
      setStatus('PUBLISHED');
    }
    setError(null);
  }, [lesson, levels, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Vui lòng nhập tên bài học');
      return;
    }
    if (!levelId) {
      setError('Vui lòng chọn cấp độ YCT');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      if (lesson?.id) {
        await adminYctApi.updateLesson(lesson.id, {
          levelId,
          title,
          description,
          displayOrder: Number(displayOrder),
          status,
        });
      } else {
        await adminYctApi.createLesson({
          levelId,
          title,
          description,
          displayOrder: Number(displayOrder),
          status,
        });
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Failed to save YCT lesson:', err);
      setError(err?.message || 'Có lỗi xảy ra khi lưu bài học');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={lesson ? 'Chỉnh sửa bài học YCT' : 'Tạo bài học YCT mới'}
      footer={
        <div className="flex justify-end gap-3 w-full">
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Huỷ bỏ
          </Button>
          <Button onClick={handleSubmit} disabled={saving} className="bg-[#11321e] hover:bg-[#1a4a2f] text-white font-bold">
            {saving ? 'Đang lưu...' : lesson ? 'Cập nhật' : 'Tạo bài học'}
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

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
            Cấp độ YCT
          </label>
          <select
            value={levelId}
            onChange={(e) => setLevelId(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#215b3b] text-sm font-medium"
          >
            {levels.map((lvl) => (
              <option key={lvl.id} value={lvl.id}>
                {lvl.code} - {lvl.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
            Tiêu đề bài học *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ví dụ: Bài 1: Chào bạn! (你好)"
            className="w-full p-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#215b3b] text-sm font-medium"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
            Mô tả tóm tắt
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Mô tả nội dung bài học..."
            rows={3}
            className="w-full p-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#215b3b] text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Thứ tự hiển thị
            </label>
            <input
              type="number"
              value={displayOrder}
              onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)}
              className="w-full p-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#215b3b] text-sm"
            />
          </div>

          <div>
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
        </div>
      </form>
    </Modal>
  );
}
