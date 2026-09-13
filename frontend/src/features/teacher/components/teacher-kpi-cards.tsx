'use client';

import Link from 'next/link';
import { Users, FileCheck, Database, CheckCircle2 } from 'lucide-react';

interface TeacherKpiCardsProps {
  studentsCount: number;
  totalStudents: number;
  examsTotal: number;
  examsActive: number;
  examsDraft: number;
  questionsTotal: number;
  accuracyRate: number;
}

export function TeacherKpiCards({
  studentsCount,
  totalStudents,
  examsTotal,
  examsActive,
  examsDraft,
  questionsTotal,
  accuracyRate,
}: TeacherKpiCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {/* 1. Học sinh tích cực */}
      <Link 
        href="/teacher/students"
        className="block bg-white rounded-[24px] p-5 border border-gray-100/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group"
      >
        <div className="flex justify-between items-start mb-3">
          <span className="text-[12px] font-extrabold tracking-wider text-gray-500 uppercase group-hover:text-[#1f5333] transition-colors">Học Sinh Tích Cực</span>
          <div className="p-2.5 bg-[#eaf3c5] text-[#1f5333] rounded-2xl group-hover:scale-110 transition-transform">
            <Users className="h-5 w-5" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black text-[#1f5333]">{String(studentsCount).padStart(2, '0')}</span>
          <span className="text-xs font-semibold text-gray-400">/ {totalStudents} học sinh</span>
        </div>
        <p className="text-[11px] font-bold text-emerald-600 mt-2 flex items-center gap-1">
          <span>●</span> Đang tham gia ôn luyện
        </p>
      </Link>

      {/* 2. Đề thi đã soạn */}
      <Link
        href="/teacher/exams"
        className="block bg-white rounded-[24px] p-5 border border-gray-100/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group"
      >
        <div className="flex justify-between items-start mb-3">
          <span className="text-[12px] font-extrabold tracking-wider text-gray-500 uppercase group-hover:text-[#1f5333] transition-colors">Đề Thi Đã Soạn</span>
          <div className="p-2.5 bg-[#fef3c7] text-[#d97706] rounded-2xl group-hover:scale-110 transition-transform">
            <FileCheck className="h-5 w-5" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black text-[#1f5333]">{String(examsTotal).padStart(2, '0')}</span>
          <span className="text-xs font-semibold text-gray-400">bộ đề thi</span>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#eaf3c5] text-[#1f5333]">
            {examsActive} đang mở
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-gray-100 text-gray-600">
            {examsDraft} bản nháp
          </span>
        </div>
      </Link>

      {/* 3. Kho ngân hàng câu */}
      <Link 
        href="/teacher/questions"
        className="block bg-white rounded-[24px] p-5 border border-gray-100/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group"
      >
        <div className="flex justify-between items-start mb-3">
          <span className="text-[12px] font-extrabold tracking-wider text-gray-500 uppercase group-hover:text-[#1f5333] transition-colors">Kho Ngân Hàng Câu</span>
          <div className="p-2.5 bg-[#dbeafe] text-[#2563eb] rounded-2xl group-hover:scale-110 transition-transform">
            <Database className="h-5 w-5" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black text-[#1f5333]">{questionsTotal}</span>
          <span className="text-xs font-semibold text-gray-400">câu hỏi Hanzi/HSK</span>
        </div>
        <p className="text-[11px] font-bold text-gray-500 mt-2">
          Sẵn sàng tạo đề thi tự động
        </p>
      </Link>

      {/* 4. Tỷ lệ hoàn thành / đúng chuẩn */}
      <Link 
        href="/teacher/exam-statistics"
        className="block bg-white rounded-[24px] p-5 border border-gray-100/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group"
      >
        <div className="flex justify-between items-start mb-3">
          <span className="text-[12px] font-extrabold tracking-wider text-gray-500 uppercase group-hover:text-[#1f5333] transition-colors">Tỷ Lệ Đạt Chuẩn</span>
          <div className="p-2.5 bg-[#dcfce7] text-[#16a34a] rounded-2xl group-hover:scale-110 transition-transform">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black text-[#1f5333]">{accuracyRate}%</span>
          <span className="text-xs font-bold text-emerald-600">{accuracyRate >= 60 ? 'Tốt' : 'Đang cải thiện'}</span>
        </div>
        <div className="w-full bg-gray-100 h-2 rounded-full mt-2.5 overflow-hidden">
          <div 
            className="bg-[#78993a] h-full rounded-full transition-all duration-500" 
            style={{ width: `${Math.min(100, Math.max(accuracyRate > 0 ? 10 : 0, accuracyRate))}%` }}
          />
        </div>
      </Link>
    </div>
  );
}
