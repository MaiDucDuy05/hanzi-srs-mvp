/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { adminContentApi } from '@/lib/api/endpoints/admin-content';
import { Edit2, Trash2, Search, ListPlus } from 'lucide-react';
import { AdminPracticeQuestionModal } from './admin-practice-question-modal';

export const AdminPracticeQuestionsTable = () => {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState('');
  const [filterLevel, setFilterLevel] = useState('');
  
  const [hskLevels, setHskLevels] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editForm, setEditForm] = useState<any>({});

  const fetchQuestions = async (searchStr = search, levelId = filterLevel) => {
    try {
      setLoading(true);
      const params: any = { page: 1, limit: 100 };
      if (searchStr) params.search = searchStr;
      if (levelId) params.levelId = levelId;

      const [questionsRes, levelsRes] = await Promise.all([
        adminContentApi.getQuestions(params) as any,
        adminContentApi.getHskLevels() as any
      ]);
      setQuestions(questionsRes.data?.items || questionsRes.data || []);
      setHskLevels(levelsRes.data?.items || levelsRes.data || []);
    } catch (error) {
      console.error('Failed to fetch practice questions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchQuestions(search, filterLevel);
    }, 500);
    return () => clearTimeout(timer);
  }, [search, filterLevel]);

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa câu hỏi này?')) return;
    try {
      await adminContentApi.deleteQuestion(id);
      fetchQuestions(search, filterLevel);
    } catch (error) {
      console.error('Failed to delete practice question:', error);
      alert('Lỗi khi xóa câu hỏi');
    }
  };

  const handleOpenModal = (question?: any) => {
    if (question) {
      setEditForm({ 
        ...question, 
        questionData: question.questionData || {},
        answerData: question.answerData || {}
      });
    } else {
      setEditForm({ 
        prompt: '',
        questionType: 'FILL_BLANK', 
        answerType: 'TEXT',
        levelId: '',
        questionData: {},
        answerData: {},
        isActive: true,
        status: 'PUBLISHED'
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
      let parsedQuestion = editForm.questionData;
      let parsedAnswer = editForm.answerData;
      
      // Fallback if they somehow remained strings
      if (typeof parsedQuestion === 'string') {
        try { parsedQuestion = JSON.parse(parsedQuestion || '{}'); } catch { alert('Dữ liệu JSON không hợp lệ!'); return; }
      }
      if (typeof parsedAnswer === 'string') {
        try { parsedAnswer = JSON.parse(parsedAnswer || '{}'); } catch { alert('Dữ liệu JSON không hợp lệ!'); return; }
      }

      const payload = {
        ...editForm,
        questionData: parsedQuestion,
        answerData: parsedAnswer,
        levelId: editForm.levelId || null,
        lessonId: editForm.lessonId || null,
        topicId: editForm.topicId || null
      };

      if (payload.id) {
        await adminContentApi.updateQuestion(payload.id, payload);
        alert('Cập nhật thành công!');
      } else {
        await adminContentApi.createQuestion(payload);
        alert('Tạo mới thành công!');
      }
      handleCloseModal();
      fetchQuestions(search, filterLevel);
    } catch (error) {
      alert('Lưu thất bại!');
      console.error(error);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex flex-col gap-4 bg-gray-50/50">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="font-bold text-[#11321e] text-lg shrink-0">Câu hỏi Luyện tập</h2>
          
          <div className="relative w-full md:w-80 shrink-0">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm nội dung (prompt)..."
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
              <option value="">Tất cả HSK</option>
              {hskLevels.map(level => (
                <option key={level.id} value={level.id}>{level.name || `HSK ${level.level}`}</option>
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
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Prompt</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Loại (Question Type)</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">HSK Level</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Trạng thái</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Thao tác</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center p-8 text-gray-400">Đang tải dữ liệu...</td>
              </tr>
            ) : questions.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center p-8 text-gray-400">Không tìm thấy câu hỏi luyện tập</td>
              </tr>
            ) : (
              questions.map((q: any) => (
                <tr key={q.id} className="transition-colors hover:bg-gray-50">
                  <td className="px-6 py-4 font-bold text-[#11321e] max-w-xs truncate">{q.prompt}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-700">
                      {q.questionType}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-600">
                    {q.levelId 
                      ? hskLevels.find(l => l.id === q.levelId)?.name || `HSK Level ${q.levelId}`
                      : '-'}
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
        <AdminPracticeQuestionModal
          editForm={editForm}
          setEditForm={setEditForm}
          hskLevels={hskLevels}
          onClose={handleCloseModal}
          onSave={handleSave}
        />
      )}
    </div>
  );
};
