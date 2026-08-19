'use client';

import { Card } from '@/features/ui/components/card';
import { Database } from 'lucide-react';

interface RevenueResourcesStackProps {
  monthlyRevenue: string;
  revenueTarget: string;
  storagePercent: number;
  serverLoadPercent: number;
}

export function RevenueResourcesStack({
  monthlyRevenue = '$38,240',
  revenueTarget = '$45k',
  storagePercent = 76,
  serverLoadPercent = 42,
}: Partial<RevenueResourcesStackProps>) {
  return (
    <div className="flex flex-col gap-6">
      {/* Monthly Revenue */}
      <Card className="p-5 shadow-sm border-l-4 border-l-forest border-y-0 border-r-0 rounded-l-none">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-forest text-sm">
              Monthly Revenue
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Target {revenueTarget}
            </p>
          </div>
          <span className="text-2xl font-bold text-forest">
            {monthlyRevenue}
          </span>
        </div>
      </Card>

      {/* System Resources */}
      <Card className="p-5 shadow-sm border-l-4 border-l-accent-lime border-y-0 border-r-0 rounded-l-none flex-1">
        <div className="flex items-center gap-2 text-forest font-semibold mb-4 text-sm">
          <Database className="h-4 w-4" />
          <span>System Resources</span>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Storage</span>
              <span>{storagePercent}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div
                className="bg-forest h-1.5 rounded-full"
                style={{ width: `${storagePercent}%` }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Server Load</span>
              <span>{serverLoadPercent}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div
                className="bg-accent-olive h-1.5 rounded-full"
                style={{ width: `${serverLoadPercent}%` }}
              ></div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
