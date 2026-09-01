'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Flag, Send, Menu, X, Bookmark, BookmarkCheck, Clock, Maximize } from 'lucide-react';
import { testApi } from '@/lib/api/endpoints/test';
import type { Test, TestAttempt, TestQuestion } from '@/lib/api/types';
import { Button } from '@/features/ui/components/button';
import { PageLoading } from '@/features/ui/components/spinner';
import { ErrorState } from '@/features/ui/components/error-state';
import { QuestionRenderer } from '@/features/teacher/components/question-renderer';
import { Badge } from '@/features/ui/components/badge';
import { cn } from '@/lib/utils/cn';

export function StudentExamTakingPage() {
  const { attemptId } = useParams<{ attemptId: string }>();
  const router = useRouter();

  const [attempt, setAttempt] = useState<TestAttempt | null>(null);
  const [test, setTest] = useState<Test | null>(null);
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [markedForReview, setMarkedForReview] = useState<Set<string>>(new Set());

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);
  const [showNavigator, setShowNavigator] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const durationSecondsRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    // Initial check
    if (typeof document !== 'undefined') {
      setIsFullscreen(!!document.fullscreenElement);
    }

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const requestFullscreen = async () => {
    try {
      if (containerRef.current && containerRef.current.requestFullscreen) {
        await containerRef.current.requestFullscreen();
      } else if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
    } catch (err) {
      console.error('Lỗi khi mở toàn màn hình:', err);
      alert('Trình duyệt của bạn không hỗ trợ tính năng này.');
    }
  };

  // Load exam data
  useEffect(() => {
    const load = async () => {
      try {
        const att = await testApi.getAttempt(attemptId);
        if (att.status !== 'IN_PROGRESS') {
          alert('Bài kiểm tra này đã kết thúc!');
          router.push('/dashboard/exams');
          return;
        }

        const t = await testApi.get(att.testId);
        let qs = await testApi.listQuestions({ testId: att.testId });

        // Shuffle if needed
        if (t.shuffleQuestions) {
          let seed = 0;
          for (let i = 0; i < attemptId.length; i++) seed += attemptId.charCodeAt(i);
          const random = () => {
            const x = Math.sin(seed++) * 10000;
            return x - Math.floor(x);
          };
          for (let i = qs.length - 1; i > 0; i--) {
            const j = Math.floor(random() * (i + 1));
            [qs[i], qs[j]] = [qs[j], qs[i]];
          }
        }

        // Load existing answers
        const existingAnswers = await testApi.listAnswers(attemptId);
        const answerMap: Record<string, unknown> = {};
        existingAnswers.forEach((ans: any) => {
          answerMap[ans.questionId] = ans.answer;
        });

        setAttempt(att);
        setTest(t);
        setQuestions(qs.sort((a, b) => a.displayOrder - b.displayOrder));
        setAnswers(answerMap);

        // Setup timer
        const startedAtTime = new Date(att.startedAt).getTime();
        const now = Date.now();
        const elapsedSeconds = Math.floor((now - startedAtTime) / 1000);
        const totalSeconds = t.timeLimitMinutes * 60;
        const remaining = Math.max(0, totalSeconds - elapsedSeconds);

        setTimeLeft(remaining);
        durationSecondsRef.current = elapsedSeconds;
        setLoading(false);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Lỗi tải bài kiểm tra.');
        setLoading(false);
      }
    };

    void load();
  }, [attemptId, router]);

  // Timer
  useEffect(() => {
    if (!loading && test && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
        durationSecondsRef.current += 1;
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [loading, test, timeLeft]);

  const handleAnswerChange = async (questionId: string, value: unknown) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    try {
      await testApi.submitAnswer(attemptId, { questionId, answer: value });
    } catch (e) {
      console.error('Failed to save answer:', e);
    }
  };

  const toggleMarkForReview = () => {
    const qId = questions[currentQuestion]?.questionId;
    if (qId) {
      const newMarked = new Set(markedForReview);
      if (newMarked.has(qId)) {
        newMarked.delete(qId);
      } else {
        newMarked.add(qId);
      }
      setMarkedForReview(newMarked);
    }
  };

  const handleAutoSubmit = async () => {
    alert('Đã hết thời gian! Hệ thống sẽ tự động nộp bài.');
    await handleSubmit();
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      if (timerRef.current) clearInterval(timerRef.current);

      await testApi.submitAttempt(attemptId, durationSecondsRef.current);
      
      // Exit fullscreen if active
      if (document.fullscreenElement && document.exitFullscreen) {
        await document.exitFullscreen().catch(console.error);
      }
      
      router.push(`/dashboard/exams/${attemptId}/result`);
    } catch (error) {
      setError('Lỗi nộp bài. Vui lòng thử lại.');
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const goToQuestion = (idx: number) => {
    if (idx >= 0 && idx < questions.length) {
      setCurrentQuestion(idx);
      setShowNavigator(false);
    }
  };

  const answeredCount = Object.keys(answers).length;

  if (loading) return <PageLoading label="Đang chuẩn bị bài kiểm tra..." />;
  if (error || !test) return <ErrorState message={error || 'Không tìm thấy bài kiểm tra'} />;

  const q = questions[currentQuestion];
  const isMarked = markedForReview.has(q?.questionId || '');
  const timerColor = timeLeft < 300 ? 'text-red-600' : timeLeft < 600 ? 'text-amber-600' : 'text-gray-900';

  return (
    <div ref={containerRef} className="flex flex-col h-screen bg-[#f7f9f6] font-sans">
      {!isFullscreen ? (
        <div className="flex flex-col h-full items-center justify-center p-4 text-center">
          <div className="bg-white p-8 sm:p-12 rounded-[2rem] shadow-sm border border-gray-100 max-w-lg w-full flex flex-col items-center">
            <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-6">
              <Maximize className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-extrabold text-[#11321e] mb-4">Chế độ Thi</h2>
            <p className="text-gray-600 font-medium mb-8">
              Bài kiểm tra này yêu cầu bạn làm bài trong <strong className="text-[#11321e]">Chế độ Toàn màn hình</strong> để đảm bảo tính công bằng. Vui lòng không thoát toàn màn hình trong suốt quá trình làm bài.
            </p>
            <Button 
              onClick={requestFullscreen} 
              className="w-full bg-[#11321e] hover:bg-[#1a4a2c] text-white rounded-full py-6 text-lg font-bold shadow-lg transition-transform active:scale-95"
            >
              Mở Toàn Màn Hình
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* Top Header */}
      <header className="sticky top-0 z-40 bg-[#fefdfb] border-b border-[#e9efe7] px-6 py-4 shadow-sm flex items-center justify-between">
        {/* Left: Breadcrumb */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/exams')} className="shrink-0 rounded-full hover:bg-brand-50">
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </Button>
          <div className="hidden sm:block text-sm font-semibold text-gray-700">
            <span className="text-brand-700">Cute Panda Forest</span>
            <span className="mx-2 text-gray-300">|</span>
            <span>{test.name}</span>
          </div>
        </div>

        {/* Center: Progress Bar */}
        <div className="hidden md:flex items-center gap-4 flex-1 max-w-md mx-8">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Progress</span>
          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#466a50] transition-all duration-300 ease-out" 
              style={{ width: `${(answeredCount / questions.length) * 100}%` }}
            />
          </div>
          <span className="text-sm font-bold text-gray-700 w-12 text-right">{answeredCount} / {questions.length}</span>
        </div>

        {/* Right: Timer & Submit */}
        <div className="flex items-center gap-4">
          <div className={cn('flex items-center gap-2 px-4 py-2 rounded-full border shadow-inner font-mono font-bold text-lg', timerColor)}>
            <Clock className="w-5 h-5" />
            {formatTime(timeLeft)}
          </div>
          <Button 
            onClick={() => setShowSubmitConfirm(true)} 
            className="bg-[#466a50] hover:bg-[#344f3b] text-white rounded-full px-6 font-semibold shadow-md transition-transform active:scale-95"
          >
            Submit Exam
          </Button>
        </div>
      </header>

      {/* Main Content Split Layout */}
      <main className="flex-1 overflow-hidden flex max-w-[1400px] w-full mx-auto">
        
        {/* Left Column: Question Area */}
        <div className="flex-1 p-4 sm:p-8 overflow-y-auto">
          {q && (
            <div className="bg-white rounded-[2rem] shadow-sm border border-[#e9efe7] p-8 sm:p-12 min-h-full flex flex-col relative">
              
              {/* Question Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <Badge className="bg-[#e9efe7] text-[#466a50] border-none font-bold uppercase tracking-wider px-3 py-1">
                    {q.question?.type === 'SINGLE_CHOICE' ? 'Trắc nghiệm' : q.question?.type === 'TRUE_FALSE' ? 'Đúng/Sai' : q.question?.type === 'SPEAKING' ? 'Luyện nói' : q.question?.type === 'WRITING' ? 'Viết chữ' : 'Câu hỏi'}
                  </Badge>
                  <h2 className="text-3xl font-extrabold text-gray-800">
                    Question {currentQuestion + 1}
                  </h2>
                </div>
                
                <Button
                  variant="ghost"
                  onClick={toggleMarkForReview}
                  className={cn("rounded-full px-4 text-gray-500 hover:bg-amber-50 hover:text-amber-600 transition-colors", isMarked && 'text-amber-600 bg-amber-50 font-medium')}
                >
                  {isMarked ? <BookmarkCheck className="h-5 w-5 mr-2" /> : <Bookmark className="h-5 w-5 mr-2" />}
                  {isMarked ? 'Bookmarked' : 'Bookmark'}
                </Button>
              </div>

              {/* Question Render */}
              <div className="flex-grow flex flex-col">
                <QuestionRenderer
                  question={q}
                  index={currentQuestion}
                  mode="take"
                  value={answers[q.questionId]}
                  onChange={(val) => handleAnswerChange(q.questionId, val)}
                />
              </div>

              {/* Bottom Nav Buttons */}
              <div className="mt-12 flex items-center justify-between pt-6 border-t border-gray-100">
                <Button
                  variant="outline"
                  onClick={() => goToQuestion(currentQuestion - 1)}
                  disabled={currentQuestion === 0}
                  className="rounded-full px-6 border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold"
                >
                  <ChevronLeft className="w-5 h-5 mr-2" /> Previous
                </Button>

                <Button
                  onClick={() => goToQuestion(currentQuestion + 1)}
                  disabled={currentQuestion === questions.length - 1}
                  className="rounded-full px-8 bg-[#466a50] hover:bg-[#344f3b] text-white font-semibold shadow-md"
                >
                  Next <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Question Palette */}
        <aside className="w-80 hidden lg:flex flex-col p-8 border-l border-[#e9efe7] bg-[#fdfefc]">
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Menu className="w-5 h-5 text-gray-400" /> Question Palette
          </h3>
          
          <div className="grid grid-cols-5 gap-3">
            {questions.map((question, idx) => {
              const isCurrent = currentQuestion === idx;
              const isAnswered = answers[question.questionId] !== undefined;
              const isReview = markedForReview.has(question.questionId);

              return (
                <button
                  key={question.id}
                  onClick={() => goToQuestion(idx)}
                  className={cn(
                    "w-full aspect-square rounded-full font-bold text-sm transition-all duration-200 flex items-center justify-center border-2",
                    isCurrent 
                      ? "bg-[#466a50] text-white border-[#466a50] transform scale-110 shadow-md" 
                      : isReview
                        ? "border-amber-400 text-amber-700 bg-amber-50"
                        : isAnswered
                          ? "bg-[#e9efe7] border-[#e9efe7] text-[#466a50]"
                          : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
                  )}
                >
                  {idx + 1}
                </button>
              )
            })}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100 space-y-3">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <div className="w-4 h-4 rounded-full bg-[#e9efe7] border-2 border-[#e9efe7]" /> Answered
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <div className="w-4 h-4 rounded-full bg-white border-2 border-gray-200" /> Not Answered
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <div className="w-4 h-4 rounded-full bg-amber-50 border-2 border-amber-400" /> Bookmarked
            </div>
          </div>
        </aside>

      </main>

      {/* Mobile Palette Drawer (unchanged logic, just styled) */}
      <div className="lg:hidden p-4 bg-white border-t border-gray-200 flex items-center justify-between">
        <Button variant="outline" className="rounded-full" onClick={() => setShowNavigator(true)}>
          <Menu className="w-4 h-4 mr-2" /> Palette ({answeredCount}/{questions.length})
        </Button>
      </div>

      {showNavigator && (
        <div className="fixed inset-0 bg-black/60 z-50 lg:hidden flex flex-col justify-end">
          <div className="bg-[#fdfefc] w-full rounded-t-3xl p-6 max-h-[70vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-xl">Question Palette</h3>
              <Button variant="ghost" className="rounded-full bg-gray-100"  onClick={() => setShowNavigator(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="grid grid-cols-6 gap-3">
              {questions.map((question, idx) => {
                const isCurrent = currentQuestion === idx;
                const isAnswered = answers[question.questionId] !== undefined;
                const isReview = markedForReview.has(question.questionId);
                return (
                  <button
                    key={question.id}
                    onClick={() => goToQuestion(idx)}
                    className={cn(
                      "w-full aspect-square rounded-full font-bold text-sm transition-all duration-200 flex items-center justify-center border-2",
                      isCurrent 
                        ? "bg-[#466a50] text-white border-[#466a50]" 
                        : isReview
                          ? "border-amber-400 text-amber-700 bg-amber-50"
                          : isAnswered
                            ? "bg-[#e9efe7] border-[#e9efe7] text-[#466a50]"
                            : "bg-white border-gray-200 text-gray-500"
                    )}
                  >
                    {idx + 1}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Submit Confirmation Modal */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl transform scale-100 animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Xác nhận nộp bài?</h3>
            <p className="text-gray-600 mb-8">
              Bạn đã trả lời {answeredCount} trên tổng số {questions.length} câu hỏi. Sau khi nộp, bạn không thể thay đổi đáp án.
            </p>
            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => setShowSubmitConfirm(false)}
                className="flex-1 rounded-full font-semibold border-gray-200"
                size="lg"
              >
                Hủy bỏ
              </Button>
              <Button
                loading={submitting}
                onClick={handleSubmit}
                className="flex-1 rounded-full bg-[#466a50] hover:bg-[#344f3b] text-white font-semibold"
                size="lg"
              >
                Nộp bài ngay
              </Button>
            </div>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
}
