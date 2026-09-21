'use client';

import React, { useState } from 'react';
import { adminYctApi, type YctLevel } from '@/lib/api/endpoints/yct';
import { Edit2, Layers, CheckCircle } from 'lucide-react';
import { Modal } from '@/features/ui/components/modal';
import { Button } from '@/features/ui/components/button';

interface AdminYctLevelsTableProps {
  levels: YctLevel[];
  onRefresh: () => void;
}

export function AdminYctLevelsTable({ levels, onRefresh }: AdminYctLevelsTableProps) {
  const [editingLevel, setEditingLevel] = useState<YctLevel | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('PUBLISHED');
  const [saving, setSaving] = useState(false);

  const handleOpenEdit = (lvl: YctLevel) => {
    setEditingLevel(lvl);
    setName(lvl.name);
    setDescription(lvl.description || '');
    setStatus(lvl.status || 'PUBLISHED');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLevel) return;

    setSaving(true);
    try {
      await adminYctApi.updateLevel(editingLevel.id, {
        name,
        description,
        status: status as any,
      });
      onRefresh();
      setEditingLevel(null);
    } catch (err) {
      console.error('Failed to update YCT level:', err);
      alert('Có lỗi xảy ra khi cập nhật cấp độ');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-50 text-gray-600 uppercase text-xs border-b border-gray-200">
          <tr>
            <th className="px-4 py-3 font-bold">Thứ tự</th>
            <th className="px-4 py-3 font-bold">Mã cấp độ</th>
            <th className="px-4 py-3 font-bold">Tên hiển thị</th>
            <th className="px-4 py-3 font-bold">Mô tả</th>
            <th className="px-4 py-3 font-bold">Trạng thái</th>
            <th className="px-4 py-3 font-bold text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {levels.map((lvl) => (
            <tr key={lvl.id} className="hover:bg-[#f3f8d7]/30 transition-colors">
              <td className="px-4 py-3 font-bold text-gray-500">{lvl.displayOrder}</td>
              <td className="px-4 py-3">
                <span className="bg-[#e5f5eb] text-[#215b3b] font-black px-2.5 py-1 rounded-full text-xs">
                  {lvl.code}
                </span>
              </td>
              <td className="px-4 py-3 font-bold text-gray-900">{lvl.name}</td>
              <td className="px-4 py-3 text-gray-500 max-w-sm truncate">
                {lvl.description || '-'}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    lvl.status === 'PUBLISHED'
                      ? 'bg-[#e5f5eb] text-[#215b3b]'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {lvl.status}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                <button
                  onClick={() => handleOpenEdit(lvl)}
                  className="p-1.5 text-gray-500 hover:text-[#215b3b] hover:bg-[#e5f5eb] rounded-lg"
                  title="Chỉnh sửa"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editingLevel && (
        <Modal
          open={!!editingLevel}
          onClose={() => setEditingLevel(null)}
          title={`Chỉnh sửa cấp độ ${editingLevel.code}`}
          footer={
            <div className="flex justify-end gap-3 w-full">
              <Button variant="secondary" onClick={() => setEditingLevel(null)} disabled={saving}>
                Huỷ bỏ
              </Button>
              <Button onClick={handleSave} disabled={saving} className="bg-[#11321e] hover:bg-[#1a4a2f] text-white font-bold">
                {saving ? 'Đang lưu...' : 'Cập nhật'}
              </Button>
            </div>
          }
        >
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Tên cấp độ
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#215b3b] text-sm font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Mô tả
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
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
          </form>
        </Modal>
      )}
    </div>
  );
}
