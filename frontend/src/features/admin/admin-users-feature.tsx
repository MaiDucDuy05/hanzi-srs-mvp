'use client';

import { useEffect, useState } from 'react';
import { resourceApi } from '@/lib/api/endpoints';
import type { User } from '@/lib/api/types';
import { Card } from '@/features/ui/components/card';
import { PageLoading } from '@/features/ui/components/spinner';
import { ErrorState } from '@/features/ui/components/error-state';
import { 
  Bell, 
  HelpCircle, 
  Search, 
  UserPlus, 
  ChevronDown, 
  History, 
  Settings2, 
  Lock,
  CheckCircle2,
  Ban,
  GraduationCap,
  Star,
  ChevronLeft,
  ChevronRight,
  UserCheck
} from 'lucide-react';
import { Badge } from '@/features/ui/components/badge';

export function AdminUsersFeature() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const us = await resourceApi.listUsers({});
      setUsers(us);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Lỗi tải dữ liệu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  return (
    <div className="space-y-6 pb-10">
      
      {/* Top Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="relative w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-full leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-brand sm:text-sm transition-shadow"
            placeholder="Search users..."
          />
        </div>
        <div className="flex items-center gap-4 text-forest">
          <button className="hover:bg-gray-100 p-2 rounded-full transition-colors"><Bell className="h-5 w-5" /></button>
          <button className="hover:bg-gray-100 p-2 rounded-full transition-colors"><HelpCircle className="h-5 w-5" /></button>
          <div className="h-8 w-8 rounded-full bg-pale-green border border-gray-200 flex items-center justify-center overflow-hidden">
            <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Admin" alt="Admin" className="h-full w-full object-cover" />
          </div>
        </div>
      </div>

      {/* Stats and Filters Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* User Management Card */}
        <Card className="p-6 col-span-1 shadow-sm border-2 border-transparent hover:border-pale-green transition-colors">
          <h2 className="text-2xl font-bold text-forest mb-2">User<br/>Management</h2>
          <p className="text-sm text-gray-500 mb-6 w-4/5">Manage guardians, guides, and explorers of the forest.</p>
          <button className="bg-forest text-white px-4 py-2.5 rounded-full text-sm font-medium hover:bg-brand-dark transition-colors flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Add User
          </button>
        </Card>

        {/* Filter Directory Card */}
        <Card className="p-6 col-span-2 shadow-sm relative">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-lg font-bold text-gray-700">Filter Directory</h2>
            <div className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5">
              <UsersIcon className="h-3.5 w-3.5" />
              Total: {users.length > 0 ? users.length.toLocaleString() : '1,248'}
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Role</label>
              <div className="relative">
                <select className="appearance-none w-full bg-pale-green/50 border-none text-forest text-sm font-medium rounded-full py-2.5 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-forest/20">
                  <option>All Roles</option>
                  <option>Student</option>
                  <option>Teacher</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-forest pointer-events-none" />
              </div>
            </div>
            
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Status</label>
              <div className="relative">
                <select className="appearance-none w-full bg-pale-green/50 border-none text-forest text-sm font-medium rounded-full py-2.5 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-forest/20">
                  <option>All Statuses</option>
                  <option>Active</option>
                  <option>Banned</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-forest pointer-events-none" />
              </div>
            </div>

            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Plan</label>
              <div className="relative">
                <select className="appearance-none w-full bg-pale-green/50 border-none text-forest text-sm font-medium rounded-full py-2.5 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-forest/20">
                  <option>All Plans</option>
                  <option>Free</option>
                  <option>VIP</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-forest pointer-events-none" />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {loading && <PageLoading label="Đang tải..." />}
      {error && <ErrorState message={error} onRetry={() => void load()} />}

      {/* User Table */}
      {!loading && !error && (
        <Card className="overflow-hidden shadow-sm border-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#dde8a6]/40 text-forest font-semibold">
                <tr>
                  <th className="px-6 py-4 rounded-tl-xl w-1/3">User</th>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Plan</th>
                  <th className="px-6 py-4 text-right rounded-tr-xl">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((u, i) => {
                  const isTeacher = u.role === 'TEACHER';
                  const isBanned = u.status === 'BANNED'; // Assuming status can be BANNED
                  const initials = u.fullName.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase();
                  
                  // Mock VIP logic: every 3rd user is VIP for demo purposes if we don't have sub plan
                  const isVip = i % 3 === 1;

                  return (
                    <tr key={u.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center font-bold text-gray-500 overflow-hidden">
                            <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${u.id}`} alt={u.fullName} className="h-full w-full object-cover opacity-80" />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold text-gray-800">{u.fullName}</span>
                            <span className="text-xs text-gray-400">{u.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-400 font-mono text-xs">
                        #{u.id.substring(0,8).toUpperCase()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${isTeacher ? 'bg-[#c7cf35] text-forest' : 'bg-gray-100 text-gray-600'}`}>
                          {isTeacher ? <UserCheck className="h-3 w-3" /> : <GraduationCap className="h-3 w-3" />}
                          {isTeacher ? 'Teacher' : 'Student'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          {isBanned ? (
                            <><Ban className="h-4 w-4 text-red-500" /><span className="text-red-500 font-medium">Banned</span></>
                          ) : (
                            <><CheckCircle2 className="h-4 w-4 text-forest" /><span className="text-forest font-medium">Active</span></>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          {isVip ? (
                            <><Star className="h-3.5 w-3.5 text-accent-lime fill-accent-lime" /><span className="text-gray-700 font-medium">VIP</span></>
                          ) : (
                            <span className="text-gray-500">Free</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-3 text-gray-400">
                          <button className="hover:text-forest transition-colors"><History className="h-4 w-4" /></button>
                          <button className="hover:text-forest transition-colors"><Settings2 className="h-4 w-4" /></button>
                          <button className="hover:text-red-500 transition-colors"><Lock className="h-4 w-4" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="px-6 py-4 bg-[#dde8a6]/40 flex items-center justify-between rounded-b-xl border-t border-white/50">
            <span className="text-xs text-forest font-medium">
              Showing 1 to {users.length} of {users.length > 0 ? users.length.toLocaleString() : '1,248'} Users
            </span>
            <div className="flex items-center gap-2">
              <button className="h-8 w-8 rounded-full bg-white text-forest flex items-center justify-center hover:bg-forest hover:text-white transition-colors shadow-sm disabled:opacity-50">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button className="h-8 w-8 rounded-full bg-white text-forest flex items-center justify-center hover:bg-forest hover:text-white transition-colors shadow-sm">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </Card>
      )}

    </div>
  );
}

// Small helper component for the Users icon in the Filter card
function UsersIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
