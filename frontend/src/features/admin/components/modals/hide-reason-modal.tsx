'use client';
import { useState } from 'react';
import { X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => Promise<void>;
  title?: string;
}

export const HideReasonModal = ({ isOpen, onClose, onSubmit, title = 'Ẩn Nội Dung' }: Props) => {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      alert('Vui lòng nhập lý do ẩn nội dung');
      return;
    }

    try {
      setLoading(true);
      await onSubmit(reason);
      setReason('');
      onClose();
    } catch (error) {
      console.error(error);
      alert('Có lỗi xảy ra khi ẩn nội dung');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-red-600">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 p-2" disabled={loading}>
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <p className="text-sm text-gray-600 mb-2">
              Nội dung bị ẩn sẽ không hiển thị với học viên. Bạn phải cung cấp lý do để giáo viên biết và khắc phục.
            </p>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Lý do ẩn <span className="text-red-500">*</span></label>
              <textarea 
                className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-red-500 outline-none min-h-[100px]" 
                placeholder="Ví dụ: Nội dung vi phạm bản quyền..."
                value={reason} 
                onChange={e => setReason(e.target.value)}
                disabled={loading}
                required
              />
            </div>
          </div>

          <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
            <button 
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-xl font-bold text-gray-600 hover:bg-gray-200 transition-colors"
              disabled={loading}
            >
              Hủy
            </button>
            <button 
              type="submit"
              className="px-6 py-2 rounded-xl font-bold bg-red-500 text-white hover:bg-red-600 shadow-sm transition-colors"
              disabled={loading}
            >
              {loading ? 'Đang xử lý...' : 'Xác nhận Ẩn'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
