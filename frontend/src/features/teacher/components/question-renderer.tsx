'use client';

import { useState, useRef } from 'react';

import { Card, CardBody } from '@/features/ui/components/card';
import { Badge } from '@/features/ui/components/badge';
import type { TestQuestion } from '@/lib/api/types';
import { cn } from '@/lib/utils/cn';
import { Mic, Play, RotateCcw, Check, CheckCircle2 } from 'lucide-react';

interface QuestionRendererProps {
  question: TestQuestion;
  index?: number;
  compact?: boolean;
  mode?: 'view' | 'take';
  value?: any;
  onChange?: (val: any) => void;
}

export function QuestionRenderer({ question, index = 0, compact = false, mode = 'view', value, onChange }: QuestionRendererProps) {
  const q = question.question;
  const content = (q?.content || {}) as Record<string, any>;
  const type = q?.type || 'UNKNOWN';

  const audioRef = useRef<HTMLAudioElement>(null);
  const [playCount, setPlayCount] = useState(0);

  const handlePlay = (e: any) => {
    if (mode === 'take' && content.audioPlayLimit && playCount >= content.audioPlayLimit) {
      e.preventDefault();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      alert(`Bạn đã hết số lần nghe (${content.audioPlayLimit} lần).`);
    }
  };

  const handleEnded = () => {
    if (mode === 'take' && content.audioPlayLimit) {
      setPlayCount(prev => prev + 1);
    }
  };

  // --- Take Mode Renderers (Cute Panda Forest UI) ---
  const renderTakeModeContent = () => {
    switch (type) {
      case 'SINGLE_CHOICE':
      case 'TRUE_FALSE': {
        const isTrueFalse = type === 'TRUE_FALSE';
        const options = isTrueFalse ? ['Đúng', 'Sai'] : (content.options || []);
        
        return (
          <div className="space-y-6">
            <p className="text-xl text-gray-800 font-medium leading-relaxed">
              {content.questionText || (isTrueFalse ? 'Đúng hay Sai?' : 'Chọn từ đúng điền vào chỗ trống:')}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              {options.map((opt: any, i: number) => {
                const optId = isTrueFalse ? (opt === 'Đúng' ? true : false) : (typeof opt === 'string' ? String.fromCharCode(65 + i) : opt.id);
                const optText = typeof opt === 'string' ? opt : opt.text;
                
                const isSelected = value === optId || value === optText;

                return (
                  <div
                    key={i}
                    onClick={() => onChange?.(optId)}
                    className={cn(
                      "flex items-center p-5 rounded-2xl border-2 transition-all duration-200 cursor-pointer group hover:shadow-sm",
                      isSelected 
                        ? "border-[#466a50] bg-[#e9efe7] shadow-inner" 
                        : "border-[#e9efe7] bg-[#fdfefc] hover:border-[#466a50]/50"
                    )}
                  >
                    <div className="mr-4 w-10 h-10 flex-shrink-0">
                      {isSelected ? (
                        <div className="w-10 h-10 bg-[#466a50] rounded-full flex items-center justify-center text-white shadow-sm scale-110 transition-transform">
                          <Check className="w-5 h-5" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 bg-[#f7f9f6] border-2 border-[#e9efe7] rounded-full flex items-center justify-center text-gray-400 font-bold group-hover:border-[#466a50]/30 transition-colors">
                          {isTrueFalse ? (i === 0 ? 'T' : 'F') : String.fromCharCode(65 + i)}
                        </div>
                      )}
                    </div>
                    <span className={cn("text-lg", isSelected ? "text-[#466a50] font-bold" : "text-gray-700 font-medium")}>
                      {optText}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      }

      case 'FILL_IN':
      case 'SHORT_ANSWER':
        return (
          <div className="space-y-6 max-w-2xl">
            <p className="text-xl text-gray-800 font-medium leading-relaxed">
              {content.questionText || (type === 'FILL_IN' ? 'Điền vào chỗ trống:' : 'Trả lời câu hỏi:')}
            </p>
            {type === 'FILL_IN' && content.options && (
              <div className="flex flex-wrap gap-2 mb-4">
                {(content.options || []).map((word: string, i: number) => (
                  <span key={i} className="px-4 py-2 bg-[#f7f9f6] border border-[#e9efe7] rounded-full text-[#466a50] font-medium text-sm">
                    {word}
                  </span>
                ))}
              </div>
            )}
            <textarea
              placeholder={type === 'FILL_IN' ? "Gõ từ cần điền..." : "Nhập câu trả lời của bạn..."}
              className="w-full px-6 py-4 border-2 border-[#e9efe7] rounded-2xl focus:outline-none focus:border-[#466a50] focus:ring-4 focus:ring-[#466a50]/10 text-lg transition-all bg-[#fdfefc] min-h-[120px] resize-y shadow-inner"
              value={value || ''}
              onChange={(e) => onChange?.(e.target.value)}
            />
          </div>
        );

      case 'ORDERING': {
        const words = content.words || content.items || [];
        const currentOrder: string[] = Array.isArray(value) ? value : [];
        const availableWords = words.filter((w: string) => !currentOrder.includes(w));

        return (
          <div className="space-y-8">
            <p className="text-xl text-gray-800 font-medium leading-relaxed">
              {content.question || content.prompt || 'Sắp xếp các từ sau thành câu hoàn chỉnh:'}
            </p>
            
            {/* Answer Area */}
            <div className="min-h-[80px] p-6 bg-[#f7f9f6] border-2 border-dashed border-[#466a50]/30 rounded-2xl flex flex-wrap gap-3 relative">
              {currentOrder.length === 0 && (
                <span className="absolute inset-0 flex items-center justify-center text-gray-400 font-medium pointer-events-none">
                  Kéo hoặc chọn các từ bên dưới để ghép vào đây
                </span>
              )}
              {currentOrder.map((word, idx) => (
                <div 
                  key={idx} 
                  onClick={() => {
                    const newOrder = [...currentOrder];
                    newOrder.splice(idx, 1);
                    onChange?.(newOrder);
                  }}
                  className="px-6 py-3 bg-[#466a50] text-white font-bold rounded-full shadow-md cursor-pointer hover:bg-[#344f3b] transform hover:scale-105 transition-all flex items-center gap-2"
                >
                  {word}
                  <span className="text-white/50 text-xs ml-1 hover:text-white">×</span>
                </div>
              ))}
            </div>

            {/* Word Bank */}
            <div className="flex flex-wrap gap-3">
              {availableWords.map((word: string, idx: number) => (
                <div 
                  key={idx} 
                  onClick={() => onChange?.([...currentOrder, word])}
                  className="px-6 py-3 bg-white border-2 border-[#e9efe7] text-[#466a50] font-bold rounded-full cursor-pointer hover:border-[#466a50] hover:bg-[#e9efe7] transition-all shadow-sm active:scale-95"
                >
                  {word}
                </div>
              ))}
            </div>
            
            <div className="flex justify-end">
              <button 
                onClick={() => onChange?.([])}
                className="text-sm text-gray-400 hover:text-red-500 font-medium flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-4 h-4" /> Làm lại từ đầu
              </button>
            </div>
          </div>
        );
      }

      case 'SPEAKING':
        return (
          <div className="flex flex-col items-center justify-center space-y-12 py-8">
            <p className="text-2xl text-center text-gray-800 font-medium max-w-2xl">
              {content.questionText || 'Hãy đọc to đoạn văn sau:'}
            </p>
            {content.passage && (
              <div className="p-8 bg-[#fdfefc] border border-[#e9efe7] rounded-3xl shadow-sm text-center">
                <p className="text-4xl font-serif text-gray-900 leading-normal">{content.passage}</p>
              </div>
            )}
            
            {/* Recording UI */}
            <div className="flex flex-col items-center gap-6">
              <div className="text-5xl font-mono font-bold text-[#466a50] tracking-wider">
                00:12
              </div>
              
              <button className="w-24 h-24 bg-[#466a50] text-white rounded-full flex items-center justify-center shadow-lg hover:bg-[#344f3b] transform hover:scale-105 transition-all focus:outline-none focus:ring-4 focus:ring-[#466a50]/30 animate-pulse">
                <Mic className="w-10 h-10" />
              </button>
              
              {/* Fake Audio Waveform */}
              <div className="flex items-center gap-1 h-12">
                {[1, 2, 3, 4, 3, 2, 5, 4, 2, 1, 3, 4, 5, 2, 1].map((bar, i) => (
                  <div key={i} className="w-1.5 bg-[#466a50] rounded-full animate-bounce" style={{ height: `${bar * 20}%`, animationDelay: `${i * 0.1}s` }} />
                ))}
              </div>

              <div className="flex gap-4">
                <button className="px-6 py-2 rounded-full border-2 border-red-200 text-red-600 font-semibold hover:bg-red-50 transition-colors">
                  Ngừng ghi âm
                </button>
                <button className="px-6 py-2 rounded-full border-2 border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 flex items-center gap-2 transition-colors">
                  <Play className="w-4 h-4" /> Nghe lại
                </button>
              </div>
            </div>
            
            <p className="text-sm text-amber-600 italic text-center">
              (Tính năng chấm điểm giọng nói tự động đang được phát triển, đây chỉ là bản demo giao diện)
            </p>
          </div>
        );

      case 'WRITING':
        return (
          <div className="flex flex-col items-center space-y-10 py-6">
            <p className="text-xl text-gray-800 font-medium text-center">
              {content.questionText || 'Viết chữ Hán vào ô trống dưới đây:'}
            </p>
            
            {/* Tianzige Grid (Handwriting Box) */}
            <div className="relative w-64 h-64 border-4 border-[#e9efe7] bg-white shadow-sm flex items-center justify-center">
              {/* Dashed lines for Tianzige */}
              <div className="absolute inset-0 border-b-2 border-dashed border-[#e9efe7] top-1/2 -translate-y-1/2 pointer-events-none" />
              <div className="absolute inset-0 border-l-2 border-dashed border-[#e9efe7] left-1/2 -translate-x-1/2 pointer-events-none" />
              
              {/* Input Overlay */}
              <input 
                type="text" 
                maxLength={1}
                className="absolute inset-0 w-full h-full bg-transparent text-center focus:outline-none focus:ring-4 focus:ring-[#466a50]/20 text-9xl font-serif text-gray-900 caret-[#466a50]"
                value={value || ''}
                onChange={(e) => onChange?.(e.target.value)}
              />
            </div>
            
            <div className="flex gap-4">
              <button 
                onClick={() => onChange?.('')}
                className="px-6 py-2 rounded-full border-2 border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 flex items-center gap-2 transition-colors"
              >
                <RotateCcw className="w-4 h-4" /> Xoá làm lại
              </button>
            </div>
            
            <p className="text-sm text-gray-500 italic max-w-md text-center">
              Mẹo: Vui lòng sử dụng bàn phím Pinyin để nhập trực tiếp chữ Hán. Nhận diện nét vẽ tay sẽ ra mắt ở phiên bản sau.
            </p>
          </div>
        );

      default:
        return (
          <div className="p-8 bg-amber-50 rounded-2xl border border-amber-200 text-center">
            <p className="text-amber-700 font-medium">Chưa hỗ trợ giao diện làm bài cho loại câu hỏi này.</p>
          </div>
        );
    }
  };

  // --- View Mode Renderers (Teacher/Admin View) ---
  const getTypeColor = (t: string) => {
    switch (t) {
      case 'SINGLE_CHOICE': return 'bg-blue-50 border-blue-200';
      case 'TRUE_FALSE': return 'bg-purple-50 border-purple-200';
      case 'SHORT_ANSWER': return 'bg-green-50 border-green-200';
      case 'FILL_IN': return 'bg-orange-50 border-orange-200';
      case 'ORDERING': return 'bg-pink-50 border-pink-200';
      case 'MATCHING': return 'bg-indigo-50 border-indigo-200';
      case 'SPEAKING': return 'bg-teal-50 border-teal-200';
      case 'WRITING': return 'bg-red-50 border-red-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const getTypeLabel = (t: string) => {
    switch (t) {
      case 'SINGLE_CHOICE': return 'Trắc nghiệm';
      case 'TRUE_FALSE': return 'Đúng/Sai';
      case 'SHORT_ANSWER': return 'Trả lời ngắn';
      case 'FILL_IN': return 'Điền chỗ trống';
      case 'ORDERING': return 'Sắp xếp';
      case 'MATCHING': return 'Nối tương ứng';
      case 'SPEAKING': return 'Luyện nói';
      case 'WRITING': return 'Viết chữ';
      default: return t;
    }
  };

  // If we are in "take" mode, we just return the clean content without the outer Card
  if (mode === 'take') {
    return (
      <div className="w-full h-full animate-in fade-in duration-300">
        {(content.imageUrl || content.audioUrl) && (
          <div className="space-y-6 mb-8 bg-white p-6 rounded-2xl border border-[#e9efe7] shadow-sm">
            {content.imageUrl && (
              <div className="flex justify-center">
                <img src={content.imageUrl} alt="Question Image" className="max-w-full h-auto rounded-xl border border-gray-100" style={{ maxHeight: '300px' }} />
              </div>
            )}
            {content.audioUrl && (
              <div className="flex flex-col gap-2 max-w-md mx-auto">
                <audio 
                  ref={audioRef}
                  src={content.audioUrl} 
                  controls 
                  className="w-full"
                  onPlay={handlePlay}
                  onEnded={handleEnded}
                />
                {content.audioPlayLimit && (
                  <span className="text-xs text-center text-amber-600 font-medium">
                    Số lần nghe còn lại: {Math.max(0, content.audioPlayLimit - playCount)} / {content.audioPlayLimit}
                  </span>
                )}
              </div>
            )}
          </div>
        )}
        {renderTakeModeContent()}
      </div>
    );
  }

  const renderViewModeContent = () => {
    switch (type) {
      case 'SINGLE_CHOICE': {
        const ca = (q as any).correctAnswer ?? content.correctAnswer ?? content.correct_answer;
        const actualAnswer = typeof ca === 'object' && ca !== null ? ca.answer : ca;
        
        return (
          <div className="space-y-2">
            <p className="font-medium text-gray-900 mb-3">{content.questionText || 'Câu hỏi'}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(content.options || []).map((opt: any, i: number) => {
                const optId = typeof opt === 'string' ? String.fromCharCode(65 + i) : opt.id;
                const optText = typeof opt === 'string' ? opt : opt.text;
                const isCorrect = actualAnswer === optId || actualAnswer === optText;

                return (
                  <div key={i} className={cn("flex items-center gap-3 p-3 border rounded-lg", isCorrect ? "border-green-500 bg-green-50" : "border-gray-200 bg-gray-50")}>
                    <div className={cn("flex shrink-0 items-center justify-center w-5 h-5 rounded-full border", isCorrect ? "border-green-500 bg-green-500" : "border-gray-300 bg-white")}>
                      {isCorrect && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span className="text-sm text-gray-700">{optText}</span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      }
      case 'TRUE_FALSE': {
        const ca = (q as any).correctAnswer ?? content.correctAnswer ?? content.correct_answer;
        const isTrueCorrect = typeof ca === 'object' && ca !== null ? ca.answer === true : ca === 'true' || ca === true;
        const isFalseCorrect = typeof ca === 'object' && ca !== null ? ca.answer === false : ca === 'false' || ca === false;

        return (
          <div className="space-y-3">
            <p className="font-medium text-gray-900">{content.questionText || 'Đúng hay Sai?'}</p>
            <div className="flex flex-wrap gap-3">
              <div className={cn("flex flex-1 items-center gap-2 p-3 border rounded-lg min-w-[90px]", isTrueCorrect ? "border-green-500 bg-green-50" : "border-gray-200 bg-gray-50")}>
                <div className={cn("w-5 h-5 rounded-full border flex shrink-0 items-center justify-center", isTrueCorrect ? "border-green-500 bg-green-500" : "border-gray-300 bg-white")}>
                  {isTrueCorrect && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className="font-medium text-gray-700">Đúng</span>
              </div>
              <div className={cn("flex flex-1 items-center gap-2 p-3 border rounded-lg min-w-[90px]", isFalseCorrect ? "border-green-500 bg-green-50" : "border-gray-200 bg-gray-50")}>
                <div className={cn("w-5 h-5 rounded-full border flex shrink-0 items-center justify-center", isFalseCorrect ? "border-green-500 bg-green-500" : "border-gray-300 bg-white")}>
                  {isFalseCorrect && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className="font-medium text-gray-700">Sai</span>
              </div>
            </div>
          </div>
        );
      }
      case 'FILL_IN':
        return (
          <div className="space-y-3">
            <p className="font-medium text-gray-900">{content.questionText || 'Điền vào chỗ trống:'}</p>
            <div className="flex gap-2 items-center flex-wrap">
              {(content.options || []).map((word: string, i: number) => (
                <span key={i} className="px-3 py-2 bg-white border-2 border-dashed border-blue-300 rounded text-blue-600 font-medium">
                  {word}
                </span>
              ))}
            </div>
            <input
              type="text"
              placeholder="Điều cần điền..."
              className="w-full px-4 py-2 border-2 border-orange-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
              disabled
            />
            {content.acceptedAnswers && (
              <div className="p-3 bg-green-100 border border-green-300 rounded text-xs text-green-700 mt-2">
                <strong>✓ Các đáp án được chấp nhận:</strong> {(content.acceptedAnswers as string[]).join(', ')}
              </div>
            )}
          </div>
        );
      case 'SHORT_ANSWER':
        return (
          <div className="space-y-3">
            <p className="font-medium text-gray-900">{content.questionText || 'Trả lời câu hỏi:'}</p>
            <textarea
              placeholder="Câu trả lời..."
              className="w-full px-4 py-3 border-2 border-green-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed min-h-[80px]"
              disabled
            />
            {content.acceptedAnswers && (
              <div className="p-3 bg-green-100 border border-green-300 rounded text-xs text-green-700 mt-2">
                <strong>✓ Các đáp án được chấp nhận:</strong>
                <ul className="list-disc ml-5 mt-1">
                  {(content.acceptedAnswers as string[]).map((ans, i) => (
                    <li key={i}>{ans}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      case 'ORDERING':
        return (
          <div className="space-y-3">
            <p className="font-medium text-gray-900">{content.questionText || content.prompt || 'Sắp xếp câu:'}</p>
            <div className="flex flex-wrap gap-2">
              {(content.items || content.correctOrder || []).map((word: string, i: number) => (
                <div key={i} className="px-3 py-2 bg-white border border-pink-300 rounded-lg shadow-sm text-gray-700">
                  {word}
                </div>
              ))}
            </div>
            {content.correctOrder && (
              <div className="p-3 bg-green-100 border border-green-300 rounded text-xs text-green-700 mt-2">
                <strong>✓ Thứ tự đúng:</strong> {(content.correctOrder as string[]).join(' → ')}
              </div>
            )}
          </div>
        );
      default:
        return (
          <div className="space-y-2">
            <p className="font-medium text-gray-900">{content.questionText || content.prompt || 'Câu hỏi'}</p>
            <pre className="text-xs text-gray-500 bg-white/50 p-2 rounded max-h-32 overflow-auto">
              {JSON.stringify(content, null, 2)}
            </pre>
          </div>
        );
    }
  };

  // Teacher/Admin View Mode keeps the original simple UI
  return (
    <Card className={cn('border-2', getTypeColor(type))}>
      <CardBody>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full font-bold text-sm">
                {index + 1}
              </span>
              <Badge tone="blue">{getTypeLabel(type)}</Badge>
              <Badge tone="gray">{question.points} điểm</Badge>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          {content.imageUrl && (
            <div className="mb-4">
              <img src={content.imageUrl} alt="Question Image" className="max-w-full h-auto rounded-lg border border-gray-200" style={{ maxHeight: '300px' }} />
            </div>
          )}
          {content.audioUrl && (
            <div className="mb-4 flex flex-col gap-2">
              <audio 
                src={content.audioUrl} 
                controls 
                className="w-full"
              />
            </div>
          )}
          {renderViewModeContent()}
        </div>
      </CardBody>
    </Card>
  );
}
