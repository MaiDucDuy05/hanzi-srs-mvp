'use client';

import { Card } from '@/features/ui/components/card';

interface SystemHealthCardProps {
  healthPercent: number;
  statusLabel: string;
  statusMessage: string;
}

export function SystemHealthCard({
  healthPercent = 92,
  statusLabel = 'Optimal',
  statusMessage = 'Forest canopy is thriving. No active incidents reported in the last 72 hours.',
}: Partial<SystemHealthCardProps>) {
  // Calculate stroke dash offset for the circular progress
  const circumference = 2 * Math.PI * 40; // radius = 40
  const dashOffset = circumference * (1 - healthPercent / 100);

  return (
    <Card className="p-6 shadow-sm flex flex-col items-center justify-center text-center">
      <h2 className="font-bold text-forest w-full text-left mb-6">
        System Health
      </h2>

      <div className="relative w-32 h-32 mb-6">
        <svg
          className="w-full h-full transform -rotate-90"
          viewBox="0 0 100 100"
        >
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="transparent"
            stroke="#f3f8d7"
            strokeWidth="8"
          />
          {/* Foreground circle */}
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="transparent"
            stroke="#c7cf35"
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-forest">
            {healthPercent}
            <span className="text-lg">%</span>
          </span>
          <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">
            {statusLabel}
          </span>
        </div>
      </div>

      <p className="text-sm text-gray-500 px-4">{statusMessage}</p>
    </Card>
  );
}
