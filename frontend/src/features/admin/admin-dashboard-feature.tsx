'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bell, HelpCircle, Activity, Users, Star, DollarSign, Clock, AlertTriangle, MessageSquare, CheckCircle, XCircle } from 'lucide-react';
import { adminApi } from '@/lib/api/endpoints';
import type { 
  DashboardSummary, 
  DashboardCharts, 
  DashboardPendingItems, 
  DashboardSystemHealth 
} from '@/lib/api/types';
import { PageLoading } from '@/features/ui/components/spinner';
import { ErrorState } from '@/features/ui/components/error-state';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function AdminDashboardFeature() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [charts, setCharts] = useState<DashboardCharts | null>(null);
  const [pendingItems, setPendingItems] = useState<DashboardPendingItems | null>(null);
  const [health, setHealth] = useState<DashboardSystemHealth | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [sum, ch, pend, hlth] = await Promise.all([
        adminApi.getSummary(),
        adminApi.getCharts(),
        adminApi.getPendingItems(),
        adminApi.getSystemHealth(),
      ]);
      setSummary(sum);
      setCharts(ch);
      setPendingItems(pend);
      setHealth(hlth);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Lỗi tải dữ liệu Dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const formatCurrency = (val: number) => `$${val.toLocaleString()}`;

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-forest">Tổng quan hệ thống</h1>
          <p className="mt-1 text-sm text-gray-500">
            Dữ liệu được cập nhật (Cache 5 phút)
          </p>
        </div>
        <div className="flex items-center gap-4 text-forest">
          <button onClick={() => void loadData()} className="text-sm border px-3 py-1 rounded-md hover:bg-gray-50">Làm mới</button>
          <button className="hover:bg-gray-100 p-2 rounded-full transition-colors">
            <Bell className="h-5 w-5" />
          </button>
        </div>
      </div>

      {loading && <PageLoading label="Đang tải dữ liệu..." />}
      {error && !loading && <ErrorState message={error} onRetry={() => void loadData()} />}

      {!loading && !error && summary && charts && pendingItems && health && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Users className="w-5 h-5"/></div>
                <h3 className="font-medium text-gray-600">Tổng Người Dùng</h3>
              </div>
              <p className="text-2xl font-bold text-gray-800">{summary.totalUsers.value.toLocaleString()}</p>
            </div>
            
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-amber-50 text-amber-500 rounded-lg"><Star className="w-5 h-5"/></div>
                <h3 className="font-medium text-gray-600">VIP Đang Hoạt Động</h3>
              </div>
              <p className="text-2xl font-bold text-gray-800">{summary.activeVip.value.toLocaleString()}</p>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-green-50 text-green-600 rounded-lg"><Activity className="w-5 h-5"/></div>
                <h3 className="font-medium text-gray-600">Lượt Luyện Tập Hôm Nay</h3>
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold text-gray-800">{summary.todayAttempts.value.toLocaleString()}</p>
                <span className="text-xs text-gray-500">vs {summary.todayAttempts.yesterday} hôm qua</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><DollarSign className="w-5 h-5"/></div>
                <h3 className="font-medium text-gray-600">Doanh Thu Tháng Này</h3>
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold text-gray-800">{formatCurrency(summary.monthlyRevenue.value)}</p>
                <span className="text-xs text-gray-500">vs {formatCurrency(summary.monthlyRevenue.lastMonth)} tháng trước</span>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
              <h3 className="font-medium text-gray-800 mb-4">Đăng ký mới (30 ngày)</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={charts.registrations}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                    <Tooltip cursor={{fill: '#f3f4f6'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                    <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={3} dot={false} activeDot={{r: 6}} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
              <h3 className="font-medium text-gray-800 mb-4">Lượt luyện tập (30 ngày)</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={charts.attempts}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                    <Tooltip cursor={{fill: '#f3f4f6'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                    <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Pending Items & Health Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* VIP Pending & Expiring */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col">
              <div className="p-4 border-b border-gray-100 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500"/>
                <h3 className="font-medium text-gray-800">Yêu cầu VIP & Sắp hết hạn</h3>
              </div>
              <div className="p-4 flex-1 flex flex-col gap-4">
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Chờ duyệt ({pendingItems.pendingVip.length})</h4>
                  {pendingItems.pendingVip.length === 0 ? (
                    <p className="text-sm text-gray-400">Không có yêu cầu nào.</p>
                  ) : (
                    <div className="space-y-2">
                      {pendingItems.pendingVip.map(v => (
                        <Link href="/admin/subscriptions" key={v.id} className="flex justify-between items-center bg-gray-50 p-2 rounded text-sm hover:bg-gray-100 transition-colors">
                          <span className="font-medium text-gray-700">{v.userFullName}</span>
                          <span className="text-blue-600 bg-blue-100 px-2 py-0.5 rounded text-xs">{v.plan}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Sắp hết hạn ({pendingItems.expiringVip.length})</h4>
                  {pendingItems.expiringVip.length === 0 ? (
                    <p className="text-sm text-gray-400">Không có VIP sắp hết hạn.</p>
                  ) : (
                    <div className="space-y-2">
                      {pendingItems.expiringVip.map(v => (
                        <Link href="/admin/subscriptions" key={v.id} className="flex justify-between items-center bg-gray-50 p-2 rounded text-sm hover:bg-gray-100 transition-colors">
                          <span className="font-medium text-gray-700">{v.userFullName}</span>
                          <span className="text-red-500">{new Date(v.expiresAt).toLocaleDateString()}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Pending Contacts */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col">
              <div className="p-4 border-b border-gray-100 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-500"/>
                <h3 className="font-medium text-gray-800">Liên hệ mới ({pendingItems.pendingContacts.length})</h3>
              </div>
              <div className="p-0 flex-1">
                {pendingItems.pendingContacts.length === 0 ? (
                  <p className="p-4 text-sm text-gray-400">Không có liên hệ mới.</p>
                ) : (
                  <ul className="divide-y divide-gray-50">
                    {pendingItems.pendingContacts.map(c => (
                      <li key={c.id}>
                        <Link href="/admin/resources" className="block p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-medium text-sm text-gray-800">{c.name}</span>
                            <span className="text-xs text-gray-400">{new Date(c.createdAt).toLocaleDateString()}</span>
                          </div>
                          <p className="text-xs text-gray-500 truncate">{c.email}</p>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{c.subject}</p>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* System Health */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-green-500"/>
                  <h3 className="font-medium text-gray-800">Tình trạng hệ thống</h3>
                </div>
                {health.statusLabel === 'Optimal' ? (
                  <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">Bình thường</span>
                ) : (
                  <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full font-medium">Cảnh báo</span>
                )}
              </div>
              <div className="p-4 flex-1 flex flex-col gap-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase mb-1">Dung lượng S3</p>
                    <p className="text-lg font-semibold text-gray-800">{health.storageUsedMb} MB</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase mb-1">AI Jobs (Hôm nay)</p>
                    <p className="text-lg font-semibold text-gray-800">{health.aiCallsToday}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Trạng thái Cron Jobs</p>
                  {health.cronJobs.length === 0 ? (
                    <p className="text-sm text-gray-400 italic">Chưa có job nào chạy</p>
                  ) : (
                    <ul className="space-y-2">
                      {health.cronJobs.map(job => (
                        <li key={job.name} className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded">
                          <span className="font-medium text-gray-700">{job.name}</span>
                          <div className="flex items-center gap-1">
                            {job.status === 'OK' ? <CheckCircle className="w-4 h-4 text-green-500"/> : <XCircle className="w-4 h-4 text-red-500"/>}
                            <span className="text-xs text-gray-500">{new Date(job.lastRun).toLocaleTimeString()}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-red-500"/>
                    <p className="text-xs font-semibold text-gray-500 uppercase">Lỗi hệ thống gần đây</p>
                  </div>
                  {pendingItems.recentSystemErrors.length === 0 ? (
                    <p className="text-sm text-gray-400 italic">Không có lỗi gần đây</p>
                  ) : (
                    <ul className="space-y-2">
                      {pendingItems.recentSystemErrors.map(err => (
                        <li key={err.id} className="text-sm p-2 bg-red-50 rounded border border-red-100">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-medium text-red-700">{err.jobName}</span>
                            <span className="text-[10px] text-red-500">{new Date(err.createdAt).toLocaleDateString()}</span>
                          </div>
                          <p className="text-xs text-red-600 line-clamp-2">{err.errorMessage}</p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="mt-auto pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-400">
                    Trạng thái: <span className="text-gray-600">{health.statusMessage}</span>
                  </p>
                </div>
              </div>
            </div>

          </div>
        </>
      )}
    </div>
  );
}
