'use client';

import React from 'react';
import { Trash2, X } from 'lucide-react';

interface VocabulariesBulkActionBarProps {
  selectedCount: number;
  bulkDeleting: boolean;
  onClearSelection: () => void;
  onBulkDelete: () => void;
}

export function VocabulariesBulkActionBar({
  selectedCount,
  bulkDeleting,
  onClearSelection,
  onBulkDelete,
}: VocabulariesBulkActionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#f5f7db] border border-[#c7cf35]/60 px-4 py-3 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-200 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="inline-flex items-center justify-center bg-[#11321e] text-[#c7cf35] font-bold text-xs px-2.5 py-1 rounded-full shadow-sm">
          {selectedCount}
        </span>
        <span className="text-sm font-semibold text-[#11321e]">
          Đã chọn {selectedCount} từ vựng
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onClearSelection}
          disabled={bulkDeleting}
          className="flex items-center gap-1 px-3.5 py-1.5 text-xs font-semibold text-gray-700 hover:text-gray-950 bg-white border border-gray-200 rounded-full hover:bg-gray-50 disabled:opacity-50 transition-colors shadow-sm"
        >
          <X className="h-3 w-3" />
          Bỏ chọn
        </button>
        <button
          type="button"
          onClick={onBulkDelete}
          disabled={bulkDeleting}
          className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-full transition-all shadow-sm"
        >
          <Trash2 className="h-3.5 w-3.5" />
          {bulkDeleting ? 'Đang xóa...' : `Xóa ${selectedCount} từ đã chọn`}
        </button>
      </div>
    </div>
  );
}
