'use client';

import { Card } from '@/features/ui/components/card';
import { 
  Bell, 
  HelpCircle, 
  Search,
  Clock,
  TrendingUp,
  RefreshCw,
  Eye,
  Check,
  X
} from 'lucide-react';

import { useEffect, useState } from 'react';
import { resourceApi } from '@/lib/api/endpoints/resource';
import { usersApi } from '@/lib/api/endpoints/users';
import type { VipUpgradeRequest, User } from '@/lib/api/types';

// Extended type to include user details
type EnrichedVipRequest = VipUpgradeRequest & { user?: User };

export function AdminSubscriptionsFeature() {
  const [requests, setRequests] = useState<EnrichedVipRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      // 1. Fetch requests
      const res = await resourceApi.listVipRequests({ limit: 50 });
      
      // 2. Fetch user details for each request
      const enrichedRequests = await Promise.all(
        (res || []).map(async (req) => {
          try {
            const userRes = await usersApi.getById(req.userId);
            return { ...req, user: userRes };
          } catch {
            return req;
          }
        })
      );
      setRequests(enrichedRequests);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error loading requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleReview = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    if (!confirm(`Are you sure you want to ${status.toLowerCase()} this request?`)) return;
    try {
      await resourceApi.reviewVipRequest(id, { status });
      void load();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Error reviewing request');
    }
  };

  const pendingCount = requests.filter(r => r.status === 'PENDING').length;
  return (
    <div className="space-y-8 pb-10 max-w-[1200px]">
      
      {/* Top Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-[32px] leading-tight font-extrabold text-[#11321e]">
            Subscription & VIP<br/>Management
          </h1>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="relative w-72">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-500" />
            </div>
            <input
              type="text"
              className="block w-full pl-11 pr-4 py-2.5 border-0 rounded-full text-sm bg-[#fbfbf8] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#dde8a6] shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)]"
              placeholder="Search requests..."
            />
          </div>
          <div className="flex items-center gap-4 text-[#11321e]">
            <button className="relative transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-0.5 -right-0.5 h-2 w-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <button className="transition-colors"><HelpCircle className="h-5 w-5" /></button>
            <div className="h-10 w-10 rounded-full bg-[#f3f8d7] border border-gray-200 flex items-center justify-center overflow-hidden">
              <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Admin" alt="Admin" className="h-full w-full object-cover" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        
        {/* Left Column - Requests */}
        <div className="flex-1 space-y-6">
          <div className="flex items-center justify-between border-b-2 border-[#b8c533] pb-3">
            <h2 className="text-xl font-bold text-[#11321e]">New Upgrade Requests</h2>
            <span className="bg-[#e4e2cd] text-[#4a5a3a] px-3 py-1 rounded-md text-xs font-bold shadow-sm">
              {pendingCount} Pending
            </span>
          </div>

          <div className="space-y-6">
            {loading && <p className="text-sm text-gray-500 py-4">Loading requests...</p>}
            {error && <p className="text-sm text-red-500 py-4">{error}</p>}
            
            {!loading && !error && requests.length === 0 && (
              <p className="text-sm text-gray-500 py-4 text-center">No upgrade requests found.</p>
            )}

            {!loading && !error && requests.map((req) => {
              const isPending = req.status === 'PENDING';
              const name = req.user?.fullName || 'Unknown User';
              const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

              return (
                <div key={req.id} className={`bg-white rounded-xl ${isPending ? 'shadow-[0_2px_12px_-4px_rgba(0,0,0,0.1)] border border-gray-100' : 'border-b border-gray-100 pb-6'} relative overflow-hidden`}>
                  {/* Top Color Accent */}
                  {isPending && <div className="absolute top-0 left-0 right-0 h-1 bg-[#c7cf35]"></div>}
                  
                  <div className={`p-6 flex flex-col md:flex-row gap-6 items-stretch ${isPending ? 'pt-7' : ''}`}>
                    
                    {/* Left Info */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex gap-4 items-center">
                          <div className="h-14 w-14 rounded-full bg-[#e3eadd] flex items-center justify-center overflow-hidden shrink-0 shadow-sm border border-white">
                            {req.user ? (
                              <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${req.user.id}`} alt="Avatar" className="h-full w-full object-cover" />
                            ) : (
                              <span className="text-[#11321e] text-xl font-medium">{initials}</span>
                            )}
                          </div>
                          <div>
                            <h3 className="font-bold text-[#11321e] text-[22px] leading-tight">{name}</h3>
                            <p className="text-[13px] text-gray-500 font-medium">Request ID: #{req.id.substring(0,8).toUpperCase()}</p>
                          </div>
                        </div>
                        
                        <div className={`flex items-center gap-1.5 font-bold text-[13px] ${isPending ? 'text-[#11321e]' : 'text-gray-600'}`}>
                          {isPending ? <Clock className="h-4 w-4" strokeWidth={2.5} /> : <RefreshCw className="h-4 w-4" strokeWidth={2.5} />}
                          {req.status}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                          <p className="text-[11px] text-gray-400 font-semibold mb-1 tracking-wide">Requested Tier</p>
                          <p className="text-[15px] font-bold text-[#11321e]">VIP</p>
                        </div>
                        <div>
                          <p className="text-[11px] text-gray-400 font-semibold mb-1 tracking-wide">Submitted On</p>
                          <p className="text-[15px] font-medium text-gray-700">{new Date(req.requestedAt).toLocaleDateString()}</p>
                        </div>
                      </div>

                      {isPending && (
                        <div>
                          <p className="text-[11px] text-gray-400 font-semibold mb-2 tracking-wide">Notes from student</p>
                          <div className="bg-[#fbfbe9] text-[#5c6853] px-5 py-4 rounded-[16px] text-[13px] italic font-medium">
                            "{req.note || 'No notes provided.'}"
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right Action / Payment Proof */}
                    {isPending ? (
                      <div className="w-full md:w-[220px] bg-[#fbfbe9] rounded-[32px] p-5 flex flex-col items-center justify-center shrink-0 shadow-sm border border-[#f3f4e1]">
                        <p className="text-[11px] text-gray-500 font-bold mb-3 tracking-wide">Payment Proof</p>
                        
                        {/* Placeholder Image */}
                        <div className="w-full aspect-[3/4] bg-white rounded-[24px] mb-5 overflow-hidden shadow-sm relative">
                          {/* We simulate a phone screenshot */}
                          <div className="absolute inset-0 bg-[#dde8a6]/20"></div>
                          <img src="https://images.unsplash.com/photo-1616077168712-fc6c788db4fa?w=400&q=80" alt="Proof" className="w-full h-full object-cover" />
                        </div>
                        
                        <button 
                          onClick={() => handleReview(req.id, 'APPROVED')}
                          className="w-full py-2 bg-transparent text-[#11321e] font-extrabold text-[15px] flex items-center justify-center gap-2 hover:bg-[#eaf3c5] rounded-full transition-colors mb-2">
                          <Check className="h-5 w-5" strokeWidth={3} /> Activate VIP
                        </button>
                        <button 
                          onClick={() => handleReview(req.id, 'REJECTED')}
                          className="text-[11px] text-red-500 font-bold hover:underline">
                          Reject Request
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end pl-6">
                         <button className="py-2.5 px-5 bg-transparent text-[#11321e] font-bold text-sm flex items-center justify-center gap-2 hover:bg-gray-50 rounded-full transition-colors border border-transparent shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] bg-white">
                          <Eye className="h-4 w-4" strokeWidth={2.5} /> View Details
                        </button>
                      </div>
                    )}

                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column - Stats & Log */}
        <div className="w-full lg:w-[300px] flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-xl p-5 flex flex-col items-center justify-center text-center shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] border border-gray-100 h-[140px]">
              <TrendingUp className="h-6 w-6 text-[#85d038] mb-3" strokeWidth={2.5} />
              <span className="text-4xl font-extrabold text-[#11321e] leading-none mb-1">14</span>
              <span className="text-[10px] text-gray-500 capitalize tracking-wide font-semibold">Upgrades Today</span>
            </div>
            <div className="bg-white rounded-xl p-5 flex flex-col items-center justify-center text-center shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] border border-gray-100 h-[140px]">
              <RefreshCw className="h-6 w-6 text-[#9eb6b8] mb-3" strokeWidth={2.5} />
              <span className="text-4xl font-extrabold text-[#11321e] leading-none mb-1">8</span>
              <span className="text-[10px] text-gray-500 capitalize tracking-wide font-semibold text-balance">Pending Verification</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] border border-gray-100 flex-1">
            <div className="p-6 flex justify-between items-center border-b border-gray-50">
              <h2 className="text-[17px] font-bold text-[#11321e]">Recent Log</h2>
              <button className="text-[11px] font-bold text-gray-500 hover:text-[#11321e]">View All &gt;</button>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                {/* Log dynamically? Leaving mock for now. */}
                {requests.slice(0, 3).map((log, index) => (
                  <div key={log.id} className={`flex gap-4 items-start pb-6 ${index !== 2 ? 'border-b border-gray-100' : ''}`}>
                    <div className={`mt-0.5 shrink-0 h-8 w-8 rounded-full flex items-center justify-center shadow-sm ${log.status === 'APPROVED' ? 'bg-[#a3e670]' : log.status === 'REJECTED' ? 'bg-[#ffc6c6]' : 'bg-gray-200'}`}>
                      {log.status === 'APPROVED' ? <Check className="h-4 w-4 text-[#11321e]" strokeWidth={3} /> : <X className="h-4 w-4 text-[#7a1e1e]" strokeWidth={3} />}
                    </div>
                    <div className="flex-1 pt-1">
                      <p className="text-[13px] font-semibold text-[#11321e] leading-snug">Request #{log.id.substring(0,8).toUpperCase()} {log.status.toLowerCase()}</p>
                      <div className="flex items-center gap-1.5 text-[10px] text-gray-400 mt-2 font-medium">
                        <span>{new Date(log.updatedAt).toLocaleTimeString()}</span>
                        <span className="h-1 w-1 rounded-full bg-gray-300"></span>
                        <span>Processed by Admin</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="p-6 flex justify-center opacity-20 mt-auto">
               <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#11321e]"><path d="M12 22v-4"/><path d="M12 14v-2"/><path d="M12 8V4"/><path d="m8 18 4-4"/><path d="m16 18-4-4"/><path d="m8 10 4-4"/><path d="m16 10-4-4"/></svg>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}
