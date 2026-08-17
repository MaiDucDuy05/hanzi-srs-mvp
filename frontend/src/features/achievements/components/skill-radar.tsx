'use client';

import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import type { RadarEntry } from '@/lib/api/endpoints/achievements';

const SKILL_LABELS: Record<string, string> = {
  MEMORY_GAME: 'Ghi nhớ',
  MATCHING: 'Nối từ',
  FILL_BLANKS: 'Điền từ',
  PINYIN_ORDERING: 'Sắp xếp',
  HANZI_WRITING: 'Viết chữ',
  // Fallbacks for the mock spec
  vocabulary: 'Từ vựng',
  grammar: 'Ngữ pháp',
  listening: 'Nghe hiểu',
  reading: 'Đọc hiểu',
  writing: 'Viết Hán tự',
};

interface SkillRadarProps {
  data: RadarEntry[];
}

export function SkillRadar({ data }: SkillRadarProps) {
  // Normalize data for chart
  const chartData = data.map((d) => ({
    subject: SKILL_LABELS[d.type] || d.type,
    score: d.avgCorrect || 0,
    fullMark: 100,
  }));

  // Nếu không có dữ liệu (user chưa chơi gì)
  if (!data || data.length === 0) {
    return (
      <div className="flex h-64 w-full items-center justify-center rounded-2xl bg-[#f3f8d7]/50 border border-dashed border-[#dde8a6]">
        <p className="text-sm font-medium text-[#5e7f26]">Chưa có dữ liệu kỹ năng</p>
      </div>
    );
  }

  return (
    <div className="h-64 w-full text-xs">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="60%" data={chartData}>
          <PolarGrid stroke="#dde8a6" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: '#215b3b', fontSize: 11, fontWeight: 'bold', fontFamily: 'var(--font-nunito)' }}
          />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          <Radar
            name="Kỹ năng"
            dataKey="score"
            stroke="#7CB342"
            strokeWidth={3}
            fill="#8BC34A"
            fillOpacity={0.5}
          />
          <Tooltip
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            itemStyle={{ color: '#215b3b', fontWeight: 'bold' }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
