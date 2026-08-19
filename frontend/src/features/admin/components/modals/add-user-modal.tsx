import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/features/ui/components/button';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { email: string; fullName: string; password?: string; role: string; vipDays?: number }) => Promise<void>;
  loading: boolean;
}

export function AddUserModal({ isOpen, onClose, onSubmit, loading }: AddUserModalProps) {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('FREE');
  const [vipDays, setVipDays] = useState(30);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      email,
      fullName,
      password: password || undefined, // undefined sẽ dùng pass mặc định bên BE
      role,
      vipDays: role === 'VIP' ? vipDays : undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl animate-in zoom-in-95 relative">
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="mb-2 text-xl font-bold text-forest">Thêm người dùng mới</h2>
        <p className="mb-6 text-sm text-gray-500">
          Mật khẩu nếu để trống sẽ tự động lấy mặc định là <b>Hanzi@123456</b>.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-forest mb-1">Email</label>
            <input
              type="email"
              required
              disabled={loading}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border-gray-200 border bg-gray-50/50 p-3 text-sm focus:border-forest focus:ring-forest disabled:opacity-50 outline-none"
              placeholder="user@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-forest mb-1">Họ và tên</label>
            <input
              type="text"
              required
              disabled={loading}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-xl border-gray-200 border bg-gray-50/50 p-3 text-sm focus:border-forest focus:ring-forest disabled:opacity-50 outline-none"
              placeholder="Nguyễn Văn A"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-forest mb-1">Mật khẩu (Tùy chọn)</label>
            <input
              type="text"
              disabled={loading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border-gray-200 border bg-gray-50/50 p-3 text-sm focus:border-forest focus:ring-forest disabled:opacity-50 outline-none"
              placeholder="Hanzi@123456"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-forest mb-1">Vai trò</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              disabled={loading}
              className="w-full rounded-xl border-gray-200 border bg-gray-50/50 p-3 text-sm focus:border-forest focus:ring-forest outline-none"
            >
              <option value="FREE">FREE</option>
              <option value="VIP">VIP</option>
              <option value="TEACHER">TEACHER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>

          {role === 'VIP' && (
            <div className="animate-in slide-in-from-top-2">
              <label className="block text-sm font-medium text-forest mb-1">Thời hạn VIP</label>
              <select
                value={vipDays}
                onChange={(e) => setVipDays(Number(e.target.value))}
                disabled={loading}
                className="w-full rounded-xl border-gray-200 border bg-accent-lime/20 p-3 text-sm focus:border-forest focus:ring-forest outline-none"
              >
                <option value={30}>1 tháng (30 ngày)</option>
                <option value={180}>6 tháng (180 ngày)</option>
                <option value={365}>1 năm (365 ngày)</option>
              </select>
            </div>
          )}

          <div className="mt-6 flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="rounded-full"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="rounded-full bg-forest text-white hover:bg-forest/90"
            >
              {loading ? 'Đang tạo...' : 'Tạo tài khoản'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
