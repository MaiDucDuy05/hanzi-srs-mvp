/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { useState, useEffect } from 'react';
import { adminContentApi } from '@/lib/api/endpoints/admin-content';
import { Edit2, Save, X, Search, Eye, EyeOff } from 'lucide-react';

export const AdminCoursesTable = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await adminContentApi.getCourses() as any;
      setCourses(res.data?.items || res.data || []);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
      await adminContentApi.updateCourseStatus(id, newStatus);
      fetchCourses();
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Lỗi khi cập nhật trạng thái');
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleEditClick = (course: any) => {
    setEditingId(course.id);
    setEditForm({ ...course });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleSave = async (id: string) => {
    try {
      await adminContentApi.updateCourse(id, {
        name: editForm.name,
        code: editForm.code,
        displayOrder: editForm.displayOrder ? parseInt(editForm.displayOrder) : 0,
        status: editForm.status,
        isActive: editForm.isActive
      });
      setEditingId(null);
      fetchCourses();
    } catch (error) {
      alert('Cập nhật thất bại!');
      console.error(error);
    }
  };

  const filteredCourses = courses.filter((c: any) => 
    c.name?.toLowerCase().includes(search.toLowerCase()) || 
    c.code?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-[#11321e]">Quản lý Khóa học</h3>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="text-gray-400 w-4 h-4" />
          </div>
          <input
            type="text"
            className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#c7cf35] transition-all"
            placeholder="Tìm theo tên/mã..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="p-4 font-semibold text-gray-600 rounded-tl-xl">Mã KH</th>
              <th className="p-4 font-semibold text-gray-600">Tên Khóa Học</th>
              <th className="p-4 font-semibold text-gray-600">Thứ tự</th>
              <th className="p-4 font-semibold text-gray-600">Trạng thái</th>
              <th className="p-4 font-semibold text-gray-600">Hiển thị</th>
              <th className="p-4 font-semibold text-gray-600 rounded-tr-xl">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center p-8 text-gray-400">Đang tải dữ liệu...</td>
              </tr>
            ) : filteredCourses.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center p-8 text-gray-400">Không tìm thấy dữ liệu</td>
              </tr>
            ) : (
              filteredCourses.map((course: any) => {
                const isEditing = editingId === course.id;
                
                return (
                  <tr key={course.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      {isEditing ? (
                        <input 
                          className="w-full border p-1 rounded" 
                          value={editForm.code} 
                          onChange={e => setEditForm({...editForm, code: e.target.value})} 
                        />
                      ) : (
                        <span className="font-medium">{course.code}</span>
                      )}
                    </td>
                    <td className="p-4">
                      {isEditing ? (
                        <input 
                          className="w-full border p-1 rounded" 
                          value={editForm.name} 
                          onChange={e => setEditForm({...editForm, name: e.target.value})} 
                        />
                      ) : (
                        course.name
                      )}
                    </td>
                    <td className="p-4">
                      {isEditing ? (
                        <input 
                          type="number"
                          className="w-20 border p-1 rounded" 
                          value={editForm.displayOrder} 
                          onChange={e => setEditForm({...editForm, displayOrder: e.target.value})} 
                        />
                      ) : (
                        course.displayOrder || 0
                      )}
                    </td>
                    <td className="p-4">
                      {isEditing ? (
                        <select
                          className="border p-1 rounded bg-white"
                          value={editForm.status}
                          onChange={e => setEditForm({...editForm, status: e.target.value})}
                        >
                          <option value="DRAFT">Nháp</option>
                          <option value="PUBLISHED">Công khai</option>
                          <option value="HIDDEN">Đã ẩn</option>
                        </select>
                      ) : (
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${course.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : course.status === 'HIDDEN' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>
                          {course.status === 'PUBLISHED' ? 'Đã xuất bản' : course.status === 'HIDDEN' ? 'Đã ẩn' : 'Bản nháp'}
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      {isEditing ? (
                        <input 
                          type="checkbox"
                          checked={editForm.isActive} 
                          onChange={e => setEditForm({...editForm, isActive: e.target.checked})} 
                        />
                      ) : (
                        <span className={course.isActive ? 'text-green-600' : 'text-red-500'}>
                          {course.isActive ? 'Bật' : 'Tắt'}
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex space-x-2">
                        {isEditing ? (
                          <>
                            <button onClick={() => handleSave(course.id)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg">
                              <Save className="w-4 h-4" />
                            </button>
                            <button onClick={handleCancelEdit} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => handleEditClick(course)} className="p-2 text-gray-400 hover:text-[#11321e] hover:bg-gray-100 rounded-lg">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleToggleStatus(course.id, course.status)} 
                              title={course.status === 'PUBLISHED' ? 'Ẩn' : 'Xuất bản'}
                              className={`p-2 rounded-lg ${
                                course.status === 'PUBLISHED' 
                                  ? 'text-green-600 hover:bg-green-50' 
                                  : 'text-gray-400 hover:text-green-600 hover:bg-gray-100'
                              }`}
                            >
                              {course.status === 'PUBLISHED' ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
