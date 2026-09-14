"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeft, Trash2, BookOpen, CheckCircle2, AlertCircle,
  Zap, Plus, Headphones, Eye, Pencil, GraduationCap, Clock, Info
} from "lucide-react";
import { testApi } from "@/lib/api/endpoints/test";
import { testSectionApi } from "@/lib/api/endpoints";
import type { TestSection, TestValidationResult } from "@/lib/api/endpoints";
import type { Test, TestQuestion } from "@/lib/api/types";
import { Button } from "@/features/ui/components/button";
import { Card, CardBody } from "@/features/ui/components/card";
import { PageLoading } from "@/features/ui/components/spinner";
import { ErrorState } from "@/features/ui/components/error-state";
import { Badge } from "@/features/ui/components/badge";
import { QuestionRenderer } from "./components/question-renderer";
import { TestAddBankModal } from "./components/test-add-bank-modal";
import { ExamCreateModal } from "./components/exam-create-modal";
import { Settings } from "lucide-react";
import { cn } from "@/lib/utils/cn";

// ─────────────────────────────────────────────
const SKILL_LABEL: Record<string, string> = {
  LISTENING: "Nghe hiểu",
  READING: "Đọc hiểu",
  WRITING: "Viết",
  GRAMMAR: "Ngữ pháp",
};

const SKILL_ICON: Record<string, React.ReactNode> = {
  LISTENING: <Headphones className="h-4 w-4" />,
  READING: <Eye className="h-4 w-4" />,
  WRITING: <Pencil className="h-4 w-4" />,
  GRAMMAR: <BookOpen className="h-4 w-4" />,
};

const SKILL_COLOR: Record<string, string> = {
  LISTENING: "text-blue-600 bg-blue-50 border-blue-200",
  READING: "text-green-600 bg-green-50 border-green-200",
  WRITING: "text-purple-600 bg-purple-50 border-purple-200",
  GRAMMAR: "text-orange-600 bg-orange-50 border-orange-200",
};

// ─────────────────────────────────────────────
// Validation Bar
function ValidationBar({ result }: { result: TestValidationResult }) {
  const total = result.sections.length;
  const valid = result.sections.filter((s) => s.isValid).length;
  const pct = total ? Math.round((valid / total) * 100) : 0;

  return (
    <div className={`rounded-2xl border-2 p-5 mb-6 ${result.isValid ? "border-green-200 bg-green-50" : "border-amber-200 bg-amber-50"}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {result.isValid
            ? <CheckCircle2 className="h-5 w-5 text-green-600" />
            : <AlertCircle className="h-5 w-5 text-amber-500" />
          }
          <span className={`font-bold text-[14px] ${result.isValid ? "text-green-700" : "text-amber-700"}`}>
            {result.isValid ? "Đề thi đủ cấu trúc chuẩn — sẵn sàng xuất bản!" : `Cần bổ sung thêm câu hỏi (${valid}/${total} phần đạt chuẩn)`}
          </span>
        </div>
        <span className={`text-[12px] font-extrabold ${result.isValid ? "text-green-600" : "text-amber-600"}`}>{pct}%</span>
      </div>
      {/* Progress */}
      <div className="h-2 bg-white/60 rounded-full overflow-hidden mb-4">
        <div
          className={`h-full rounded-full transition-all duration-500 ${result.isValid ? "bg-green-500" : "bg-amber-400"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {/* Section details */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {result.sections.map((s) => (
          <div key={s.sectionId} className={`rounded-xl border px-3 py-2 flex items-center gap-2 ${s.isValid ? "border-green-200 bg-white/60" : "border-amber-200 bg-white/60"}`}>
            {s.isValid
              ? <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
              : <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
            }
            <div className="min-w-0">
              <p className="text-[12px] font-bold text-gray-700 truncate">{s.sectionName}</p>
              <p className="text-[11px] text-gray-500">
                {s.actual}/{s.required} câu
                {!s.isValid && <span className="text-amber-600 font-bold"> (thiếu {s.missing})</span>}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Section Panel
interface SectionPanelProps {
  section: TestSection;
  questions: TestQuestion[];
  onAutoGenerate: () => void;
  onAddFromBank: () => void;
  onDeleteQuestion: (q: TestQuestion) => void;
  onUpdatePoints: (q: TestQuestion, points: number) => void;
  generating: boolean;
}

function SectionPanel({ section, questions, onAutoGenerate, onAddFromBank, onDeleteQuestion, onUpdatePoints, generating }: SectionPanelProps) {
  const required = section.requiredQuestionCount ?? 0;
  const actual = questions.length;
  const isValid = required === 0 || actual >= required;
  const skill = section.targetSkill ?? "GRAMMAR";

  return (
    <div className="rounded-[20px] border-2 border-gray-100 bg-white overflow-hidden mb-5">
      {/* Section header */}
      <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-bold border ${SKILL_COLOR[skill] ?? ""}`}>
            {SKILL_ICON[skill]}
            {SKILL_LABEL[skill] ?? skill}
          </span>
          <h3 className="font-extrabold text-[15px] text-gray-800">{section.name}</h3>
        </div>
        <div className="flex items-center gap-2">
          {/* Counter badge */}
          <span className={`px-3 py-1 rounded-full text-[12px] font-extrabold border ${isValid ? "bg-green-50 text-green-700 border-green-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>
            {actual}{required > 0 ? `/${required}` : ""} câu
          </span>
          {/* Auto generate */}
          <button
            onClick={onAutoGenerate}
            disabled={generating}
            title="Bốc ngẫu nhiên câu hỏi phù hợp từ ngân hàng"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1f5333] text-white text-[12px] font-bold hover:bg-[#17432a] transition-colors disabled:opacity-50"
          >
            <Zap className="h-3.5 w-3.5" />
            {generating ? "Đang bốc..." : "Bốc ngẫu nhiên"}
          </button>
          {/* Add from bank */}
          <button
            onClick={onAddFromBank}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 text-[12px] font-bold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" /> Chọn từ ngân hàng
          </button>
        </div>
      </div>

      {/* Questions */}
      <div className="p-4">
        {questions.length === 0 ? (
          <div className="text-center py-8">
            <BookOpen className="h-8 w-8 mx-auto mb-2 text-gray-200" />
            <p className="text-gray-400 text-[13px] font-medium">Chưa có câu hỏi trong phần này</p>
            <p className="text-gray-300 text-[12px]">Bốc ngẫu nhiên hoặc chọn từ ngân hàng</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {questions.map((q, idx) => (
              <div key={q.id} className={cn("group relative", q.question.type === 'GROUP' && "col-span-1 lg:col-span-2")}>
                <QuestionRenderer question={q} index={idx} />
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg h-7 px-2 shadow-sm">
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      defaultValue={q.points}
                      className="w-10 text-xs font-medium text-center outline-none bg-transparent"
                      onBlur={async (e) => {
                        const newPoints = Number(e.target.value);
                        if (!isNaN(newPoints) && newPoints !== q.points) {
                          onUpdatePoints(q, newPoints);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.currentTarget.blur();
                        }
                      }}
                    />
                    <span className="text-[10px] text-gray-500 font-medium">điểm</span>
                  </div>
                  <button
                    onClick={() => onDeleteQuestion(q)}
                    className="h-7 w-7 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-red-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Feature
export function TestDetailFeature() {
  const { testId } = useParams<{ testId: string }>();
  const router = useRouter();

  const [test, setTest] = useState<Test | null>(null);
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [sections, setSections] = useState<TestSection[]>([]);
  const [validation, setValidation] = useState<TestValidationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generatingSectionId, setGeneratingSectionId] = useState<string | null>(null);

  // Modal states
  const [showBankModal, setShowBankModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  // For section-specific bank modal
  const [bankModalSectionId, setBankModalSectionId] = useState<string | null>(null);

  const isTemplateBased = Boolean(test?.templateId);

  const load = async () => {
    try {
      setLoading(true);
      const [t, qs] = await Promise.all([testApi.get(testId), testApi.listQuestions({ testId })]);
      setTest(t);
      setQuestions(qs.sort((a, b) => a.displayOrder - b.displayOrder));

      // Load sections nếu là template-based
      if (t.templateId) {
        const sects = await testSectionApi.list(testId);
        const sortedSects = Array.isArray(sects)
          ? sects.sort((a: TestSection, b: TestSection) => a.orderIndex - b.orderIndex)
          : [];
        setSections(sortedSects);
        // Load validation
        try {
          const val = await testSectionApi.validate(testId);
          setValidation(val);
        } catch {}
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lỗi tải dữ liệu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, [testId]);

  const handleDeleteQuestion = async (q: TestQuestion) => {
    if (!window.confirm("Xóa câu hỏi này khỏi bài kiểm tra?")) return;
    try {
      await testApi.deleteQuestion(q.id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi xóa câu hỏi.");
    }
  };

  const handleAutoGenerate = async (sectionId: string) => {
    setGeneratingSectionId(sectionId);
    try {
      await testSectionApi.autoGenerate(sectionId);
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Lỗi bốc câu hỏi. Ngân hàng có thể chưa đủ câu.");
    } finally {
      setGeneratingSectionId(null);
    }
  };

  const handlePublish = async () => {
    if (isTemplateBased && validation && !validation.isValid) {
      alert("Đề thi chưa đủ câu hỏi theo chuẩn template. Vui lòng bổ sung trước khi xuất bản.");
      return;
    }
    try {
      const newStatus = test?.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
      await testApi.update(testId, { status: newStatus });
      await load();
    } catch {
      alert("Lỗi cập nhật trạng thái");
    }
  };

  if (loading) return <PageLoading label="Đang tải chi tiết bài kiểm tra..." />;
  if (error || !test) return <ErrorState message={error || "Không tìm thấy bài kiểm tra"} onRetry={load} />;

  const questionsInSection = (sectionId: string) =>
    questions.filter((q: any) => q.sectionId === sectionId);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" /> Quay lại
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-extrabold text-gray-900 truncate">{test.name}</h1>
          {test.description && <p className="text-gray-500 text-[13px] mt-0.5 truncate">{test.description}</p>}
        </div>
        <Badge tone={test.status === "DRAFT" ? "red" : test.status === "PUBLISHED" ? "green" : "gray"}>
          {test.status === "DRAFT" ? "Nháp" : test.status === "PUBLISHED" ? "Hoạt động" : "Đóng"}
        </Badge>
        <Button
          variant="outline"
          onClick={() => setShowSettingsModal(true)}
          title="Cài đặt thông tin chung"
        >
          <Settings className="h-4 w-4" />
        </Button>
        <Button
          variant={test.status === "PUBLISHED" ? "outline" : "primary"}
          onClick={handlePublish}
        >
          {test.status === "PUBLISHED" ? "Chuyển về Nháp" : "Xuất bản"}
        </Button>
      </div>

      {/* Info bar */}
      <div className="flex items-center gap-6 px-5 py-3 bg-gray-50 rounded-2xl border border-gray-100 text-[13px]">
        <span className="flex items-center gap-1.5 text-gray-600 font-medium">
          <Clock className="h-4 w-4" /> {test.timeLimitMinutes} phút
        </span>
        <span className="flex items-center gap-1.5 text-gray-600 font-medium">
          <GraduationCap className="h-4 w-4" /> HSK {test.hskLevel || "—"}
        </span>
        <span className="flex items-center gap-1.5 text-gray-600 font-medium">
          <BookOpen className="h-4 w-4" /> {questions.length} câu hỏi
        </span>
        {isTemplateBased && (
          <span className="flex items-center gap-1.5 text-[#1f5333] font-bold">
            <Info className="h-4 w-4" /> Đề chuẩn Template HSK
          </span>
        )}
      </div>

      {/* ─── Template-based: Validation Bar + Section Panels ─── */}
      {isTemplateBased ? (
        <>
          {validation && <ValidationBar result={validation} />}

          {sections.map((section) => (
            <SectionPanel
              key={section.id}
              section={section}
              questions={questionsInSection(section.id)}
              generating={generatingSectionId === section.id}
              onAutoGenerate={() => handleAutoGenerate(section.id)}
              onAddFromBank={() => { setBankModalSectionId(section.id); setShowBankModal(true); }}
              onDeleteQuestion={handleDeleteQuestion}
              onUpdatePoints={async (q, points) => {
                try {
                  await testApi.updateQuestion(q.id, { points });
                  await load();
                } catch (err) {
                  alert('Lỗi cập nhật điểm');
                }
              }}
            />
          ))}

          {/* Câu hỏi không có section (legacy) */}
          {questions.filter((q: any) => !q.sectionId).length > 0 && (
            <div>
              <p className="text-[12px] text-gray-400 font-bold uppercase tracking-wider mb-2">Câu hỏi khác (không thuộc phần)</p>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {questions.filter((q: any) => !q.sectionId).map((q, idx) => (
                  <div key={q.id} className={cn("group relative", q.question.type === 'GROUP' && "col-span-1 lg:col-span-2")}>
                    <QuestionRenderer question={q} index={idx} />
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                      <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg h-7 px-2 shadow-sm">
                        <input
                          type="number"
                          min="0"
                          step="0.5"
                          defaultValue={q.points}
                          className="w-10 text-xs font-medium text-center outline-none bg-transparent"
                          onBlur={async (e) => {
                            const newPoints = Number(e.target.value);
                            if (!isNaN(newPoints) && newPoints !== q.points) {
                              try {
                                await testApi.updateQuestion(q.id, { points: newPoints });
                                await load();
                              } catch (err) {
                                alert('Lỗi cập nhật điểm');
                                e.target.value = String(q.points);
                              }
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.currentTarget.blur();
                            }
                          }}
                        />
                        <span className="text-[10px] text-gray-500 font-medium">điểm</span>
                      </div>
                      <button
                        onClick={() => handleDeleteQuestion(q)}
                        className="h-7 w-7 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center hover:bg-red-100"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-red-500" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        /* ─── Non-template: giao dien cu ─── */
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <BookOpen className="h-5 w-5" /> Câu hỏi ({questions.length})
            </h2>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setShowBankModal(true)}>
                + Từ Ngân hàng
              </Button>
              <Button size="sm" onClick={() => setShowCreateModal(true)}>
                + Câu mới
              </Button>
            </div>
          </div>

          {questions.length === 0 ? (
            <Card>
              <CardBody className="text-center py-12">
                <BookOpen className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="text-gray-600 font-medium">Chưa có câu hỏi nào</p>
                <p className="text-gray-500 text-sm">Thêm câu hỏi từ ngân hàng hoặc tạo câu mới</p>
              </CardBody>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {questions.map((q, idx) => (
                <div key={q.id} className={cn("group relative", q.question.type === 'GROUP' && "col-span-1 lg:col-span-2")}>
                  <QuestionRenderer question={q} index={idx} />
                  <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white p-1 rounded shadow-sm border border-gray-100">
                    <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg h-7 px-2 shadow-sm mr-2">
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        defaultValue={q.points}
                        className="w-10 text-xs font-medium text-center outline-none bg-transparent"
                        onBlur={async (e) => {
                          const newPoints = Number(e.target.value);
                          if (!isNaN(newPoints) && newPoints !== q.points) {
                            try {
                              await testApi.updateQuestion(q.id, { points: newPoints });
                              await load();
                            } catch (err) {
                              alert('Lỗi cập nhật điểm');
                              e.target.value = String(q.points);
                            }
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.currentTarget.blur();
                          }
                        }}
                      />
                      <span className="text-[10px] text-gray-500 font-medium">điểm</span>
                    </div>
                    <Button size="sm" variant="danger" className="h-8 px-2" onClick={() => handleDeleteQuestion(q)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <TestAddBankModal
        open={showBankModal}
        onClose={() => { setShowBankModal(false); setBankModalSectionId(null); }}
        onSuccess={load}
        testId={testId}
        sectionId={bankModalSectionId ?? undefined}
        existingQuestionIds={questions.map((q) => q.questionId)}
        targetSkill={sections.find(s => s.id === bankModalSectionId)?.targetSkill || undefined}
        hskLevel={test.hskLevel ?? undefined}
      />

      {test && (
        <ExamCreateModal
          open={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
          onSuccess={load}
          editingTestId={test.id}
          tests={[test]}
        />
      )}
    </div>
  );
}
