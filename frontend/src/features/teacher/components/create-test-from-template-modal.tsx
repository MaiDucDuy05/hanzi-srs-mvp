"use client";

import { useEffect, useState } from "react";
import { testTemplateApi, testSectionApi } from "@/lib/api/endpoints";
import type { TestTemplate, TestSection } from "@/lib/api/endpoints";
import { useRouter } from "next/navigation";
import {
  BookOpen, Clock, CheckCircle2, Circle, Zap, PenLine,
  ChevronRight, X, Headphones, Eye, Pencil, RotateCcw
} from "lucide-react";

const CATEGORY_LABELS: Record<string, string> = {
  QUIZ_15M: "Kiểm tra 15 phút",
  TEST_1H: "Kiểm tra 1 tiếng",
  MID_TERM: "Thi giữa kỳ",
  FINAL_EXAM: "Thi cuối kỳ",
  CUSTOM: "Bài tập tùy chỉnh",
};

const SKILL_ICONS: Record<string, React.ReactNode> = {
  LISTENING: <Headphones className="h-4 w-4" />,
  READING: <Eye className="h-4 w-4" />,
  WRITING: <Pencil className="h-4 w-4" />,
  GRAMMAR: <BookOpen className="h-4 w-4" />,
};

const SKILL_COLORS: Record<string, string> = {
  LISTENING: "bg-blue-50 text-blue-700 border-blue-200",
  READING: "bg-green-50 text-green-700 border-green-200",
  WRITING: "bg-purple-50 text-purple-700 border-purple-200",
  GRAMMAR: "bg-orange-50 text-orange-700 border-orange-200",
};

interface Props {
  open: boolean;
  onClose: () => void;
  hskLevel?: number;
}

export function CreateTestFromTemplateModal({ open, onClose, hskLevel }: Props) {
  const router = useRouter();
  const [templates, setTemplates] = useState<TestTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<TestTemplate | null>(null);
  const [testName, setTestName] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterLevel, setFilterLevel] = useState<number>(hskLevel ?? 3);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    testTemplateApi.list({ hskLevel: filterLevel })
      .then((res) => setTemplates(Array.isArray(res) ? res : []))
      .catch(() => setTemplates([]))
      .finally(() => setLoading(false));
  }, [open, filterLevel]);

  const handleCreate = async () => {
    if (!selected) return;
    setCreating(true);
    setError(null);
    try {
      const result = await testTemplateApi.createTest(selected.id, testName || undefined);
      onClose();
      router.push(`/teacher/exams/${result.test.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lỗi tạo đề thi");
    } finally {
      setCreating(false);
    }
  };

  if (!open) return null;

  const grouped = templates.reduce((acc, t) => {
    const key = t.category;
    if (!acc[key]) acc[key] = [];
    acc[key].push(t);
    return acc;
  }, {} as Record<string, TestTemplate[]>);

  const categoryOrder = ["QUIZ_15M", "TEST_1H", "MID_TERM", "FINAL_EXAM"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[28px] w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-extrabold text-[#1f5333]">Tạo đề thi từ Template</h2>
            <p className="text-[13px] text-gray-500 mt-0.5">Chọn cấu trúc đề chuẩn HSK để bắt đầu</p>
          </div>
          <button onClick={onClose} className="h-9 w-9 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {/* HSK Level Filter */}
        <div className="px-8 pt-5 pb-3">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Cấp độ HSK</p>
          <div className="flex gap-2 flex-wrap">
            {[1, 2, 3, 4, 5, 6].map((lvl) => (
              <button
                key={lvl}
                onClick={() => { setFilterLevel(lvl); setSelected(null); }}
                className={`px-4 py-1.5 rounded-full text-[13px] font-bold border transition-all ${
                  filterLevel === lvl
                    ? "bg-[#1f5333] text-white border-[#1f5333]"
                    : "bg-white text-gray-600 border-gray-200 hover:border-[#1f5333]"
                }`}
              >HSK {lvl}</button>
            ))}
          </div>
        </div>

        {/* Template List */}
        <div className="flex-1 overflow-y-auto px-8 py-3 space-y-5">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 rounded-full border-2 border-[#1f5333] border-t-transparent animate-spin" />
            </div>
          ) : (
            categoryOrder.map((cat) => {
              const items = grouped[cat];
              if (!items?.length) return null;
              return (
                <div key={cat}>
                  <p className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest mb-2">
                    {CATEGORY_LABELS[cat]}
                  </p>
                  <div className="space-y-2">
                    {items.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => { setSelected(t); setTestName(t.name); }}
                        className={`w-full text-left rounded-2xl border-2 p-4 transition-all ${
                          selected?.id === t.id
                            ? "border-[#1f5333] bg-[#f0f9f4]"
                            : "border-gray-100 hover:border-gray-200 bg-white"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {selected?.id === t.id
                              ? <CheckCircle2 className="h-5 w-5 text-[#1f5333] shrink-0" />
                              : <Circle className="h-5 w-5 text-gray-300 shrink-0" />
                            }
                            <div>
                              <p className="font-bold text-[14px] text-gray-800">{t.name}</p>
                              <div className="flex items-center gap-2 mt-1 flex-wrap">
                                <span className="flex items-center gap-1 text-[12px] text-gray-500">
                                  <Clock className="h-3.5 w-3.5" /> {t.timeLimitMinutes} phút
                                </span>
                                {t.sections?.map((s) => (
                                  <span key={s.id} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold border ${SKILL_COLORS[s.targetSkill]}`}>
                                    {SKILL_ICONS[s.targetSkill]} {s.questionCount} câu
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-gray-300 shrink-0" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer: Selected + Create */}
        {selected && (
          <div className="px-8 py-5 border-t border-gray-100 space-y-3">
            <div>
              <label className="text-[12px] font-bold text-gray-500 mb-1.5 block">Tên bài thi (tùy chỉnh)</label>
              <input
                type="text"
                value={testName}
                onChange={(e) => setTestName(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-[14px] font-medium outline-none focus:border-[#1f5333] transition-colors"
                placeholder="Tên bài thi..."
              />
            </div>
            {error && <p className="text-red-500 text-[13px]">{error}</p>}
            <div className="flex gap-3">
              <button
                onClick={handleCreate}
                disabled={creating}
                className="flex-1 bg-[#1f5333] text-white rounded-xl py-3 font-bold text-[14px] flex items-center justify-center gap-2 hover:bg-[#17432a] transition-colors disabled:opacity-60"
              >
                {creating ? (
                  <RotateCcw className="h-4 w-4 animate-spin" />
                ) : (
                  <Zap className="h-4 w-4" />
                )}
                {creating ? "Đang tạo..." : "Tạo đề thi"}
              </button>
              <button
                onClick={() => setSelected(null)}
                className="px-5 border border-gray-200 rounded-xl font-bold text-[14px] text-gray-500 hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
