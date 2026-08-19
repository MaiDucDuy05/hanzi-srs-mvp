'use client';

import { Plus } from 'lucide-react';

interface FloatingActionButtonProps {
  onClick?: () => void;
  label?: string;
}

export function FloatingActionButton({
  onClick,
  label = 'New Exam',
}: FloatingActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-10 right-10 bg-[#1f5333] text-white px-7 py-4 rounded-full shadow-[0_8px_30px_rgba(31,83,51,0.3)] hover:bg-[#153f25] hover:shadow-[0_12px_40px_rgba(31,83,51,0.4)] hover:-translate-y-1 transition-all duration-300 flex items-center gap-2 font-bold z-50"
    >
      <Plus className="h-5 w-5" />
      {label}
    </button>
  );
}
