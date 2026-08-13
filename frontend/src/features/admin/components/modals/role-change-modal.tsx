import React, { useState } from 'react';
import type { User } from '@/lib/api/types';
import { Card } from '@/features/ui/components/card';
import { X, ShieldAlert } from 'lucide-react';

interface RoleChangeModalProps {
  user: User;
  onClose: () => void;
  onConfirm: (role: string, vipDays?: number) => Promise<void>;
}

export function RoleChangeModal({ user, onClose, onConfirm }: RoleChangeModalProps) {
  // If user has VIP, display VIP as their role for simplicity, though actual role is FREE/TEACHER
  const initialRole = user.vipValidUntil ? 'VIP' : user.role;
  const [role, setRole] = useState(initialRole);
  const [vipDays, setVipDays] = useState<string>('30');
  const [confirmAdmin, setConfirmAdmin] = useState('');
  const [loading, setLoading] = useState(false);

  const isAdminSelected = role === 'ADMIN';
  const isVipSelected = role === 'VIP';
  
  const canSubmit = !isAdminSelected || confirmAdmin === 'CONFIRM';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    try {
      await onConfirm(role, isVipSelected ? parseInt(vipDays) : undefined);
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
        
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800">Thay Đổi Phân Quyền</h2>
          <p className="text-sm text-gray-500 mt-1">
            Đổi quyền cho người dùng <span className="font-semibold text-gray-800">{user.fullName}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò mới</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white/50 px-3 py-2.5 text-sm focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest transition-colors"
            >
              <option value="FREE">Học viên cơ bản (Free)</option>
              <option value="VIP">Học viên VIP</option>
              <option value="TEACHER">Giáo viên (Teacher)</option>
              <option value="ADMIN">Quản trị viên (Admin)</option>
            </select>
          </div>

          {isVipSelected && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Thời hạn VIP</label>
              <div className="grid grid-cols-3 gap-2">
                {[30, 180, 365].map(days => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => setVipDays(days.toString())}
                    className={`py-2 px-3 text-sm font-medium rounded-xl border transition-colors ${
                      vipDays === days.toString()
                        ? 'bg-[#c7cf35]/20 border-[#c7cf35] text-forest'
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {days} ngày
                  </button>
                ))}
              </div>
            </div>
          )}

          {isAdminSelected && (
            <div className="bg-red-50 p-4 rounded-xl border border-red-100 flex gap-3 mt-4">
              <ShieldAlert className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-red-800 font-medium">Cảnh báo bảo mật</p>
                <p className="text-xs text-red-600 mt-1 mb-2">
                  Việc cấp quyền Quản trị viên (Admin) cho phép người này can thiệp vào toàn bộ hệ thống.
                </p>
                <input
                  type="text"
                  placeholder="Gõ CONFIRM để xác nhận"
                  value={confirmAdmin}
                  onChange={(e) => setConfirmAdmin(e.target.value)}
                  className="w-full rounded-lg border border-red-200 px-3 py-1.5 text-sm focus:border-red-400 focus:outline-none focus:ring-1 focus:ring-red-400"
                />
              </div>
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
              disabled={loading || !canSubmit}
              className="px-4 py-2 text-sm font-medium text-white bg-forest hover:bg-forest/90 rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {loading && <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              Lưu thay đổi
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}
