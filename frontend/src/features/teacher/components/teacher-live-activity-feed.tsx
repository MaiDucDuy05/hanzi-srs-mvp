'use client';

import Link from 'next/link';
import { Trophy, Lightbulb, FileText, CheckCircle2, ChevronRight } from 'lucide-react';

interface TeacherLiveActivityFeedProps {
  activities: any[];
}

export function TeacherLiveActivityFeed({ activities }: TeacherLiveActivityFeedProps) {
  return (
    <div className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-black text-[#1f5333] flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
          Hoạt động nộp bài
        </h3>
        <span className="text-[11px] font-bold text-gray-400">Trực tiếp</span>
      </div>

      <div className="space-y-3.5 max-h-[360px] overflow-y-auto pr-1">
        {activities.slice(0, 7).map((act, index) => {
          let Icon = FileText;
          let iconBg = 'bg-[#eaf3c5] text-[#1f5333]';
          let actionLabel = 'nộp bài';

          if (act.activityType === 'TEST_COMPLETED') {
            Icon = Trophy;
            iconBg = 'bg-amber-100 text-amber-700';
            actionLabel = `hoàn thành bài thi (${act.details?.score || 0}đ)`;
          } else if (act.activityType === 'PRACTICE_COMPLETED') {
            Icon = Lightbulb;
            iconBg = 'bg-emerald-100 text-emerald-700';
            actionLabel = 'luyện tập từ vựng Hanzi';
          }

          const studentName = act.user?.fullName || 'Học viên Panda';

          return (
            <div key={act.id || index} className="flex items-start gap-3 text-xs">
              <div className={`p-2 rounded-xl shrink-0 ${iconBg}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-gray-700 font-medium leading-tight">
                  <span className="font-bold text-[#1f5333]">{studentName}</span> {actionLabel}
                </p>
                <span className="text-[10px] text-gray-400 block mt-0.5 font-medium">
                  {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(act.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          );
        })}

        {activities.length === 0 && (
          <p className="text-xs text-gray-400 italic text-center py-4">Chưa có hoạt động nộp bài nào.</p>
        )}
      </div>

      {/* Box Mẹo sư phạm AI */}
      <div className="bg-[#fcfce8] border border-[#f3f4e1] rounded-2xl p-3.5 flex items-center justify-between gap-2 mt-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-[#eaf3c5] text-[#1f5333] rounded-xl shrink-0">
            <Lightbulb className="h-4 w-4" />
          </div>
          <p className="text-[11px] font-bold text-[#1f5333] leading-tight">
            Mẹo giảng dạy: Có 3 học sinh hay nhầm lẫn bộ thủ &quot;氵&quot; (Thủy) và &quot;冫&quot; (Băng).
          </p>
        </div>
        <ChevronRight className="h-4 w-4 text-gray-400 shrink-0" />
      </div>
    </div>
  );
}
