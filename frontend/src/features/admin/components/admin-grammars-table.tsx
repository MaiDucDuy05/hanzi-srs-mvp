/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { useState, useEffect } from 'react';
import { adminContentApi } from '@/lib/api/endpoints/admin-content';
import { Edit2, Trash2, Search, Plus, X, FileDown, ListPlus } from 'lucide-react';
import { BulkAddGrammarModal } from './bulk-add-grammar-modal';

export const AdminGrammarsTable = () => {
  const [grammars, setGrammars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterLevel, setFilterLevel] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [hskLevels, setHskLevels] = useState<any[]>([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [editForm, setEditForm] = useState<any>({});

  const fetchGrammars = async (searchStr: string = search, levelId: string = filterLevel, statusStr: string = filterStatus) => {
    try {
      setLoading(true);
      const params: any = { page: 1, limit: 100 };
      if (searchStr) params.search = searchStr;
      if (levelId) params.levelId = levelId;
      if (statusStr) params.status = statusStr;

      const [grammarRes, levelsRes] = await Promise.all([
        adminContentApi.getGrammars(params) as any,
        adminContentApi.getHskLevels() as any
      ]);
      setGrammars(grammarRes.data?.items || grammarRes.data || []);
      setHskLevels(levelsRes.data?.items || levelsRes.data || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa ngữ pháp này?')) return;
    try {
      await adminContentApi.deleteGrammar(id);
      fetchGrammars(search, filterLevel, filterStatus);
    } catch (error) {
      console.error('Failed to delete grammar:', error);
      alert('Lỗi khi xóa ngữ pháp');
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchGrammars(search, filterLevel, filterStatus);
    }, 500);
    return () => clearTimeout(timer);
  }, [search, filterLevel, filterStatus]);

  const handleOpenModal = (grammar?: any) => {
    if (grammar) {
      setEditForm({ ...grammar });
    } else {
      setEditForm({ title: '', structure: '', explanation: '', status: 'DRAFT', isActive: true });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditForm({});
  };

  const handleSave = async () => {
    try {
      if (editForm.id) {
        await adminContentApi.updateGrammar(editForm.id, editForm);
        alert('Cập nhật thành công!');
      } else {
        await adminContentApi.createGrammar(editForm);
        alert('Tạo mới thành công!');
      }
      handleCloseModal();
      fetchGrammars(search, filterLevel, filterStatus);
    } catch (error) {
      alert('Lưu thất bại!');
      console.error(error);
    }
  };

  const handleExportCsv = async () => {
    try {
      const response = await fetch('/api/v1/admin/grammars/export', {
        method: 'GET',
      });
      if (!response.ok) throw new Error('Export failed');
      const text = await response.text();
      const blob = new Blob(['\uFEFF' + text], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', 'grammars_export.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Failed to export CSV', error);
      alert('Lỗi khi xuất CSV');
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex flex-col gap-4 bg-gray-50/50">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="font-bold text-[#11321e] text-lg shrink-0">Danh sách ngữ pháp</h2>
          
          <div className="relative w-full md:w-80 shrink-0">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm tiêu đề, cấu trúc..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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
              Thêm ngữ pháp
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Tiêu đề</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-1/3">Cấu trúc</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Trạng thái</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Hiển thị</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Thao tác</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center p-8 text-gray-400">Đang tải dữ liệu...</td>
              </tr>
            ) : grammars.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center p-8 text-gray-400">Không tìm thấy ngữ pháp</td>
              </tr>
            ) : (
              grammars.map((grammar: any) => (
                <tr key={grammar.id} className="transition-colors hover:bg-gray-50">
                  <td className="px-6 py-4 font-bold text-[#11321e]">{grammar.title}</td>
                  <td className="px-6 py-4 text-gray-600 text-sm max-w-xs truncate">{grammar.structure}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${grammar.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : grammar.status === 'HIDDEN' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                      {grammar.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={grammar.isActive ? 'text-green-600 font-bold' : 'text-red-500 font-bold'}>
                      {grammar.isActive ? 'Bật' : 'Tắt'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleOpenModal(grammar)} className="h-8 w-8 rounded-full bg-[#f3f4e1] flex items-center justify-center text-[#4a5a3a] hover:bg-[#dde8a6] transition-colors" title="Sửa">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(grammar.id)} className="h-8 w-8 rounded-full bg-[#f3f4e1] flex items-center justify-center text-[#4a5a3a] hover:bg-red-100 hover:text-red-500 transition-colors" title="Xóa">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold text-[#11321e]">
                {editForm.id ? 'Sửa Ngữ Pháp' : 'Thêm Ngữ Pháp Mới'}
              </h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-700 p-2">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Tiêu đề</label>
                <input 
                  className="w-full border p-2 rounded-xl focus:ring-2 focus:ring-[#c7cf35] outline-none" 
                  value={editForm.title || ''} 
                  onChange={e => setEditForm({...editForm, title: e.target.value})} 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Cấu trúc</label>
                <textarea 
                  className="w-full border p-2 rounded-xl focus:ring-2 focus:ring-[#c7cf35] outline-none min-h-[80px]" 
                  value={editForm.structure || ''} 
                  onChange={e => setEditForm({...editForm, structure: e.target.value})} 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Giải thích (Markdown)</label>
                <textarea 
                  className="w-full border p-2 rounded-xl focus:ring-2 focus:ring-[#c7cf35] outline-none min-h-[150px]" 
                  value={editForm.explanation || ''} 
                  onChange={e => setEditForm({...editForm, explanation: e.target.value})} 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Trạng thái</label>
                  <select 
                    className="w-full border p-2 rounded-xl focus:ring-2 focus:ring-[#c7cf35] outline-none bg-white"
                    value={editForm.status || 'DRAFT'} 
                    onChange={e => setEditForm({...editForm, status: e.target.value})}
                  >
                    <option value="DRAFT">Nháp (Draft)</option>
                    <option value="PUBLISHED">Công khai (Published)</option>
                    <option value="HIDDEN">Ẩn (Hidden)</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input 
                    type="checkbox" 
                    id="isActive"
                    className="w-4 h-4 text-[#c7cf35] rounded border-gray-300 focus:ring-[#c7cf35]"
                    checked={editForm.isActive ?? true} 
                    onChange={e => setEditForm({...editForm, isActive: e.target.checked})} 
                  />
                  <label htmlFor="isActive" className="text-sm font-semibold text-gray-700">Kích hoạt (Hiển thị)</label>
                </div>
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
              <button 
                onClick={handleCloseModal}
                className="px-6 py-2 rounded-xl font-bold text-gray-600 hover:bg-gray-200 transition-colors"
              >
                Hủy
              </button>
              <button 
                onClick={handleSave}
                className="px-6 py-2 rounded-xl font-bold bg-[#c7cf35] text-[#11321e] hover:bg-[#dde8a6] shadow-sm transition-colors"
              >
                Lưu Ngữ Pháp
              </button>
            </div>
          </div>
        </div>
      )}

      <BulkAddGrammarModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        onSuccess={fetchGrammars}
        hskLevels={hskLevels}
      />
    </div>
  );
};
