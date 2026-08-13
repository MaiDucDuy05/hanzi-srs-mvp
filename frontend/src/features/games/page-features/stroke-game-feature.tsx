'use client';

import React, { useRef, useState, useEffect } from 'react';
import { PenTool } from 'lucide-react';

export function StrokeGameFeature() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [speed, setSpeed] = useState<'slow' | 'normal' | 'fast'>('normal');

  useEffect(() => {
    // Just a placeholder drawing context setup
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Draw placeholder faint character "永" (eternity), a classic character for calligraphy
    ctx.font = '280px "Ma Shan Zheng", "KaiTi", sans-serif';
    ctx.fillStyle = '#e5e7eb';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('永', canvas.width / 2, canvas.height / 2 + 15);
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
    
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    ctx.moveTo((clientX - rect.left) * scaleX, (clientY - rect.top) * scaleY);
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
    
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    ctx.lineTo((clientX - rect.left) * scaleX, (clientY - rect.top) * scaleY);
    ctx.strokeStyle = '#333'; // Ink color
    ctx.lineWidth = 20;
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
    ctx.font = '280px "Ma Shan Zheng", "KaiTi", sans-serif';
    ctx.fillStyle = '#e5e7eb';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('永', canvas.width / 2, canvas.height / 2 + 15);
  };

  return (
    <div className="w-full min-h-screen bg-[#f9f8f4] text-[#333] font-sans flex flex-col items-center py-10 px-4 relative overflow-hidden">
      {/* Paper texture overlay (simulated) */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-multiply" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/rice-paper.png")' }}></div>

      <div className="max-w-4xl w-full relative z-10">
        {/* Header */}
        <div className="flex items-center gap-3 border-b-2 border-[#d0c9b7] pb-3 mb-8">
          <PenTool className="w-7 h-7 text-[#5a5038]" />
          <h1 className="text-2xl font-bold text-[#2c281e]">Stroke Order Writing Practice</h1>
        </div>

        {/* Main Content */}
        <div className="flex flex-col md:flex-row gap-10 justify-center items-start mb-8">
          
          {/* Left: Tian Zi Ge Canvas */}
          <div className="flex flex-col items-center">
            <h2 className="text-[#5a5038] mb-3 text-sm font-medium">Tian Zi Ge</h2>
            <div className="relative bg-white border-2 border-[#8b7e66] w-[400px] h-[400px] shadow-sm">
              {/* Grid Lines */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-0 w-full border-t-2 border-dashed border-[#c6bcab]"></div>
                <div className="absolute left-1/2 top-0 h-full border-l-2 border-dashed border-[#c6bcab]"></div>
              </div>
              <canvas
                ref={canvasRef}
                width={400}
                height={400}
                className="relative z-10 w-full h-full cursor-crosshair touch-none"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
            </div>
            <button 
              onClick={clearCanvas}
              className="mt-5 px-6 py-2 text-sm bg-white border border-[#d0c9b7] rounded-full text-[#5a5038] hover:bg-[#f0ebe1] transition-colors"
            >
              Clear Canvas
            </button>
          </div>

          {/* Right: Animation Preview */}
          <div className="bg-[#f3efdf] border-2 border-[#d0c9b7] p-5 rounded-lg shadow-sm w-[280px] flex flex-col items-center relative">
            {/* Corner decorations */}
            <div className="absolute top-1.5 left-1.5 w-4 h-4 border-t-[3px] border-l-[3px] border-[#a3977c]"></div>
            <div className="absolute top-1.5 right-1.5 w-4 h-4 border-t-[3px] border-r-[3px] border-[#a3977c]"></div>
            <div className="absolute bottom-1.5 left-1.5 w-4 h-4 border-b-[3px] border-l-[3px] border-[#a3977c]"></div>
            <div className="absolute bottom-1.5 right-1.5 w-4 h-4 border-b-[3px] border-r-[3px] border-[#a3977c]"></div>

            <h3 className="text-sm font-bold text-[#5a5038] mb-4">Animation Preview</h3>
            
            <div className="relative bg-white border-2 border-[#a3977c] w-[180px] h-[180px] mb-5">
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-0 w-full border-t border-dashed border-[#c6bcab]"></div>
                <div className="absolute left-1/2 top-0 h-full border-l border-dashed border-[#c6bcab]"></div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center text-[120px] text-[#222] font-['Ma_Shan_Zheng','KaiTi',sans-serif]">
                永
              </div>
            </div>

            <div className="flex gap-2 w-full mb-4">
              {(['slow', 'normal', 'fast'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  className={`flex-1 py-1.5 text-xs font-medium rounded border transition-colors capitalize ${
                    speed === s ? 'bg-[#8b7e66] text-white border-[#8b7e66]' : 'bg-white text-[#5a5038] border-[#a3977c] hover:bg-[#e8e2d2]'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            <button className="w-full py-2.5 bg-[#e8e2d2] border border-[#a3977c] rounded text-sm font-semibold text-[#4a422e] hover:bg-[#d6ceb8] transition-colors">
              Play Demo
            </button>
          </div>
        </div>

        {/* FSRS Feedback Bar */}
        <div className="bg-[#edeae0] border-2 border-[#d0c9b7] rounded-xl p-4 mt-8">
          <div className="text-center text-sm text-[#5a5038] mb-3 font-semibold">FSRS feedback</div>
          <div className="flex gap-3 h-12">
            <button className="flex-1 bg-[#d32f2f] hover:bg-[#b71c1c] text-white rounded-lg font-bold transition-all hover:-translate-y-0.5 shadow-sm">Again</button>
            <button className="flex-1 bg-[#e67e22] hover:bg-[#d35400] text-white rounded-lg font-bold transition-all hover:-translate-y-0.5 shadow-sm">Hard</button>
            <button className="flex-1 bg-[#f1c40f] hover:bg-[#f39c12] text-white rounded-lg font-bold transition-all hover:-translate-y-0.5 shadow-sm">Good</button>
            <button className="flex-1 bg-[#4caf50] hover:bg-[#388e3c] text-white rounded-lg font-bold transition-all hover:-translate-y-0.5 shadow-sm">Easy</button>
          </div>
        </div>

      </div>
    </div>
  );
}
