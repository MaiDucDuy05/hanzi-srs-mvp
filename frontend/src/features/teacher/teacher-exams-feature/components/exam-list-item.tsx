'use client';

import { FileText, Award, CheckCircle2, Calendar, Timer, Clock, Edit3, Eye, MoreVertical } from 'lucide-react';
import { Exam, ExamListItemProps, ExamStatus } from '../types';
import { getStatusColor, getStatusLabel, getIndicatorColor, formatDuration } from '../utils';

const STATUS_ICON_MAP: Record<ExamStatus, React.ElementType> = {
  DRAFT: FileText,
  ACTIVE: Award,
  COMPLETED: CheckCircle2,
};

interface ExamListItemPropsExtended extends ExamListItemProps {
  isEven?: boolean;
}

export function ExamListItem({
  exam,
  onEdit,
  onPreview,
  onDelete,
  isEven = false,
}: ExamListItemPropsExtended) {
  const statusColors = getStatusColor(exam.status);
  const indicatorColor = getIndicatorColor(exam.status);
  const StatusIcon = STATUS_ICON_MAP[exam.status];

  return (
    <div
      className={`rounded-2xl p-4 pr-5 border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-300 group cursor-pointer relative overflow-hidden ${
        isEven ? 'bg-gray-50 opacity-70' : 'bg-white hover:shadow-md hover:border-[#dde8a6]'
      }`}
    >
      {/* Left indicator bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl"
        style={{ backgroundColor: indicatorColor }}
      />

      {/* Main content */}
      <div className="flex items-center gap-4 pl-3">
        <div
          className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform ${
            exam.status === 'DRAFT'
              ? 'bg-[#fff4f4] text-[#e55353]'
              : exam.status === 'ACTIVE'
              ? 'bg-[#f4f7ed] text-[#78993a]'
              : 'bg-white border border-gray-200 text-gray-400'
          }`}
        >
          <StatusIcon className="h-6 w-6" />
        </div>

        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className={`font-bold text-[16px] group-hover:text-[${indicatorColor}] transition-colors ${exam.status === 'COMPLETED' ? 'text-gray-600' : 'text-[#1f5333]'}`}>
              {exam.title}
            </h3>
            <span
              className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider border"
              style={{
                backgroundColor: statusColors.bg,
                color: statusColors.text,
                borderColor: statusColors.border,
              }}
            >
              {getStatusLabel(exam.status)}
            </span>
          </div>
          <div className="flex items-center gap-4 text-[13px] text-gray-500 font-medium">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {exam.targetClass || 'All Classes'}
            </span>
            {exam.durationMinutes && (
              <span className="flex items-center gap-1.5">
                <Timer className="h-3.5 w-3.5" />
                {formatDuration(exam.durationMinutes)}
              </span>
            )}
            {exam.closingIn && (
              <span className="flex items-center gap-1.5 text-orange-500">
                <Clock className="h-3.5 w-3.5" />
                Closes in {exam.closingIn}
              </span>
            )}
            {exam.dueDate && (
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                {exam.dueDate}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 sm:opacity-0 group-hover:opacity-100 transition-opacity pl-15 sm:pl-0">
        {exam.status !== 'COMPLETED' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.(exam.id);
            }}
            className="p-2 text-gray-400 hover:text-[#1f5333] hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Edit3 className="h-4 w-4" />
          </button>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPreview?.(exam.id);
          }}
          className="p-2 text-gray-400 hover:text-[#1f5333] hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Eye className="h-4 w-4" />
        </button>
        {exam.status === 'DRAFT' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.(exam.id);
            }}
            className="p-2 text-gray-400 hover:text-[#1f5333] hover:bg-gray-100 rounded-lg transition-colors"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
