'use client';

import { useState, useEffect } from 'react';
import { adminSubscriptionsApi, VipRequest, VipStats } from '@/lib/api/endpoints/admin-subscriptions';
import { VipStatsCards } from '@/features/admin/components/vip-stats-cards';
import { VipRequestsTable } from '@/features/admin/components/vip-requests-table';
import { VipActionModal } from '@/features/admin/components/vip-modals';

export default function AdminSubscriptionsPage() {
  const [stats, setStats] = useState<VipStats | null>(null);
  const [requests, setRequests] = useState<VipRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals state
  const [activeRequest, setActiveRequest] = useState<VipRequest | null>(null);
  const [modalType, setModalType] = useState<'approve' | 'reject' | 'extend' | 'cancel' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, requestsRes] = await Promise.all([
        adminSubscriptionsApi.getStats(),
        adminSubscriptionsApi.getRequests(statusFilter !== 'ALL' ? { status: statusFilter } : {})
      ]);
      setStats(statsRes.data);
      setRequests(requestsRes.data);
    } catch (error) {
      alert('Không thể tải dữ liệu VIP');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const handleAction = async (data: any) => {
    if (!activeRequest) return;
    setIsProcessing(true);
    try {
      if (modalType === 'approve') {
        await adminSubscriptionsApi.approveRequest(activeRequest.id);
        alert('Đã duyệt yêu cầu VIP');
      } else if (modalType === 'reject') {
        await adminSubscriptionsApi.rejectRequest(activeRequest.id, data.note);
        alert('Đã từ chối yêu cầu');
      } else if (modalType === 'extend') {
        await adminSubscriptionsApi.extendSubscription(activeRequest.userId, data.days, data.note);
        alert('Đã gia hạn gói VIP');
      } else if (modalType === 'cancel') {
        await adminSubscriptionsApi.cancelSubscription(activeRequest.userId, data.note);
        alert('Đã hủy gói VIP');
      }
      setModalType(null);
      fetchData();
    } catch (error: any) {
      alert(error.message || 'Có lỗi xảy ra');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Quản lý VIP</h1>
        <p className="text-gray-500 mt-2">
          Theo dõi doanh thu, xét duyệt yêu cầu nâng cấp và quản lý tài khoản VIP.
        </p>
      </div>

      <VipStatsCards stats={stats} loading={loading} />

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Danh sách yêu cầu</h2>
        <div className="w-48">
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="flex h-10 w-full items-center justify-between rounded-md border border-light-bamboo bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="PENDING">Chờ duyệt</option>
            <option value="APPROVED">Đã duyệt</option>
            <option value="REJECTED">Từ chối</option>
          </select>
        </div>
      </div>

      <VipRequestsTable
        requests={requests}
        loading={loading}
        onApprove={(r) => { setActiveRequest(r); setModalType('approve'); }}
        onReject={(r) => { setActiveRequest(r); setModalType('reject'); }}
        onExtend={(r) => { setActiveRequest(r); setModalType('extend'); }}
        onCancel={(r) => { setActiveRequest(r); setModalType('cancel'); }}
      />

      {/* Modals */}
      <VipActionModal
        open={modalType === 'approve'}
        onOpenChange={(o) => !o && setModalType(null)}
        title="Duyệt yêu cầu VIP"
        description={`Bạn có chắc chắn muốn duyệt yêu cầu nâng cấp VIP cho ${activeRequest?.userEmail}? Hệ thống sẽ tự động gửi email thông báo.`}
        confirmText="Duyệt ngay"
        onConfirm={handleAction}
        loading={isProcessing}
      />

      <VipActionModal
        open={modalType === 'reject'}
        onOpenChange={(o) => !o && setModalType(null)}
        title="Từ chối yêu cầu VIP"
        description={`Vui lòng nhập lý do từ chối yêu cầu của ${activeRequest?.userEmail}.`}
        confirmText="Từ chối"
        variant="destructive"
        requireNote
        onConfirm={handleAction}
        loading={isProcessing}
      />

      <VipActionModal
        open={modalType === 'extend'}
        onOpenChange={(o) => !o && setModalType(null)}
        title="Gia hạn VIP"
        description={`Gia hạn thêm ngày sử dụng cho ${activeRequest?.userEmail}.`}
        confirmText="Gia hạn"
        requireDays
        requireNote
        onConfirm={handleAction}
        loading={isProcessing}
      />

      <VipActionModal
        open={modalType === 'cancel'}
        onOpenChange={(o) => !o && setModalType(null)}
        title="Hủy gói VIP"
        description={`Bạn có chắc chắn muốn hủy gói VIP của ${activeRequest?.userEmail}?`}
        confirmText="Hủy VIP"
        variant="destructive"
        requireNote
        onConfirm={handleAction}
        loading={isProcessing}
      />
    </div>
  );
}
