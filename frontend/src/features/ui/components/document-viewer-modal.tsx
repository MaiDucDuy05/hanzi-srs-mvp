'use client';

import { X, Download, ShieldAlert, Maximize, Minimize } from 'lucide-react';
import { useEffect, useState } from 'react';

interface DocumentViewerModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  url: string;
  fileKey: string;
  tier: 'FREE' | 'VIP' | 'PREMIUM';
}

export function DocumentViewerModal({ open, onClose, title, url, fileKey, tier }: DocumentViewerModalProps) {
  const [isRendered, setIsRendered] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(fileKey);
  const isPdf = /\.pdf$/i.test(fileKey);
  const isVip = tier === 'VIP' || tier === 'PREMIUM';

  // Chống body scroll khi mở modal
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => setIsRendered(true), 50);
    } else {
      document.body.style.overflow = 'unset';
      setIsRendered(false);
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300 ${isRendered ? 'opacity-100' : 'opacity-0'}`} 
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div 
        className={`relative bg-[#f8f9fa] shadow-2xl flex flex-col overflow-hidden transition-all duration-300 transform ${
          isRendered ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'
        } ${
          isFullscreen ? 'w-screen h-screen rounded-none' : 'w-full max-w-6xl h-[90vh] rounded-2xl m-4'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <h3 className="font-bold text-gray-800 text-lg truncate max-w-lg">{title}</h3>
            {isVip && (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200/50">
                <ShieldAlert className="w-3.5 h-3.5" />
                Tài liệu Bảo vệ (Không thể tải)
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {!isVip && (
              <a 
                href={url} 
                download
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-[#11321e] text-white rounded-lg text-sm font-bold hover:bg-[#1f4e31] transition-colors shadow-sm"
              >
                <Download className="w-4 h-4" />
                Tải xuống
              </a>
            )}
            <div className="h-6 w-px bg-gray-200 mx-1"></div>
            <button 
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              title={isFullscreen ? "Thu nhỏ" : "Phóng to toàn màn hình"}
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
            <button 
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Đóng"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden bg-[#ebeef0] relative group select-none" onContextMenu={(e) => isVip && e.preventDefault()}>
          {isVip && (
            <div className="absolute inset-0 z-10 pointer-events-none" /> /* Khối chặn click/right-click cho VIP */
          )}

          {isImage ? (
            <div className="w-full h-full flex items-center justify-center p-8 overflow-auto">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={url} 
                alt={title} 
                className="max-w-full max-h-full object-contain shadow-sm rounded-lg"
                draggable={!isVip}
              />
            </div>
          ) : isPdf ? (
            <iframe 
              src={`${url}#toolbar=0&navpanes=0&scrollbar=0`}
              className="w-full h-full border-none"
              title={title}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 gap-4">
              <ShieldAlert className="w-16 h-16 text-gray-300" />
              <p>Định dạng này không hỗ trợ xem trực tiếp trên Web.</p>
              {!isVip && (
                <a href={url} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">
                  Tải về máy để xem
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
