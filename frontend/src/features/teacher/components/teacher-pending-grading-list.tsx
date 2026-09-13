'use client';

import Link from 'next/link';
import { FileCheck, Mic, ArrowRight, Clock, CheckCircle, ExternalLink } from 'lucide-react';
import type { Test } from '@/lib/api/types';

interface TeacherPendingGradingProps {
  activeExams: Test[];
  pendingSpeakingCount: number;
}

export function TeacherPendingGradingList({ activeExams, pendingSpeakingCount }: TeacherPendingGradingProps) {
  return (
    <div className="bg-white rounded-[32px] p-6 sm:p-7 border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-base sm:text-lg font-black text-[#1f5333] flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-[#78993a]" />
            Đề thi đang mở & Cần chấm
          </h3>
        </div>
        <Link 
          href="/teacher/exams" 
          className="text-xs font-bold text-[#1f5333] hover:text-[#78993a] flex items-center gap-1 transition-colors"
        >
          Xem tất cả ({activeExams.length}) <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="space-y-3">
        {/* Khảo sát nói HSKK (nếu có bài chờ chấm) */}
        {pendingSpeakingCount > 0 ? (
          <div className="bg-[#fff4f4] border border-[#fecaca] rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#fee2e2] text-rose-600 rounded-xl">
                <Mic className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-black text-gray-800">Khảo sát Phát âm Ngữ điệu & Hanzi HSKK</h4>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500 text-white animate-pulse">
                    Cần chấm ({pendingSpeakingCount})
                  </span>
                </div>
                <p className="text-xs text-gray-500 font-medium mt-0.5">
                  Bài nói âm thanh học viên gửi lên cần giáo viên nghe và cho điểm
                </p>
              </div>
            </div>
            <Link
              href="/teacher/hskk-grading"
              className="px-4 py-2 bg-[#1f5333] text-white rounded-xl text-xs font-black hover:bg-[#153a23] transition-colors whitespace-nowrap shadow-sm"
            >
              Chấm bài nói
            </Link>
          </div>
        ) : null}

        {/* Danh sách đề thi */}
        {activeExams.slice(0, 3).map((exam) => (
          <div 
            key={exam.id}
            className="bg-[#fcfce8]/50 hover:bg-[#fcfce8] border border-[#f3f4e1] rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white border border-gray-100 text-[#1f5333] rounded-xl shadow-xs">
                <FileCheck className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-black text-[#1f5333]">{exam.name}</h4>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#eaf3c5] text-[#1f5333]">
                    {exam.status === 'PUBLISHED' ? 'Đang mở' : 'Bản nháp'}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500 font-medium mt-0.5">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-gray-400" />
                    {exam.timeLimitMinutes} phút
                  </span>
                  <span>HSK {exam.hskLevel || 1}</span>
                  <span className="text-emerald-600 font-bold">Tự động chấm điểm</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <Link
                href={`/teacher/exams`}
                className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-50 transition-colors"
              >
                Xem đề
              </Link>
              <Link
                href={`/teacher/exam-statistics`}
                className="px-4 py-1.5 bg-[#1f5333] text-white rounded-xl text-xs font-black hover:bg-[#153a23] transition-colors"
              >
                Thống kê
              </Link>
            </div>
          </div>
        ))}

        {activeExams.length === 0 && pendingSpeakingCount === 0 && (
          <p className="text-sm text-gray-400 italic text-center py-6">
            Chưa có đề thi nào đang mở. Hãy bấm &quot;Tạo đề thi mới&quot; để bắt đầu.
          </p>
        )}
      </div>
    </div>
  );
}
