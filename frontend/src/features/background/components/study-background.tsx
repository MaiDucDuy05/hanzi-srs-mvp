import React from 'react';
import { FloatingLeaves } from './floating-leaves';

interface StudyBackgroundProps {
  children: React.ReactNode;
  className?: string;
}

const BackgroundWave = () => (
  <svg 
    className="absolute bottom-0 left-0 w-full h-[70vh] text-[#f9f6e7] fill-current" 
    viewBox="0 0 1440 700" 
    preserveAspectRatio="none"
  >
    <path d="M0,700 L1440,700 L1440,40 C1300,200 1200,100 1080,250 C960,400 840,370 720,370 C600,370 480,400 360,250 C240,100 140,200 0,40 Z" />
  </svg>
);


export function StudyBackground({ children, className }: StudyBackgroundProps) {
  return (
    <div className={`relative min-h-screen bg-[#cbf2df] ${className ?? ''}`}>
      {/* Lớp Background tĩnh nằm dưới cùng */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        {/* Wavy shape at the bottom */}
        <BackgroundWave />

        {/* Floating leaves should be on top of the wave */}
        <FloatingLeaves />
        <FloatingLeaves type={2} />
      </div>
      
      {/* Nội dung trang */}
      {children}
    </div>
  );
}
