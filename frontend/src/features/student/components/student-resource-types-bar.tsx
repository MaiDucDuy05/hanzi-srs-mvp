'use client';

import type { ResourceType } from '@/lib/api/types';

interface StudentResourceTypesBarProps {
  resourceTypes: ResourceType[];
  selectedTypeId: string;
  onSelect: (typeId: string) => void;
}

export function StudentResourceTypesBar({
  resourceTypes,
  selectedTypeId,
  onSelect,
}: StudentResourceTypesBarProps) {
  if (!resourceTypes || resourceTypes.length === 0) return null;

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
      {resourceTypes.map((type) => {
        const isSelected = selectedTypeId === type.id;
        return (
          <button
            key={type.id}
            type="button"
            onClick={() => onSelect(type.id)}
            className={`px-4 py-2 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer ${
              isSelected
                ? 'bg-[#215b3b] text-white shadow-sm'
                : 'bg-white text-gray-600 hover:bg-emerald-50 border border-gray-100 shadow-2xs'
            }`}
          >
            {type.name} ({type.resourceCount || 0})
          </button>
        );
      })}
    </div>
  );
}
