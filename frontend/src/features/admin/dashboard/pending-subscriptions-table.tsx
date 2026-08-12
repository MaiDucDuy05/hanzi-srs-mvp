'use client';

import { Card } from '@/features/ui/components/card';
import { Badge } from '@/features/ui/components/badge';
import { X, Check } from 'lucide-react';

interface PendingSubscription {
  id: string;
  name: string;
  initials: string;
  plan: string;
}

interface PendingSubscriptionsTableProps {
  subscriptions: PendingSubscription[];
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onViewAll?: () => void;
}

export function PendingSubscriptionsTable({
  subscriptions,
  onApprove,
  onReject,
  onViewAll,
}: PendingSubscriptionsTableProps) {
  return (
    <Card className="col-span-1 md:col-span-2 p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-bold text-forest">Pending Subscriptions</h2>
        <button
          onClick={onViewAll}
          className="text-sm font-medium text-gray-500 flex items-center hover:text-forest transition-colors"
        >
          View All <span className="ml-1">→</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-3 font-medium text-gray-500 w-1/2">
                User
              </th>
              <th className="text-left py-3 font-medium text-gray-500 w-1/4">
                Plan Request
              </th>
              <th className="text-right py-3 font-medium text-gray-500 w-1/4">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {subscriptions.map((sub) => (
              <tr
                key={sub.id}
                className="border-b border-gray-50/50 last:border-0 group"
              >
                <td className="py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-pale-green text-forest flex items-center justify-center font-bold text-xs">
                      {sub.initials}
                    </div>
                    <span className="font-medium text-gray-800">
                      {sub.name}
                    </span>
                  </div>
                </td>
                <td className="py-3">
                  <Badge tone="green">{sub.plan}</Badge>
                </td>
                <td className="py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => onReject?.(sub.id)}
                      className="h-7 w-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-500 transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => onApprove?.(sub.id)}
                      className="h-7 w-7 rounded-full bg-forest text-white flex items-center justify-center hover:bg-brand-dark transition-colors"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
