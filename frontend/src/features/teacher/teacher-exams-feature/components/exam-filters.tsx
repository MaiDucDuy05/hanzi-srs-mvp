'use client';

import { ExamFilter } from '../types';

interface ExamFiltersProps {
  filters: ExamFilter[];
  activeFilter: ExamFilter;
  onFilterChange: (filter: ExamFilter) => void;
}

export function ExamFilters({ filters, activeFilter, onFilterChange }: ExamFiltersProps) {
  return (
    <div className="flex bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
      {filters.map((filter) => (
        <button
          key={filter}
          onClick={() => onFilterChange(filter)}
          className={`px-5 py-2 rounded-lg text-[13px] font-bold transition-all ${
            activeFilter === filter
              ? 'bg-[#1f5333] text-white shadow-sm'
              : 'text-gray-500 hover:text-[#1f5333] hover:bg-gray-50'
          }`}
        >
          {filter}
        </button>
      ))}
    </div>
  );
}
