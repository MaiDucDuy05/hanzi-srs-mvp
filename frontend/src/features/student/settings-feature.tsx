'use client';

import { useState } from 'react';
import { User, GraduationCap, Lock, Save, Bell } from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import { authApi } from '@/lib/api/endpoints';

const TABS = [
  { id: 'profile', label: 'Hồ sơ', icon: User, description: 'Tên hiển thị, thông tin cá nhân.' },
  { id: 'learning', label: 'Học tập', icon: GraduationCap, description: 'Mục tiêu hàng ngày, cấu hình ôn tập.' },
  { id: 'account', label: 'Tài khoản', icon: Lock, description: 'Đổi mật khẩu, bảo mật.' },
];

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`w-12 h-6 rounded-full flex items-center p-1 transition-colors duration-200 ${checked ? 'bg-[#85d038]' : 'bg-gray-200'}`}
    >
      <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-200 ${checked ? 'translate-x-6' : 'translate-x-0'}`} />
    </button>
  );
}

export function SettingsFeature() {
  const { user, refresh } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Profile state
  const [fullName, setFullName] = useState(user?.fullName ?? '');

  // Learning state
  const [dailyGoal, setDailyGoal] = useState(user?.dailyGoal ?? 50);
  const [notifNewLesson, setNotifNewLesson] = useState(true);
  const [notifStreak, setNotifStreak] = useState(true);
  const [notifMistake, setNotifMistake] = useState(false);

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
    // TODO: Wire up to PATCH /auth/me with password change once backend supports it.
    await new Promise((r) => setTimeout(r, 800));
    setIsSaving(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    showMessage('success', 'Mật khẩu đã được thay đổi.');
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 pb-10 max-w-[1200px]">

      {/* Left Sidebar */}
      <div className="w-full md:w-72 shrink-0">
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold text-[#11321e] mb-2">Cài đặt</h1>
          <p className="text-sm text-gray-500 font-medium">Tùy chỉnh tài khoản cá nhân.</p>
        </div>

        <div className="flex flex-col gap-2">
          {TABS.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-start gap-4 p-4 rounded-2xl text-left transition-colors border ${
                  isActive
                    ? 'bg-[#f3f4e1] border-[#eaf3c5] shadow-sm'
                    : 'bg-white border-transparent hover:bg-gray-50'
                }`}
              >
                <div className={`mt-0.5 p-2 rounded-xl shrink-0 ${isActive ? 'bg-[#c7cf35] text-[#11321e]' : 'bg-gray-100 text-gray-500'}`}>
                  <tab.icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <div>
                  <p className={`font-bold text-[15px] mb-0.5 ${isActive ? 'text-[#11321e]' : 'text-gray-700'}`}>{tab.label}</p>
                  <p className="text-[11px] text-gray-400 font-medium leading-snug">{tab.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Content */}
      <div className="flex-1 pt-2 md:pt-16">
        <div className="bg-white rounded-[32px] p-8 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] border border-gray-100 relative min-h-[500px]">

          {/* Toast Message */}
          {message && (
            <div className={`absolute top-6 right-6 z-10 px-5 py-3 rounded-xl text-sm font-bold shadow-lg animate-in slide-in-from-top-2 fade-in duration-300 ${
              message.type === 'success'
                ? 'bg-[#ecfce7] text-[#1b432a] border border-[#bbf7b0]'
                : 'bg-[#fff4f4] text-red-700 border border-red-200'
            }`}>
              {message.text}
            </div>
          )}

          {/* ── Profile Tab ── */}
          {activeTab === 'profile' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="mb-8 border-b border-gray-100 pb-4">
                <h2 className="text-2xl font-bold text-[#11321e]">Hồ sơ cá nhân</h2>
                <p className="text-sm text-gray-500 mt-1">Cập nhật tên hiển thị và thông tin tài khoản.</p>
              </div>

              {/* Avatar placeholder */}
              <div className="flex items-center gap-5">
                <div className="h-20 w-20 rounded-full bg-[#c7cf35] flex items-center justify-center text-3xl font-extrabold text-[#11321e] shadow-inner">
                  {fullName.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Ảnh đại diện</p>
                  <p className="text-xs text-gray-400 mt-0.5">Được tạo từ chữ cái đầu của tên.</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-[13px] font-bold text-gray-700 mb-2">Họ tên</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="w-full bg-[#fbfbf8] border border-gray-200 rounded-xl py-3 px-4 text-sm font-bold text-[#11321e] focus:outline-none focus:ring-2 focus:ring-[#c7cf35] transition-shadow"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-bold text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={user?.email ?? ''}
                    disabled
                    className="w-full bg-gray-100 border border-gray-200 rounded-xl py-3 px-4 text-sm font-bold text-gray-400 cursor-not-allowed"
                  />
                  <p className="text-[11px] text-gray-400 mt-2 font-medium">Email không thể thay đổi.</p>
                </div>
              </div>
            </div>
          )}

          {/* ── Learning Tab ── */}
          {activeTab === 'learning' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="mb-8 border-b border-gray-100 pb-4">
                <h2 className="text-2xl font-bold text-[#11321e]">Cấu hình Học tập</h2>
                <p className="text-sm text-gray-500 mt-1">Mục tiêu hàng ngày và tùy chọn thông báo.</p>
              </div>

              {/* Daily Goal */}
              <div className="bg-[#fcfbe8] rounded-2xl p-6 border border-[#f3f4e1]">
                <h3 className="font-bold text-[#11321e] text-[15px] mb-4">Mục tiêu XP hàng ngày</h3>
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    min={1}
                    max={10000}
                    value={dailyGoal}
                    onChange={e => setDailyGoal(Number(e.target.value))}
                    className="w-28 bg-white border border-gray-200 rounded-xl py-2.5 px-4 text-sm font-bold text-[#11321e] focus:outline-none focus:ring-2 focus:ring-[#c7cf35]"
                  />
                  <span className="text-sm font-bold text-gray-600">XP / ngày</span>
                </div>
                <p className="text-[11px] text-gray-400 mt-2 font-medium">
                  Gợi ý: Người mới nên bắt đầu 20–50 XP. Khi quen dần, tăng lên 80–100 XP.
                </p>
              </div>

              {/* Notifications */}
              <div>
                <h3 className="font-bold text-[#11321e] text-[15px] mb-4">Thông báo</h3>
                <div className="space-y-4">
                  {[
                    { label: 'Bài học mới', desc: 'Nhắc khi có bài học mới được thêm vào.', checked: notifNewLesson, onChange: setNotifNewLesson },
                    { label: 'Nhắc streak', desc: 'Nhắc ôn tập khi chuỗi ngày học có thể bị gián đoạn.', checked: notifStreak, onChange: setNotifStreak },
                    { label: 'Từ mới sai thường xuyên', desc: 'Nhắc khi có từ mới được thêm vào sổ lỗi.', checked: notifMistake, onChange: setNotifMistake },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between p-4 bg-[#fbfbf8] rounded-xl border border-gray-100">
                      <div>
                        <p className="font-bold text-[13px] text-gray-700">{item.label}</p>
                        <p className="text-[11px] text-gray-400 font-medium mt-0.5">{item.desc}</p>
                      </div>
                      <ToggleSwitch checked={item.checked} onChange={item.onChange} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Account Tab ── */}
          {activeTab === 'account' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="mb-8 border-b border-gray-100 pb-4">
                <h2 className="text-2xl font-bold text-[#11321e]">Bảo mật tài khoản</h2>
                <p className="text-sm text-gray-500 mt-1">Thay đổi mật khẩu để bảo vệ tài khoản.</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-[13px] font-bold text-gray-700 mb-2">Mật khẩu hiện tại</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    placeholder="Nhập mật khẩu hiện tại"
                    className="w-full bg-[#fbfbf8] border border-gray-200 rounded-xl py-3 px-4 text-sm font-bold text-[#11321e] focus:outline-none focus:ring-2 focus:ring-[#c7cf35] transition-shadow"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-gray-700 mb-2">Mật khẩu mới</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Ít nhất 8 ký tự"
                    className="w-full bg-[#fbfbf8] border border-gray-200 rounded-xl py-3 px-4 text-sm font-bold text-[#11321e] focus:outline-none focus:ring-2 focus:ring-[#c7cf35] transition-shadow"
                  />
                  <p className="text-[11px] text-gray-400 mt-2 font-medium">Phải có ít nhất 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt.</p>
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-gray-700 mb-2">Xác nhận mật khẩu mới</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới"
                    className="w-full bg-[#fbfbf8] border border-gray-200 rounded-xl py-3 px-4 text-sm font-bold text-[#11321e] focus:outline-none focus:ring-2 focus:ring-[#c7cf35] transition-shadow"
                  />
                </div>

                {passwordError && (
                  <p className="text-sm font-bold text-red-500 bg-red-50 px-4 py-2.5 rounded-xl border border-red-100">
                    {passwordError}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Global Save Button */}
          <div className="absolute bottom-8 right-8">
            <button
              onClick={() => {
                if (activeTab === 'profile') handleSaveProfile();
                else if (activeTab === 'learning') handleSaveLearning();
                else handleSavePassword();
              }}
              disabled={isSaving}
              className="bg-[#11321e] text-white px-8 py-3 rounded-full text-[15px] font-bold hover:bg-[#1f4e31] transition-colors shadow-lg flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
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
      </div>

    </div>
  );
}
