import React from 'react';
import type { User } from '@/lib/api/types';
import { Card } from '@/features/ui/components/card';
import { 
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

interface AdminUsersTableProps {
  users: User[];
  total: number;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
  onDelete: (id: string) => void;
}

export function AdminUsersTable({
  users,
  total,
  page,
  limit,
  onPageChange,
  onDelete
}: AdminUsersTableProps) {
  return (
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
              const isBanned = u.status === 'BANNED'; 
              const initials = u.fullName.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase();
              
              // Mock VIP logic
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
                      <button onClick={() => onDelete(u.id)} className="hover:text-red-500 transition-colors"><Lock className="h-4 w-4" /></button>
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
          Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total.toLocaleString()} Users
        </span>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page === 1}
            className="h-8 w-8 rounded-full bg-white text-forest flex items-center justify-center hover:bg-forest hover:text-white transition-colors shadow-sm disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button 
            onClick={() => onPageChange(page + 1)}
            disabled={page * limit >= total}
            className="h-8 w-8 rounded-full bg-white text-forest flex items-center justify-center hover:bg-forest hover:text-white transition-colors shadow-sm disabled:opacity-50"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </Card>
  );
}
