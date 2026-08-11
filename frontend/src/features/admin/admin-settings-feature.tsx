'use client';

import { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  GraduationCap, 
  CreditCard, 
  ShieldCheck, 
  Server,
  Globe,
  Bell,
  Save,
  Gamepad2,
  Mail
} from 'lucide-react';
import { AuthGuard } from '@/features/layout/components/auth-guard';

const TABS = [
  { id: 'general', label: 'Cài đặt chung', icon: Globe, description: 'Tên ứng dụng, ngôn ngữ, múi giờ.' },
  { id: 'learning', label: 'Cấu hình Học tập', icon: GraduationCap, description: 'Thuật toán ôn tập (SRS), điểm EXP.' },
  { id: 'billing', label: 'Thanh toán & VIP', icon: CreditCard, description: 'Bảng giá, gói cước, khuyến mãi.' },
  { id: 'security', label: 'Bảo mật', icon: ShieldCheck, description: 'Phân quyền, mật khẩu, 2FA.' },
  { id: 'notifications', label: 'Thông báo', icon: Bell, description: 'Mẫu Email, Push notifications.' },
  { id: 'maintenance', label: 'Bảo trì hệ thống', icon: Server, description: 'Clear cache, backup, bảo trì.' },
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

export function AdminSettingsFeature() {
  const [activeTab, setActiveTab] = useState('learning'); // Default to learning for demo
  const [isSaving, setIsSaving] = useState(false);

  // Mock states for interactive toggles/inputs
  const [learningSettings, setLearningSettings] = useState({
    newCardsPerDay: '20',
    easyMultiplier: '2.5',
    hardMultiplier: '1.2',
    enableGamification: true
  });

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      window.alert('Đã lưu cấu hình thành công!');
    }, 800);
  };

  return (
    <AuthGuard>
      <div className="flex flex-col md:flex-row gap-8 pb-10 max-w-[1200px]">
        
        {/* Left Sidebar - Vertical Tabs */}
        <div className="w-full md:w-72 shrink-0">
          <div className="mb-6">
            <h1 className="text-3xl font-extrabold text-[#11321e] mb-2">Cài đặt</h1>
            <p className="text-sm text-gray-500 font-medium">Tùy chỉnh hệ thống cốt lõi.</p>
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
            
            {activeTab === 'learning' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="mb-8 border-b border-gray-100 pb-4">
                  <h2 className="text-2xl font-bold text-[#11321e]">Cấu hình Học tập (SRS)</h2>
                  <p className="text-sm text-gray-500 mt-1">Quản lý cách thuật toán flashcard hoạt động và tương tác người dùng.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-[13px] font-bold text-gray-700 mb-2">Số từ mới tối đa mỗi ngày</label>
                    <input 
                      type="number" 
                      value={learningSettings.newCardsPerDay}
                      onChange={e => setLearningSettings({...learningSettings, newCardsPerDay: e.target.value})}
                      className="w-full bg-[#fbfbf8] border border-gray-200 rounded-xl py-3 px-4 text-sm font-bold text-[#11321e] focus:outline-none focus:ring-2 focus:ring-[#c7cf35] transition-shadow" 
                    />
                    <p className="text-[11px] text-gray-400 mt-2 font-medium">Giới hạn mặc định cho học viên mới.</p>
                  </div>
                  <div>
                    <label className="block text-[13px] font-bold text-gray-700 mb-2">Hệ số thẻ "Dễ" (Easy Multiplier)</label>
                    <input 
                      type="number" step="0.1"
                      value={learningSettings.easyMultiplier}
                      onChange={e => setLearningSettings({...learningSettings, easyMultiplier: e.target.value})}
                      className="w-full bg-[#fbfbf8] border border-gray-200 rounded-xl py-3 px-4 text-sm font-bold text-[#11321e] focus:outline-none focus:ring-2 focus:ring-[#c7cf35] transition-shadow" 
                    />
                    <p className="text-[11px] text-gray-400 mt-2 font-medium">Nhân khoảng cách thời gian ôn tập (Mặc định: 2.5x).</p>
                  </div>
                </div>

                <div className="bg-[#fcfbe8] rounded-2xl p-6 border border-[#f3f4e1] flex items-center justify-between">
                  <div className="flex gap-4 items-center">
                    <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center text-[#78993a] shadow-sm shrink-0">
                      <Gamepad2 className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-[#11321e] text-[15px]">Kích hoạt Gamification</h3>
                      <p className="text-[12px] text-gray-500 font-medium mt-0.5">Sử dụng điểm EXP và hệ thống tính mạng (Hearts).</p>
                    </div>
                  </div>
                  <ToggleSwitch 
                    checked={learningSettings.enableGamification} 
                    onChange={v => setLearningSettings({...learningSettings, enableGamification: v})} 
                  />
                </div>
              </div>
            )}

            {activeTab === 'general' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="mb-8 border-b border-gray-100 pb-4">
                  <h2 className="text-2xl font-bold text-[#11321e]">Cài đặt chung</h2>
                  <p className="text-sm text-gray-500 mt-1">Thông tin cơ bản về ứng dụng của bạn.</p>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-[13px] font-bold text-gray-700 mb-2">Tên Ứng dụng</label>
                    <input type="text" defaultValue="Cute Panda Forest" className="w-full bg-[#fbfbf8] border border-gray-200 rounded-xl py-3 px-4 text-sm font-bold text-[#11321e] focus:outline-none focus:ring-2 focus:ring-[#c7cf35] transition-shadow" />
                  </div>
                  <div>
                    <label className="block text-[13px] font-bold text-gray-700 mb-2">Email Hỗ trợ</label>
                    <input type="email" defaultValue="support@pandaforest.edu" className="w-full bg-[#fbfbf8] border border-gray-200 rounded-xl py-3 px-4 text-sm font-bold text-[#11321e] focus:outline-none focus:ring-2 focus:ring-[#c7cf35] transition-shadow" />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'maintenance' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="mb-8 border-b border-gray-100 pb-4">
                  <h2 className="text-2xl font-bold text-[#11321e]">Bảo trì hệ thống</h2>
                  <p className="text-sm text-gray-500 mt-1">Dành cho kỹ thuật viên và quản trị viên cấp cao.</p>
                </div>

                <div className="bg-[#fff4f4] rounded-2xl p-6 border border-[#ffd5d5] flex items-center justify-between">
                  <div className="flex gap-4 items-center">
                    <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center text-red-500 shadow-sm shrink-0">
                      <Server className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-red-700 text-[15px]">Chế độ bảo trì (Maintenance Mode)</h3>
                      <p className="text-[12px] text-red-400 font-medium mt-0.5">Khóa toàn bộ truy cập từ học viên. Chỉ Admin mới được vào.</p>
                    </div>
                  </div>
                  <ToggleSwitch checked={false} onChange={() => window.alert('Không thể bật chế độ này trên UI Mock')} />
                </div>
              </div>
            )}

            {/* Placeholder for other tabs */}
            {['billing', 'security', 'notifications'].includes(activeTab) && (
              <div className="flex flex-col items-center justify-center h-full text-center py-20 animate-in fade-in duration-300 opacity-50">
                <SettingsIcon className="h-16 w-16 text-gray-200 mb-4 animate-[spin_10s_linear_infinite]" />
                <p className="text-gray-400 font-bold text-lg">Chức năng đang được phát triển</p>
                <p className="text-gray-400 text-sm">Vui lòng quay lại sau.</p>
              </div>
            )}

            {/* Global Save Button - Absolute positioned at bottom right */}
            <div className="absolute bottom-8 right-8">
              <button 
                onClick={handleSave}
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
    </AuthGuard>
  );
}
