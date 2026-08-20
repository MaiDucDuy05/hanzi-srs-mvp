/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { adminContentApi } from '@/lib/api/endpoints/admin-content';
import { Edit2, Trash2, Search, Plus, X, ListPlus } from 'lucide-react';

export const AdminExamQuestionsTable = () => {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState('');
  const [filterSourceType, setFilterSourceType] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterLevel, setFilterLevel] = useState('');
  
  const [hskLevels, setHskLevels] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editForm, setEditForm] = useState<any>({});

  const fetchQuestions = async (searchStr = search, sourceTypeStr = filterSourceType, typeStr = filterType, levelId = filterLevel) => {
    try {
      setLoading(true);
      const params: any = { page: 1, limit: 100 };
      if (searchStr) params.search = searchStr;
      if (sourceTypeStr) params.sourceType = sourceTypeStr;
      if (typeStr) params.type = typeStr;
      if (levelId) params.hskLevel = levelId;

      const [questionsRes, levelsRes] = await Promise.all([
        adminContentApi.getExamQuestions(params) as any,
        adminContentApi.getHskLevels() as any
      ]);
      setQuestions(questionsRes.data?.items || questionsRes.data || []);
      setHskLevels(levelsRes.data?.items || levelsRes.data || []);
    } catch (error) {
      console.error('Failed to fetch questions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchQuestions(search, filterSourceType, filterType, filterLevel);
    }, 500);
    return () => clearTimeout(timer);
  }, [search, filterSourceType, filterType, filterLevel]);

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa câu hỏi này?')) return;
    try {
      await adminContentApi.deleteExamQuestion(id);
      fetchQuestions(search, filterSourceType, filterType, filterLevel);
    } catch (error) {
      console.error('Failed to delete question:', error);
      alert('Lỗi khi xóa câu hỏi');
    }
  };

  const handleOpenModal = (question?: any) => {
    if (question) {
      setEditForm({ 
        ...question, 
        content: JSON.stringify(question.content || {}, null, 2),
        tags: question.tags ? question.tags.join(', ') : '' 
      });
    } else {
      setEditForm({ 
        type: 'SINGLE_CHOICE', 
        sourceType: 'BOTH',
        difficulty: 'MEDIUM',
        visibility: 'PUBLIC',
        hskLevel: '',
        lessonId: '',
        topicId: '',
        content: '{}',
        explanation: '',
        tags: '',
        isActive: true
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditForm({});
  };

  const handleSave = async () => {
    try {
      let parsedContent = {};
      try {
        parsedContent = JSON.parse(editForm.content || '{}');
      } catch {
        alert('Dữ liệu JSON không hợp lệ ở mục Content!');
        return;
      }

      const payload = {
        ...editForm,
        content: parsedContent,
        tags: editForm.tags ? editForm.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
        hskLevel: editForm.hskLevel ? parseInt(editForm.hskLevel) : null
      };

      if (payload.id) {
        await adminContentApi.updateExamQuestion(payload.id, payload);
        alert('Cập nhật thành công!');
      } else {
        await adminContentApi.createExamQuestion(payload);
        alert('Tạo mới thành công!');
      }
      handleCloseModal();
      fetchQuestions(search, filterSourceType, filterType, filterLevel);
    } catch (error) {
      alert('Lưu thất bại!');
      console.error(error);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex flex-col gap-4 bg-gray-50/50">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="font-bold text-[#11321e] text-lg shrink-0">Danh sách Câu hỏi</h2>
          
          <div className="relative w-full md:w-80 shrink-0">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm nội dung..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#c7cf35] transition-shadow bg-white"
            />
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <select 
              value={filterSourceType}
              onChange={(e) => setFilterSourceType(e.target.value)}
              className="w-full sm:w-auto pl-4 pr-8 py-2 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#c7cf35] transition-shadow bg-white cursor-pointer"
            >
              <option value="">Tất cả Nguồn</option>
              <option value="PRACTICE">Luyện tập (Practice)</option>
              <option value="EXAM">Bài thi (Exam)</option>
              <option value="BOTH">Cả hai (Both)</option>
            </select>

            <select 
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full sm:w-auto pl-4 pr-8 py-2 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#c7cf35] transition-shadow bg-white cursor-pointer"
            >
              <option value="">Tất cả Loại</option>
              <option value="SINGLE_CHOICE">Trắc nghiệm</option>
              <option value="FILL_IN">Điền khuyết</option>
              <option value="ORDERING">Sắp xếp</option>
              <option value="TRUE_FALSE">Đúng / Sai</option>
              <option value="MATCHING">Nối từ</option>
            </select>

            <select 
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="w-full sm:w-auto pl-4 pr-8 py-2 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#c7cf35] transition-shadow bg-white cursor-pointer"
            >
              <option value="">Tất cả HSK</option>
              {[1,2,3,4,5,6,7,8,9].map(num => (
                <option key={num} value={num}>HSK {num}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 w-full md:w-auto shrink-0">
            <button 
              onClick={() => handleOpenModal()}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#11321e] text-[#c7cf35] px-4 py-2 rounded-full text-sm font-bold shadow-sm hover:bg-[#1f4e31] transition-colors"
            >
              <ListPlus className="h-4 w-4" />
              Thêm câu hỏi
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Loại</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Nguồn</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">HSK</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-1/3">Nội dung (Preview)</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Trạng thái</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Thao tác</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center p-8 text-gray-400">Đang tải dữ liệu...</td>
              </tr>
            ) : questions.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center p-8 text-gray-400">Không tìm thấy câu hỏi</td>
              </tr>
            ) : (
              questions.map((q: any) => (
                <tr key={q.id} className="transition-colors hover:bg-gray-50">
                  <td className="px-6 py-4 font-bold text-[#11321e]">{q.type}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-700">
                      {q.sourceType}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-600">
                    {q.hskLevel ? `HSK ${q.hskLevel}` : '-'}
                  </td>
                  <td className="px-6 py-4 text-gray-600 text-sm max-w-xs truncate">
                    {JSON.stringify(q.content)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={q.isActive ? 'text-green-600 font-bold text-sm' : 'text-red-500 font-bold text-sm'}>
                      {q.isActive ? 'Bật' : 'Tắt'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleOpenModal(q)} className="h-8 w-8 rounded-full bg-[#f3f4e1] flex items-center justify-center text-[#4a5a3a] hover:bg-[#dde8a6] transition-colors" title="Sửa">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(q.id)} className="h-8 w-8 rounded-full bg-[#f3f4e1] flex items-center justify-center text-[#4a5a3a] hover:bg-red-100 hover:text-red-500 transition-colors" title="Xóa">
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
          <div className="bg-white rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
              <h2 className="text-xl font-bold text-[#11321e]">
                {editForm.id ? 'Sửa Câu hỏi' : 'Thêm Câu hỏi Mới'}
              </h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-700 p-2">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Row 1: Type & Source & Difficulty */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Nguồn câu hỏi</label>
                  <select 
                    className="w-full border p-2.5 rounded-xl focus:ring-2 focus:ring-[#c7cf35] outline-none bg-white border-gray-200"
                    value={editForm.sourceType || 'BOTH'} 
                    onChange={e => setEditForm({...editForm, sourceType: e.target.value})}
                  >
                    <option value="PRACTICE">Luyện tập (Practice)</option>
                    <option value="EXAM">Bài thi (Exam)</option>
                    <option value="BOTH">Cả hai (Both)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Loại Câu hỏi</label>
                  <select 
                    className="w-full border p-2.5 rounded-xl focus:ring-2 focus:ring-[#c7cf35] outline-none bg-white border-gray-200"
                    value={editForm.type || 'SINGLE_CHOICE'} 
                    onChange={e => setEditForm({...editForm, type: e.target.value})}
                  >
                    <option value="SINGLE_CHOICE">Trắc nghiệm một lựa chọn (SINGLE_CHOICE)</option>
                    <option value="FILL_IN">Điền vào chỗ trống (FILL_IN)</option>
                    <option value="ORDERING">Sắp xếp câu (ORDERING)</option>
                    <option value="TRUE_FALSE">Đúng / Sai (TRUE_FALSE)</option>
                    <option value="MATCHING">Nối từ (MATCHING)</option>
                    <option value="SHORT_ANSWER">Trả lời ngắn (SHORT_ANSWER)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Độ khó</label>
                  <select 
                    className="w-full border p-2.5 rounded-xl focus:ring-2 focus:ring-[#c7cf35] outline-none bg-white border-gray-200"
                    value={editForm.difficulty || 'MEDIUM'} 
                    onChange={e => setEditForm({...editForm, difficulty: e.target.value})}
                  >
                    <option value="EASY">Dễ (Easy)</option>
                    <option value="MEDIUM">Trung bình (Medium)</option>
                    <option value="HARD">Khó (Hard)</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Curriculum bindings */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">HSK Level</label>
                  <select 
                    className="w-full border p-2.5 rounded-xl focus:ring-2 focus:ring-[#c7cf35] outline-none bg-white border-gray-200"
                    value={editForm.hskLevel || ''} 
                    onChange={e => setEditForm({...editForm, hskLevel: e.target.value})}
                  >
                    <option value="">-- Không xếp loại --</option>
                    {[1,2,3,4,5,6,7,8,9].map(num => (
                      <option key={num} value={num}>HSK {num}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Lesson ID (Tùy chọn)</label>
                  <input 
                    type="text" 
                    className="w-full p-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#c7cf35]" 
                    placeholder="UUID của bài học"
                    value={editForm.lessonId || ''} 
                    onChange={(e) => setEditForm({...editForm, lessonId: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Topic ID (Tùy chọn)</label>
                  <input 
                    type="text" 
                    className="w-full p-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#c7cf35]" 
                    placeholder="UUID của chủ đề"
                    value={editForm.topicId || ''} 
                    onChange={(e) => setEditForm({...editForm, topicId: e.target.value})} 
                  />
                </div>
              </div>

              {/* Row 3: Content JSON */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nội dung JSON (Câu hỏi + Đáp án)</label>
                <textarea 
                  className="w-full border p-4 rounded-xl focus:ring-2 focus:ring-[#c7cf35] outline-none font-mono text-sm h-48 border-gray-200 bg-gray-50" 
                  value={editForm.content || ''} 
                  placeholder='{"question": "Nội dung...", "options": [...], "answer": "..."}'
                  onChange={e => setEditForm({...editForm, content: e.target.value})} 
                />
              </div>

              {/* Row 4: Explanation */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Giải thích (Markdown)</label>
                <textarea 
                  className="w-full border p-4 rounded-xl focus:ring-2 focus:ring-[#c7cf35] outline-none text-sm h-24 border-gray-200" 
                  value={editForm.explanation || ''} 
                  onChange={e => setEditForm({...editForm, explanation: e.target.value})} 
                />
              </div>

              {/* Row 5: Tags & Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tags (Ngăn cách bởi dấu phẩy)</label>
                  <input 
                    type="text" 
                    className="w-full p-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#c7cf35]" 
                    placeholder="grammar, hsk1, vocabulary"
                    value={editForm.tags || ''} 
                    onChange={(e) => setEditForm({...editForm, tags: e.target.value})} 
                  />
                </div>
                <div className="flex gap-6 items-center pt-8">
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="isActiveQuestion"
                      className="w-4 h-4 text-[#c7cf35] rounded border-gray-300 focus:ring-[#c7cf35]"
                      checked={editForm.isActive ?? true} 
                      onChange={e => setEditForm({...editForm, isActive: e.target.checked})} 
                    />
                    <label htmlFor="isActiveQuestion" className="text-sm font-semibold text-gray-700 cursor-pointer">Kích hoạt</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="isPublicQuestion"
                      className="w-4 h-4 text-[#c7cf35] rounded border-gray-300 focus:ring-[#c7cf35]"
                      checked={editForm.visibility === 'PUBLIC'} 
                      onChange={e => setEditForm({...editForm, visibility: e.target.checked ? 'PUBLIC' : 'PRIVATE'})} 
                    />
                    <label htmlFor="isPublicQuestion" className="text-sm font-semibold text-gray-700 cursor-pointer">Công khai (Public)</label>
                  </div>
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
