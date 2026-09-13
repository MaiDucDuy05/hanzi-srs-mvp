'use client';

import { useState } from 'react';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface HskLevelScore {
  levelLabel: string;
  levelName: string;
  avgScore: number;
  statusText: string;
  studentCount: number;
}

interface SkillScore {
  skill: string;
  score: number;
  fillColor: string;
}

interface TeacherScoreDistributionProps {
  hskLevelScores: HskLevelScore[];
  skillData: SkillScore[];
}

export function TeacherScoreDistributionChart({ hskLevelScores, skillData }: TeacherScoreDistributionProps) {
  const [tab, setTab] = useState<'1-3' | '4-6'>('1-3');

  const displayScores = tab === '1-3' 
    ? hskLevelScores 
    : [
        { levelLabel: 'HSK 4', levelName: 'Nâng cao', avgScore: 74.5, statusText: 'Cần chú ý', studentCount: 1 },
        { levelLabel: 'HSK 5', levelName: 'Cao cấp', avgScore: 68.0, statusText: 'Cần luyện thêm', studentCount: 0 },
        { levelLabel: 'HSK 6', levelName: 'Thành thạo', avgScore: 0, statusText: 'Chưa có dữ liệu', studentCount: 0 },
      ];

  return (
    <div className="bg-white rounded-[32px] p-6 sm:p-7 border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h3 className="text-base sm:text-lg font-black text-[#1f5333]">
            Phân bổ điểm trung bình theo Cấp độ HSK
          </h3>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            Thống kê kết quả kiểm tra & luyện tập gần nhất
          </p>
        </div>
        <div className="inline-flex items-center gap-1.5 p-1 bg-[#f0f2f5] rounded-xl text-xs font-bold text-gray-600">
          <button 
            onClick={() => setTab('1-3')}
            className={`px-3 py-1 rounded-lg transition-all ${tab === '1-3' ? 'bg-white shadow-sm text-[#1f5333]' : 'text-gray-400 hover:text-gray-700'}`}
          >
            HSK 1 - 3
          </button>
          <button 
            onClick={() => setTab('4-6')}
            className={`px-3 py-1 rounded-lg transition-all ${tab === '4-6' ? 'bg-white shadow-sm text-[#1f5333]' : 'text-gray-400 hover:text-gray-700'}`}
          >
            HSK 4 - 6
          </button>
        </div>
      </div>

      {/* 3 cards cấp độ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {displayScores.map((lvl) => (
          <div key={lvl.levelLabel} className="bg-[#fcfce8]/60 border border-[#f3f4e1] rounded-2xl p-4">
            <span className="text-[11px] font-extrabold uppercase text-gray-500 tracking-wider">
              {lvl.levelLabel} ({lvl.levelName})
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-black text-[#1f5333]">{lvl.avgScore}</span>
              <span className="text-xs font-semibold text-gray-400">/ 100</span>
            </div>
            <p className="text-[11px] font-bold text-[#78993a] mt-1.5 flex items-center justify-between">
              <span>{lvl.statusText}</span>
              <span className="text-gray-400 font-normal">{lvl.studentCount} học viên</span>
            </p>
          </div>
        ))}
      </div>

      {/* Biểu đồ phân bổ kỹ năng */}
      <div className="pt-2">
        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={skillData} barSize={26}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f2f5" />
              <XAxis 
                dataKey="skill" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 12, fontWeight: 700 }} 
              />
              <YAxis 
                domain={[0, 100]} 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 11 }} 
              />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ 
                  borderRadius: '16px', 
                  border: '1px solid #f1f5f9', 
                  boxShadow: '0 8px 16px -4px rgba(0,0,0,0.08)',
                  fontWeight: 700,
                  fontSize: '13px'
                }} 
              />
              <Bar dataKey="score" radius={[8, 8, 0, 0]}>
                {skillData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fillColor} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
