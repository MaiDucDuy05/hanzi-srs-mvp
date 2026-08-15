'use client';

import { useState, useEffect } from 'react';
import { adminRewardsApi } from '@/lib/api/endpoints/admin-rewards';
import type { Reward } from '@/lib/api/types';
import { Plus, Edit2, Trash2, ShieldCheck, Tag, Box, Crown } from 'lucide-react';
import { AdminRewardsModal } from './components/rewards/admin-rewards-modal';

export function AdminRewardsFeature() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await adminRewardsApi.getAll();
      setRewards(data || []);
      setError(null);
    } catch (e: any) {
      setError(e.message || 'Lỗi khi tải danh sách phần thưởng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreate = () => {
    setSelectedReward(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (reward: Reward) => {
    setSelectedReward(reward);
    setIsModalOpen(true);
  };

  const handleSave = async (data: any) => {
    if (selectedReward) {
      // Update
      await adminRewardsApi.update(selectedReward.id, data);
    } else {
      // Create
      await adminRewardsApi.create(data);
    }
    await loadData();
  };

  const handleToggleActive = async (reward: Reward) => {
    try {
      await adminRewardsApi.toggleActive(reward.id);
      await loadData();
    } catch (e: any) {
      alert(e.message || 'Lỗi khi đổi trạng thái');
    }
  };

  const handleDelete = async (reward: Reward) => {
    if (!confirm(`Bạn có chắc muốn xóa phần thưởng ${reward.title}?`)) return;
    try {
      await adminRewardsApi.remove(reward.id);
      await loadData();
    } catch (e: any) {
      alert(e.message || 'Lỗi khi xóa');
    }
  };

  const getRewardIcon = (type: string) => {
    switch (type) {
      case 'TEMPORARY_VIP': return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'DISCOUNT_VOUCHER': return <Tag className="w-4 h-4 text-blue-500" />;
      case 'CONTENT_UNLOCK': return <Box className="w-4 h-4 text-purple-500" />;
      case 'COSMETIC': return <ShieldCheck className="w-4 h-4 text-pink-500" />;
      default: return <Box className="w-4 h-4 text-gray-500" />;
    }
  };

  if (loading && rewards.length === 0) {
    return <div className="p-10 text-center animate-pulse">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="flex flex-col h-full gap-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-[#11321e] mb-2">Phần thưởng (Rewards)</h1>
          <p className="text-sm text-gray-500 font-medium">Quản lý kho phần thưởng cho phép người dùng dùng EXP để đổi.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-[#85d038] hover:bg-[#7bc032] rounded-xl transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Thêm mới
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-medium">
          {error}
        </div>
      )}

      <div className="bg-white rounded-[32px] p-6 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] border border-gray-100 flex-1 overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-sm text-gray-500">
                <th className="pb-4 font-semibold px-4">Code</th>
                <th className="pb-4 font-semibold px-4">Tên phần thưởng</th>
                <th className="pb-4 font-semibold px-4">Loại</th>
                <th className="pb-4 font-semibold px-4">Giá EXP</th>
                <th className="pb-4 font-semibold px-4">Trạng thái</th>
                <th className="pb-4 font-semibold px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {rewards.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-gray-400">
                    Chưa có phần thưởng nào. Hãy thêm mới!
                  </td>
                </tr>
              ) : (
                rewards.map((reward) => (
                  <tr key={reward.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group">
                    <td className="py-4 px-4 font-mono text-xs text-gray-600">
                      {reward.code}
                    </td>
                    <td className="py-4 px-4 font-medium text-gray-900">
                      {reward.title}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2 bg-gray-100 w-fit px-3 py-1 rounded-lg">
                        {getRewardIcon(reward.type)}
                        <span className="text-[11px] font-bold text-gray-600">{reward.type}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-bold text-[#85d038]">
                      {reward.costExp}
                    </td>
                    <td className="py-4 px-4">
                      <button
                        onClick={() => handleToggleActive(reward)}
                        className={`w-10 h-5 rounded-full flex items-center p-1 transition-colors duration-200 ${reward.active ? 'bg-[#85d038]' : 'bg-gray-200'}`}
                      >
                        <div className={`bg-white w-3 h-3 rounded-full shadow-sm transform transition-transform duration-200 ${reward.active ? 'translate-x-5' : 'translate-x-0'}`} />
                      </button>
                    </td>
                    <td className="py-4 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEdit(reward)}
                        className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Sửa"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(reward)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Xóa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AdminRewardsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        reward={selectedReward}
      />
    </div>
  );
}
