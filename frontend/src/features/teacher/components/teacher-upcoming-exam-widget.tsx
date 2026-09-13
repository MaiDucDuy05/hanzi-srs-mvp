'use client';

import Link from 'next/link';
import { Calendar, Clock, ArrowUpRight } from 'lucide-react';
import type { Test } from '@/lib/api/types';

interface TeacherUpcomingExamWidgetProps {
  featuredExam?: Test | null;
  studentCount: number;
}

export function TeacherUpcomingExamWidget({ featuredExam, studentCount }: TeacherUpcomingExamWidgetProps) {
  const examName = featuredExam?.name || 'Đề Thi Thử HSK Chuẩn BLCU';
  const duration = featuredExam?.timeLimitMinutes || 45;

  return (
    <div className="bg-[#1f5333] text-white rounded-[32px] p-6 shadow-md relative overflow-hidden flex flex-col justify-between">
      {/* Background cute panda decoration */}
      <div className="absolute -right-8 -bottom-8 opacity-15 pointer-events-none">
        <img 
          src="/assets/illustrations/panda/panda.png" 
          alt="Panda" 
          className="w-48 h-48 object-contain"
        />
      </div>

      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold bg-[#eaf3c5] text-[#1f5333] tracking-wide">
            <Calendar className="h-3 w-3" />
            LỊCH THI MỞ GẦN NHẤT
          </span>
          <span className="text-[11px] text-[#eaf3c5] font-bold">
            {studentCount} học viên đăng ký
          </span>
        </div>

        <h3 className="text-lg font-black tracking-tight leading-snug text-[#fcfce8] mb-2">
          {examName}
        </h3>

        <p className="text-xs text-emerald-100/80 font-medium leading-relaxed mb-6">
          Thời gian làm bài: {duration} phút • Chấm điểm tự động và gửi kết quả cho học sinh ngay khi nộp bài.
        </p>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-emerald-800/80">
        <div>
          <span className="text-[10px] uppercase font-bold text-emerald-300 block">Trạng thái</span>
          <span className="text-xs font-black text-[#eaf3c5]">Sẵn sàng làm bài</span>
        </div>

        <Link
          href="/teacher/exams"
          className="px-4 py-2 bg-[#eaf3c5] text-[#1f5333] hover:bg-white rounded-xl text-xs font-black transition-colors shadow-sm flex items-center gap-1.5"
        >
          Vào phòng thi
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
