'use client';

import { FileText, ArrowRight, Loader2 } from 'lucide-react';
import { Badge } from '@/features/ui/components/badge';
import type { Resource } from '@/lib/api/types';

interface StudentResourceCardProps {
  resource: Resource;
  onClick: () => void;
  isDownloading?: boolean;
  defaultDescription?: string;
}

export function StudentResourceCard({
  resource,
  onClick,
  isDownloading = false,
  defaultDescription = 'Sách giáo khoa cơ bản cho người mới bắt đầu.',
}: StudentResourceCardProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      className={`group relative flex flex-row items-stretch bg-white rounded-[24px] sm:rounded-[28px] p-4 sm:p-5 hover:shadow-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-emerald-100/50 hover:border-emerald-200/80 transition-all duration-300 cursor-pointer hover:-translate-y-1 ${
        isDownloading ? 'opacity-70 pointer-events-none' : ''
      }`}
    >
      {/* Left: Book Cover Image */}
      <div className="w-[96px] sm:w-[108px] h-[134px] sm:h-[148px] shrink-0 bg-emerald-50 rounded-2xl overflow-hidden relative mr-4 sm:mr-5 flex items-center justify-center border border-emerald-100/70 shadow-xs group-hover:shadow-md transition-all duration-300">
        {resource.coverImageUrl ? (
          <img
            src={resource.coverImageUrl}
            alt={resource.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-emerald-400 bg-emerald-100/30">
            <FileText className="h-10 w-10 opacity-60" />
            <span className="text-[10px] font-bold text-emerald-700/60 mt-1">PDF</span>
          </div>
        )}
      </div>

      {/* Right: Content details */}
      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
        <div>
          {/* Top meta row: Category pill & Tier badge */}
          <div className="flex items-center justify-between gap-2 mb-2">
            {resource.resourceType ? (
              <span className="inline-block text-[11px] font-semibold text-[#215b3b] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100/80 truncate max-w-[200px]">
                {resource.resourceType.name}
              </span>
            ) : (
              <span />
            )}

            {resource.tier === 'VIP' ? (
              <Badge tone="amber" className="shrink-0 uppercase text-[10px] px-2.5 py-0.5 rounded-full font-bold tracking-wider shadow-xs">
                PREMIUM
              </Badge>
            ) : (
              <Badge tone="green" className="shrink-0 uppercase text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-[#43b97f] text-white tracking-wider shadow-xs border-none">
                FREE
              </Badge>
            )}
          </div>

          {/* Title: Full width available, no truncation for standard book titles */}
          <h3
            className="text-base sm:text-[17px] font-bold text-[#11321e] line-clamp-2 leading-snug tracking-tight group-hover:text-[#215b3b] transition-colors"
            title={resource.title}
          >
            {resource.title}
          </h3>

          {/* Description */}
          <p className="text-[13px] sm:text-[14px] text-gray-500 line-clamp-2 leading-relaxed mt-1.5">
            {resource.description || defaultDescription}
          </p>
        </div>

        {/* Bottom action indicator */}
        <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-emerald-50 text-xs">
          <span className="text-gray-400 font-medium flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-emerald-600/70" />
            <span>Tài liệu tham khảo</span>
          </span>

          {isDownloading ? (
            <span className="text-emerald-700 font-bold flex items-center gap-1">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Đang mở...</span>
            </span>
          ) : (
            <span className="text-[#215b3b] font-bold inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
              <span>Xem sách</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
