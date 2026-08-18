'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { testApi } from '@/lib/api/endpoints';
import type { Test, TestAttempt, TestQuestion, TestAnswer } from '@/lib/api/types';
import { Card, CardBody } from '@/features/ui/components/card';
import { Button } from '@/features/ui/components/button';
import { PageLoading } from '@/features/ui/components/spinner';
import { ErrorState } from '@/features/ui/components/error-state';
import { formatDateTime } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';

export function StudentExamResultFeature({ attemptId: propAttemptId, onBack }: { attemptId?: string; onBack?: () => void } = {}) {
  const params = useParams<{ attemptId: string }>();
  const router = useRouter();
  const attemptId = propAttemptId || params?.attemptId;

  const [data, setData] = useState<{
    attempt: TestAttempt;
    test: Test;
    questions: TestQuestion[];
    answers: TestAnswer[];
  } | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    testApi.getAttemptResult(attemptId)
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [attemptId]);

  if (loading) return <PageLoading label="Đang tải kết quả..." />;
  if (error || !data) return <ErrorState message={error || 'Không tìm thấy dữ liệu'} />;

  const { attempt, test, questions, answers } = data;
  
  // Create answer map for quick lookup
  const answerMap = new Map(answers.map(a => [a.questionId, a]));

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      <div className="flex items-center gap-4 mb-4">
        <Button variant="ghost" onClick={() => onBack ? onBack() : router.push('/dashboard/exams')}>
          ← Quay lại
        </Button>
      </div>

      <Card>
        <CardBody className="text-center py-6 space-y-4">
          <h1 className="text-2xl font-bold text-gray-800">Kết quả: {test.name}</h1>
          <div className="text-6xl font-bold text-brand">{attempt.score || 0}<span className="text-3xl text-gray-400">/100</span></div>
          <div className="flex justify-center gap-8 text-sm text-gray-600 mt-4">
            <div>
              <p className="font-semibold text-gray-900">Thời gian làm bài</p>
              <p>{Math.floor((attempt.durationSeconds || 0) / 60)} phút {(attempt.durationSeconds || 0) % 60} giây</p>
            </div>
            <div>
              <p className="font-semibold text-gray-900">Nộp lúc</p>
              <p>{attempt.submittedAt ? formatDateTime(attempt.submittedAt) : 'N/A'}</p>
            </div>
          </div>
        </CardBody>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-bold">Chi tiết bài làm</h2>
        {questions.length === 0 && <p className="text-gray-500">Đề bài không có câu hỏi.</p>}
        {questions.map((qObj, index) => {
          const q = qObj.question;
          const qContent = (q?.content || {}) as Record<string, any>;
          const type = q?.type || 'UNKNOWN';
          let text = qContent.questionText || qContent.sentence || JSON.stringify(qContent);
          if (type === 'ORDERING') text = (qContent.correctOrder || []).join(' / ');
          if (type === 'MATCHING') text = 'Nối từ';

          const correctAnswer = qContent.correct_answer || qContent.correctOrder || qContent.acceptedAnswers;

          const ans = answerMap.get(qObj.id);
          const isCorrect = ans?.isCorrect;
          
          return (
            <Card key={qObj.id} className={cn("border-l-4", isCorrect ? "border-l-green-500" : (isCorrect === false ? "border-l-red-500" : "border-l-gray-300"))}>
              <CardBody className="space-y-3">
                <div className="flex justify-between gap-4">
                  <div className="flex gap-2">
                    <span className="font-bold">{index + 1}.</span>
                    <span className="font-medium whitespace-pre-wrap">{text}</span>
                  </div>
                  <div className="shrink-0 text-sm font-semibold text-gray-500">
                    {ans?.pointsAwarded || 0} / {qObj.points} điểm
                  </div>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg text-sm">
                  <p className="mb-1"><span className="font-medium text-gray-700">Câu trả lời của bạn: </span> 
                    {ans?.answer ? (
                      <span className={cn(isCorrect ? "text-green-600 font-semibold" : "text-red-600 font-semibold")}>
                        {String(ans.answer)}
                      </span>
                    ) : <span className="text-gray-400 italic">Không trả lời</span>}
                  </p>

                  {correctAnswer && (
                    <p className="mt-2 text-green-700">
                      <span className="font-medium">Đáp án đúng: </span>
                      {JSON.stringify(correctAnswer)}
                    </p>
                  )}
                  {!correctAnswer && test.showAnswersAfter && attempt.status === 'GRADED' && (
                    <p className="mt-2 text-gray-500 italic">Câu hỏi tự luận, chờ giáo viên chấm hoặc không có đáp án mẫu.</p>
                  )}
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
