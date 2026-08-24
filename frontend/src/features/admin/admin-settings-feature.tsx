'use client';

import { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Gamepad2, 
  CreditCard, 
  ShieldCheck, 
  Server,
  Globe,
  Bell,
  Save,
  Cpu,
  Layers,
  LogOut
} from 'lucide-react';
import { AuthGuard } from '@/features/layout/components/auth-guard';
import { adminConfigsApi, SystemConfig } from '@/lib/api/endpoints/admin-configs';
import { useAuth } from '@/lib/auth/auth-context';
import { useRouter } from 'next/navigation';

const TABS = [
  { id: 'limits', label: 'Giới hạn & Lượt chơi', icon: Gamepad2, description: 'Lượt tập miễn phí, giới hạn sĩ số' },
  { id: 'gamification', label: 'Điểm thưởng EXP', icon: ShieldCheck, description: 'Cấu hình hệ thống EXP & Game' },
  { id: 'commerce', label: 'Thương mại & Giá', icon: CreditCard, description: 'Giá VIP, giới hạn dung lượng upload' },
  // { id: 'ai', label: 'Cấu hình AI', icon: Cpu, description: 'Provider, giới hạn lượt tạo AI' },
  // { id: 'features', label: 'Feature Flags', icon: Layers, description: 'Bật/tắt các tính năng lớn' },
  // { id: 'system', label: 'Hệ thống', icon: Server, description: 'Bảo trì, email liên hệ' },
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
  const { logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('limits');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Array of all configs (flattened for easy state management)
  const [configs, setConfigs] = useState<SystemConfig[]>([]);
  // To track which ones changed
  const [changedKeys, setChangedKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    adminConfigsApi.getConfigs().then(data => {
      const flatConfigs = Object.values(data).flat();
      setConfigs(flatConfigs);
      setIsLoading(false);
    }).catch(err => {
      console.error(err);
      setIsLoading(false);
    });
  }, []);

  const handleChange = (key: string, value: string) => {
    setConfigs(prev => prev.map(c => c.key === key ? { ...c, value } : c));
    setChangedKeys(prev => {
      const newSet = new Set(prev);
      newSet.add(key);
      return newSet;
    });
  };

  const handleSave = async () => {
    if (changedKeys.size === 0) return;
    setIsSaving(true);
    const updates = Array.from(changedKeys).map(key => ({
      key,
      value: configs.find(c => c.key === key)?.value || ''
    }));

    try {
      await adminConfigsApi.updateConfigsBulk(updates);
      window.alert('Đã lưu cấu hình thành công!');
      setChangedKeys(new Set());
    } catch (e) {
      window.alert('Có lỗi xảy ra khi lưu cấu hình.');
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

  if (isLoading) return <div className="p-10 text-center animate-pulse">Đang tải cấu hình hệ thống...</div>;

  const currentTabConfigs = configs.filter(c => c.group === activeTab);

  return (
    <AuthGuard>
      <div className="flex flex-col md:flex-row gap-8 pb-10 max-w-[1200px]">
        {/* Sidebar */}
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

            <div className="mt-8 border-t border-gray-100 pt-6">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl bg-[#fff4f4] text-red-600 font-bold hover:bg-red-50 hover:text-red-700 transition-colors border border-red-100 shadow-sm"
              >
                <LogOut className="h-5 w-5" strokeWidth={2.5} />
                Đăng xuất
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 pt-2 md:pt-16">
          <div className="bg-white rounded-[32px] p-8 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] border border-gray-100 relative min-h-[500px] flex flex-col">
            <div className="mb-8 border-b border-gray-100 pb-4">
              <h2 className="text-2xl font-bold text-[#11321e]">
                {TABS.find(t => t.id === activeTab)?.label}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {TABS.find(t => t.id === activeTab)?.description}
              </p>
            </div>
            
            <div className="space-y-6 flex-1">
              {currentTabConfigs.map(config => (
                <div key={config.key} className="pb-6 border-b border-gray-50 last:border-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <label className="block text-[14px] font-bold text-gray-800">{config.key}</label>
                      {config.description && <p className="text-[12px] text-gray-500 mt-1">{config.description}</p>}
                      {config.updatedAt && (
                        <p className="text-[11px] text-gray-400 mt-2 font-medium">
                          Cập nhật lần cuối{config.updatedByUser ? ` bởi ${config.updatedByUser.fullName}` : ''} lúc {new Date(config.updatedAt).toLocaleString('vi-VN')}
                        </p>
                      )}
                    </div>
                    <div className="shrink-0 w-full sm:w-64">
                      {config.valueType === 'BOOLEAN' ? (
                        <div className="flex items-center justify-start sm:justify-end mt-2 sm:mt-0">
                          <ToggleSwitch 
                            checked={config.value === 'true'} 
                            onChange={(val) => handleChange(config.key, val ? 'true' : 'false')} 
                          />
                        </div>
                      ) : config.valueType === 'INT' ? (
                        <input 
                          type="number"
                          value={config.value}
                          onChange={(e) => handleChange(config.key, e.target.value)}
                          className="w-full bg-[#fbfbf8] border border-gray-200 rounded-xl py-2 px-4 text-sm font-bold text-[#11321e] focus:outline-none focus:ring-2 focus:ring-[#c7cf35] transition-shadow" 
                        />
                      ) : config.key === 'ai_provider' ? (
                        <select
                          value={config.value}
                          onChange={(e) => handleChange(config.key, e.target.value)}
                          className="w-full bg-[#fbfbf8] border border-gray-200 rounded-xl py-2 px-4 text-sm font-bold text-[#11321e] focus:outline-none focus:ring-2 focus:ring-[#c7cf35] transition-shadow appearance-none"
                        >
                          <option value="openai">OpenAI</option>
                          <option value="gemini">Google Gemini</option>
                        </select>
                      ) : (
                        <input 
                          type="text"
                          value={config.value}
                          onChange={(e) => handleChange(config.key, e.target.value)}
                          className="w-full bg-[#fbfbf8] border border-gray-200 rounded-xl py-2 px-4 text-sm font-bold text-[#11321e] focus:outline-none focus:ring-2 focus:ring-[#c7cf35] transition-shadow" 
                        />
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {currentTabConfigs.length === 0 && (
                <p className="text-gray-400 text-sm text-center py-10">Không có cấu hình nào trong nhóm này.</p>
              )}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
              <button 
                onClick={handleSave}
                disabled={isSaving || changedKeys.size === 0}
                className="bg-[#11321e] text-white px-8 py-3 rounded-full text-[15px] font-bold hover:bg-[#1f4e31] transition-colors shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <span className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                  <Save className="h-5 w-5" strokeWidth={2.5} />
                )}
                {isSaving ? 'Đang lưu...' : (changedKeys.size > 0 ? `Lưu ${changedKeys.size} thay đổi` : 'Lưu Thay đổi')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
