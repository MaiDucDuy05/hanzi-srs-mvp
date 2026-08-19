'use client';

import { Card } from '@/features/ui/components/card';
import { Star } from 'lucide-react';

interface PendingVipCardProps {
  pendingCount: number;
  onReviewAll?: () => void;
}

export function PendingVipCard({
  pendingCount = 42,
  onReviewAll,
}: Partial<PendingVipCardProps>) {
  return (
    <Card className="p-6 bg-[#dde8a6] border-none shadow-sm flex flex-col">
      <div className="flex items-center gap-2 text-forest font-semibold mb-2">
        <div className="bg-white/50 p-1 rounded-full">
          <Star className="h-4 w-4" />
        </div>
        <span>Pending VIP</span>
      </div>
      <p className="text-sm text-forest/70 mb-auto">
        Requires guardian approval.
      </p>

      <div className="flex items-end justify-between mt-8">
        <div className="text-5xl font-bold text-forest">{pendingCount}</div>
        <button
          onClick={onReviewAll}
          className="bg-forest text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-brand-dark transition-colors"
        >
          Review All
        </button>
      </div>
    </Card>
  );
}
