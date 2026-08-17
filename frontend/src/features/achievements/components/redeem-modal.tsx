'use client';

import React from 'react';
import type { RewardItem } from '@/lib/api/endpoints/achievements';

interface RedeemModalProps {
  reward: RewardItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (rewardId: string) => void;
}

export function RedeemModal({ reward, isOpen, onClose, onConfirm }: RedeemModalProps) {
  if (!isOpen || !reward) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm transition-all duration-300">
      <div className="w-full max-w-sm scale-100 animate-in zoom-in-95 rounded-3xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#f3f8d7] text-3xl shadow-inner">
            {reward.type === 'TEMPORARY_VIP' ? '👑' : reward.type === 'DISCOUNT_VOUCHER' ? '🎟️' : '🎁'}
          </div>
        </div>
        
        <h3 className="mb-2 text-center text-xl font-black text-[#215b3b]">
          Xác nhận đổi thưởng
        </h3>
        
        <p className="mb-6 text-center text-sm text-[#4a5a3a]">
          Bạn có chắc chắn muốn dùng <span className="font-bold text-[#5e7f26]">{reward.costExp} EXP</span> để đổi lấy phần thưởng <span className="font-bold">"{reward.title}"</span> không? Khoản này không thể hoàn tác.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl bg-gray-100 px-4 py-3 font-bold text-gray-600 transition-colors hover:bg-gray-200"
          >
            Hủy bỏ
          </button>
          <button
            onClick={() => {
              onConfirm(reward.id);
              onClose();
            }}
            className="flex-1 rounded-xl bg-[#5e7f26] px-4 py-3 font-bold text-white transition-colors hover:bg-[#4a6520]"
          >
            Đổi ngay
          </button>
        </div>
      </div>
    </div>
  );
}
