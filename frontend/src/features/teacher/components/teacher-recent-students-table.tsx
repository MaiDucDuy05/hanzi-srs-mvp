'use client';

import Link from 'next/link';
import type { TestAttempt } from '@/lib/api/types';

interface TeacherRecentStudentsTableProps {
  attempts: TestAttempt[];
}

export function TeacherRecentStudentsTable({ attempts }: TeacherRecentStudentsTableProps) {
  const getStatusBadge = (score: number) => {
    if (score >= 90) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#eaf3c5] text-[#1f5333]">
          Tiến bộ vượt bậc
        </span>
      );
    }
    if (score >= 70) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700">
          Đạt chuẩn
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700">
        Cần luyện thêm
      </span>
    );
  };

  const getInitials = (name: string) => {
    if (!name) return 'HV';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="bg-white rounded-[32px] p-6 sm:p-7 border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-base sm:text-lg font-black text-[#1f5333]">
            Bảng điểm nhanh học sinh theo dõi sát sao
          </h3>
          <p className="text-xs text-gray-500 font-medium">Kết quả nộp bài thi thực tế gần nhất</p>
        </div>
        <Link
          href="/teacher/students"
          className="text-xs font-bold text-[#1f5333] hover:text-[#78993a] transition-colors"
        >
          Quản lý học sinh →
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[540px]">
          <thead>
            <tr className="border-b border-gray-100 text-[11px] font-extrabold uppercase text-gray-400 tracking-wider">
              <th className="pb-3 pl-2">Học Sinh</th>
              <th className="pb-3">Bài Thi Gần Nhất</th>
              <th className="pb-3 text-center">Điểm Số</th>
              <th className="pb-3 text-right pr-2">Trạng Thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-sm">
            {attempts.slice(0, 5).map((att, idx) => {
              const fullName = att.user?.fullName || 'Học viên Panda';
              const initials = getInitials(fullName);
              const score = typeof att.score === 'number' ? att.score : 0;
              const testTitle = att.test?.name || 'Bài kiểm tra kiến thức HSK';

              return (
                <tr key={att.id || idx} className="hover:bg-gray-50/60 transition-colors">
                  <td className="py-3 pl-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#f3f4e1] text-[#1f5333] font-black text-xs flex items-center justify-center border border-white shadow-2xs">
                        {initials}
                      </div>
                      <div>
                        <p className="font-bold text-[#1f5333] text-[13px]">{fullName}</p>
                        <p className="text-[11px] text-gray-400 font-mono">HV-{att.userId?.slice(0, 4)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 font-semibold text-gray-700 text-xs">
                    {testTitle}
                  </td>
                  <td className="py-3 text-center">
                    <span className="font-black text-[#1f5333] text-sm">{score}</span>
                    <span className="text-gray-400 text-xs font-medium">/100</span>
                  </td>
                  <td className="py-3 text-right pr-2">
                    {getStatusBadge(score)}
                  </td>
                </tr>
              );
            })}

            {attempts.length === 0 && (
              <tr>
                <td colSpan={4} className="py-8 text-center text-gray-400 italic text-xs">
                  Chưa có lượt nộp bài nào được ghi nhận.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
