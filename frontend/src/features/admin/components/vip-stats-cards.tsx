'use client';

import { Users, Clock, DollarSign, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardBody } from '@/features/ui/components/card';
import { VipStats } from '@/lib/api/endpoints/admin-subscriptions';

interface VipStatsCardsProps {
  stats: VipStats | null;
  loading?: boolean;
}

export function VipStatsCards({ stats, loading }: VipStatsCardsProps) {
  if (loading || !stats) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse bg-gray-100 h-28">
            <div />
          </Card>
        ))}
      </div>
    );
  }

  const items = [
    {
      title: 'Tổng số VIP',
      value: stats.totalVipUsers.toString(),
      icon: Users,
      description: 'Tổng người dùng VIP hiện tại',
      color: 'text-brand'
    },
    {
      title: 'Yêu cầu chờ duyệt',
      value: stats.pendingRequests.toString(),
      icon: Clock,
      description: 'Cần xử lý',
      color: 'text-amber-500'
    },
    {
      title: 'Doanh thu tháng này',
      value: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats.monthlyRevenue),
      icon: DollarSign,
      description: 'Giao dịch đã duyệt',
      color: 'text-green-500'
    },
    {
      title: 'Sắp hết hạn',
      value: stats.expiringSoon.length.toString(),
      icon: AlertCircle,
      description: 'Trong 7 ngày tới',
      color: 'text-red-500'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {items.map((item, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader
              title={
                <div className="text-sm font-medium text-gray-700">
                  {item.title}
                </div>
              }
              action={<item.icon className={`h-4 w-4 ${item.color}`} />}
            />
            <CardBody className="py-2 pt-0">
              <div className="text-2xl font-bold">{item.value}</div>
              <p className="text-xs text-gray-500 mt-1">
                {item.description}
              </p>
            </CardBody>
          </Card>
        ))}
      </div>

      {stats.expiringSoon.length > 0 && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-red-800 mb-2 flex items-center">
            <AlertCircle className="w-4 h-4 mr-2" />
            Danh sách VIP sắp hết hạn
          </h3>
          <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
            {stats.expiringSoon.map((u) => (
              <div key={u.user_id} className="bg-white p-3 rounded-lg shadow-sm text-sm border border-red-100 flex flex-col">
                <span className="font-medium text-gray-900 truncate" title={u.name}>{u.name}</span>
                <span className="text-red-600 text-xs mt-1">
                  Hết hạn: {new Date(u.expires_at).toLocaleDateString('vi-VN')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
