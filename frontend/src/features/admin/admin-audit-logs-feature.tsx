'use client';

import { useState } from 'react';
import { adminUsersApi } from '@/lib/api/endpoints';
import { PageLoading } from '@/features/ui/components/spinner';
import { ErrorState } from '@/features/ui/components/error-state';
import { Card } from '@/features/ui/components/card';
import { useApi } from '@/lib/hooks/use-api';
import { ChevronLeft, ChevronRight, Activity, Search } from 'lucide-react';

export function AdminAuditLogsFeature() {
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [adminId, setAdminId] = useState('');
  const [action, setAction] = useState('');

  const { data, loading, error, refetch } = useApi(
    async () => {
      const response = await adminUsersApi.getAuditLogs({
        page,
        limit,
        ...(adminId ? { adminId } : {}),
        ...(action ? { action } : {}),
      });
      return response;
    },
    [page, limit, adminId, action]
  );

  const total = data?.meta?.total || 0;
  const logs = data?.data || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex items-center gap-3 mb-2">
        <div className="h-10 w-10 bg-[#dde8a6] rounded-xl flex items-center justify-center border border-white/50 shadow-sm">
          <Activity className="h-5 w-5 text-forest" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Lịch sử thao tác</h1>
          <p className="text-sm text-gray-500">
            Theo dõi các hành động quản trị hệ thống
          </p>
        </div>
      </div>
      
      <Card className="p-4 bg-white/40 backdrop-blur-xl border border-white/50 flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm theo ID Quản trị viên..."
            value={adminId}
            onChange={(e) => setAdminId(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white/50 border border-gray-200 rounded-xl text-sm focus:border-forest focus:ring-1 focus:ring-forest outline-none transition-colors"
          />
        </div>
        <select
          value={action}
          onChange={(e) => setAction(e.target.value)}
          className="w-48 bg-white/50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-forest focus:ring-1 focus:ring-forest outline-none transition-colors"
        >
          <option value="">Tất cả thao tác</option>
          <option value="CHANGE_ROLE">Đổi quyền (CHANGE_ROLE)</option>
          <option value="BAN_USER">Khóa tài khoản (BAN_USER)</option>
          <option value="UNBAN_USER">Mở khóa (UNBAN_USER)</option>
        </select>
      </Card>

      {loading && !data && <PageLoading />}
      {error && <ErrorState message="Lỗi tải danh sách logs" onRetry={refetch} />}

      {!loading && !error && (
        <Card className="overflow-hidden shadow-sm border-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#dde8a6]/40 text-forest font-semibold">
                <tr>
                  <th className="px-6 py-4 rounded-tl-xl w-1/4">Quản trị viên</th>
                  <th className="px-6 py-4">Hành động</th>
                  <th className="px-6 py-4">Đối tượng</th>
                  <th className="px-6 py-4 w-1/3">Chi tiết</th>
                  <th className="px-6 py-4 text-right rounded-tr-xl">Thời gian & IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {logs.map((log: any) => (
                  <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-800">{log.adminName || 'Unknown Admin'}</span>
                          <span className="text-xs text-gray-400">{log.adminEmail}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        log.action === 'BAN_USER' ? 'bg-red-100 text-red-700' :
                        log.action === 'UNBAN_USER' ? 'bg-green-100 text-green-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 font-mono text-xs">
                      {log.targetType} #{log.targetId.substring(0,8).toUpperCase()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded border border-gray-100 max-w-xs overflow-x-auto">
                        <pre>{JSON.stringify({old: log.oldValue, new: log.newValue}, null, 2)}</pre>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-gray-500 text-xs">
                      <div>{new Date(log.createdAt).toLocaleString('vi-VN')}</div>
                      <div className="mt-1">{log.ipAddress}</div>
                    </td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      Không tìm thấy log nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="px-6 py-4 bg-[#dde8a6]/40 flex items-center justify-between rounded-b-xl border-t border-white/50">
            <span className="text-xs text-forest font-medium">
              Hiển thị {(page - 1) * limit + 1} đến {Math.min(page * limit, total)} trên tổng số {total.toLocaleString()}
            </span>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="h-8 w-8 rounded-full bg-white text-forest flex items-center justify-center hover:bg-forest hover:text-white transition-colors shadow-sm disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button 
                onClick={() => setPage(page + 1)}
                disabled={page * limit >= total}
                className="h-8 w-8 rounded-full bg-white text-forest flex items-center justify-center hover:bg-forest hover:text-white transition-colors shadow-sm disabled:opacity-50"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
