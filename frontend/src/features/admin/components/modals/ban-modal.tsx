import React, { useState } from 'react';
import type { User } from '@/lib/api/types';
import { Card } from '@/features/ui/components/card';
import { X, AlertTriangle } from 'lucide-react';

interface BanModalProps {
  user: User;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
}

export function BanModal({ user, onClose, onConfirm }: BanModalProps) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const isBanned = user.status === 'BANNED';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isBanned && !reason.trim()) return;
    setLoading(true);
    try {
      await onConfirm(reason);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
      <Card className="w-full max-w-md bg-white/95 backdrop-blur-xl border border-white shadow-2xl p-6 rounded-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
          <X className="h-5 w-5" />
        </button>
        
        <div className="flex flex-col items-center mb-6 text-center">
          <div className={`h-12 w-12 rounded-full mb-3 flex items-center justify-center ${isBanned ? 'bg-forest/10 text-forest' : 'bg-red-500/10 text-red-500'}`}>
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-gray-800">
            {isBanned ? 'Mở Khóa Tài Khoản' : 'Khóa Tài Khoản'}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {isBanned ? `Bạn có chắc chắn muốn mở khóa cho ${user.fullName}?` : `Tài khoản ${user.fullName} (${user.email}) sẽ không thể đăng nhập.`}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isBanned && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lý do khóa (bắt buộc)</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
                className="w-full rounded-xl border border-gray-200 bg-white/50 px-3 py-2 text-sm focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest transition-colors min-h-[100px] resize-none"
                placeholder="Nhập lý do vi phạm..."
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading || (!isBanned && !reason.trim())}
              className={`px-4 py-2 text-sm font-medium text-white rounded-xl transition-colors flex items-center gap-2 ${
                isBanned 
                  ? 'bg-forest hover:bg-forest/90' 
                  : 'bg-red-500 hover:bg-red-600 disabled:opacity-50'
              }`}
            >
              {loading && <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {isBanned ? 'Xác nhận mở khóa' : 'Khóa tài khoản'}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}
