'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/features/ui/components/modal';
import { Button } from '@/features/ui/components/button';
import { Badge } from '@/features/ui/components/badge';
import { curriculumApi } from '@/lib/api/endpoints/curriculum';
import { studyApi, type GeneratedQuestionItem } from '@/lib/api/endpoints/study';
import type { HskLevel, Lesson } from '@/lib/api/types';
import { Wand2, Sparkles, CheckCircle, RefreshCw, Trash2, ArrowRight, BookOpen, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useAuth } from '@/lib/auth/auth-context';

interface ExamAIGenerateModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ExamAIGenerateModal({ open, onClose, onSuccess }: ExamAIGenerateModalProps) {
  const { user } = useAuth();
  // Step 1: Config, Step 2: Preview & Edit, Step 3: Test Details & Save
  const [step, setStep] = useState<1 | 2>(1);


  // Curriculum State
  const [levels, setLevels] = useState<HskLevel[]>([]);
  const [selectedLevelId, setSelectedLevelId] = useState<string>('');
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState<string>('');
  const [lessonVocabs, setLessonVocabs] = useState<any[]>([]);

  // Generation Config State
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['SINGLE_CHOICE', 'FILL_IN', 'ORDERING']);
  const [difficulty, setDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>('MEDIUM');
  const [customWords, setCustomWords] = useState<string>('');

  // Generated Questions State
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestionItem[]>([]);

  // Test Details State
  const [testName, setTestName] = useState<string>('');
  const [timeLimitMinutes, setTimeLimitMinutes] = useState<number>(15);

  // Load levels on open
  useEffect(() => {
    if (open) {
      setStep(1);
      setError(null);
      setGeneratedQuestions([]);
      curriculumApi.listLevels().then((res) => {
        setLevels(res);
        if (res.length > 0 && !selectedLevelId) {
          setSelectedLevelId(res[0].id);
        }
      }).catch((e) => console.error(e));
    }
  }, [open]);

  // Load lessons when level changes
  useEffect(() => {
    if (selectedLevelId) {
      curriculumApi.listLessons({ levelId: selectedLevelId }).then((res) => {
        setLessons(res);
        if (res.length > 0) {
          setSelectedLessonId(res[0].id);
        } else {
          setSelectedLessonId('');
        }
      }).catch((e) => console.error(e));
    }
  }, [selectedLevelId]);

  // Load vocabularies when lesson changes
  useEffect(() => {
    if (selectedLessonId) {
      curriculumApi.getLessonContents(selectedLessonId).then((res) => {
        setLessonVocabs(res.vocabularies || []);
      }).catch(() => setLessonVocabs([]));

      // Auto-populate test name
      const curLesson = lessons.find((l) => l.id === selectedLessonId);
      const curLevel = levels.find((lvl) => lvl.id === selectedLevelId);
      if (curLesson) {
        setTestName(`Kiểm tra từ vựng: ${curLesson.title} (${curLevel?.name || 'HSK'})`);
      }
    }
  }, [selectedLessonId, lessons, levels, selectedLevelId]);

  const toggleType = (t: string) => {
    if (selectedTypes.includes(t)) {
      if (selectedTypes.length > 1) {
        setSelectedTypes(selectedTypes.filter((x) => x !== t));
      }
    } else {
      setSelectedTypes([...selectedTypes, t]);
    }
  };

  const handleGenerateQuestions = async () => {
    setGenerating(true);
    setError(null);
    try {
      const curLevel = levels.find((lvl) => lvl.id === selectedLevelId);
      const wordsArray = customWords
        .split(/[,，\n]/)
        .map((w) => w.trim())
        .filter((w) => w.length > 0);

      const res = await studyApi.generateExamQuestions({
        lessonId: selectedLessonId || undefined,
        customWords: wordsArray.length > 0 ? wordsArray : undefined,
        count: questionCount,
        level: curLevel?.name || 'HSK 1',
        questionTypes: selectedTypes,
        difficulty,
      });

      if (!res || res.length === 0) {
        throw new Error('AI không tạo được câu hỏi nào, vui lòng thử lại.');
      }

      setGeneratedQuestions(res);
      setStep(2);
    } catch (err: any) {
      setError(err?.message || 'Có lỗi xảy ra khi tạo câu hỏi với AI.');
    } finally {
      setGenerating(false);
    }
  };

  const handleDeleteQuestion = (idx: number) => {
    setGeneratedQuestions((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleCreateTest = async () => {
    if (!testName.trim()) {
      setError('Vui lòng nhập tên bài kiểm tra.');
      return;
    }
    if (generatedQuestions.length === 0) {
      setError('Không có câu hỏi nào để tạo bài kiểm tra.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const curLevel = levels.find((lvl) => lvl.id === selectedLevelId);
      const levelNum = curLevel?.displayOrder || 1;

      await studyApi.generateAndCreateTest({
        testName,
        hskLevel: levelNum,
        timeLimitMinutes,
        lessonId: selectedLessonId || undefined,
        customWords: customWords.split(/[,，\n]/).map((w) => w.trim()).filter(Boolean),
        count: generatedQuestions.length,
        questionTypes: selectedTypes,
        difficulty,
        teacherId: user?.id,
        questions: generatedQuestions, // Pass the already generated/reviewed questions!
      } as any);

      onSuccess();
      onClose();


    } catch (err: any) {
      setError(err?.message || 'Lỗi khi lưu bài kiểm tra vào hệ thống.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      wide={true}
      title={
        <div>
          <h3 className="text-lg font-bold text-[#1f5333]">Sinh bài tập kiểm tra từ vựng bằng AI</h3>
          <p className="text-xs text-gray-500 font-normal mt-0.5">Sử dụng trí tuệ nhân tạo (Gemini) để tự động tạo đề thi bám sát bài học từ vựng.</p>
        </div>
      }
    >
      <div className="space-y-6 pt-2">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-center gap-3 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: CONFIGURATION */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Cấp độ HSK</label>
                <select
                  value={selectedLevelId}
                  onChange={(e) => setSelectedLevelId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#466a50] text-sm"
                >
                  {levels.map((lvl) => (
                    <option key={lvl.id} value={lvl.id}>
                      {lvl.name} ({lvl.code})
                    </option>
                  ))}
                </select>
              </div>


              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Bài giảng từ vựng</label>
                <select
                  value={selectedLessonId}
                  onChange={(e) => setSelectedLessonId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#466a50] text-sm"
                >
                  {lessons.length === 0 ? (
                    <option value="">Chưa có bài học</option>
                  ) : (
                    lessons.map((ls) => (
                      <option key={ls.id} value={ls.id}>
                        {ls.title}
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>

            {/* Vocab preview badges */}
            {lessonVocabs.length > 0 && (
              <div className="p-4 bg-[#f8faf8] border border-[#e9efe7] rounded-2xl">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="w-4 h-4 text-[#466a50]" />
                  <span className="text-xs font-bold text-[#466a50] uppercase tracking-wider">
                    Từ vựng trong bài ({lessonVocabs.length} từ):
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                  {lessonVocabs.map((v, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 bg-white border border-[#d2dfd5] text-[#2c4e36] text-xs font-medium rounded-lg shadow-2xs"
                    >
                      {v.hanzi} ({v.pinyin || ''})
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Custom additional words */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Hoặc nhập thêm từ vựng cần kiểm tra (phân cách bằng dấu phẩy)
              </label>
              <input
                type="text"
                placeholder="VD: 苹果, 学习, 朋友, 医生"
                value={customWords}
                onChange={(e) => setCustomWords(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#466a50] text-sm"
              />
            </div>

            {/* Question options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-gray-700">Số lượng câu hỏi</label>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-gray-500">Tùy chọn:</span>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={questionCount}
                      onChange={(e) => {
                        const val = Math.max(1, Math.min(50, Number(e.target.value) || 1));
                        setQuestionCount(val);
                      }}
                      className="w-16 px-2 py-1 bg-white border border-gray-200 rounded-lg text-sm text-center font-bold text-[#466a50] focus:outline-none focus:border-[#466a50]"
                    />
                    <span className="text-xs text-gray-500 font-medium">câu</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {[5, 10, 20, 30, 40].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setQuestionCount(c)}
                      className={cn(
                        'flex-1 py-1.5 rounded-xl text-xs font-bold border transition-all',
                        questionCount === c
                          ? 'bg-[#466a50] text-white border-[#466a50] shadow-sm'
                          : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                      )}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>


              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Độ khó</label>
                <div className="flex items-center gap-3">
                  {[
                    { id: 'EASY', label: 'Dễ' },
                    { id: 'MEDIUM', label: 'Trung bình' },
                    { id: 'HARD', label: 'Khó' },
                  ].map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setDifficulty(d.id as any)}
                      className={cn(
                        'flex-1 py-2 rounded-xl text-sm font-bold border transition-all',
                        difficulty === d.id
                          ? 'bg-[#466a50] text-white border-[#466a50] shadow-sm'
                          : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                      )}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Allowed question types */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Dạng câu hỏi cho phép</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'SINGLE_CHOICE', label: 'Trắc nghiệm (MCQ)' },
                  { id: 'FILL_IN', label: 'Điền từ vào chỗ trống' },
                  { id: 'ORDERING', label: 'Sắp xếp trật tự câu' },
                ].map((type) => {
                  const isChecked = selectedTypes.includes(type.id);
                  return (
                    <div
                      key={type.id}
                      onClick={() => toggleType(type.id)}
                      className={cn(
                        'p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between',
                        isChecked
                          ? 'border-[#466a50] bg-[#eaf1ec]'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      )}
                    >
                      <span className={cn('text-sm font-semibold', isChecked ? 'text-[#2c4e36]' : 'text-gray-600')}>
                        {type.label}
                      </span>
                      <div
                        className={cn(
                          'w-5 h-5 rounded-full flex items-center justify-center text-white text-xs',
                          isChecked ? 'bg-[#466a50]' : 'bg-gray-200'
                        )}
                      >
                        ✓
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <Button variant="secondary" onClick={onClose} disabled={generating}>
                Đóng
              </Button>
              <Button
                variant="primary"
                onClick={handleGenerateQuestions}
                disabled={generating || (!selectedLessonId && !customWords.trim())}
                className="bg-[#466a50] hover:bg-[#385540] text-white flex items-center gap-2"
              >
                {generating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    AI đang soạn câu hỏi...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Bắt đầu sinh câu hỏi
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2: PREVIEW & CREATE TEST */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Header info bar */}
            <div className="flex items-center justify-between bg-[#f2f7f3] p-4 rounded-2xl border border-[#dce8df]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#466a50]" />
                <span className="text-sm font-bold text-[#2c4e36]">
                  AI đã tạo thành công {generatedQuestions.length} câu hỏi
                </span>
              </div>
              <button
                onClick={() => setStep(1)}
                className="text-xs text-[#466a50] hover:underline font-semibold flex items-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Tạo lại cấu hình
              </button>
            </div>

            {/* Test info inputs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Tên bài kiểm tra
                </label>
                <input
                  type="text"
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                  className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#466a50] text-sm font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Thời gian làm (phút)
                </label>
                <input
                  type="number"
                  min={5}
                  max={120}
                  value={timeLimitMinutes}
                  onChange={(e) => setTimeLimitMinutes(Number(e.target.value))}
                  className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#466a50] text-sm"
                />
              </div>
            </div>

            {/* Questions List Preview */}
            <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
              {generatedQuestions.map((q, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-white border border-gray-200 rounded-2xl relative hover:border-[#466a50]/40 transition-colors shadow-2xs group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#eef4f0] text-[#34533c] text-xs font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <Badge tone="green" className="text-xs font-bold">
                        {q.type}
                      </Badge>
                      {q.targetVocab && (
                        <span className="text-xs text-gray-500 font-medium">
                          Từ đích: <strong className="text-gray-800">{q.targetVocab}</strong>
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteQuestion(idx)}
                      className="text-gray-400 hover:text-red-500 p-1 rounded-lg transition-colors"
                      title="Xóa câu hỏi này"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Question Prompt */}
                  <p className="text-sm font-medium text-gray-800 mb-3">
                    {q.content.questionText || q.content.question || q.content.prompt}
                  </p>

                  {/* Question details based on type */}
                  {q.type === 'SINGLE_CHOICE' && q.content.options && (
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {q.content.options.map((opt, i) => (
                        <div
                          key={i}
                          className={cn(
                            'px-3 py-1.5 rounded-lg text-xs border font-medium flex items-center justify-between',
                            opt === q.content.correctAnswer
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold'
                              : 'bg-gray-50 border-gray-200 text-gray-600'
                          )}
                        >
                          <span>{opt}</span>
                          {opt === q.content.correctAnswer && <span className="text-[10px] text-emerald-600">✓ Đúng</span>}
                        </div>
                      ))}
                    </div>
                  )}

                  {q.type === 'FILL_IN' && (
                    <div className="p-2.5 bg-emerald-50/60 border border-emerald-200 rounded-xl text-xs text-emerald-900 mt-2">
                      <strong>Đáp án chấp nhận: </strong>
                      {(q.content.acceptedAnswers || []).join(', ')}
                    </div>
                  )}

                  {q.type === 'ORDERING' && q.content.correctOrder && (
                    <div className="p-2.5 bg-emerald-50/60 border border-emerald-200 rounded-xl text-xs text-emerald-900 mt-2">
                      <strong>Thứ tự đúng: </strong>
                      {q.content.correctOrder.join(' → ')}
                    </div>
                  )}

                  {q.explanation && (
                    <p className="text-xs text-gray-500 italic mt-2.5 pt-2 border-t border-gray-100">
                      💡 {q.explanation}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Step 2 Actions */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
              <Button variant="secondary" onClick={() => setStep(1)} disabled={saving}>
                Quay lại
              </Button>
              <Button
                variant="primary"
                onClick={handleCreateTest}
                disabled={saving || generatedQuestions.length === 0}
                className="bg-[#466a50] hover:bg-[#385540] text-white flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Đang lưu bài thi...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Lưu đề thi ({generatedQuestions.length} câu)
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
