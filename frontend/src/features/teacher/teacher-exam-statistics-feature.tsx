'use client';

import { useEffect, useState, useMemo } from 'react';
import { BarChart as BarChartIcon, CheckCircle2, History } from 'lucide-react';
import { testApi } from '@/lib/api/endpoints/test';
import type { TestAttempt } from '@/lib/api/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatDate } from '@/lib/utils/format';

export function TeacherExamStatisticsFeature() {
  const [attempts, setAttempts] = useState<TestAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTestId, setSelectedTestId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await testApi.listAttempts({ status: 'GRADED', limit: 100 });
        setAttempts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to fetch graded attempts', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredAttempts = useMemo(() => {
    if (!selectedTestId) return attempts;
    return attempts.filter(a => a.testId === selectedTestId);
  }, [attempts, selectedTestId]);

  const chartData = useMemo(() => {
    if (!selectedTestId) {
      const testMap: Record<string, { name: string; totalScore: number; count: number; testId: string }> = {};
      attempts.forEach(a => {
        const tId = a.testId;
        if (!testMap[tId]) {
          testMap[tId] = {
            testId: tId,
            name: a.test?.name || `Test #${tId.slice(0, 6)}`,
            totalScore: 0,
            count: 0,
          };
        }
        testMap[tId].totalScore += a.score;
        testMap[tId].count += 1;
      });

      return Object.values(testMap).map(t => ({
        testId: t.testId,
        name: t.name,
        avgScore: Math.round(t.totalScore / t.count),
        count: t.count,
        fill: '#78993a'
      }));
    } else {
      const bins = { '0-49': 0, '50-69': 0, '70-89': 0, '90-100': 0 };
      filteredAttempts.forEach(a => {
        if (a.score < 50) bins['0-49']++;
        else if (a.score < 70) bins['50-69']++;
        else if (a.score < 90) bins['70-89']++;
        else bins['90-100']++;
      });
      return [
        { name: '0 - 49 (Yếu)', count: bins['0-49'], fill: '#f87171' },
        { name: '50 - 69 (TB)', count: bins['50-69'], fill: '#fbbf24' },
        { name: '70 - 89 (Khá)', count: bins['70-89'], fill: '#a3e635' },
        { name: '90 - 100 (Giỏi)', count: bins['90-100'], fill: '#4ade80' },
      ];
    }
  }, [attempts, filteredAttempts, selectedTestId]);

  const avgScore = useMemo(() => {
    if (!filteredAttempts.length) return 0;
    return Math.round(filteredAttempts.reduce((sum, a) => sum + a.score, 0) / filteredAttempts.length);
  }, [filteredAttempts]);

  const uniqueTests = useMemo(() => {
    const tests = new Map<string, string>();
    attempts.forEach(a => {
      if (!tests.has(a.testId)) {
        tests.set(a.testId, a.test?.name || `Test #${a.testId.slice(0, 6)}`);
      }
    });
    return Array.from(tests.entries()).map(([id, name]) => ({ id, name }));
  }, [attempts]);

  return (
    <div className="max-w-[1200px] pb-20 animate-in fade-in duration-300">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-[#1f5333] mb-2">Thống Kê Điểm Số</h1>
          <p className="text-gray-500">Phân tích kết quả các bài kiểm tra đã chấm</p>
        </div>
        <div>
          <select 
            className="border-gray-200 border rounded-xl px-4 py-2 bg-white text-gray-700 outline-none focus:ring-2 focus:ring-[#78993a] min-w-[250px]"
            value={selectedTestId || ''}
            onChange={(e) => setSelectedTestId(e.target.value || null)}
          >
            <option value="">Tất cả bài kiểm tra</option>
            {uniqueTests.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin h-8 w-8 border-3 border-[#78993a] border-t-transparent rounded-full" />
        </div>
      ) : attempts.length === 0 ? (
        <div className="bg-white rounded-[24px] p-12 text-center shadow-sm">
          <span className="text-6xl mb-4 block">📊</span>
          <h3 className="text-xl font-bold text-gray-700">Chưa có dữ liệu</h3>
          <p className="text-gray-500 mt-2">Hiện tại chưa có bài kiểm tra nào được chấm điểm.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Chart Area */}
          <div className="col-span-2 space-y-8">
            <div className="bg-white rounded-[32px] p-8 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)]">
              <h2 className="text-lg font-bold text-[#1f5333] mb-6 flex items-center gap-2">
                <BarChartIcon className="w-5 h-5" /> 
                {selectedTestId ? 'Phân Bố Điểm Số' : 'Điểm trung bình theo bài kiểm tra'}
              </h2>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#9ca3af', fontSize: 11 }}
                      dy={10}
                      tickFormatter={(value) => value.length > 15 ? value.substring(0, 15) + '...' : value}
                    />
                    <YAxis 
                      domain={selectedTestId ? ['auto', 'auto'] : [0, 100]}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#9ca3af', fontSize: 13 }}
                    />
                    <Tooltip 
                      cursor={{ fill: '#f3f4f6', opacity: 0.4 }}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                      formatter={(value: any, name: any) => [value, name === 'avgScore' ? 'Điểm trung bình' : 'Số lượng']}
                    />
                    {!selectedTestId ? (
                      <Bar 
                        dataKey="avgScore" 
                        name="avgScore" 
                        radius={[6, 6, 0, 0]} 
                        barSize={40} 
                        onClick={(data: any) => setSelectedTestId(data?.testId || data?.payload?.testId)}
                        className="cursor-pointer"
                        fill="#78993a"
                      />
                    ) : (
                      <Bar 
                        dataKey="count" 
                        name="count" 
                        radius={[6, 6, 0, 0]} 
                        barSize={40}
                        fill="#78993a"
                      />
                    )}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-[32px] p-8 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)]">
              <h2 className="text-lg font-bold text-[#1f5333] mb-6 flex items-center gap-2">
                <History className="w-5 h-5" /> Các bài vừa chấm gần đây
              </h2>
              <div className="divide-y divide-gray-100">
                {filteredAttempts.slice(0, 10).map((a: any) => (
                  <div key={a.id} className="py-4 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-gray-800">{a.test?.name || 'Bài kiểm tra'}</div>
                      <div className="text-[13px] text-gray-500 mt-1">
                        Học sinh: {a.user?.fullName || a.userId?.split('-')[0]} • Nộp lúc: {formatDate(a.submittedAt || a.createdAt)}
                      </div>
                    </div>
                    <div className="bg-[#f0fdf4] text-[#1f5333] px-4 py-2 rounded-xl font-bold">
                      {a.score} điểm
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Stats Area */}
          <div className="col-span-1 space-y-6">
            <div className="bg-gradient-to-b from-[#f3f4e1] to-[#e8ebc3] rounded-[32px] p-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-white/60 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-[#78993a]" />
                </div>
                <div className="font-bold text-[#1f5333]">Tổng đã chấm</div>
              </div>
              <div className="text-5xl font-extrabold text-[#1f5333] mt-4">{filteredAttempts.length}</div>
              <div className="text-[13px] text-[#5c7a2b] mt-2 font-medium">Bản ghi bài làm</div>
            </div>

            <div className="bg-[#fcfce8] border border-[#f3f4e1] rounded-[32px] p-8">
              <div className="font-bold text-[#1f5333] mb-2">Điểm trung bình</div>
              <div className="text-5xl font-extrabold text-[#78993a]">{avgScore}</div>
              <div className="w-full bg-white/60 h-2 rounded-full mt-4 overflow-hidden">
                <div className="bg-[#78993a] h-full rounded-full" style={{ width: `${avgScore}%` }} />
              </div>
            </div>
          </div>
          
        </div>
      )}
    </div>
  );
}
