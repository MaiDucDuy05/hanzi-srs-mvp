'use client';

import React, { useRef, useState, useEffect } from 'react';

export function StrokeGameFeature() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    // Just a placeholder drawing context setup
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Draw placeholder faint character
    ctx.font = '220px "Ma Shan Zheng", "KaiTi", sans-serif';
    ctx.fillStyle = '#e5f5eb';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('学', canvas.width / 2, canvas.height / 2 + 15);
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.beginPath();
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.strokeStyle = '#215b3b';
    ctx.lineWidth = 12;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Redraw faint character
    ctx.font = '220px "Ma Shan Zheng", "KaiTi", sans-serif';
    ctx.fillStyle = '#e5f5eb';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('学', canvas.width / 2, canvas.height / 2 + 15);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center w-full max-w-5xl mx-auto px-4 py-6 sm:py-8 relative z-10 h-full">
      <h1 className="text-3xl font-black text-[#215b3b] font-heading mb-4 drop-shadow-sm">Stroke Order Garden</h1>
      <p className="text-lg text-[#4a6b38] mb-8 font-medium">Trace the character below</p>
      
      <div className="bg-white p-4 sm:p-8 rounded-[2.5rem] shadow-xl border-4 border-[#eef7e9]">
        <canvas
          ref={canvasRef}
          width={300}
          height={300}
          className="border-2 border-dashed border-gray-300 rounded-2xl cursor-crosshair touch-none"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mt-8">
        <button 
          onClick={clearCanvas}
          className="px-8 py-3 bg-white text-[#215b3b] border-2 border-[#215b3b] text-lg font-bold rounded-full hover:bg-[#f9fdf5] transition-colors"
        >
          Clear Canvas
        </button>
        <button className="px-8 py-3 bg-[#aadd4a] text-white text-lg font-bold rounded-full shadow-md hover:bg-[#97cf34] transition-colors">
          Check Strokes
        </button>
      </div>
    </div>
  );
}
