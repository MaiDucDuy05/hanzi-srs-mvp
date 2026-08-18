'use client';

import { Card, CardBody } from '@/features/ui/components/card';
import { Badge } from '@/features/ui/components/badge';
import type { TestQuestion } from '@/lib/api/types';
import { cn } from '@/lib/utils/cn';

interface QuestionRendererProps {
  question: TestQuestion;
  index?: number;
  compact?: boolean;
}

export function QuestionRenderer({ question, index = 0, compact = false }: QuestionRendererProps) {
  const q = question.question;
  const content = (q?.content || {}) as Record<string, any>;
  const type = q?.type || 'UNKNOWN';

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'SINGLE_CHOICE':
        return 'bg-blue-50 border-blue-200';
      case 'TRUE_FALSE':
        return 'bg-purple-50 border-purple-200';
      case 'SHORT_ANSWER':
        return 'bg-green-50 border-green-200';
      case 'FILL_IN':
        return 'bg-orange-50 border-orange-200';
      case 'ORDERING':
        return 'bg-pink-50 border-pink-200';
      case 'MATCHING':
        return 'bg-indigo-50 border-indigo-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'SINGLE_CHOICE':
        return 'Trắc nghiệm';
      case 'TRUE_FALSE':
        return 'Đúng/Sai';
      case 'SHORT_ANSWER':
        return 'Trả lời ngắn';
      case 'FILL_IN':
        return 'Điền chỗ trống';
      case 'ORDERING':
        return 'Sắp xếp';
      case 'MATCHING':
        return 'Nối tương ứng';
      default:
        return type;
    }
  };

  const renderQuestionContent = () => {
    switch (type) {
      case 'SINGLE_CHOICE': {
        const ca = (q as any).correctAnswer ?? content.correctAnswer ?? content.correct_answer;
        const actualAnswer = typeof ca === 'object' && ca !== null ? ca.answer : ca;
        
        return (
          <div className="space-y-2">
            <p className="font-medium text-gray-900 mb-3">{content.questionText || 'Câu hỏi'}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(content.options || []).map((opt: string, i: number) => {
                const isCorrect = actualAnswer === opt;
                return (
                  <div
                    key={i}
                    className={cn(
                      "flex items-center gap-3 p-3 border rounded-lg",
                      isCorrect ? "border-blue-500 bg-blue-50 shadow-sm" : "border-gray-200 bg-gray-50"
                    )}
                  >
                    <div className={cn(
                      "flex shrink-0 items-center justify-center w-5 h-5 rounded-full border",
                      isCorrect ? "border-blue-500 bg-blue-500" : "border-gray-300 bg-white"
                    )}>
                      {isCorrect && <span className="w-2 h-2 rounded-full bg-white block" />}
                    </div>
                    <span className={cn("text-sm", isCorrect ? "text-blue-800 font-semibold" : "text-gray-700")}>{opt}</span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      }

      case 'TRUE_FALSE': {
        const ca = (q as any).correctAnswer ?? content.correctAnswer ?? content.correct_answer;
        const isTrueCorrect = typeof ca === 'object' && ca !== null ? ca.answer === true : ca === true;
        const isFalseCorrect = typeof ca === 'object' && ca !== null ? ca.answer === false : ca === false;

        return (
          <div className="space-y-3">
            <p className="font-medium text-gray-900">{content.questionText || 'Đúng hay Sai?'}</p>
            <div className="flex gap-3">
              <div className={cn(
                "flex items-center gap-2 p-3 border rounded-lg min-w-[120px]", 
                isTrueCorrect ? "border-blue-500 bg-blue-50 shadow-sm" : "border-gray-200 bg-gray-50"
              )}>
                <div className={cn(
                  "w-5 h-5 rounded-full border flex shrink-0 items-center justify-center", 
                  isTrueCorrect ? "border-blue-500 bg-blue-500" : "border-gray-300 bg-white"
                )}>
                  {isTrueCorrect && <span className="w-2 h-2 bg-white rounded-full block" />}
                </div>
                <span className={cn("font-medium", isTrueCorrect ? "text-blue-800" : "text-gray-700")}>Đúng</span>
              </div>
              
              <div className={cn(
                "flex items-center gap-2 p-3 border rounded-lg min-w-[120px]", 
                isFalseCorrect ? "border-blue-500 bg-blue-50 shadow-sm" : "border-gray-200 bg-gray-50"
              )}>
                <div className={cn(
                  "w-5 h-5 rounded-full border flex shrink-0 items-center justify-center", 
                  isFalseCorrect ? "border-blue-500 bg-blue-500" : "border-gray-300 bg-white"
                )}>
                  {isFalseCorrect && <span className="w-2 h-2 bg-white rounded-full block" />}
                </div>
                <span className={cn("font-medium", isFalseCorrect ? "text-blue-800" : "text-gray-700")}>Sai</span>
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
                <span
                  key={i}
                  className="px-3 py-2 bg-white border-2 border-dashed border-blue-300 rounded text-blue-600 font-medium cursor-pointer hover:bg-blue-50 transition-colors"
                >
                  {word}
                </span>
              ))}
            </div>
            <input
              type="text"
              placeholder="Điều cần điền..."
              className="w-full px-4 py-2 border-2 border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              disabled
            />
            {content.correctAnswer && (
              <div className="p-2 bg-green-100 border border-green-300 rounded text-xs text-green-700">
                ✓ Đáp án: <strong>{JSON.stringify(content.correctAnswer)}</strong>
              </div>
            )}
          </div>
        );

      case 'ORDERING':
        return (
          <div className="space-y-3">
            <p className="font-medium text-gray-900">
              {content.question || content.prompt || 'Sắp xếp câu theo thứ tự đúng:'}
            </p>
            <div className="space-y-2">
              {(content.words || content.items || []).map((word: string, i: number) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 bg-white border-2 border-pink-200 rounded-lg cursor-move hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center justify-center w-6 h-6 bg-pink-100 text-pink-600 rounded font-bold text-xs">
                    {i + 1}
                  </div>
                  <span className="text-gray-700">{word}</span>
                </div>
              ))}
            </div>
            {content.correctOrder && (
              <div className="p-3 bg-green-100 border border-green-300 rounded text-xs text-green-700">
                <strong>✓ Thứ tự đúng:</strong> {(content.correctOrder as string[]).join(' → ')}
              </div>
            )}
          </div>
        );

      case 'MATCHING':
        return (
          <div className="space-y-3">
            <p className="font-medium text-gray-900">{content.prompt || 'Nối các từ tương ứng:'}</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-bold text-gray-600 mb-2">CỘT A</p>
                <div className="space-y-2">
                  {(content.leftItems || []).map((item: string, i: number) => (
                    <div key={i} className="p-2 bg-indigo-100 border border-indigo-300 rounded text-sm font-medium text-indigo-700">
                      {i + 1}. {item}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-600 mb-2">CỘT B</p>
                <div className="space-y-2">
                  {(content.rightItems || []).map((item: string, i: number) => (
                    <div key={i} className="p-2 bg-white border-2 border-indigo-200 rounded text-sm text-indigo-700">
                      {String.fromCharCode(65 + i)}. {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {content.pairs && (
              <div className="p-3 bg-green-100 border border-green-300 rounded text-xs text-green-700">
                <strong>✓ Cách nối:</strong>{' '}
                {Object.entries(content.pairs as Record<string, string>)
                  .map(([k, v]) => `${k}→${v}`)
                  .join(', ')}
              </div>
            )}
          </div>
        );

      case 'SHORT_ANSWER':
        return (
          <div className="space-y-3">
            <p className="font-medium text-gray-900">{content.questionText || 'Trả lời câu hỏi:'}</p>
            <textarea
              placeholder="Nhập câu trả lời..."
              className="w-full px-4 py-3 border-2 border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              rows={3}
              disabled
            />
            {content.acceptedAnswers && (
              <div className="p-2 bg-green-100 border border-green-300 rounded text-xs text-green-700">
                <strong>✓ Đáp án chấp nhận:</strong>{' '}
                {(content.acceptedAnswers as string[]).join(', ')}
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="p-4 bg-gray-100 rounded border border-gray-300">
            <p className="text-sm text-gray-600 font-mono">{JSON.stringify(content, null, 2)}</p>
          </div>
        );
    }
  };

  if (compact) {
    return (
      <div className={cn('border rounded-lg p-3', getTypeColor(type))}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900">
              Câu {index + 1}: {getTypeLabel(type)}
            </p>
            <p className="text-xs text-gray-600 mt-1 line-clamp-2">
              {content.questionText ||
                content.prompt ||
                (typeof content === 'string' ? content : JSON.stringify(content).substring(0, 100))}
            </p>
          </div>
          <Badge tone="gray">{question.points} điểm</Badge>
        </div>
      </div>
    );
  }

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

        <div className="space-y-4">{renderQuestionContent()}</div>
      </CardBody>
    </Card>
  );
}
