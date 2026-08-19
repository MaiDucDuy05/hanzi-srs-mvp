/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { adminContentApi } from '@/lib/api/endpoints/admin-content';
import { FileUp, FileDown, Save, X, Edit2, Trash2, Mic } from 'lucide-react';
import { CsvImportModal } from './csv-import-modal';

export function VocabulariesTable() {
  const [vocabularies, setVocabularies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Inline edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ hanzi: string; pinyin: string; meaning: string }>({ hanzi: '', pinyin: '', meaning: '' });
  const [saving, setSaving] = useState(false);
  
  // Modal state
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);

  const fetchVocabularies = async () => {
    try {
      setLoading(true);
      const res = await adminContentApi.getVocabularies({ page: 1, limit: 50 }) as any;
      if (res.data) {
        setVocabularies(res.data.items || []);
      }
    } catch (error) {
      console.error('Failed to fetch vocabularies', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVocabularies();
  }, []);

  const handleEditClick = (vocab: any) => {
    setEditingId(vocab.id);
    setEditForm({
      hanzi: vocab.hanzi,
      pinyin: vocab.pinyin,
      meaning: vocab.meaning,
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleSaveEdit = async (id: string) => {
    try {
      setSaving(true);
      await adminContentApi.updateVocabulary(id, editForm);
      setVocabularies(vocabularies.map(v => v.id === id ? { ...v, ...editForm } : v));
      setEditingId(null);
    } catch (error) {
      console.error('Failed to update vocabulary', error);
      alert('Lỗi khi cập nhật từ vựng');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa từ vựng này?')) return;
    try {
      await adminContentApi.deleteVocabulary(id);
      fetchVocabularies();
    } catch (error) {
      console.error('Failed to delete vocabulary', error);
      alert('Lỗi khi xóa từ vựng');
    }
  };

  const handleExportCsv = async () => {
    try {
      const res = await adminContentApi.exportVocabulariesCsv() as any;
      const blob = new Blob([res], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', 'vocabularies_export.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Failed to export CSV', error);
      alert('Lỗi khi xuất CSV');
    }
  };

  const handleAudioUpload = async (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('file', file);
      await adminContentApi.uploadVocabularyAudio(id, formData);
      alert('Tải âm thanh lên thành công!');
      fetchVocabularies();
    } catch (error) {
      console.error('Failed to upload audio', error);
      alert('Lỗi khi tải âm thanh lên');
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <h2 className="font-bold text-[#11321e] text-lg">Danh sách từ vựng</h2>
        <div className="flex gap-2">
          <button 
            onClick={handleExportCsv}
            className="flex items-center gap-2 bg-white text-[#11321e] px-4 py-2 rounded-full text-sm font-bold border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors"
          >
            <FileDown className="h-4 w-4" />
            Export CSV
          </button>
          <button 
            onClick={() => setIsCsvModalOpen(true)}
            className="flex items-center gap-2 bg-white text-[#11321e] px-4 py-2 rounded-full text-sm font-bold border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors"
          >
            <FileUp className="h-4 w-4" />
            Import CSV
          </button>
          <button className="bg-[#c7cf35] text-[#11321e] px-4 py-2 rounded-full text-sm font-bold shadow-sm hover:bg-[#dde8a6] transition-colors">
            Thêm từ vựng
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-1/4">Hán Tự</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-1/4">Pinyin</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-1/3">Nghĩa</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Hành động</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-500 font-medium">Đang tải...</td>
              </tr>
            ) : vocabularies.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-500 font-medium">Chưa có từ vựng nào</td>
              </tr>
            ) : (
              vocabularies.map((vocab) => {
                const isEditing = editingId === vocab.id;
                
                return (
                  <tr key={vocab.id} className={`transition-colors ${isEditing ? "bg-[#fcfbe8]" : "hover:bg-gray-50"}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isEditing ? (
                        <input 
                          className="border border-[#c7cf35] p-2 w-full rounded-xl focus:outline-none focus:ring-2 focus:ring-[#c7cf35]/50 font-bold"
                          value={editForm.hanzi} 
                          onChange={e => setEditForm({...editForm, hanzi: e.target.value})} 
                        />
                      ) : (
                        <span className="text-2xl font-bold text-[#11321e]">{vocab.hanzi}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isEditing ? (
                        <input 
                          className="border border-[#c7cf35] p-2 w-full rounded-xl focus:outline-none focus:ring-2 focus:ring-[#c7cf35]/50"
                          value={editForm.pinyin} 
                          onChange={e => setEditForm({...editForm, pinyin: e.target.value})} 
                        />
                      ) : (
                        <span className="text-gray-600 font-medium">{vocab.pinyin}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {isEditing ? (
                        <input 
                          className="border border-[#c7cf35] p-2 w-full rounded-xl focus:outline-none focus:ring-2 focus:ring-[#c7cf35]/50"
                          value={editForm.meaning} 
                          onChange={e => setEditForm({...editForm, meaning: e.target.value})} 
                        />
                      ) : (
                        <span className="text-[#11321e] font-medium line-clamp-2">{vocab.meaning}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleSaveEdit(vocab.id)} 
                            disabled={saving}
                            className="h-8 w-8 rounded-full bg-[#11321e] flex items-center justify-center text-white hover:bg-[#1f4e31] transition-colors disabled:opacity-50"
                            title="Lưu"
                          >
                            <Save className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={handleCancelEdit} 
                            disabled={saving}
                            className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors disabled:opacity-50"
                            title="Huỷ"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          <div>
                            <input
                              type="file"
                              id={`audio-upload-${vocab.id}`}
                              className="hidden"
                              accept="audio/*"
                              onChange={(e) => handleAudioUpload(vocab.id, e)}
                            />
                            <label 
                              htmlFor={`audio-upload-${vocab.id}`}
                              className={`h-8 w-8 rounded-full flex items-center justify-center cursor-pointer transition-colors ${vocab.audioKey ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                              title={vocab.audioKey ? "Cập nhật âm thanh" : "Tải âm thanh lên"}
                            >
                              <Mic className="h-4 w-4" />
                            </label>
                          </div>
                          <button 
                            onClick={() => handleEditClick(vocab)}
                            className="h-8 w-8 rounded-full bg-[#f3f4e1] flex items-center justify-center text-[#4a5a3a] hover:bg-[#dde8a6] transition-colors"
                            title="Sửa nhanh"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(vocab.id)}
                            className="h-8 w-8 rounded-full bg-[#f3f4e1] flex items-center justify-center text-[#4a5a3a] hover:bg-red-100 hover:text-red-500 transition-colors"
                            title="Xóa"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <CsvImportModal 
        isOpen={isCsvModalOpen} 
        onClose={() => setIsCsvModalOpen(false)} 
        onSuccess={fetchVocabularies} 
      />
    </div>
  );
}
