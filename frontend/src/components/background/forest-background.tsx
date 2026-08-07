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
        
        {/* Panda Illustration (Background mascot) */}
        <div className="absolute inset-0 z-0 mx-auto w-full max-w-5xl">
          <div className="absolute left-0 top-1/2 flex w-full -translate-y-1/2 items-center justify-center opacity-30 lg:w-1/2 lg:opacity-100">
            <img
              src="/assets/illustrations/panda/panda-on-meadow.svg"
              alt="Panda"
              className="relative z-10 h-[350px] w-auto object-contain drop-shadow-xl sm:h-[450px] lg:h-[450px]"
            />
          </div>
        </div>
      </div>
      
      {/* Nội dung trang */}
      {children}
    </div>
  );
}
