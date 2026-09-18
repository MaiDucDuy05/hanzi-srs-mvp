'use client';

import { useState } from 'react';
import { Modal } from '@/features/ui/components/modal';
import { Button } from '@/features/ui/components/button';
import { Field, Input, Textarea, Select } from '@/features/ui/components/form';
import { useConfirm } from '@/providers/confirm-provider';
import { resourceApi } from '@/lib/api/endpoints';
import type { ResourceType } from '@/lib/api/types';
import { Plus, Edit2, Trash2, CheckCircle2, XCircle } from 'lucide-react';

interface AdminResourceTypesModalProps {
  open: boolean;
  onClose: () => void;
  types: ResourceType[];
  onRefresh: () => void;
}

export function AdminResourceTypesModal({
  open,
  onClose,
  types,
  onRefresh,
}: AdminResourceTypesModalProps) {
  const confirm = useConfirm();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    code: '',
    description: '',
    displayOrder: 0,
    isActive: true,
  });

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm({
      name: '',
      code: '',
      description: '',
      displayOrder: (types.length + 1) * 1,
      isActive: true,
    });
    setError(null);
    setShowForm(true);
  };

  const handleOpenEdit = (type: ResourceType) => {
    setEditingId(type.id);
    setForm({
      name: type.name,
      code: type.code,
      description: type.description || '',
      displayOrder: type.displayOrder,
      isActive: type.isActive,
    });
    setError(null);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setError(null);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.code.trim()) {
      setError('Vui lòng nhập tên và mã định danh loại giáo trình');
      return;
    }
    try {
      setSaving(true);
      setError(null);
      if (editingId) {
        await resourceApi.updateType(editingId, {
          name: form.name.trim(),
          code: form.code.trim().toLowerCase().replace(/\s+/g, '_'),
          description: form.description.trim() || null,
          displayOrder: Number(form.displayOrder) || 0,
          isActive: form.isActive,
        });
      } else {
        await resourceApi.createType({
          name: form.name.trim(),
          code: form.code.trim().toLowerCase().replace(/\s+/g, '_'),
          description: form.description.trim() || null,
          displayOrder: Number(form.displayOrder) || 0,
          isActive: form.isActive,
        });
      }
      setShowForm(false);
      setEditingId(null);
      onRefresh();
    } catch (e: any) {
      setError(e instanceof Error ? e.message : 'Lỗi khi lưu loại giáo trình');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (type: ResourceType) => {
    const ok = await confirm({
      title: 'Xóa loại giáo trình',
      message: `Bạn có chắc chắn muốn xóa "${type.name}"? Các tài liệu thuộc loại này sẽ chuyển về trạng thái Chưa phân loại.`,
      variant: 'danger',
    });
    if (!ok) return;

    try {
      await resourceApi.deleteType(type.id);
      onRefresh();
    } catch (e: any) {
      window.alert(e instanceof Error ? e.message : 'Lỗi khi xóa loại giáo trình');
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      wide
      title="Quản lý Loại giáo trình"
      footer={
        <Button variant="outline" onClick={onClose} disabled={saving}>
          Đóng
        </Button>
      }
    >
      <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-1">
        {error && (
          <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {/* Top Header: Actions */}
        <div className="flex justify-between items-center">
          <p className="text-xs text-gray-500">
            Tổng cộng: <strong className="text-gray-700">{types.length}</strong> loại giáo trình
          </p>
          {!showForm && (
            <button
              type="button"
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1f5333] hover:bg-[#163f26] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              Thêm loại giáo trình
            </button>
          )}
        </div>

        {/* Create/Edit Form */}
        {showForm && (
          <div className="bg-emerald-50/40 p-4 rounded-xl border border-emerald-100 space-y-3">
            <h4 className="text-sm font-bold text-[#1f5333]">
              {editingId ? 'Chỉnh sửa loại giáo trình' : 'Thêm loại giáo trình mới'}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Tên loại giáo trình (*)">
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ví dụ: Giáo trình HSK tiêu chuẩn"
                  disabled={saving}
                />
              </Field>
              <Field label="Mã định danh code (*)">
                <Input
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  placeholder="Ví dụ: hsk_standard"
                  disabled={saving}
                />
              </Field>
            </div>
            <Field label="Mô tả">
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Mô tả ngắn về bộ giáo trình này..."
                rows={2}
                disabled={saving}
              />
            </Field>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Thứ tự hiển thị">
                <Input
                  type="number"
                  value={form.displayOrder}
                  onChange={(e) =>
                    setForm({ ...form, displayOrder: parseInt(e.target.value) || 0 })
                  }
                  disabled={saving}
                />
              </Field>
              <Field label="Trạng thái">
                <Select
                  value={form.isActive ? 'true' : 'false'}
                  onChange={(e) => setForm({ ...form, isActive: e.target.value === 'true' })}
                  disabled={saving}
                >
                  <option value="true">Đang hoạt động</option>
                  <option value="false">Tạm ẩn</option>
                </Select>
              </Field>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={handleCancelForm} disabled={saving}>
                Hủy
              </Button>
              <Button size="sm" onClick={handleSave} disabled={saving}>
                {saving ? 'Đang lưu...' : editingId ? 'Cập nhật' : 'Tạo mới'}
              </Button>
            </div>
          </div>
        )}

        {/* Types Table List */}
        <div className="border border-gray-100 rounded-xl overflow-hidden shadow-xs">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-semibold">
                <th className="py-2.5 px-3 w-12 text-center">#</th>
                <th className="py-2.5 px-3">Tên loại giáo trình</th>
                <th className="py-2.5 px-3">Mã code</th>
                <th className="py-2.5 px-3 w-24 text-center">Trạng thái</th>
                <th className="py-2.5 px-3 w-20 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {types.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-gray-400 italic">
                    Chưa có loại giáo trình nào. Hãy thêm loại mới!
                  </td>
                </tr>
              ) : (
                types.map((t, idx) => (
                  <tr key={t.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-2.5 px-3 text-center text-gray-400 font-mono">
                      {t.displayOrder || idx + 1}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-gray-800">
                      <div>{t.name}</div>
                      {t.description && (
                        <div className="text-[11px] text-gray-400 font-normal truncate max-w-xs">
                          {t.description}
                        </div>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-gray-500">
                      {t.code}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {t.isActive ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="h-3 w-3 text-green-600" />
                          Hiện
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                          <XCircle className="h-3 w-3 text-gray-400" />
                          Ẩn
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(t)}
                          className="p-1 text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 rounded transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(t)}
                          className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Xóa"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Modal>
  );
}
