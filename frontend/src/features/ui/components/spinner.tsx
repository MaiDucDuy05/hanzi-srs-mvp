'use client';

import { cn } from '@/lib/utils/cn';
import { useEffect, useState } from 'react';

export function Spinner({ className }: { className?: string }) {
  return (
    <div
      role="status"
      aria-label="Đang tải"
      className={cn(
        'inline-block h-8 w-8 animate-spin rounded-full border-[3px] border-[#eaf3c5] border-t-[#78993a]',
        className,
      )}
    />
  );
}

const LOADING_STATES = [
  { text: 'Đang chuẩn bị bài học...', image: '/assets/illustrations/panda/panda.png' },
  { text: 'Gấu trúc đang tìm tài liệu...', image: '/assets/illustrations/panda/panda-eating.svg' },
  { text: 'Vui lòng đợi một chút nhé...', image: '/assets/illustrations/panda/panda-standing.svg' },
  { text: 'Đang mài mực viết Hán tự...', image: '/assets/illustrations/panda/panda-in-bamboo.svg' },
  { text: 'Đang xếp lại thẻ Flashcard...', image: '/assets/illustrations/panda/panda-with-accessory.svg' },
  { text: 'Đang tải dữ liệu...', image: '/assets/illustrations/panda/panda_shoot.png' }
];

export function PageLoading({ label }: { label?: string }) {
  const [stateIndex, setStateIndex] = useState(0);

  useEffect(() => {
    if (label) return;
    const interval = setInterval(() => {
      setStateIndex((prev) => (prev + 1) % LOADING_STATES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [label]);

  const currentState = label ? { text: label, image: LOADING_STATES[0].image } : LOADING_STATES[stateIndex];

  return (
    <div className="flex min-h-[40vh] w-full flex-col items-center justify-center gap-8">
      <div className="relative flex items-center justify-center">
        {/* Outer glowing rings */}
        <div className="absolute h-32 w-32 animate-ping rounded-full bg-[#78993a] opacity-20" style={{ animationDuration: '3s' }}></div>
        <div className="absolute h-24 w-24 animate-pulse rounded-full bg-[#c2df7a] opacity-60" style={{ animationDuration: '2s' }}></div>
        
        {/* Center Icon */}
        <div className="relative z-10 flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-xl shadow-[#78993a]/20 border-2 border-[#eaf3c5] overflow-hidden p-3">
          <img 
            src={currentState.image} 
            alt="Loading Panda" 
            className="animate-bounce object-contain w-full h-full" 
            style={{ animationDuration: '2s' }} 
          />
        </div>
      </div>
      
      <div className="flex flex-col items-center gap-3">
        <h3 className="font-[family-name:var(--font-nunito)] text-lg font-bold text-[#215b3b] animate-pulse">
          {currentState.text}
        </h3>
        <div className="flex gap-1.5">
          <span className="h-2 w-2 animate-bounce rounded-full bg-[#78993a] opacity-80 [animation-delay:-0.3s]"></span>
          <span className="h-2 w-2 animate-bounce rounded-full bg-[#78993a] opacity-80 [animation-delay:-0.15s]"></span>
          <span className="h-2 w-2 animate-bounce rounded-full bg-[#78993a] opacity-80"></span>
        </div>
      </div>
    </div>
  );
}
