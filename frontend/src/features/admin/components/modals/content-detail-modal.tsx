'use client';
import { X } from 'lucide-react';

interface ContentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: any | null;
  loading: boolean;
}

export const ContentDetailModal = ({ isOpen, onClose, content, loading }: ContentDetailModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-xl flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-xl font-bold text-[#11321e]">Chi tiết nội dung</h2>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center p-8 text-gray-500">Đang tải...</div>
          ) : content ? (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tiêu đề / Nội dung chính</label>
                <div className="mt-1 text-gray-900 font-medium whitespace-pre-wrap bg-gray-50 p-4 rounded-2xl">
                  {content.title || content.name || content.prompt || '(Không có)'}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</label>
                  <div className="mt-1 text-gray-900">{content.id}</div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Phân loại</label>
                  <div className="mt-1 text-gray-900">{content.type}</div>
                </div>
              </div>
              
              {content.hiddenByAdmin && (
                <div>
                  <label className="text-xs font-semibold text-red-500 uppercase tracking-wider">Lý do phạt</label>
                  <div className="mt-1 text-red-700 bg-red-50 p-3 rounded-xl">
                    {content.hideReason || 'Không có lý do'}
                  </div>
                </div>
              )}
              
              <div className="pt-4 border-t border-gray-100">
                <details className="cursor-pointer">
                  <summary className="text-sm font-semibold text-gray-600 hover:text-forest">Xem dữ liệu thô (Raw JSON)</summary>
                  <pre className="mt-2 text-xs bg-gray-800 text-green-400 p-4 rounded-xl overflow-x-auto">
                    {JSON.stringify(content, null, 2)}
                  </pre>
                </details>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500">Không tìm thấy dữ liệu</div>
          )}
        </div>
        
        <div className="p-6 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
