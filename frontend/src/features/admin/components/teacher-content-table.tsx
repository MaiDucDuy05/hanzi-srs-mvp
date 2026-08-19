'use client';
import { useState, useEffect } from 'react';
import { adminTeacherContentApi } from '@/lib/api/endpoints/admin-teacher-content';
import { Search, Filter, ShieldAlert, Eye, CheckCircle2, AlertCircle, Trash2 } from 'lucide-react';
import { HideReasonModal } from './modals/hide-reason-modal';
import { ContentDetailModal } from './modals/content-detail-modal';

export const TeacherContentTable = () => {
  const [contents, setContents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  const [hideModalOpen, setHideModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedContent, setSelectedContent] = useState<any>(null);
  const [detailData, setDetailData] = useState<any>(null);

  const fetchContents = async () => {
    try {
      setLoading(true);
      const res = await adminTeacherContentApi.getContents({
        search: searchQuery || undefined,
        type: filterType || undefined,
        status: filterStatus || undefined,
      }) as any;
      setContents(res.data?.items || res.data || []);
    } catch (error) {
      console.error('Failed to fetch teacher content:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchContents();
    }, 300);
    return () => clearTimeout(timer);
  }, [filterType, filterStatus, searchQuery]);

  const handleUnhide = async (type: string, id: string) => {
    if (!confirm('Bạn có chắc muốn gỡ phạt và mở lại nội dung này?')) return;
    try {
      await adminTeacherContentApi.unhideContent(type, id);
      fetchContents();
    } catch (error) {
      console.error(error);
      alert('Lỗi khi mở lại nội dung');
    }
  };

  const handleHideSubmit = async (reason: string) => {
    if (!selectedContent) return;
    await adminTeacherContentApi.hideContent(selectedContent.type, selectedContent.id, reason);
    setHideModalOpen(false);
    fetchContents();
  };

  const handleDelete = async (type: string, id: string) => {
    if (!confirm('Bạn có chắc muốn XÓA MỀM nội dung này? Hành động này không thể hoàn tác trên giao diện.')) return;
    try {
      await adminTeacherContentApi.deleteContent(type, id);
      fetchContents();
    } catch (error) {
      console.error(error);
      alert('Lỗi khi xóa nội dung');
    }
  };

  const handleViewDetail = async (type: string, id: string) => {
    setDetailModalOpen(true);
    setDetailLoading(true);
    try {
      const res = await adminTeacherContentApi.getContentDetail(type, id) as any;
      setDetailData(res.data || res);
    } catch (error) {
      console.error('Failed to fetch detail', error);
      setDetailData(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'test': return 'Bài kiểm tra';
      case 'resource': return 'Tài liệu';
      case 'question': return 'Câu hỏi';
      default: return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'test': return 'bg-blue-100 text-blue-700';
      case 'resource': return 'bg-purple-100 text-purple-700';
      case 'question': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl flex-1 w-full sm:max-w-md">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tiêu đề..."
            className="bg-transparent border-none outline-none w-full text-sm font-semibold text-gray-700 placeholder-gray-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-4 items-center w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              className="border-none bg-gray-50 text-sm font-semibold text-gray-700 py-2 px-4 rounded-xl focus:ring-2 focus:ring-[#c7cf35] outline-none"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="">Tất cả loại</option>
              <option value="test">Bài kiểm tra</option>
              <option value="resource">Tài liệu</option>
              <option value="question">Câu hỏi</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <select
              className="border-none bg-gray-50 text-sm font-semibold text-gray-700 py-2 px-4 rounded-xl focus:ring-2 focus:ring-[#c7cf35] outline-none"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="ACTIVE">Bình thường</option>
              <option value="HIDDEN">Bị ẩn (Vi phạm)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm">
                <th className="p-4 font-semibold whitespace-nowrap">Nội dung</th>
                <th className="p-4 font-semibold whitespace-nowrap text-center">Phân loại</th>
                <th className="p-4 font-semibold whitespace-nowrap text-center">Trạng thái</th>
                <th className="p-4 font-semibold whitespace-nowrap text-center">Thời gian tạo</th>
                <th className="p-4 font-semibold whitespace-nowrap text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">Đang tải...</td>
                </tr>
              ) : contents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500 flex items-center justify-center gap-2">
                    <ShieldAlert className="w-5 h-5" /> Không có nội dung nào
                  </td>
                </tr>
              ) : (
                contents.map((item) => (
                  <tr key={`${item.type}-${item.id}`} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 max-w-[300px]">
                      <div className="font-bold text-[#11321e] truncate" title={item.title}>
                        {item.title || '(Không có tiêu đề)'}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">ID: {item.id}</div>
                      {item.hiddenByAdmin && item.hideReason && (
                        <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded-lg flex gap-1 items-start">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span className="line-clamp-2">Lý do: {item.hideReason}</span>
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getTypeColor(item.type)}`}>
                        {getTypeLabel(item.type)}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      {item.hiddenByAdmin ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">
                          <ShieldAlert className="w-3 h-3" /> Bị ẩn
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                          <CheckCircle2 className="w-3 h-3" /> Hợp lệ
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-center text-sm text-gray-500">
                      {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => handleViewDetail(item.type, item.id)}
                          className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        {item.hiddenByAdmin ? (
                          <button 
                            onClick={() => handleUnhide(item.type, item.id)}
                            className="p-2 text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                            title="Gỡ phạt & Mở lại"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        ) : (
                          <button 
                            onClick={() => {
                              setSelectedContent(item);
                              setHideModalOpen(true);
                            }}
                            className="p-2 text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
                            title="Ẩn nội dung vi phạm"
                          >
                            <ShieldAlert className="w-4 h-4" />
                          </button>
                        )}
                        
                        <button 
                          onClick={() => handleDelete(item.type, item.id)}
                          className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                          title="Xóa mềm nội dung"
                        >
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
      </div>

      <HideReasonModal
        isOpen={hideModalOpen}
        onClose={() => setHideModalOpen(false)}
        onSubmit={handleHideSubmit}
      />
      <ContentDetailModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        content={detailData}
        loading={detailLoading}
      />
    </div>
  );
};
