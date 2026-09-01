'use client';

import { useState } from 'react';
import { User, GraduationCap, Lock, Save, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import { authApi } from '@/lib/api/endpoints';
import { useRouter } from 'next/navigation';

const TABS = [
  { id: 'profile', label: 'Hồ sơ', icon: User, description: 'Tên hiển thị, thông tin cá nhân.' },
  { id: 'learning', label: 'Học tập', icon: GraduationCap, description: 'Mục tiêu hàng ngày, cấu hình ôn tập.' },
  { id: 'account', label: 'Tài khoản', icon: Lock, description: 'Đổi mật khẩu, bảo mật.' },
];

export function SettingsFeature() {
  const { user, refresh, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Profile state
  const [fullName, setFullName] = useState(user?.fullName ?? '');

  // Learning state
  const [dailyGoal, setDailyGoal] = useState(user?.dailyGoal ?? 50);

  // Account state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleSaveProfile = async () => {
    if (!fullName.trim()) {
      showMessage('error', 'Tên không được để trống.');
      return;
    }
    setIsSaving(true);
    try {
      await authApi.updateMe({ fullName: fullName.trim() });
      await refresh();
      showMessage('success', 'Hồ sơ đã được lưu.');
    } catch {
      showMessage('error', 'Lưu thất bại. Vui lòng thử lại.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveLearning = async () => {
    if (dailyGoal < 1 || dailyGoal > 10000) {
      showMessage('error', 'Mục tiêu phải từ 1 đến 10000 XP.');
      return;
    }
    setIsSaving(true);
    try {
      await authApi.updateMe({ dailyGoal });
      await refresh();
      showMessage('success', 'Cấu hình học tập đã được lưu.');
    } catch {
      showMessage('error', 'Lưu thất bại. Vui lòng thử lại.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePassword = async () => {
    setPasswordError('');
    if (!currentPassword) {
      setPasswordError('Vui lòng nhập mật khẩu hiện tại.');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('Mật khẩu mới phải có ít nhất 8 ký tự.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Mật khẩu xác nhận không khớp.');
      return;
    }
    setIsSaving(true);
    try {
      await authApi.changePassword({
        currentPassword,
        newPassword,
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showMessage('success', 'Mật khẩu đã được thay đổi.');
    } catch (e) {
      setPasswordError(e instanceof Error ? e.message : 'Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="flex h-full w-full flex-col">
      <div className="w-full px-2 py-4 sm:px-6 sm:py-6 lg:px-8 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-heading text-4xl font-black text-[#215b3b]">Cài đặt</h1>
          <button 
            onClick={handleLogout} 
            className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 font-bold text-red-600 transition-colors border border-red-100 hover:bg-red-50 shadow-sm"
          >
            <LogOut className="h-4 w-4" strokeWidth={2.5} /> <span className="hidden sm:inline">Đăng xuất</span>
          </button>
        </div>

        {/* Tab bar */}
        <div className="mb-6 flex gap-2 rounded-2xl bg-white p-2 shadow-sm flex-wrap">
          {TABS.map((t) => {
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex-1 rounded-xl px-4 py-3 text-sm sm:text-base font-bold transition-all flex items-center justify-center gap-2 min-w-[120px] ${
                  isActive
                    ? 'bg-[#e5f5eb] text-[#215b3b]'
                    : 'text-[#4a5a3a] hover:bg-[#f3f9f5]'
                }`}
              >
                <t.icon className="w-4 h-4" strokeWidth={isActive ? 2.5 : 2} />
                {t.label}
              </button>
            )
          })}
        </div>

        {/* Toast Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-2xl text-sm font-bold shadow-sm animate-in slide-in-from-top-2 fade-in duration-300 ${
            message.type === 'success'
              ? 'bg-[#ecfce7] text-[#1b432a] border border-[#bbf7b0]'
              : 'bg-[#fff4f4] text-red-700 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        {/* ── Profile Tab ── */}
        {activeTab === 'profile' && (
          <div className="rounded-[2rem] bg-white p-6 sm:p-8 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="mb-8 border-b border-gray-100 pb-4">
              <h2 className="text-xl font-black text-[#215b3b]">Hồ sơ cá nhân</h2>
              <p className="text-sm text-gray-500 mt-1 font-medium">Cập nhật tên hiển thị và thông tin tài khoản.</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-8 mb-8">
              {/* Avatar */}
              <div className="flex flex-col items-center gap-3 shrink-0">
                <div className="h-24 w-24 rounded-full bg-[#f3f9f5] flex items-center justify-center text-4xl font-extrabold text-[#215b3b]">
                  {fullName.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500 font-bold">Ảnh đại diện</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">Tạo tự động từ tên.</p>
                </div>
              </div>

              <div className="flex-1 space-y-6">
                <div>
                  <label className="block text-sm font-bold text-[#4a5a3a] mb-2">Họ tên</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="w-full bg-[#fbfbf8] border border-gray-200 rounded-2xl py-3.5 px-5 text-sm font-bold text-[#11321e] focus:outline-none focus:ring-2 focus:ring-[#8BC34A] focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#4a5a3a] mb-2">Email</label>
                  <input
                    type="email"
                    value={user?.email ?? ''}
                    disabled
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3.5 px-5 text-sm font-bold text-gray-400 cursor-not-allowed"
                  />
                  <p className="text-[11px] text-gray-400 mt-2 font-medium">Email định danh tài khoản, không thể thay đổi.</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="bg-[#8BC34A] text-white px-8 py-3.5 rounded-full text-[15px] font-bold hover:bg-[#7CB342] transition-colors shadow-sm flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <span className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                  <Save className="h-5 w-5" strokeWidth={2.5} />
                )}
                {isSaving ? 'Đang lưu...' : 'Lưu Thay đổi'}
              </button>
            </div>
          </div>
        )}

        {/* ── Learning Tab ── */}
        {activeTab === 'learning' && (
          <div className="rounded-[2rem] bg-white p-6 sm:p-8 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="mb-8 border-b border-gray-100 pb-4">
              <h2 className="text-xl font-black text-[#215b3b]">Cấu hình Học tập</h2>
              <p className="text-sm text-gray-500 mt-1 font-medium">Điều chỉnh mục tiêu hàng ngày phù hợp với tiến độ của bạn.</p>
            </div>

            {/* Daily Goal */}
            <div className="bg-[#fbfbf8] rounded-2xl p-6 border border-gray-100 mb-8">
              <h3 className="font-bold text-[#215b3b] text-[15px] mb-4">Mục tiêu XP hàng ngày</h3>
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  min={1}
                  max={10000}
                  value={dailyGoal}
                  onChange={e => setDailyGoal(Number(e.target.value))}
                  className="w-32 bg-white border border-gray-200 rounded-xl py-3 px-4 text-sm font-bold text-[#11321e] focus:outline-none focus:ring-2 focus:ring-[#8BC34A]"
                />
                <span className="text-sm font-bold text-[#4a5a3a]">XP / ngày</span>
              </div>
              <p className="text-[12px] text-gray-500 mt-3 font-medium">
                Gợi ý: Người mới nên bắt đầu 20–50 XP. Khi quen dần, có thể tăng lên 80–100 XP để duy trì động lực.
              </p>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSaveLearning}
                disabled={isSaving}
                className="bg-[#8BC34A] text-white px-8 py-3.5 rounded-full text-[15px] font-bold hover:bg-[#7CB342] transition-colors shadow-sm flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <span className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                  <Save className="h-5 w-5" strokeWidth={2.5} />
                )}
                {isSaving ? 'Đang lưu...' : 'Lưu Thay đổi'}
              </button>
            </div>
          </div>
        )}

        {/* ── Account Tab ── */}
        {activeTab === 'account' && (
          <div className="rounded-[2rem] bg-white p-6 sm:p-8 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="mb-8 border-b border-gray-100 pb-4">
              <h2 className="text-xl font-black text-[#215b3b]">Bảo mật tài khoản</h2>
              <p className="text-sm text-gray-500 mt-1 font-medium">Thay đổi mật khẩu để đảm bảo an toàn cho tài khoản.</p>
            </div>

            <div className="space-y-6 max-w-md mb-8">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-bold text-[#4a5a3a]">Mật khẩu hiện tại</label>
                  <button 
                    type="button"
                    onClick={async () => {
                      await logout();
                      router.push('/forgot-password');
                    }}
                    className="text-[12px] font-bold text-[#8BC34A] hover:text-[#7CB342] transition-colors"
                  >
                    Quên mật khẩu?
                  </button>
                </div>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  placeholder="Nhập mật khẩu hiện tại"
                  className="w-full bg-[#fbfbf8] border border-gray-200 rounded-2xl py-3.5 px-5 text-sm font-bold text-[#11321e] focus:outline-none focus:ring-2 focus:ring-[#8BC34A] transition-shadow"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#4a5a3a] mb-2">Mật khẩu mới</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Ít nhất 8 ký tự"
                  className="w-full bg-[#fbfbf8] border border-gray-200 rounded-2xl py-3.5 px-5 text-sm font-bold text-[#11321e] focus:outline-none focus:ring-2 focus:ring-[#8BC34A] transition-shadow"
                />
                <p className="text-[11px] text-gray-400 mt-2 font-medium">Khuyên dùng mật khẩu bao gồm chữ hoa, chữ thường và số.</p>
              </div>
              <div>
                <label className="block text-sm font-bold text-[#4a5a3a] mb-2">Xác nhận mật khẩu mới</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu mới"
                  className="w-full bg-[#fbfbf8] border border-gray-200 rounded-2xl py-3.5 px-5 text-sm font-bold text-[#11321e] focus:outline-none focus:ring-2 focus:ring-[#8BC34A] transition-shadow"
                />
              </div>

              {passwordError && (
                <p className="text-sm font-bold text-red-500 bg-red-50 px-4 py-3 rounded-xl border border-red-100">
                  {passwordError}
                </p>
              )}
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSavePassword}
                disabled={isSaving}
                className="bg-[#8BC34A] text-white px-8 py-3.5 rounded-full text-[15px] font-bold hover:bg-[#7CB342] transition-colors shadow-sm flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <span className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                  <Save className="h-5 w-5" strokeWidth={2.5} />
                )}
                {isSaving ? 'Đang lưu...' : 'Thay đổi mật khẩu'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
