'use client';

import { VipRequest } from '@/lib/api/endpoints/admin-subscriptions';

import { Check, X, CreditCard, MoreVertical } from 'lucide-react';
import { Badge } from '@/features/ui/components/badge';
import { Button } from '@/features/ui/components/button';

interface VipRequestsTableProps {
  requests: VipRequest[];
  loading: boolean;
  onApprove: (request: VipRequest) => void;
  onReject: (request: VipRequest) => void;
  onExtend: (request: VipRequest) => void;
  onCancel: (request: VipRequest) => void;
}

export function VipRequestsTable({
  requests,
  loading,
  onApprove,
  onReject,
  onExtend,
  onCancel,
}: VipRequestsTableProps) {
  if (loading) {
    return <div className="text-center py-10">Đang tải dữ liệu...</div>;
  }

  if (!requests.length) {
    return <div className="text-center py-10 text-gray-500">Không có dữ liệu.</div>;
  }

  return (
    <div className="overflow-x-auto rounded-3xl border border-light-bamboo bg-white shadow-soft">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50 border-b border-light-bamboo text-sm">
            <th className="px-5 py-3 font-semibold text-gray-600">Khách hàng</th>
            <th className="px-5 py-3 font-semibold text-gray-600">Gói VIP</th>
            <th className="px-5 py-3 font-semibold text-gray-600">Số tiền</th>
            <th className="px-5 py-3 font-semibold text-gray-600">Nội dung CK</th>
            <th className="px-5 py-3 font-semibold text-gray-600">Trạng thái</th>
            <th className="px-5 py-3 font-semibold text-gray-600">Ngày tạo</th>
            <th className="px-5 py-3 font-semibold text-gray-600 text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((req) => (
            <tr key={req.id} className="border-b border-light-bamboo last:border-0 hover:bg-gray-50/50">
              <td className="px-5 py-4">
                <div className="font-medium text-foreground">{req.userName || 'Unknown'}</div>
                <div className="text-sm text-gray-500">{req.userEmail}</div>
              </td>
              <td className="px-5 py-4">
                <Badge tone="gray">
                  {req.plan}
                </Badge>
              </td>
              <td className="px-5 py-4 font-medium text-foreground">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(req.amount)}
              </td>
              <td className="px-5 py-4 max-w-[200px] truncate text-gray-500" title={req.transferNote}>
                {req.transferNote || '-'}
              </td>
              <td className="px-5 py-4">
                {req.status === 'PENDING' && <Badge tone="amber">Chờ duyệt</Badge>}
                {req.status === 'APPROVED' && <Badge tone="green">Đã duyệt</Badge>}
                {req.status === 'REJECTED' && <Badge tone="red">Từ chối</Badge>}
              </td>
              <td className="px-5 py-4 text-sm text-gray-600">
                <div>
                  {new Date(req.requestedAt).toLocaleString('vi-VN', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </td>
              <td className="px-5 py-4 text-right">
                {req.status === 'PENDING' ? (
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="outline" className="text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => onApprove(req)}>
                      <Check className="w-4 h-4" /> Duyệt
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => onReject(req)}>
                      <X className="w-4 h-4" /> Từ chối
                    </Button>
                  </div>
                ) : req.status === 'APPROVED' ? (
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="ghost" onClick={() => onExtend(req)}>
                      <CreditCard className="w-4 h-4 mr-1" /> Gia hạn
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => onCancel(req)}>
                      <X className="w-4 h-4 mr-1" /> Hủy
                    </Button>
                  </div>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
