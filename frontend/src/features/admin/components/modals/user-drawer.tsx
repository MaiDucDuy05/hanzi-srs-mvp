import React from 'react';
import type { User } from '@/lib/api/types';
import { X, Calendar, Mail, Tag, AlertCircle, Shield, ArrowRight } from 'lucide-react';

interface UserDrawerProps {
  user: User;
  onClose: () => void;
  isOpen: boolean;
}

export function UserDrawer({ user, onClose, isOpen }: UserDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/10 backdrop-blur-sm transition-opacity">
      <div 
        className="w-full max-w-md h-full bg-white shadow-2xl border-l border-gray-100 flex flex-col transform transition-transform animate-in slide-in-from-right duration-300"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-lg font-bold text-gray-800">Chi tiết Người dùng</h2>
          <button 
            onClick={onClose}
            className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-gray-200 text-gray-500 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Header Info */}
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-gray-100 flex-shrink-0 border border-gray-200 overflow-hidden">
              <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${user.id}`} alt={user.fullName} className="h-full w-full object-cover" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">{user.fullName}</h3>
              <p className="text-gray-500 text-sm flex items-center gap-1.5 mt-1">
                <Mail className="h-4 w-4" /> {user.email}
              </p>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Details */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <Tag className="h-4 w-4" /> User ID
              </span>
              <span className="text-sm font-mono text-gray-800 bg-gray-100 px-2 py-0.5 rounded">
                {user.id}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <Shield className="h-4 w-4" /> Phân quyền
              </span>
              <span className="text-sm font-semibold text-gray-800">
                {user.role}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" /> Trạng thái
              </span>
              <span className={`text-sm font-semibold ${user.status === 'ACTIVE' ? 'text-forest' : 'text-red-500'}`}>
                {user.status}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <Calendar className="h-4 w-4" /> Ngày tham gia
              </span>
              <span className="text-sm text-gray-800">
                {new Date(user.createdAt).toLocaleDateString('vi-VN')}
              </span>
            </div>
          </div>

          {user.vipValidUntil && (
            <div className="bg-[#dde8a6]/40 p-4 rounded-xl border border-[#c7cf35]/30">
              <h4 className="text-sm font-bold text-forest mb-1">Gói VIP hiện tại</h4>
              <p className="text-sm text-gray-600">
                Hết hạn vào: <span className="font-semibold text-gray-800">{new Date(user.vipValidUntil).toLocaleDateString('vi-VN')}</span>
              </p>
            </div>
          )}

          {user.status === 'BANNED' && (
            <div className="bg-red-50 p-4 rounded-xl border border-red-100">
              <h4 className="text-sm font-bold text-red-800 mb-1 flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4" /> Thông tin Khóa
              </h4>
              <p className="text-sm text-red-700 mt-2">
                <strong>Lý do:</strong> {user.banReason || 'Không rõ'}
              </p>
              {user.bannedAt && (
                <p className="text-sm text-red-700 mt-1">
                  <strong>Ngày khóa:</strong> {new Date(user.bannedAt).toLocaleString('vi-VN')}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
