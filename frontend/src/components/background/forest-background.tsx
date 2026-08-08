import React from 'react';
import { Blob } from '@/components/home/panda-decoration';
import { FloatingLeaves } from './floating-leaves';

interface ForestBackgroundProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Nền rừng tre organic có thể tái sử dụng cho các trang khác.
 * Bao gồm:
 * - Màu nền xanh nhạt
 * - 3 Blobs ở các góc
 * - Lá tĩnh (hoặc động) ở 4 góc
 */
export function ForestBackground({ children, className }: ForestBackgroundProps) {
  return (
    <div className={`relative min-h-screen overflow-hidden bg-[#dffce8] ${className ?? ''}`}>
      {/* Lớp Background tĩnh nằm dưới cùng */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <FloatingLeaves />
        <Blob className="absolute -left-16 -top-16 h-[300px] w-[350px] opacity-100 sm:-left-24 sm:-top-24 sm:h-[400px] sm:w-[500px]" fill="#d7e9c1" />
        <Blob className="absolute -right-16 -top-16 h-[300px] w-[350px] scale-x-[-1] opacity-100 sm:-right-24 sm:-top-24 sm:h-[400px] sm:w-[500px]" fill="#d7e9c1" />
        <Blob className="absolute -bottom-16 -right-16 h-[300px] w-[350px] scale-x-[-1] scale-y-[-1] opacity-100 sm:-bottom-24 sm:-right-24 sm:h-[400px] sm:w-[500px]" fill="#d7e9c1" />
        
      </div>
      
      {/* Nội dung trang */}
      {children}
    </div>
  );
}
