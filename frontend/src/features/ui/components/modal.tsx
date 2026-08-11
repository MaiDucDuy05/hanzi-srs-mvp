'use client';

import { useEffect, type ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

export function Modal({
 open,
 onClose,
 title,
 children,
 footer,
 wide,
}: {
 open: boolean;
 onClose: () => void;
 title: string;
 children: ReactNode;
 footer?: ReactNode;
 wide?: boolean;
}) {
 useEffect(() => {
 if (!open) return;
 const onKey = (e: KeyboardEvent) => {
 if (e.key === 'Escape') onClose();
 };
 window.addEventListener('keydown', onKey);
 return () => window.removeEventListener('keydown', onKey);
 }, [open, onClose]);

 if (!open) return null;

 return (
 <div
 className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
 onClick={onClose}
 role="dialog"
 aria-modal="true"
 >
 <div
 className={cn(
 'w-full rounded-3xl border border-light-bamboo bg-white shadow-lift',
 wide ? 'max-w-2xl' : 'max-w-md',
 )}
 onClick={(e) => e.stopPropagation()}
 >
 <div className="flex items-center justify-between border-b border-light-bamboo px-5 py-4">
 <h3 className="font-semibold text-foreground">{title}</h3>
 <button
 onClick={onClose}
 aria-label="Đóng"
 className="rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
 >
 ✕
 </button>
 </div>
 <div className="max-h-[70vh] overflow-y-auto px-5 py-4">{children}</div>
 {footer && (
 <div className="flex justify-end gap-2 border-t border-light-bamboo px-5 py-3">
 {footer}
 </div>
 )}
 </div>
 </div>
 );
}
