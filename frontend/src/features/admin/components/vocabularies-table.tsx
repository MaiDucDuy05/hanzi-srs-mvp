/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect, useRef } from 'react';
import { adminContentApi } from '@/lib/api/endpoints/admin-content';
import { FileDown, Edit2, Trash2, ListPlus, Search } from 'lucide-react';
import { EditVocabularyModal } from './edit-vocabulary-modal';
import { BulkAddVocabularyModal } from './bulk-add-vocabulary-modal';
import { VocabulariesBulkActionBar } from './vocabularies-bulk-action-bar';
import { useConfirm } from '@/providers/confirm-provider';

export function VocabulariesTable() {
  const [vocabularies, setVocabularies] = useState<any[]>([]);
  const [hskLevels, setHskLevels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const headerCheckboxRef = useRef<HTMLInputElement>(null);

  // Modal state for Edit/Create
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const confirm = useConfirm();
  const [filterLevel, setFilterLevel] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const fetchData = async (search: string = searchQuery, levelId: string = filterLevel, status: string = filterStatus) => {
    try {
      setLoading(true);
      const params: any = { page: 1, limit: 100 };
      if (search) params.search = search;
      if (levelId) params.levelId = levelId;
      if (status) params.status = status;

      const [vocabRes, levelsRes] = await Promise.all([
        adminContentApi.getVocabularies(params) as any,
        adminContentApi.getHskLevels() as any
      ]);
      if (vocabRes.data) {
        setVocabularies(vocabRes.data.items || []);
      }
      if (levelsRes.data) {
        setHskLevels(levelsRes.data.items || levelsRes.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setSelectedIds([]);
    const timer = setTimeout(() => {
      fetchData(searchQuery, filterLevel, filterStatus);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, filterLevel, filterStatus]);

  // Sync header indeterminate state
  const isAllSelected = vocabularies.length > 0 && vocabularies.every(v => selectedIds.includes(v.id));
  const isSomeSelected = selectedIds.length > 0 && !isAllSelected;

  useEffect(() => {
    if (headerCheckboxRef.current) {
      headerCheckboxRef.current.indeterminate = isSomeSelected;
    }
  }, [isSomeSelected]);

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      const currentVisibleIds = new Set(vocabularies.map(v => v.id));
      setSelectedIds(prev => prev.filter(id => !currentVisibleIds.has(id)));
    } else {
      const newIds = new Set([...selectedIds, ...vocabularies.map(v => v.id)]);
      setSelectedIds(Array.from(newIds));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleOpenModal = (vocab?: any) => {
    if (vocab) {
      setEditForm({ ...vocab });
    } else {
      setEditForm({ 
        hanzi: '', 
        pinyin: '', 
        meaningVi: '', 
        levelId: hskLevels[0]?.id || '',
        partOfSpeech: '',
        example: '',
        status: 'PUBLISHED',
        isActive: true
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditForm({});
  };

  const handleSaveEdit = async (payload: any) => {
    try {
      setSaving(true);
      if (payload.id) {
        await adminContentApi.updateVocabulary(payload.id, payload);
        alert('Cập nhật thành công!');
      } else {
        await adminContentApi.createVocabulary(payload);
        alert('Tạo mới thành công!');
      }
      handleCloseModal();
      fetchData(searchQuery, filterLevel, filterStatus);
    } catch (error) {
      console.error('Failed to save vocabulary', error);
      alert('Lỗi khi lưu từ vựng');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!(await confirm({ title: 'Xóa từ vựng', message: 'Bạn có chắc chắn muốn xóa từ vựng này?', variant: 'danger' }))) return;
    try {
      await adminContentApi.deleteVocabulary(id);
      setSelectedIds(prev => prev.filter(item => item !== id));
      fetchData(searchQuery, filterLevel, filterStatus);
    } catch (error) {
      console.error('Failed to delete vocabulary', error);
      alert('Lỗi khi xóa từ vựng');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    const ok = await confirm({
      title: 'Xóa nhiều từ vựng',
      message: `Bạn có chắc chắn muốn xóa ${selectedIds.length} từ vựng đã chọn? Hành động này không thể hoàn tác.`,
      variant: 'danger',
      confirmText: `Xóa ${selectedIds.length} từ`,
      cancelText: 'Hủy',
    });
    if (!ok) return;

    try {
      setBulkDeleting(true);
      await adminContentApi.bulkDeleteVocabularies(selectedIds);
      setSelectedIds([]);
      fetchData(searchQuery, filterLevel, filterStatus);
    } catch (error) {
      console.error('Failed to bulk delete vocabularies', error);
      alert('Lỗi khi xóa nhiều từ vựng');
    } finally {
      setBulkDeleting(false);
    }
  };

  const handleExportCsv = async () => {
    try {
      const response = await fetch('/api/v1/admin/vocabularies/export', {
        method: 'GET',
      });
      if (!response.ok) throw new Error('Export failed');
      const text = await response.text();
      // Add UTF-8 BOM (\uFEFF) so Excel can read Chinese and Vietnamese characters correctly
      const blob = new Blob(['\uFEFF' + text], { type: 'text/csv;charset=utf-8;' });
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

  const getLevelName = (levelId?: string | null) => {
    if (!levelId) return 'Chưa phân cấp';
    const level = hskLevels.find(l => l.id === levelId);
    return level ? level.name : 'Chưa phân cấp';
  };

  return (
    <div className="bg-white rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex flex-col gap-4 bg-gray-50/50">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="font-bold text-[#11321e] text-lg shrink-0">Danh sách từ vựng</h2>
          
          <div className="relative w-full md:w-80 shrink-0">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm hanzi, pinyin, nghĩa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#c7cf35] transition-shadow bg-white"
            />
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <select 
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="w-full sm:w-auto pl-4 pr-8 py-2 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#c7cf35] transition-shadow bg-white cursor-pointer"
            >
              <option value="">Tất cả cấp độ</option>
              <option value="none">Chưa phân cấp HSK</option>
              {hskLevels.map(level => (
                <option key={level.id} value={level.id}>{level.name}</option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full sm:w-auto pl-4 pr-8 py-2 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#c7cf35] transition-shadow bg-white cursor-pointer"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="PUBLISHED">Đã xuất bản</option>
              <option value="DRAFT">Bản nháp</option>
            </select>
          </div>

          <div className="flex gap-2 w-full md:w-auto shrink-0">
            <button 
              onClick={handleExportCsv}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white text-[#11321e] px-4 py-2 rounded-full text-sm font-bold border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors"
            >
              <FileDown className="h-4 w-4" />
              Export CSV
            </button>
            
            <button 
              onClick={() => setIsBulkModalOpen(true)}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#11321e] text-[#c7cf35] px-4 py-2 rounded-full text-sm font-bold shadow-sm hover:bg-[#1f4e31] transition-colors"
            >
              <ListPlus className="h-4 w-4" />
              Thêm từ
            </button>
          </div>
        </div>

        {/* Thanh thao tác hàng loạt khi có phần tử được chọn */}
        <VocabulariesBulkActionBar
          selectedCount={selectedIds.length}
          bulkDeleting={bulkDeleting}
          onClearSelection={() => setSelectedIds([])}
          onBulkDelete={handleBulkDelete}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-12 px-4 py-4 text-center">
                <input
                  type="checkbox"
                  ref={headerCheckboxRef}
                  checked={isAllSelected}
                  onChange={handleToggleSelectAll}
                  disabled={loading || vocabularies.length === 0}
                  className="h-4 w-4 rounded border-gray-300 text-[#11321e] accent-[#11321e] focus:ring-[#c7cf35] cursor-pointer disabled:cursor-not-allowed"
                  title="Chọn tất cả"
                />
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Hán Tự / Pinyin</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-1/3">Nghĩa & Loại từ</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Cấp độ</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Trạng thái</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Hành động</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500 font-medium">Đang tải...</td>
              </tr>
            ) : vocabularies.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500 font-medium">Chưa có từ vựng nào</td>
              </tr>
            ) : (
              vocabularies.map((vocab) => {
                const isSelected = selectedIds.includes(vocab.id);
                return (
                  <tr 
                    key={vocab.id} 
                    className={`transition-colors ${isSelected ? 'bg-[#f7f8df]/70' : 'hover:bg-gray-50'}`}
                  >
                    <td className="w-12 px-4 py-4 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(vocab.id)}
                        className="h-4 w-4 rounded border-gray-300 text-[#11321e] accent-[#11321e] focus:ring-[#c7cf35] cursor-pointer"
                        title={`Chọn từ ${vocab.hanzi}`}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-2xl font-bold text-[#11321e]">{vocab.hanzi}</span>
                        <span className="text-gray-500 text-sm mt-1">{vocab.pinyin}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-[#11321e] font-medium line-clamp-2">{vocab.meaningVi || vocab.meaning}</span>
                        {vocab.partOfSpeech && (
                          <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full w-max">{vocab.partOfSpeech}</span>
                        )}
                        {vocab.example && (
                          <span className="text-xs text-gray-400 line-clamp-1 italic mt-1">VD: {vocab.example}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 font-bold text-xs rounded-full ${vocab.levelId ? 'bg-gray-100 text-gray-700' : 'bg-amber-50 text-amber-700 border border-amber-200/70'}`}>
                        {getLevelName(vocab.levelId)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <span className={`text-[10px] font-bold uppercase rounded-full w-max px-2 py-0.5 ${vocab.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {vocab.status === 'PUBLISHED' ? 'Đã xuất bản' : 'Bản nháp'}
                        </span>
                        <span className={`text-[10px] font-bold uppercase rounded-full w-max px-2 py-0.5 ${vocab.isActive ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                          {vocab.isActive ? 'Hiển thị' : 'Đã ẩn'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleOpenModal(vocab)}
                          className="h-8 w-8 rounded-full bg-[#f3f4e1] flex items-center justify-center text-[#4a5a3a] hover:bg-[#dde8a6] transition-colors"
                          title="Sửa"
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
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <BulkAddVocabularyModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        onSuccess={() => {
          setSelectedIds([]);
          fetchData(searchQuery, filterLevel, filterStatus);
        }}
        hskLevels={hskLevels}
      />

      {/* MODAL THÊM/SỬA TỪ VỰNG */}
      <EditVocabularyModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveEdit}
        saving={saving}
        editForm={editForm}
        setEditForm={setEditForm}
        hskLevels={hskLevels}
      />
    </div>
  );
}
