'use client';

import React, { useMemo } from 'react';
import type { HeatmapEntry } from '@/lib/api/endpoints/achievements';

interface StreakHeatmapProps {
  data: HeatmapEntry[];
  days?: number; // mặc định 90 ngày
}

export function StreakHeatmap({ data, days = 90 }: StreakHeatmapProps) {
  // Tạo mảng 90 ngày tính từ hôm nay trở về trước
  const calendarDates = useMemo(() => {
    const dates: { date: string; count: number }[] = [];
    const today = new Date();
    
    // Tạo map để tra cứu nhanh (O(1))
    const countMap = new Map<string, number>();
    data.forEach((entry) => {
      // chuẩn hóa format YYYY-MM-DD
      const d = new Date(entry.date).toISOString().split('T')[0];
      countMap.set(d, entry.count);
    });

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      dates.push({
        date: dateStr,
        count: countMap.get(dateStr) || 0,
      });
    }
    return dates;
  }, [data, days]);

  const getColor = (count: number) => {
    if (count === 0) return 'bg-[#ebedf0]';
    if (count <= 2) return 'bg-[#c6e48b]';
    if (count <= 5) return 'bg-[#7bc96f]';
    if (count <= 10) return 'bg-[#239a3b]';
    return 'bg-[#196127]';
  };

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-1.5">
        {calendarDates.map((day, idx) => (
          <div
            key={idx}
            title={`${day.date}: ${day.count} hoạt động`}
            className={`h-4 w-4 rounded-sm transition-colors hover:ring-2 hover:ring-[#215b3b]/50 ${getColor(day.count)}`}
          />
        ))}
      </div>
      <div className="mt-3 flex items-center justify-end gap-2 text-xs text-[#4a5a3a]">
        <span>Ít</span>
        <div className="flex gap-1">
          <div className="h-3 w-3 rounded-sm bg-[#ebedf0]" />
          <div className="h-3 w-3 rounded-sm bg-[#c6e48b]" />
          <div className="h-3 w-3 rounded-sm bg-[#7bc96f]" />
          <div className="h-3 w-3 rounded-sm bg-[#239a3b]" />
          <div className="h-3 w-3 rounded-sm bg-[#196127]" />
        </div>
        <span>Nhiều</span>
      </div>
    </div>
  );
}
