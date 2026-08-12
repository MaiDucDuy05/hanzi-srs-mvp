'use client';

import { Card } from '@/features/ui/components/card';
import { Users } from 'lucide-react';

interface UserStatsCardProps {
  totalUsers: number;
  freeUsers: number;
  vipUsers: number;
  teacherUsers: number;
}

export function UserStatsCard({
  totalUsers = 12450,
  freeUsers = 8200,
  vipUsers = 3950,
  teacherUsers = 300,
}: Partial<UserStatsCardProps>) {
  return (
    <Card className="p-6 relative overflow-hidden border border-gray-200/60 shadow-sm">
      <div className="flex items-center gap-2 text-forest font-semibold mb-4">
        <Users className="h-5 w-5" />
        <span>Total Users</span>
      </div>
      <div className="text-4xl font-bold text-forest mb-6">
        {totalUsers.toLocaleString()}
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between items-center">
          <span className="flex items-center gap-2 text-gray-500">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span> Free
          </span>
          <span className="font-medium">{freeUsers.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="flex items-center gap-2 text-gray-500">
            <span className="w-1.5 h-1.5 rounded-full bg-forest"></span> VIP
          </span>
          <span className="font-medium">{vipUsers.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="flex items-center gap-2 text-gray-500">
            <span className="w-1.5 h-1.5 rounded-full bg-forest"></span>{' '}
            Teacher
          </span>
          <span className="font-medium">{teacherUsers.toLocaleString()}</span>
        </div>
      </div>

      {/* Faint background icon */}
      <Users className="absolute -right-4 -top-4 w-32 h-32 text-gray-50/50" />
    </Card>
  );
}
