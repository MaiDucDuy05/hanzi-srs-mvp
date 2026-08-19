'use client';

import { useEffect, type ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
  className?: string;
}

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  wide,
  className,
}: ModalProps) {
  useEffect(() => {
    if (!open) return;

    // Khóa cuộn trang khi mở modal (Prevent body scroll)
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);

    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = originalStyle;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-opacity"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={typeof title === 'string' ? 'modal-title' : undefined}
    >
      <div
        className={cn(
          'relative flex max-h-[90vh] w-full flex-col rounded-2xl border border-gray-100 bg-white shadow-2xl transition-all',
          wide ? 'max-w-3xl' : 'max-w-md',
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {title ? (
          <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-6 py-4">
            <h3 id="modal-title" className="text-lg font-semibold text-gray-900">
              {title}
            </h3>
            <button
              onClick={onClose}
              aria-label="Đóng modal"
              className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          </div>
        ) : (
          <button
            onClick={onClose}
            aria-label="Đóng modal"
            className="absolute right-4 top-4 z-10 rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        )}

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {children}
        </div>

        {footer && (
          <div className="flex shrink-0 items-center justify-end gap-3 rounded-b-2xl border-t border-gray-100 bg-gray-50/50 px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
