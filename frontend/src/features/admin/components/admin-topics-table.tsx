/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { useState, useEffect } from 'react';
import { adminContentApi } from '@/lib/api/endpoints/admin-content';
import { Edit2, Search, Plus, X, Image as ImageIcon, Eye, EyeOff, BookOpen } from 'lucide-react';
import { AdminTopicVocabulariesModal } from './admin-topic-vocabularies-modal';
import { useConfirm } from '@/providers/confirm-provider';

export const AdminTopicsTable = () => {
  const [topics, setTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  
  const [selectedTopicForVocabs, setSelectedTopicForVocabs] = useState<any>(null);
  const confirm = useConfirm();

  const fetchTopics = async () => {
    try {
      setLoading(true);
      const res = await adminContentApi.getTopics() as any;
      setTopics(res.data?.items || res.data || []);
    } catch (error) {
      console.error('Failed to fetch topics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const isPublishing = currentStatus !== 'PUBLISHED';
    if (!(await confirm({ 
      title: isPublishing ? 'Xuất bản chủ đề' : 'Ẩn chủ đề', 
      message: `Bạn có chắc chắn muốn ${isPublishing ? 'xuất bản' : 'ẩn'} chủ đề này?`, 
      variant: isPublishing ? 'info' : 'warning' 
    }))) return;

    try {
      const newStatus = isPublishing ? 'PUBLISHED' : 'DRAFT';
      await adminContentApi.updateTopicStatus(id, newStatus);
      fetchTopics();
    } catch (error) {
      console.error('Failed to update topic status:', error);
      alert('Lỗi khi cập nhật trạng thái chủ đề');
    }
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  const handleOpenModal = (topic?: any) => {
    if (topic) {
      setEditForm({ ...topic });
    } else {
      setEditForm({ name: '', slug: '', description: '', thumbnailKey: '', status: 'DRAFT', isActive: true, displayOrder: 0 });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditForm({});
  };

  const handleSave = async () => {
    if (!(await confirm({ title: 'Lưu thay đổi', message: 'Bạn có chắc chắn muốn lưu các thay đổi này?', variant: 'info' }))) return;
    try {
      if (editForm.id) {
        await adminContentApi.updateTopic(editForm.id, editForm);
        alert('Cập nhật thành công!');
      } else {
        await adminContentApi.createTopic(editForm);
        alert('Tạo mới thành công!');
      }
      handleCloseModal();
      fetchTopics();
    } catch (error) {
      alert('Lưu thất bại!');
      console.error(error);
    }
  };

  const filteredTopics = topics.filter((t: any) => 
    t.name?.toLowerCase().includes(search.toLowerCase()) || 
    t.slug?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h3 className="text-xl font-bold text-[#11321e]">Quản lý Chủ đề</h3>
        <div className="flex gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="text-gray-400 w-4 h-4" />
            </div>
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#c7cf35] transition-all"
              placeholder="Tìm chủ đề..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="bg-[#11321e] text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-[#1f4e31] shrink-0"
          >
            <Plus className="w-4 h-4" /> Tạo mới
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center p-8 text-gray-400 bg-white rounded-3xl border border-gray-100">Đang tải dữ liệu...</div>
      ) : filteredTopics.length === 0 ? (
        <div className="text-center p-8 text-gray-400 bg-white rounded-3xl border border-gray-100">Không tìm thấy chủ đề nào</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTopics.map((topic: any) => (
            <div key={topic.id} className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex flex-col group hover:shadow-md transition-shadow">
              <div className="h-32 bg-gray-100 rounded-2xl mb-4 flex items-center justify-center overflow-hidden">
                {topic.thumbnailKey ? (
                  <img src={topic.thumbnailKey} alt={topic.name} className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-gray-300" />
                )}
              </div>
              
              <div className="flex justify-between items-start mb-2">
                <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-full ${topic.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                  {topic.status === 'PUBLISHED' ? 'Đã xuất bản' : 'Bản nháp'}
                </span>
                <span className={`text-[11px] font-bold ${topic.isActive ? 'text-green-600' : 'text-red-500'}`}>
                  {topic.isActive ? 'Hiển thị' : 'Đã Ẩn'}
                </span>
              </div>
              
              <h4 className="text-lg font-bold text-[#11321e] mb-1">{topic.name}</h4>
              <p className="text-xs text-gray-500 mb-4 line-clamp-2">{topic.description || 'Chưa có mô tả'}</p>
              
              <div className="mt-auto flex justify-end gap-2 pt-4 border-t border-gray-50">
                <button onClick={() => setSelectedTopicForVocabs(topic)} className="p-2 text-gray-400 hover:text-[#c7cf35] hover:bg-gray-100 rounded-lg transition-colors" title="Gán từ vựng">
                  <BookOpen className="w-4 h-4" />
                </button>
                <button onClick={() => handleOpenModal(topic)} className="p-2 text-gray-400 hover:text-[#11321e] hover:bg-gray-100 rounded-lg transition-colors" title="Sửa chủ đề">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleToggleStatus(topic.id, topic.status)} 
                  title={topic.status === 'PUBLISHED' ? 'Ẩn' : 'Xuất bản'}
                  className={`p-2 rounded-lg transition-colors ${
                    topic.status === 'PUBLISHED' 
                      ? 'text-green-600 hover:bg-green-50' 
                      : 'text-gray-400 hover:text-green-600 hover:bg-gray-100'
                  }`}
                >
                  {topic.status === 'PUBLISHED' ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold text-[#11321e]">
                {editForm.id ? 'Sửa Chủ đề' : 'Thêm Chủ đề Mới'}
              </h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-700 p-2">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Tên chủ đề</label>
                <input 
                  className="w-full border p-2 rounded-xl focus:ring-2 focus:ring-[#c7cf35] outline-none" 
                  value={editForm.name || ''} 
                  onChange={e => setEditForm({...editForm, name: e.target.value})} 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Slug (Đường dẫn)</label>
                <input 
                  className="w-full border p-2 rounded-xl focus:ring-2 focus:ring-[#c7cf35] outline-none" 
                  value={editForm.slug || ''} 
                  onChange={e => setEditForm({...editForm, slug: e.target.value})} 
                  placeholder="vd: am-thuc"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Mô tả</label>
                <textarea 
                  className="w-full border p-2 rounded-xl focus:ring-2 focus:ring-[#c7cf35] outline-none min-h-[80px]" 
                  value={editForm.description || ''} 
                  onChange={e => setEditForm({...editForm, description: e.target.value})} 
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
                    <option value="DRAFT">Nháp</option>
                    <option value="PUBLISHED">Công khai</option>
                    <option value="HIDDEN">Ẩn</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input 
                    type="checkbox" 
                    id="isActiveTopic"
                    className="w-4 h-4 text-[#c7cf35] rounded border-gray-300 focus:ring-[#c7cf35]"
                    checked={editForm.isActive ?? true} 
                    onChange={e => setEditForm({...editForm, isActive: e.target.checked})} 
                  />
                  <label htmlFor="isActiveTopic" className="text-sm font-semibold text-gray-700">Hiển thị</label>
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
                Lưu Chủ đề
              </button>
            </div>
          </div>
        </div>
      )}
      
      {selectedTopicForVocabs && (
        <AdminTopicVocabulariesModal 
          topic={selectedTopicForVocabs} 
          onClose={() => setSelectedTopicForVocabs(null)} 
        />
      )}
    </div>
  );
};
