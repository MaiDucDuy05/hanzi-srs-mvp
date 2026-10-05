'use client';

import React from 'react';
import { Crown, Sparkles, Lock, Check } from 'lucide-react';
import { Modal } from './modal';
import { Link } from '@/i18n/routing';

export interface VipLockModalProps {
  open: boolean;
  onClose: () => void;
  levelName?: string;
  lessonTitle?: string;
}

export function VipLockModal({
  open,
  onClose,
  levelName,
  lessonTitle,
}: VipLockModalProps) {
  return (
    <Modal open={open} onClose={onClose} className="max-w-md p-0 overflow-hidden rounded-[2rem] border border-[#eaf3c5]">
      <div className="relative p-6 sm:p-8 text-center bg-gradient-to-b from-[#f3f8d7]/60 via-white to-white">
        {/* Crown & Lock Icon Badge */}
        <div className="mx-auto w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/25 mb-5 relative group">
          <Crown className="w-10 h-10 text-white fill-white/20 animate-bounce" />
          <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-[#215b3b] border-2 border-white flex items-center justify-center shadow-md">
            <Lock className="w-4 h-4 text-white" />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-2xl font-black text-[#11321e] mb-2 font-heading">
          Nội Dung Dành Cho VIP
        </h3>

        {/* Subtitle / context */}
        <p className="text-sm text-gray-600 leading-relaxed mb-6">
          {levelName ? (
            <>
              Khoá học <span className="font-bold text-[#215b3b]">{levelName}</span> chỉ mở miễn phí 3 bài đầu tiên.
            </>
          ) : (
            'Khoá học này chỉ mở miễn phí 3 bài đầu tiên.'
          )}
          {lessonTitle && (
            <span className="block font-semibold text-gray-800 mt-1">
              Bài: {lessonTitle}
            </span>
          )}
          <span className="block mt-2 text-xs text-gray-500">
            Hãy nâng cấp tài khoản VIP để mở khoá toàn bộ bài học, ngữ pháp, bài tập và trò chơi luyện tập tương tác!
          </span>
        </p>

        {/* Feature bullets */}
        <div className="bg-[#fcfdf6] rounded-2xl p-4 border border-[#eaf3c5] text-left space-y-2.5 mb-6 text-xs text-gray-700 font-medium">
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
            <span>Mở khoá 100% bài học tất cả cấp độ HSK & YCT</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
            <span>Không giới hạn lượt chơi Mini-game luyện từ & chữ Hán</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
            <span>Đầy đủ giải thích ngữ pháp và ví dụ thực tế chuyên sâu</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link
            href="/upgrade-vip"
            onClick={onClose}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-sm shadow-md shadow-amber-500/25 flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <Sparkles className="w-4 h-4 fill-white" />
            <span>Nâng Cấp VIP Ngay</span>
          </Link>

          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-gray-500 hover:text-gray-800 transition-colors"
          >
            Để sau
          </button>
        </div>
      </div>
    </Modal>
  );
}
