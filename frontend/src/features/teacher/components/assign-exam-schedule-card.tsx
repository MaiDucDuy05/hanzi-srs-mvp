import React from 'react';
import { Calendar, Clock, Zap, FileEdit, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface AssignExamScheduleCardProps {
  startTime: string;
  setStartTime: (val: string) => void;
  endTime: string;
  setEndTime: (val: string) => void;
  statusOnSubmit: 'GRADED' | 'SUBMITTED';
  setStatusOnSubmit: (val: 'GRADED' | 'SUBMITTED') => void;
  onApplyPreset: (hours: number) => void;
}

export function AssignExamScheduleCard({
  startTime,
  setStartTime,
  endTime,
  setEndTime,
  statusOnSubmit,
  setStatusOnSubmit,
  onApplyPreset,
}: AssignExamScheduleCardProps) {
  const presets = [
    { label: '24 giờ', hours: 24 },
    { label: '3 ngày', hours: 72 },
    { label: '7 ngày', hours: 168 },
    { label: '14 ngày', hours: 336 },
  ];

  return (
    <div className="space-y-5 bg-[#fcfdfa] p-4 sm:p-5 rounded-2xl border border-gray-100">
      {/* Thời gian làm bài */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold uppercase tracking-wider text-[#1f5333] flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#78993a]" />
            Thời hạn làm bài
          </label>
          <span className="text-[11px] text-gray-400 font-medium">Cài đặt giờ mở & đóng</span>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-1.5 mb-3">
          <span className="text-[11px] text-gray-500 font-medium mr-1">Hạn nhanh:</span>
          <div className="flex flex-wrap gap-1.5 flex-1">
            {presets.map((p) => (
              <button
                key={p.hours}
                type="button"
                onClick={() => onApplyPreset(p.hours)}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white border border-gray-200 text-gray-600 hover:border-[#78993a] hover:text-[#1f5333] hover:bg-[#f4f7ed] transition-all"
              >
                +{p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2.5">
          <div>
            <span className="text-xs text-gray-600 font-medium block mb-1">Thời gian bắt đầu</span>
            <input
              type="datetime-local"
              required
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:border-[#78993a] focus:ring-1 focus:ring-[#78993a] transition-all text-gray-700"
            />
          </div>
          <div>
            <span className="text-xs text-gray-600 font-medium block mb-1">Thời gian kết thúc (Hạn chót)</span>
            <input
              type="datetime-local"
              required
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:border-[#78993a] focus:ring-1 focus:ring-[#78993a] transition-all text-gray-700"
            />
          </div>
        </div>
      </div>

      {/* Chế độ chấm điểm */}
      <div className="pt-3 border-t border-gray-100">
        <label className="text-xs font-bold uppercase tracking-wider text-[#1f5333] flex items-center gap-1.5 mb-2.5">
          <Sparkles className="w-3.5 h-3.5 text-[#78993a]" />
          Chế độ chấm bài
        </label>
        <div className="grid grid-cols-1 gap-2.5">
          <div
            onClick={() => setStatusOnSubmit('GRADED')}
            className={cn(
              'p-3 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3',
              statusOnSubmit === 'GRADED'
                ? 'border-[#78993a] bg-[#f4f7ed]/70 shadow-xs'
                : 'border-gray-200 bg-white hover:border-gray-300'
            )}
          >
            <div
              className={cn(
                'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5',
                statusOnSubmit === 'GRADED' ? 'bg-[#78993a] text-white' : 'bg-gray-100 text-gray-500'
              )}
            >
              <Zap className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-900">Tự động chấm điểm</span>
                <span className="text-[10px] uppercase font-bold text-[#78993a] bg-white px-1.5 py-0.5 rounded border border-[#78993a]/30">
                  Khuyên dùng
                </span>
              </div>
              <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">
                Hệ thống chấm ngay sau khi nộp, phù hợp câu hỏi trắc nghiệm.
              </p>
            </div>
          </div>

          <div
            onClick={() => setStatusOnSubmit('SUBMITTED')}
            className={cn(
              'p-3 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3',
              statusOnSubmit === 'SUBMITTED'
                ? 'border-[#78993a] bg-[#f4f7ed]/70 shadow-xs'
                : 'border-gray-200 bg-white hover:border-gray-300'
            )}
          >
            <div
              className={cn(
                'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5',
                statusOnSubmit === 'SUBMITTED' ? 'bg-[#78993a] text-white' : 'bg-gray-100 text-gray-500'
              )}
            >
              <FileEdit className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-xs font-bold text-gray-900">Chờ giáo viên chấm thủ công</span>
              <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">
                Phù hợp với bài thi có phần tự luận viết câu hoặc ghi âm giọng nói.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
