'use client';

import { useEffect, useRef, useState } from 'react';
import { PenTool } from 'lucide-react';
import { WritingSec, type WritingCtx as WritingState } from '../sec/writing-sec';
import type { QuestionItem, ModeResult } from '../../practice/components/practice-models';
import { HanziWriterCanvas } from './hanzi-writer-canvas';
import { HanziWriterAnimation } from './hanzi-writer-animation';
import { AudioButton } from '@/features/ui/components/audio-button';
import { loadCharData } from '@/lib/hanzi/char-data-loader';

export { WritingState };

interface WritingModeProps {
  items: readonly QuestionItem[];
  initialState?: WritingState | null;
  onStateChange: (state: WritingState) => void;
  onComplete: (result: ModeResult) => void;
}

function createInitCtx(items: readonly QuestionItem[]): WritingState {
  return {
    phase: 'idle', charIndex: 0, totalChars: items.length,
    currentHanzi: items[0]?.hanzi ?? '', currentPinyin: items[0]?.pinyin ?? '',
    currentMeaning: items[0]?.meaning ?? '',
    correctCount: 0, wrongCount: 0, moves: 0, feedback: null, charResults: [],
  };
}

export function WritingMode({ items, initialState, onStateChange, onComplete }: WritingModeProps) {
  const secRef = useRef<WritingSec | null>(null);
  const [ctx, setCtx] = useState<WritingState>(() => initialState ?? createInitCtx(items));
  const [speed, setSpeed] = useState<'slow' | 'normal' | 'fast'>('normal');
  const [key, setKey] = useState(0);

  const onCompleteRef = useRef(onComplete);
  const onStateChangeRef = useRef(onStateChange);
  useEffect(() => {
    onCompleteRef.current = onComplete;
    onStateChangeRef.current = onStateChange;
  }, [onComplete, onStateChange]);

  useEffect(() => {
    const sec = new WritingSec(items);
    secRef.current = sec;
    const unsubComplete = sec.onComplete.addListener((data) => {
      onCompleteRef.current({
        correctCount: data.correct, wrongCount: data.wrong,
        moveCount: data.correct + data.wrong, score: data.score,
        answerData: { chars: data.charResults },
      });
    });
    const interval = setInterval(() => { if (secRef.current) setCtx(secRef.current.getState()); }, 50);
    const initCtx = sec.start();
    setCtx(initCtx);
    onStateChangeRef.current(initCtx);
    return () => { clearInterval(interval); unsubComplete(); sec.destroy(); };
  }, [items]);

  const handleComplete = (mistakes = 0) => secRef.current?.complete(mistakes);
  const handleSkip = () => secRef.current?.skip();
  const clearCanvas = () => setKey(k => k + 1);

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] bg-[#f9f8f4] text-[#333] font-sans flex flex-col items-center py-10 px-4 relative overflow-hidden rounded-xl border border-[#e8e2d2]">
      {/* Paper texture */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-multiply" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/rice-paper.png")' }} />

      <div className="max-w-4xl w-full relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-[#d0c9b7] pb-3 mb-8">
          <div className="flex items-center gap-3">
            <PenTool className="w-7 h-7 text-[#5a5038]" />
            <h1 className="text-2xl font-bold text-[#2c281e]">Luyện viết chữ Hán</h1>
          </div>
          <div className="text-sm font-semibold text-[#8b7e66]">Tiến độ: {ctx.charIndex + 1}/{ctx.totalChars}</div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col md:flex-row gap-10 justify-center items-start mb-8">

          {/* Left: Tian Zi Ge Canvas */}
          <div className="flex flex-col items-center">
            <h2 className="text-[#5a5038] mb-3 text-sm font-medium">Bảng Viết (Tian Zi Ge)</h2>
            <div className="relative bg-white border-2 border-[#8b7e66] w-[350px] h-[350px] shadow-sm flex items-center justify-center">
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-0 w-full border-t-2 border-dashed border-[#c6bcab]" />
                <div className="absolute left-1/2 top-0 h-full border-l-2 border-dashed border-[#c6bcab]" />
              </div>
              <div className="relative z-10">
                {ctx.currentHanzi && (
                  <HanziWriterCanvas
                    key={`${ctx.currentHanzi}-${key}`}
                    char={ctx.currentHanzi}
                    size={320}
                    onComplete={handleComplete}
                  />
                )}
              </div>
            </div>
            <div className="mt-5 flex gap-3 w-[350px]">
              <button onClick={clearCanvas} className="flex-1 py-2 text-sm bg-white border border-[#d0c9b7] rounded font-semibold text-[#5a5038] hover:bg-[#f0ebe1] transition-colors shadow-sm">
                Viết lại nét sai
              </button>
              <button onClick={handleSkip} className="flex-1 py-2 text-sm bg-[#e8e2d2] border border-[#a3977c] rounded font-semibold text-[#4a422e] hover:bg-[#d6ceb8] transition-colors shadow-sm">
                Bỏ qua chữ này
              </button>
            </div>
            {ctx.feedback === 'done' && <p className="mt-3 font-medium text-[#4caf50]">Bạn đã viết đúng! Đang chuyển chữ...</p>}
          </div>

          {/* Right: Info & Animation Preview */}
          <div className="bg-[#f3efdf] border-2 border-[#d0c9b7] p-5 rounded-lg shadow-sm w-[280px] flex flex-col items-center relative">
            {/* Corner decorations */}
            <div className="absolute top-1.5 left-1.5 w-4 h-4 border-t-[3px] border-l-[3px] border-[#a3977c]" />
            <div className="absolute top-1.5 right-1.5 w-4 h-4 border-t-[3px] border-r-[3px] border-[#a3977c]" />
            <div className="absolute bottom-1.5 left-1.5 w-4 h-4 border-b-[3px] border-l-[3px] border-[#a3977c]" />
            <div className="absolute bottom-1.5 right-1.5 w-4 h-4 border-b-[3px] border-r-[3px] border-[#a3977c]" />

            <div className="w-full text-center mb-6 mt-2 border-b border-[#d0c9b7] pb-4">
              <p className="text-xl font-bold text-[#8b7e66] mb-1">{ctx.currentPinyin}</p>
              <p className="text-sm font-medium text-[#5a5038] mb-3">{ctx.currentMeaning}</p>
              <AudioButton audioKey={items[ctx.charIndex]?.audioKey} className="text-[#8b7e66] hover:bg-[#e8e2d2] bg-white border border-[#d0c9b7]" />
            </div>

            <h3 className="text-sm font-bold text-[#5a5038] mb-3">Animation Preview</h3>
            <div className="relative bg-white border-2 border-[#a3977c] w-[180px] h-[180px] mb-5">
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-0 w-full border-t border-dashed border-[#c6bcab]" />
                <div className="absolute left-1/2 top-0 h-full border-l border-dashed border-[#c6bcab]" />
              </div>
              {ctx.currentHanzi && <HanziWriterAnimation char={ctx.currentHanzi} speed={speed} />}
            </div>

            <div className="flex gap-2 w-full">
              {(['slow', 'normal', 'fast'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  className={`flex-1 py-1.5 text-xs font-bold rounded border transition-colors capitalize ${
                    speed === s ? 'bg-[#8b7e66] text-white border-[#8b7e66]' : 'bg-white text-[#5a5038] border-[#a3977c] hover:bg-[#e8e2d2]'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
