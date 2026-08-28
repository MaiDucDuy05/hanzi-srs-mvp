'use client';

import { useState } from 'react';
import { User, GraduationCap, Lock, Save, Bell, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import { authApi } from '@/lib/api/endpoints';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

const getTabs = (t: any) => [
  { id: 'profile', label: t('profile'), icon: User, description: t('profileDesc') },
  { id: 'learning', label: t('learning'), icon: GraduationCap, description: t('learningDesc') },
  { id: 'account', label: t('account'), icon: Lock, description: t('accountDesc') },
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
  const { user, refresh, logout } = useAuth();
  const router = useRouter();
  const t = useTranslations('Settings');
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
      showMessage('error', t('nameRequired'));
      return;
    }
    setIsSaving(true);
    try {
      await authApi.updateMe({ fullName: fullName.trim() });
      await refresh();
      showMessage('success', t('profileSaved'));
    } catch {
      showMessage('error', t('saveFailed'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveLearning = async () => {
    if (dailyGoal < 1 || dailyGoal > 10000) {
      showMessage('error', t('goalInvalid'));
      return;
    }
    setIsSaving(true);
    try {
      await authApi.updateMe({ dailyGoal });
      await refresh();
      showMessage('success', t('learningSaved'));
    } catch {
      showMessage('error', t('saveFailed'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePassword = async () => {
    setPasswordError('');
    if (!currentPassword) {
      setPasswordError(t('currPwdRequired'));
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError(t('newPwdLength'));
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError(t('pwdNotMatch'));
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
      showMessage('success', t('pwdChanged'));
    } catch (e) {
      setPasswordError(e instanceof Error ? e.message : t('errorOccurred'));
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
    <div className="flex flex-col md:flex-row gap-8 pb-10 max-w-[1200px]">

      {/* Left Sidebar */}
      <div className="w-full md:w-72 shrink-0">
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold text-[#11321e] mb-2">{t('settingsTitle')}</h1>
          <p className="text-sm text-gray-500 font-medium">{t('settingsSubtitle')}</p>
        </div>

        <div className="flex flex-col gap-2">
          {getTabs(t).map(tab => {
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

          <div className="mt-8 border-t border-gray-100 pt-6">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl bg-[#fff4f4] text-red-600 font-bold hover:bg-red-50 hover:text-red-700 transition-colors border border-red-100 shadow-sm"
            >
              <LogOut className="h-5 w-5" strokeWidth={2.5} />
              {t('logout')}
            </button>
          </div>
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
                <h2 className="text-2xl font-bold text-[#11321e]">{t('profileTitle')}</h2>
                <p className="text-sm text-gray-500 mt-1">{t('profileSubtitle')}</p>
              </div>

              {/* Avatar placeholder */}
              <div className="flex items-center gap-5">
                <div className="h-20 w-20 rounded-full bg-[#c7cf35] flex items-center justify-center text-3xl font-extrabold text-[#11321e] shadow-inner">
                  {fullName.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">{t('avatar')}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{t('avatarDesc')}</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-[13px] font-bold text-gray-700 mb-2">{t('fullName')}</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="w-full bg-[#fbfbf8] border border-gray-200 rounded-xl py-3 px-4 text-sm font-bold text-[#11321e] focus:outline-none focus:ring-2 focus:ring-[#c7cf35] transition-shadow"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-bold text-gray-700 mb-2">{t('email')}</label>
                  <input
                    type="email"
                    value={user?.email ?? ''}
                    disabled
                    className="w-full bg-gray-100 border border-gray-200 rounded-xl py-3 px-4 text-sm font-bold text-gray-400 cursor-not-allowed"
                  />
                  <p className="text-[11px] text-gray-400 mt-2 font-medium">{t('emailFixed')}</p>
                </div>
              </div>
            </div>
          )}

          {/* ── Learning Tab ── */}
          {activeTab === 'learning' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="mb-8 border-b border-gray-100 pb-4">
                <h2 className="text-2xl font-bold text-[#11321e]">{t('learningTitle')}</h2>
                <p className="text-sm text-gray-500 mt-1">{t('learningSubtitle')}</p>
              </div>

              {/* Daily Goal */}
              <div className="bg-[#fcfbe8] rounded-2xl p-6 border border-[#f3f4e1]">
                <h3 className="font-bold text-[#11321e] text-[15px] mb-4">{t('dailyGoal')}</h3>
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    min={1}
                    max={10000}
                    value={dailyGoal}
                    onChange={e => setDailyGoal(Number(e.target.value))}
                    className="w-28 bg-white border border-gray-200 rounded-xl py-2.5 px-4 text-sm font-bold text-[#11321e] focus:outline-none focus:ring-2 focus:ring-[#c7cf35]"
                  />
                  <span className="text-sm font-bold text-gray-600">{t('xpPerDay')}</span>
                </div>
                <p className="text-[11px] text-gray-400 mt-2 font-medium">
                  {t('goalHint')}
                </p>
              </div>

              {/* Notifications */}
              {/* <div>
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
              </div> */}
            </div>
          )}

          {/* ── Account Tab ── */}
          {activeTab === 'account' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="mb-8 border-b border-gray-100 pb-4">
                <h2 className="text-2xl font-bold text-[#11321e]">{t('securityTitle')}</h2>
                <p className="text-sm text-gray-500 mt-1">{t('securitySubtitle')}</p>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-[13px] font-bold text-gray-700">{t('currPwd')}</label>
                    <button 
                      type="button"
                      onClick={async () => {
                        await logout();
                        router.push('/forgot-password');
                      }}
                      className="text-[12px] font-bold text-[#c7cf35] hover:text-[#b4bd2f] transition-colors"
                    >
                      {t('forgotPwd')}
                    </button>
                  </div>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    placeholder={t('enterCurrPwd')}
                    className="w-full bg-[#fbfbf8] border border-gray-200 rounded-xl py-3 px-4 text-sm font-bold text-[#11321e] focus:outline-none focus:ring-2 focus:ring-[#c7cf35] transition-shadow"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-gray-700 mb-2">{t('newPwd')}</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder={t('atLeast8')}
                    className="w-full bg-[#fbfbf8] border border-gray-200 rounded-xl py-3 px-4 text-sm font-bold text-[#11321e] focus:outline-none focus:ring-2 focus:ring-[#c7cf35] transition-shadow"
                  />
                  <p className="text-[11px] text-gray-400 mt-2 font-medium">{t('pwdHint')}</p>
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-gray-700 mb-2">{t('confirmPwd')}</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder={t('reEnterNewPwd')}
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
              {isSaving ? t('saving') : t('saveChanges')}
            </button>
          </div>

        </div>
      </div>

    </div>
  );
}
