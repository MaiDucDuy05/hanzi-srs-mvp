import { Card } from '@/features/ui/components/card';
import { 
  Bell, 
  HelpCircle, 
  Search, 
  UserPlus, 
  ChevronDown 
} from 'lucide-react';
import React from 'react';

interface AdminUsersFilterProps {
  total: number;
  search: string;
  onSearchChange: (val: string) => void;
  role: string;
  onRoleChange: (val: string) => void;
  status: string;
  onStatusChange: (val: string) => void;
}

export function AdminUsersFilter({
  total,
  search,
  onSearchChange,
  role,
  onRoleChange,
  status,
  onStatusChange
}: AdminUsersFilterProps) {
  return (
    <>
      {/* Top Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="relative w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-full leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-brand sm:text-sm transition-shadow"
            placeholder="Search users by name or email..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
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
              Total: {total.toLocaleString()}
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Role</label>
              <div className="relative">
                <select 
                  value={role}
                  onChange={(e) => onRoleChange(e.target.value)}
                  className="appearance-none w-full bg-pale-green/50 border-none text-forest text-sm font-medium rounded-full py-2.5 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-forest/20"
                >
                  <option value="All Roles">All Roles</option>
                  <option value="FREE">Student (FREE)</option>
                  <option value="TEACHER">Teacher</option>
                  <option value="ADMIN">Admin</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-forest pointer-events-none" />
              </div>
            </div>
            
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Status</label>
              <div className="relative">
                <select 
                  value={status}
                  onChange={(e) => onStatusChange(e.target.value)}
                  className="appearance-none w-full bg-pale-green/50 border-none text-forest text-sm font-medium rounded-full py-2.5 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-forest/20"
                >
                  <option value="All Statuses">All Statuses</option>
                  <option value="ACTIVE">Active</option>
                  <option value="BANNED">Banned</option>
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
    </>
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
