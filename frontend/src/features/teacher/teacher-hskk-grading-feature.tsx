'use client';

import { 
  ClipboardList, 
  RotateCcw, 
  Play, 
  RotateCw, 
  History, 
  Send,
  Bold,
  Italic,
  Mic,
  Sparkles,
  PenLine
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { testApi } from '@/lib/api/endpoints/test';
import type { TestAttempt, TestAnswer, TestQuestion, Test } from '@/lib/api/types';
import { formatDistanceToNow } from 'date-fns';

export function TeacherHskkGradingFeature() {
  const [attempts, setAttempts] = useState<TestAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAttemptId, setSelectedAttemptId] = useState<string | null>(null);
  
  const [attemptDetail, setAttemptDetail] = useState<{
    attempt: TestAttempt;
    test: Test;
    questions: TestQuestion[];
    answers: TestAnswer[];
  } | null>(null);
  
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);
  const [gradePoints, setGradePoints] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    testApi.listAttempts({ limit: 50, status: 'SUBMITTED' }).then(res => {
      const attemptsArray = res || [];
      setAttempts(attemptsArray);
      setLoading(false);
      if (attemptsArray.length > 0) {
        setSelectedAttemptId(attemptsArray[0].id);
      }
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!selectedAttemptId) return;
    setLoadingDetail(true);
    testApi.getAttemptResult(selectedAttemptId).then(res => {
      setAttemptDetail(res);
      setLoadingDetail(false);
      // Select the first question that requires manual grading (e.g., SHORT_ANSWER), fallback to first question
      const manualQs = res.questions.filter(q => q.question.type === 'SHORT_ANSWER');
      if (manualQs.length > 0) {
        setActiveQuestionId(manualQs[0].id);
      } else if (res.questions.length > 0) {
        setActiveQuestionId(res.questions[0].id);
      }
    }).catch(err => {
      console.error(err);
      setLoadingDetail(false);
    });
  }, [selectedAttemptId]);

  // Set grade points when active question changes
  useEffect(() => {
    if (activeQuestionId && attemptDetail) {
      const existingAnswer = attemptDetail.answers.find(a => a.questionId === activeQuestionId);
      if (existingAnswer) {
        setGradePoints(existingAnswer.pointsAwarded || 0);
      } else {
        setGradePoints(0);
      }
    }
  }, [activeQuestionId, attemptDetail]);

  const handleGradeSubmit = async () => {
    if (!selectedAttemptId || !activeQuestionId) return;
    try {
      setIsSubmitting(true);
      await testApi.gradeAnswer(selectedAttemptId, activeQuestionId, gradePoints);
      alert('Đã cập nhật điểm thành công!');
      // Refresh list to update total score
      const res = await testApi.listAttempts({ limit: 50, status: 'SUBMITTED' });
      setAttempts(res || []);
      // Refresh detail
      const detailRes = await testApi.getAttemptResult(selectedAttemptId);
      setAttemptDetail(detailRes);
    } catch (err) {
      console.error(err);
      alert('Có lỗi xảy ra khi cập nhật điểm');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteGrading = async () => {
    if (!selectedAttemptId) return;
    if (!window.confirm('Bạn có chắc chắn muốn hoàn thành việc chấm điểm cho bài thi này? Bài thi sẽ được chuyển sang trạng thái Đã chấm.')) return;
    try {
      setIsSubmitting(true);
      await testApi.completeGrading(selectedAttemptId);
      alert('Đã hoàn thành chấm điểm!');
      // Remove from list
      setAttempts(prev => {
        const updated = prev.filter(a => a.id !== selectedAttemptId);
        if (updated.length > 0) {
          setSelectedAttemptId(updated[0].id);
        } else {
          setSelectedAttemptId(null);
          setAttemptDetail(null);
        }
        return updated;
      });
    } catch (err) {
      console.error(err);
      alert('Có lỗi xảy ra khi hoàn thành chấm điểm');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAutoGrade = async () => {
    if (!selectedAttemptId) return;
    try {
      setIsSubmitting(true);
      await testApi.autoGradeObjective(selectedAttemptId);
      
      // Refresh detail
      const detailRes = await testApi.getAttemptResult(selectedAttemptId);
      setAttemptDetail(detailRes);
      
      // Find first subjective question to focus on
      const subjectiveQs = detailRes.questions.filter(q => q.question.type === 'SHORT_ANSWER' || q.question.type === 'SPEAKING' || q.question.type === 'WRITING');
      if (subjectiveQs.length > 0) {
        setActiveQuestionId(subjectiveQs[0].id);
        alert('Đã tự động chấm trắc nghiệm! Bạn có thể bắt đầu chấm các câu tự luận/nói.');
      } else {
        alert('Đã tự động chấm xong toàn bài!');
      }
    } catch (err) {
      console.error(err);
      alert('Có lỗi xảy ra khi tự động chấm');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStudentName = (attempt: TestAttempt) => attempt.user?.fullName || 'Học viên ẩn danh';

  return (
    <div className="max-w-[1200px] pb-20 animate-in fade-in duration-300 h-full flex flex-col">
      
      <div className="flex flex-col lg:flex-row gap-8 flex-1">
        
        {/* Left Column: Pending Tasks */}
        <div className="w-full lg:w-[350px] shrink-0">
          <div className="bg-white rounded-[32px] border border-gray-100 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] h-full min-h-[600px] flex flex-col overflow-hidden">
            
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#1f5333]">
                <ClipboardList className="h-5 w-5" strokeWidth={2.5} />
                <h2 className="font-extrabold text-[16px]">Cần chấm điểm</h2>
              </div>
              <span className="bg-[#eef5e9] text-[#558866] px-3 py-1 rounded-full text-[11px] font-extrabold">{attempts.length} Bài</span>
            </div>

            <div className="p-4 space-y-3 overflow-y-auto flex-1">
              {loading ? (
                <div className="text-center text-sm text-gray-500 py-4">Đang tải...</div>
              ) : attempts.length === 0 ? (
                <div className="text-center text-sm text-gray-500 py-4">Không có bài nào</div>
              ) : attempts.map(attempt => {
                const isSelected = attempt.id === selectedAttemptId;
                return (
                  <div 
                    key={attempt.id}
                    onClick={() => setSelectedAttemptId(attempt.id)}
                    className={`rounded-3xl p-5 transition-all cursor-pointer relative ${
                      isSelected 
                        ? 'bg-[#fcfce8] border border-[#eaf3c5] shadow-sm' 
                        : 'bg-white border border-gray-100 hover:border-gray-200 hover:shadow-sm'
                    }`}
                  >
                    {isSelected && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-[#78993a] rounded-r-md" />}
                    <div className="flex items-start justify-between mb-3 pl-2">
                      <div className="flex items-center gap-3">
                        <img 
                          src={`https://api.dicebear.com/7.x/notionists/svg?seed=${getStudentName(attempt).replace(/\s/g, '')}`} 
                          alt={getStudentName(attempt)} 
                          className="h-10 w-10 rounded-full bg-white border border-[#eaf3c5]"
                        />
                        <div>
                          <h3 className={`font-extrabold text-[15px] ${isSelected ? 'text-[#1f5333]' : 'text-gray-700'}`}>{getStudentName(attempt)}</h3>
                          <p className="text-[11px] text-gray-500 font-medium">
                            {formatDistanceToNow(new Date(attempt.submittedAt || attempt.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold ${isSelected ? 'bg-[#c7cf35] text-[#1f5333]' : 'bg-gray-100 text-gray-500'}`}>
                        {attempt.score}đ
                      </span>
                    </div>
                    <p className="text-[13px] text-gray-600 font-medium pl-2 line-clamp-1">{attempt.test?.name}</p>
                  </div>
                );
              })}
            </div>

          </div>
        </div>

        {/* Right Column: Grading Area */}
        <div className="flex-1 flex flex-col gap-6">
          
          {!selectedAttemptId || loadingDetail || !attemptDetail ? (
            <div className="flex-1 flex items-center justify-center bg-white rounded-[32px] border border-gray-100 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)]">
              <p className="text-gray-500 font-medium">Vui lòng chọn một bài làm để xem chi tiết</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <h1 className="text-[28px] font-extrabold text-[#1f5333] tracking-tight line-clamp-1">{getStudentName(attemptDetail.attempt)}'s Submission</h1>
                    <span className="bg-[#f3f4e1] border border-[#eaf3c5] text-[#78993a] px-3 py-1 rounded-full text-[11px] font-extrabold flex items-center gap-1.5 shadow-sm whitespace-nowrap">
                      <Sparkles className="h-3 w-3" /> Điểm: {attemptDetail.attempt.score}
                    </span>
                  </div>
                  <button 
                    onClick={handleAutoGrade}
                    disabled={isSubmitting}
                    className="bg-white text-[#1f5333] px-4 py-2 rounded-full text-[13px] font-bold border border-[#1f5333]/20 hover:bg-[#f3f4e1] transition-all flex items-center gap-2"
                  >
                    <RotateCw className={`h-4 w-4 ${isSubmitting ? 'animate-spin' : ''}`} />
                    Tự động chấm trắc nghiệm
                  </button>
                </div>
                <p className="text-[15px] text-gray-600 font-medium">{attemptDetail.test.name}</p>
              </div>

              {/* Question Selection Matrix */}
              {attemptDetail.questions.length > 0 && (
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] mb-4">
                  <h3 className="font-extrabold text-[#1f5333] mb-4">Danh sách câu hỏi</h3>
                  <div className="flex flex-wrap gap-3">
                    {attemptDetail.questions.map((q, idx) => {
                      const answer = attemptDetail.answers.find(a => a.questionId === q.id);
                      // Consider it graded if it has pointsAwarded
                      const isGraded = answer && answer.pointsAwarded !== null && answer.pointsAwarded !== undefined;
                      const isActive = activeQuestionId === q.id;

                      let btnClass = 'w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm transition-all border-2 ';
                      if (isActive) {
                        btnClass += 'border-[#1f5333] ring-4 ring-[#eaf3c5] ';
                      } else {
                        btnClass += 'border-transparent hover:border-gray-200 ';
                      }

                      if (isGraded) {
                        btnClass += isActive ? 'bg-[#1f5333] text-white' : 'bg-[#eaf3c5] text-[#1f5333]';
                      } else {
                        btnClass += isActive ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-500';
                      }

                      return (
                        <button
                          key={q.id}
                          onClick={() => setActiveQuestionId(q.id)}
                          className={btnClass}
                          title={q.question.type}
                        >
                          {idx + 1}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-6 mt-4 text-xs font-bold text-gray-500">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-[#eaf3c5]"></div>
                      <span>Đã chấm</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-gray-100"></div>
                      <span>Chưa chấm</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Grading Block */}
              {(() => {
                const activeQuestion = attemptDetail.questions.find(q => q.id === activeQuestionId);
                const activeAnswer = attemptDetail.answers.find(a => a.questionId === activeQuestionId);
                
                if (!activeQuestion) return null;

                return (
                  <>
                    <div className="bg-[#fcfce8] border border-[#eaf3c5] rounded-[40px] p-8 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.02)] relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-white/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
                      
                      <div className="relative z-10">
                        <h3 className="font-extrabold text-[#1f5333] mb-4">Nội dung câu hỏi:</h3>
                        <div 
                          className="text-gray-700 mb-6 font-medium text-sm prose"
                          dangerouslySetInnerHTML={{ __html: activeQuestion.question.content?.text || '' }}
                        />

                        <h3 className="font-extrabold text-[#1f5333] mb-4">Câu trả lời của học viên:</h3>
                        
                        {activeAnswer ? (
                          <div className="bg-white/60 p-4 rounded-2xl border border-[#eaf3c5]">
                            <pre className="text-sm text-gray-700 whitespace-pre-wrap font-medium">
                              {JSON.stringify(activeAnswer.answer, null, 2)}
                            </pre>
                            {/* If there's an audioUrl, render player here */}
                            {(activeAnswer.answer as any)?.audioUrl && (
                               <audio src={(activeAnswer.answer as any).audioUrl} controls className="mt-4 w-full" />
                            )}
                          </div>
                        ) : (
                          <p className="text-gray-400 italic font-medium">Học viên không trả lời câu hỏi này.</p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col xl:flex-row gap-6 flex-1">
                      
                      {/* Assessment Rubric */}
                      <div className="flex-1 bg-white rounded-[32px] p-6 border border-gray-100 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)]">
                        <div className="flex items-center gap-2 text-[#1f5333] mb-6 border-b border-gray-100 pb-4">
                          <ClipboardList className="h-5 w-5" strokeWidth={2.5} />
                          <h2 className="font-extrabold text-[16px]">Chấm điểm</h2>
                        </div>
                        
                        <div className="space-y-6">
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-[13px] font-bold text-gray-700">Điểm số đạt được</span>
                              <span className="text-[13px] font-extrabold text-[#78993a] bg-[#eef5e9] px-2 py-0.5 rounded">{gradePoints} / {activeQuestion.points}</span>
                            </div>
                            <input 
                              type="range" 
                              min="0" 
                              max={activeQuestion.points} 
                              value={gradePoints} 
                              onChange={(e) => setGradePoints(Number(e.target.value))}
                              className="w-full accent-[#1f5333]"
                            />
                            <div className="flex justify-between mt-2 text-xs font-bold text-gray-400">
                              <span>0đ</span>
                              <span>{activeQuestion.points}đ</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Teacher Notes */}
                      <div className="flex-1 bg-white rounded-[32px] p-6 border border-gray-100 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2 text-[#1f5333]">
                            <PenLine className="h-5 w-5" strokeWidth={2.5} />
                            <h2 className="font-extrabold text-[16px]">Nhận xét (Sắp ra mắt)</h2>
                          </div>
                        </div>
                        
                        <div className="flex-1 bg-[#fcfce8] border border-[#eaf3c5] rounded-3xl p-5 flex flex-col relative opacity-50 pointer-events-none">
                          <textarea 
                            className="w-full flex-1 bg-transparent border-none resize-none outline-none text-[14px] font-medium text-[#4a5a3a] placeholder:text-[#a0af80]"
                            placeholder="Type your feedback here..."
                            disabled
                          />
                        </div>
                      </div>

                    </div>
                    
                    {/* Footer Actions */}
                    <div className="flex items-center justify-between mt-4 mb-8">
                      <button 
                        onClick={handleCompleteGrading}
                        disabled={isSubmitting}
                        className="bg-[#eef5e9] text-[#1f5333] px-6 py-3 rounded-full text-[14px] font-bold hover:bg-[#eaf3c5] transition-all border border-[#1f5333]/20 disabled:opacity-50"
                      >
                        Hoàn thành chấm điểm
                      </button>
                      <button 
                        onClick={handleGradeSubmit}
                        disabled={isSubmitting || !activeAnswer}
                        className="bg-[#1f5333] text-white px-8 py-3 rounded-full text-[14px] font-bold hover:bg-[#1b462b] transition-all shadow-lg shadow-[#1f5333]/20 flex items-center gap-2 disabled:opacity-50"
                      >
                        <Send className="h-4 w-4" /> {isSubmitting ? 'Đang lưu...' : 'Lưu điểm câu này'}
                      </button>
                    </div>
                  </>
                );
              })()}
            </>
          )}

        </div>

      </div>

    </div>
  );
}
