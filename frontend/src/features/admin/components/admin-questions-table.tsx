/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { useState, useEffect } from 'react';
import { adminContentApi } from '@/lib/api/endpoints/admin-content';
import { Edit2, Trash2, Search, Plus, X } from 'lucide-react';

export const AdminQuestionsTable = () => {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editForm, setEditForm] = useState<any>({});

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const res = await adminContentApi.getQuestions() as any;
      setQuestions(res.data?.items || res.data || []);
    } catch (error) {
      console.error('Failed to fetch questions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleOpenModal = (question?: any) => {
    if (question) {
      setEditForm({ ...question, questionData: JSON.stringify(question.questionData || {}), answerData: JSON.stringify(question.answerData || {}) });
    } else {
      setEditForm({ prompt: '', questionType: 'FILL_BLANK', status: 'DRAFT', isActive: true, questionData: '{}', answerData: '{}', topicId: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditForm({});
  };

  const handleSave = async () => {
    try {
      // Parse JSON back before sending
      const payload = {
        ...editForm,
        questionData: JSON.parse(editForm.questionData || '{}'),
        answerData: JSON.parse(editForm.answerData || '{}')
      };

      if (payload.id) {
        await adminContentApi.updateQuestion(payload.id, payload);
        alert('Cập nhật thành công!');
      } else {
        await adminContentApi.createQuestion(payload);
        alert('Tạo mới thành công!');
      }
      handleCloseModal();
      fetchQuestions();
    } catch (error) {
      alert('Lưu thất bại! Hãy kiểm tra định dạng JSON.');
      console.error(error);
    }
  };

  const filteredQuestions = questions.filter((q: any) => 
    q.prompt?.toLowerCase().includes(search.toLowerCase()) || 
    q.questionType?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 relative">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-[#11321e]">Quản lý Câu hỏi Public</h3>
        <div className="flex gap-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="text-gray-400 w-4 h-4" />
            </div>
            <input
              type="text"
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#c7cf35] transition-all"
              placeholder="Tìm theo nội dung..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="bg-[#11321e] text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-[#1f4e31]"
          >
            <Plus className="w-4 h-4" /> Tạo mới
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="p-4 font-semibold text-gray-600 rounded-tl-xl">Loại câu hỏi</th>
              <th className="p-4 font-semibold text-gray-600">Nội dung (Prompt)</th>
              <th className="p-4 font-semibold text-gray-600">Trạng thái</th>
              <th className="p-4 font-semibold text-gray-600">Hiển thị</th>
              <th className="p-4 font-semibold text-gray-600 rounded-tr-xl">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center p-8 text-gray-400">Đang tải dữ liệu...</td>
              </tr>
            ) : filteredQuestions.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center p-8 text-gray-400">Không tìm thấy câu hỏi</td>
              </tr>
            ) : (
              filteredQuestions.map((q: any) => (
                <tr key={q.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-bold text-[#11321e]">{q.questionType}</td>
                  <td className="p-4 text-gray-600 text-sm max-w-xs truncate">{q.prompt || '(Không có prompt)'}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${q.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : q.status === 'HIDDEN' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                      {q.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={q.isActive ? 'text-green-600' : 'text-red-500'}>
                      {q.isActive ? 'Bật' : 'Tắt'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex space-x-2">
                      <button onClick={() => handleOpenModal(q)} className="p-2 text-gray-400 hover:text-[#11321e] hover:bg-gray-100 rounded-lg">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
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
                {editForm.id ? 'Sửa Câu hỏi' : 'Thêm Câu hỏi Mới'}
              </h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-700 p-2">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Loại Câu hỏi</label>
                <select 
                  className="w-full border p-2 rounded-xl focus:ring-2 focus:ring-[#c7cf35] outline-none bg-white"
                  value={editForm.questionType || ''} 
                  onChange={e => setEditForm({...editForm, questionType: e.target.value})}
                >
                  <option value="FILL_BLANK">Điền vào chỗ trống</option>
                  <option value="ORDER_WORDS">Sắp xếp câu</option>
                  <option value="MULTIPLE_CHOICE">Trắc nghiệm</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nội dung (Prompt)</label>
                <textarea 
                  className="w-full border p-2 rounded-xl focus:ring-2 focus:ring-[#c7cf35] outline-none min-h-[60px]" 
                  value={editForm.prompt || ''} 
                  onChange={e => setEditForm({...editForm, prompt: e.target.value})} 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lesson ID (Tuỳ chọn)</label>
                  <input type="text" className="w-full p-2 border border-gray-200 rounded-xl" value={editForm.lessonId || ''} onChange={(e) => setEditForm({...editForm, lessonId: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Level ID (Tuỳ chọn)</label>
                  <input type="text" className="w-full p-2 border border-gray-200 rounded-xl" value={editForm.levelId || ''} onChange={(e) => setEditForm({...editForm, levelId: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Topic ID (Tuỳ chọn)</label>
                <input type="text" className="w-full p-2 border border-gray-200 rounded-xl" placeholder="Nếu câu hỏi thuộc Topic, dán ID vào đây" value={editForm.topicId || ''} onChange={(e) => setEditForm({...editForm, topicId: e.target.value})} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Dữ liệu Câu hỏi (JSON)</label>
                  <textarea 
                    className="w-full border p-2 rounded-xl focus:ring-2 focus:ring-[#c7cf35] outline-none font-mono text-sm h-32" 
                    value={editForm.questionData || ''} 
                    onChange={e => setEditForm({...editForm, questionData: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Đáp án (JSON)</label>
                  <textarea 
                    className="w-full border p-2 rounded-xl focus:ring-2 focus:ring-[#c7cf35] outline-none font-mono text-sm h-32" 
                    value={editForm.answerData || ''} 
                    onChange={e => setEditForm({...editForm, answerData: e.target.value})} 
                  />
                </div>
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
                    id="isActiveQuestion"
                    className="w-4 h-4 text-[#c7cf35] rounded border-gray-300 focus:ring-[#c7cf35]"
                    checked={editForm.isActive ?? true} 
                    onChange={e => setEditForm({...editForm, isActive: e.target.checked})} 
                  />
                  <label htmlFor="isActiveQuestion" className="text-sm font-semibold text-gray-700">Kích hoạt (Hiển thị)</label>
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
                Lưu Câu hỏi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
