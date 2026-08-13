'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/features/ui/components/card';
import { Badge } from '@/features/ui/components/badge';
import { PageLoading } from '@/features/ui/components/spinner';
import { ErrorState } from '@/features/ui/components/error-state';
import { usersApi } from '@/lib/api/endpoints';
import { resourceApi } from '@/lib/api/endpoints/resource';
import type { VipUpgradeRequest, User } from '@/lib/api/types';
import { 
  Bell, 
  HelpCircle, 
  Users, 
  Star, 
  Database,
  HardDrive,
  X,
  Check
} from 'lucide-react';

type EnrichedVipRequest = VipUpgradeRequest & { user?: User };

export function AdminDashboardFeature() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [stats, setStats] = useState({
    totalUsers: 0,
    freeUsers: 0,
    teacherUsers: 0,
    vipUsers: 0,
    pendingVipCount: 0,
  });

  const [pendingRequests, setPendingRequests] = useState<EnrichedVipRequest[]>([]);

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Fetch user counts (limit 1 to just get meta.total)
      const [allRes, freeRes, teacherRes, pendingRes] = await Promise.all([
        usersApi.getAll({ limit: 1 }),
        usersApi.getAll({ role: 'FREE', limit: 1 }),
        usersApi.getAll({ role: 'TEACHER', limit: 1 }),
        resourceApi.listVipRequests({ status: 'PENDING', limit: 5 }),
      ]);

      const totalUsers = allRes.meta?.total || 0;
      const freeUsers = freeRes.meta?.total || 0;
      const teacherUsers = teacherRes.meta?.total || 0;
      const vipUsers = totalUsers - freeUsers - teacherUsers; // Computed

      setStats({
        totalUsers,
        freeUsers,
        teacherUsers,
        vipUsers: Math.max(0, vipUsers),
        pendingVipCount: pendingRes.meta?.total || 0,
      });

      // 2. Enrich pending requests with user details
      const enrichedRequests = await Promise.all(
        (pendingRes.data || []).map(async (req) => {
          try {
            const userRes = await usersApi.getById(req.userId);
            return { ...req, user: userRes };
          } catch {
            return req;
          }
        })
      );
      setPendingRequests(enrichedRequests);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error loading dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const handleReview = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    if (!confirm(`Are you sure you want to ${status.toLowerCase()} this request?`)) return;
    try {
      await resourceApi.reviewVipRequest(id, { status });
      void loadData(); // Reload stats and list
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Error reviewing request');
    }
  };

  if (loading) return <div className="p-10"><PageLoading label="Đang tải Dashboard..." /></div>;
  if (error) return <div className="p-10"><ErrorState message={error} onRetry={() => void loadData()} /></div>;

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-forest">Guardian Overview</h1>
          <p className="mt-1 text-sm text-gray-500">Welcome back to the canopy. Here's today's summary.</p>
        </div>
        <div className="flex items-center gap-4 text-forest">
          <button className="hover:bg-gray-100 p-2 rounded-full transition-colors"><Bell className="h-5 w-5" /></button>
          <button className="hover:bg-gray-100 p-2 rounded-full transition-colors"><HelpCircle className="h-5 w-5" /></button>
        </div>
      </div>

      {/* Stats Grid Top */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Total Users */}
        <Card className="p-6 relative overflow-hidden border border-gray-200/60 shadow-sm">
          <div className="flex items-center gap-2 text-forest font-semibold mb-4">
            <Users className="h-5 w-5" />
            <span>Total Users</span>
          </div>
          <div className="text-4xl font-bold text-forest mb-6">{stats.totalUsers.toLocaleString()}</div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-2 text-gray-500"><span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span> Free</span>
              <span className="font-medium">{stats.freeUsers.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-2 text-gray-500"><span className="w-1.5 h-1.5 rounded-full bg-forest"></span> VIP</span>
              <span className="font-medium">{stats.vipUsers.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-2 text-gray-500"><span className="w-1.5 h-1.5 rounded-full bg-forest"></span> Teacher</span>
              <span className="font-medium">{stats.teacherUsers.toLocaleString()}</span>
            </div>
          </div>
          
          {/* Faint background icon */}
          <Users className="absolute -right-4 -top-4 w-32 h-32 text-gray-50/50" />
        </Card>

        {/* Pending VIP */}
        <Card className="p-6 bg-[#dde8a6] border-none shadow-sm flex flex-col">
          <div className="flex items-center gap-2 text-forest font-semibold mb-2">
            <div className="bg-white/50 p-1 rounded-full"><Star className="h-4 w-4" /></div>
            <span>Pending VIP</span>
          </div>
          <p className="text-sm text-forest/70 mb-auto">Requires guardian approval.</p>
          
          <div className="flex items-end justify-between mt-8">
            <div className="text-5xl font-bold text-forest">{stats.pendingVipCount}</div>
            <Link href="/admin/subscriptions" className="bg-forest text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-brand-dark transition-colors">
              Review All
            </Link>
          </div>
        </Card>

        {/* Right Stack (Revenue & Resources) */}
        <div className="flex flex-col gap-6">
          <Card className="p-5 shadow-sm border-l-4 border-l-forest border-y-0 border-r-0 rounded-l-none">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-forest text-sm">Monthly Revenue</h3>
                <p className="text-xs text-gray-500 mt-1">Target $45k</p>
              </div>
              <span className="text-2xl font-bold text-forest">$38,240</span>
            </div>
          </Card>

          <Card className="p-5 shadow-sm border-l-4 border-l-accent-lime border-y-0 border-r-0 rounded-l-none flex-1">
            <div className="flex items-center gap-2 text-forest font-semibold mb-4 text-sm">
              <Database className="h-4 w-4" />
              <span>System Resources</span>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Storage</span>
                  <span>76%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div className="bg-forest h-1.5 rounded-full" style={{ width: '76%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Server Load</span>
                  <span>42%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div className="bg-accent-olive h-1.5 rounded-full" style={{ width: '42%' }}></div>
                </div>
              </div>
            </div>
          </Card>
        </div>
        
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Pending Subscriptions */}
        <Card className="col-span-1 md:col-span-2 p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-bold text-forest">Pending Subscriptions</h2>
            <button className="text-sm font-medium text-gray-500 flex items-center hover:text-forest transition-colors">
              View All <span className="ml-1">→</span>
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 font-medium text-gray-500 w-1/2">User</th>
                  <th className="text-left py-3 font-medium text-gray-500 w-1/4">Plan Request</th>
                  <th className="text-right py-3 font-medium text-gray-500 w-1/4">Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingRequests.map((req) => {
                  const name = req.user?.fullName || 'Unknown User';
                  const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

                  return (
                    <tr key={req.id} className="border-b border-gray-50/50 last:border-0 group">
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-pale-green text-forest flex items-center justify-center font-bold text-xs overflow-hidden">
                            {req.user ? (
                              <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${req.user.id}`} alt="Avatar" className="h-full w-full object-cover" />
                            ) : (
                              initials
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-800">{name}</span>
                            <span className="text-xs text-gray-400">{req.user?.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3">
                        <Badge tone="green">VIP</Badge>
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleReview(req.id, 'REJECTED')}
                            className="h-7 w-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-500 transition-colors"
                            title="Reject"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                          <button 
                            onClick={() => handleReview(req.id, 'APPROVED')}
                            className="h-7 w-7 rounded-full bg-forest text-white flex items-center justify-center hover:bg-brand-dark transition-colors"
                            title="Approve"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {pendingRequests.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-gray-500 text-sm">
                      No pending requests.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* System Health */}
        <Card className="p-6 shadow-sm flex flex-col items-center justify-center text-center">
          <h2 className="font-bold text-forest w-full text-left mb-6">System Health</h2>
          
          <div className="relative w-32 h-32 mb-6">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f3f8d7" strokeWidth="8" />
              {/* Foreground circle */}
              <circle cx="50" cy="50" r="40" fill="transparent" stroke="#c7cf35" strokeWidth="8" strokeDasharray="251.2" strokeDashoffset="20.096" strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-forest">92<span className="text-lg">%</span></span>
              <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Optimal</span>
            </div>
          </div>
          
          <p className="text-sm text-gray-500 px-4">
            Forest canopy is thriving. No active incidents reported in the last 72 hours.
          </p>
        </Card>
        
      </div>
    </div>
  );
}
