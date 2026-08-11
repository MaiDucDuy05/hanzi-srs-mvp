import React from 'react';

interface BambooProgressBarProps {
  progress: number; // 0 to 100
  className?: string;
  label?: string; // Optional custom text instead of percentage
  hidePanda?: boolean; // Hide the moving panda icon
  labelClassName?: string; // Custom classes for the label
}

export function BambooProgressBar({ progress, className = '', label, hidePanda, labelClassName }: BambooProgressBarProps) {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  // Tweak these values to perfect the bamboo alignment
  const TILT_ANGLE = '6deg'; // Flattens the upward tilt
  const IMAGE_WIDTH = 260; // Scale of the SVG
  const SEGMENT_ADVANCE = 180; // Distance between segments. Reduced to 110px to perfectly overlap and hide gaps!

  // Renders a track of 6 stitched bamboo segments
  const renderTrack = (isFilled: boolean) => (
    <div className="absolute left-0 top-0 w-[1000px] h-full flex items-center">
      {[...Array(10)].map((_, i) => (
        <div 
          key={i} 
          className="relative h-full shrink-0 overflow-visible"
          style={{ width: `${SEGMENT_ADVANCE}px`, marginLeft: i === 0 ? '-10px' : '0px' }}
        >
          <div 
            className="absolute left-0 top-0 h-full"
            style={{ width: `${IMAGE_WIDTH}px`, transform: `rotate(${TILT_ANGLE})` }}
          >
            <img 
              src="/assets/illustrations/bamboo/bamboo_process.svg" 
              alt={isFilled ? "Bamboo Fill" : "Bamboo Track"}
              className={`absolute max-w-none ${isFilled ? 'drop-shadow-md' : 'opacity-90 drop-shadow-sm'}`} 
              style={{ 
                width: `${IMAGE_WIDTH}px`,
                top: '50%', 
                left: 0,
                transform: `translateY(${isFilled ? '-70.2%' : '-24.1%'})` 
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className={`relative flex flex-col items-center justify-center w-full max-w-3xl mx-auto h-[120px] ${className}`}>
      
      {/* Track wrapper with overflow-hidden for clean edges */}
      <div className="absolute left-0 w-full h-[100px] top-1/2 -translate-y-1/2 overflow-hidden pointer-events-none mask-image-edges">
        {/* Unfilled track */}
        <div className="absolute inset-0 w-full h-full left-0 top-0">
          {renderTrack(false)}
        </div>
        
        {/* Filled track */}
        <div 
          className="absolute inset-0 w-full h-full transition-all duration-500 z-10 left-0 top-0" 
          style={{ clipPath: `inset(0 ${100 - clampedProgress}% 0 0)` }}
        >
          {renderTrack(true)}
        </div>
      </div>
      
      {/* Panda Icon */}
      {!hidePanda && (
        <div 
          className="absolute z-20 transition-all duration-500" 
          style={{ top: '50%', left: `${clampedProgress}%`, transform: 'translate(-50%, -50%)' }}
        >
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full flex items-center justify-center shadow-[0_3px_10px_rgba(0,0,0,0.15)] border-2 border-[#eef7e9] text-xl sm:text-2xl">
            🐼
          </div>
        </div>
      )}

      <span className={`font-bold text-sm sm:text-base absolute z-20 px-3 py-0.5 rounded-full whitespace-nowrap ${labelClassName || 'bottom-0 text-[#4a6b38] bg-white/80 backdrop-blur-sm shadow-sm'}`}>
        {label || `${Math.round(clampedProgress)}%`}
      </span>
    </div>
  );
}
