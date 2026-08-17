/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { useState, useEffect } from 'react';
import { adminContentApi } from '@/lib/api/endpoints/admin-content';
import { Edit2, Plus, X, MoreVertical, Eye, EyeOff } from 'lucide-react';

export const AdminLessonsView = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [savingOrder, setSavingOrder] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // 1. Lấy danh sách khóa học để làm Filter
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await adminContentApi.getCourses() as any;
        const coursesData = res.data?.items || res.data || [];
        setCourses(coursesData);
        if (coursesData.length > 0) {
          setSelectedCourseId(coursesData[0].id);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Failed to fetch courses:', error);
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  // 2. Lấy bài học khi chọn khóa học
  useEffect(() => {
    if (!selectedCourseId) return;
    const fetchLessons = async () => {
      try {
        setLoading(true);
        const res = await adminContentApi.getLessons(selectedCourseId) as any;
        // API trả về mảng trực tiếp hoặc data.items
        setLessons(res.data?.items || res.data || res || []);
      } catch (error) {
        console.error('Failed to fetch lessons:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLessons();
  }, [selectedCourseId]);

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
      await adminContentApi.updateLessonStatus(id, newStatus);
      // Cập nhật local state thay vì fetch lại để mượt hơn
      setLessons(lessons.map(l => l.id === id ? { ...l, status: newStatus } : l));
    } catch (error) {
      console.error('Failed to update lesson status:', error);
      alert('Lỗi khi cập nhật trạng thái bài học');
    }
  };

  // Drag & Drop
  const handleDragStart = (idx: number) => setDraggedIdx(idx);
  const handleDragOver = (e: React.DragEvent, idx: number) => e.preventDefault();
  const handleDrop = (e: React.DragEvent, targetIdx: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === targetIdx) return;
    
    const newLessons = [...lessons];
    const draggedLesson = newLessons[draggedIdx];
    newLessons.splice(draggedIdx, 1);
    newLessons.splice(targetIdx, 0, draggedLesson);
    
    const updatedLessons = newLessons.map((l, index) => ({
      ...l,
      displayOrder: index + 1
    }));
    
    setLessons(updatedLessons);
    setDraggedIdx(null);
  };

  const handleSaveOrder = async () => {
    try {
      setSavingOrder(true);
      const payload = lessons.map((l) => ({ id: l.id, order: l.displayOrder }));
      await adminContentApi.reorderLessons(payload);
      alert('Đã lưu thứ tự bài học thành công!');
    } catch (err) {
      console.error('Failed to reorder lessons', err);
      alert('Lỗi khi lưu thứ tự bài học');
    } finally {
      setSavingOrder(false);
    }
  };

  // Modal handlers
  const handleOpenModal = (lesson?: any) => {
    if (lesson) {
      setEditForm({ ...lesson });
    } else {
      setEditForm({ title: '', description: '', status: 'DRAFT', displayOrder: lessons.length + 1 });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditForm({});
  };

  const handleSave = async () => {
    if (!selectedCourseId) return;
    try {
      if (editForm.id) {
        await adminContentApi.updateLesson(editForm.id, editForm);
        alert('Cập nhật bài học thành công!');
      } else {
        await adminContentApi.createLesson(selectedCourseId, editForm);
        alert('Tạo bài học thành công!');
      }
      handleCloseModal();
      // Fetch lại danh sách
      const res = await adminContentApi.getLessons(selectedCourseId) as any;
      setLessons(res.data?.items || res.data || res || []);
    } catch (error) {
      alert('Lưu thất bại!');
      console.error(error);
    }
  };

  const selectedCourseName = courses.find(c => c.id === selectedCourseId)?.name || 'Khóa học';

  return (
    <div className="space-y-6">
      {/* Course Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {courses.length === 0 && !loading && (
          <span className="text-gray-500 text-sm">Bạn cần tạo Khóa học trước khi tạo bài học.</span>
        )}
        {courses.map(course => (
          <button
            key={course.id}
            onClick={() => setSelectedCourseId(course.id)}
            className={`px-5 py-2 rounded-full text-[13px] font-bold border transition-colors ${
              selectedCourseId === course.id 
                ? 'bg-[#c7cf35] text-[#11321e] border-[#c7cf35] shadow-sm' 
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {course.name}
          </button>
        ))}
      </div>

      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-[#11321e]">
          Bài học thuộc: <span className="text-[#78993a]">{selectedCourseName}</span>
        </h3>
        {lessons.length > 0 && (
          <button 
            onClick={handleSaveOrder}
            disabled={savingOrder}
            className="bg-[#c7cf35] text-[#11321e] px-5 py-2 rounded-xl text-sm font-bold shadow-sm hover:bg-[#dde8a6] transition-colors disabled:opacity-50"
          >
            {savingOrder ? 'Đang lưu...' : 'Lưu Thứ Tự'}
          </button>
        )}
      </div>

      {/* Grid bài học */}
      {loading ? (
        <div className="text-center p-12 text-gray-400 bg-white rounded-3xl border border-gray-100">Đang tải bài học...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lessons.map((lesson, idx) => (
            <div 
              key={lesson.id} 
              draggable
              onDragStart={() => handleDragStart(idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDrop={(e) => handleDrop(e, idx)}
              className={`bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col relative group hover:shadow-md transition-all cursor-grab active:cursor-grabbing ${draggedIdx === idx ? 'opacity-50' : ''}`}
            >
              <div className="flex justify-between items-start mb-4">
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                  lesson.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {lesson.status === 'PUBLISHED' ? 'Đã xuất bản' : 'Bản nháp'}
                </span>
                
                <div className="relative">
                  <button 
                    onClick={() => setOpenMenuId(openMenuId === lesson.id ? null : lesson.id)}
                    className="text-gray-400 hover:text-[#11321e] hover:bg-gray-100 p-1 rounded-lg transition-colors"
                  >
                    <MoreVertical className="h-5 w-5" />
                  </button>
                  
                  {openMenuId === lesson.id && (
                    <div className="absolute right-0 top-8 w-44 bg-white rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden z-10">
                      <button 
                        onClick={() => { handleOpenModal(lesson); setOpenMenuId(null); }}
                        className="w-full text-left px-4 py-2.5 text-[13px] font-bold text-[#11321e] hover:bg-gray-50 transition-colors border-b border-gray-50"
                      >
                        Sửa bài học
                      </button>
                      <button 
                        onClick={() => { alert('Tính năng Quản lý nội dung (Thêm từ vựng/Ngữ pháp) sắp ra mắt!'); setOpenMenuId(null); }}
                        className="w-full text-left px-4 py-2.5 text-[13px] font-bold text-gray-500 hover:text-[#11321e] hover:bg-gray-50 transition-colors"
                      >
                        Quản lý nội dung
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <h3 className="text-lg font-bold text-[#11321e] mb-2 leading-tight">
                {lesson.title}
              </h3>
              
              <p className="text-[13px] text-gray-500 font-medium mb-8 line-clamp-3">
                {lesson.description || 'Chưa có mô tả.'}
              </p>

              <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-50">
                <div className="flex items-center gap-2 text-[#78993a]">
                  <span className="text-[11px] font-extrabold px-2 py-1 bg-[#f3f4e1] rounded-lg">Thứ tự: {lesson.displayOrder || idx + 1}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <button onClick={() => handleOpenModal(lesson)} className="h-8 w-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-[#11321e] transition-colors">
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleToggleStatus(lesson.id, lesson.status)} 
                    title={lesson.status === 'PUBLISHED' ? 'Ẩn' : 'Xuất bản'}
                    className={`h-8 w-8 rounded-full flex items-center justify-center transition-colors ${
                      lesson.status === 'PUBLISHED' 
                        ? 'bg-green-50 text-green-600 hover:bg-green-100' 
                        : 'bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-green-600'
                    }`}
                  >
                    {lesson.status === 'PUBLISHED' ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Nút Tạo bài học */}
          {selectedCourseId && (
            <button 
              onClick={() => handleOpenModal()}
              className="bg-[#fcfbe8] border-2 border-dashed border-[#dde8a6] rounded-3xl p-6 flex flex-col items-center justify-center text-center hover:bg-[#f3f4e1] transition-colors min-h-[220px]"
            >
              <div className="h-12 w-12 rounded-full bg-[#c7cf35] text-[#11321e] flex items-center justify-center mb-4 shadow-sm group-hover:scale-105 transition-transform">
                <Plus className="h-6 w-6" strokeWidth={2.5} />
              </div>
              <span className="text-[#11321e] font-bold text-[15px]">Tạo Bài<br/>Học Mới</span>
            </button>
          )}
        </div>
      )}

      {/* Modal Cập nhật / Tạo mới */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
              <h2 className="text-xl font-bold text-[#11321e]">
                {editForm.id ? 'Sửa Bài Học' : 'Thêm Bài Học Mới'}
              </h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Tên bài học</label>
                <input 
                  className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-[#c7cf35] focus:border-transparent outline-none transition-shadow text-[15px]" 
                  value={editForm.title || ''} 
                  onChange={e => setEditForm({...editForm, title: e.target.value})} 
                  placeholder="Nhập tên bài học..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Mô tả</label>
                <textarea 
                  className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-[#c7cf35] focus:border-transparent outline-none transition-shadow text-[15px] min-h-[120px] resize-none" 
                  value={editForm.description || ''} 
                  onChange={e => setEditForm({...editForm, description: e.target.value})} 
                  placeholder="Nhập mô tả ngắn cho bài học..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Trạng thái</label>
                <select 
                  className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-[#c7cf35] focus:border-transparent outline-none bg-white text-[15px]"
                  value={editForm.status || 'DRAFT'} 
                  onChange={e => setEditForm({...editForm, status: e.target.value})}
                >
                  <option value="DRAFT">Bản nháp</option>
                  <option value="PUBLISHED">Đã xuất bản</option>
                </select>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button 
                onClick={handleCloseModal}
                className="px-6 py-2.5 rounded-xl font-bold text-gray-500 bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button 
                onClick={handleSave}
                className="px-6 py-2.5 rounded-xl font-bold bg-[#11321e] text-white hover:bg-[#1f4e31] shadow-sm transition-colors"
              >
                Lưu Bài Học
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
