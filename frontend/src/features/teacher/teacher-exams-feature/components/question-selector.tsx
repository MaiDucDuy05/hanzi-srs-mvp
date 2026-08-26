'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Check, X, BookOpen, FileText, Layers } from 'lucide-react';
import { Question } from '../types';
import {
  SOURCE_TYPE_OPTIONS,
  DIFFICULTY_OPTIONS,
  QUESTION_TYPE_OPTIONS,
  HSK_LEVEL_OPTIONS,
  getSourceTypeBadge,
  getDifficultyColor,
  getQuestionPreview,
} from '../utils';
import { Button } from '@/features/ui/components/button';

interface QuestionSelectorProps {
  questions: Question[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onClose: () => void;
  onConfirm: () => void;
  examId: string | null;
}

export function QuestionSelector({
  questions,
  selectedIds,
  onSelectionChange,
  onClose,
  onConfirm,
  examId,
}: QuestionSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    sourceType: 'ALL',
    difficulty: '',
    questionType: '',
    hskLevel: '',
  });
  const [selectAll, setSelectAll] = useState(false);

  // Filter questions
  const filteredQuestions = questions.filter((q) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const preview = getQuestionPreview(q).toLowerCase();
      const tags = q.tags?.join(' ').toLowerCase() || '';
      if (!preview.includes(query) && !tags.includes(query)) {
        return false;
      }
    }

    // Source type filter
    if (filters.sourceType !== 'ALL' && q.sourceType !== filters.sourceType) {
      return false;
    }

    // Difficulty filter
    if (filters.difficulty && q.difficulty !== filters.difficulty) {
      return false;
    }

    // Question type filter
    if (filters.questionType && q.type !== filters.questionType) {
      return false;
    }

    // HSK level filter
    if (filters.hskLevel && q.hskLevel !== parseInt(filters.hskLevel)) {
      return false;
    }

    return true;
  });

  const handleToggle = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((i) => i !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectAll) {
      // Deselect all filtered questions
      onSelectionChange(
        selectedIds.filter((id) => !filteredQuestions.some((q) => q.id === id))
      );
    } else {
      // Select all filtered questions
      const newIds = [
        ...new Set([...selectedIds, ...filteredQuestions.map((q) => q.id)]),
      ];
      onSelectionChange(newIds);
    }
    setSelectAll(!selectAll);
  };

  const clearFilters = () => {
    setFilters({
      sourceType: 'ALL',
      difficulty: '',
      questionType: '',
      hskLevel: '',
    });
    setSearchQuery('');
  };

  const hasFilters =
    filters.sourceType !== 'ALL' ||
    filters.difficulty ||
    filters.questionType ||
    filters.hskLevel ||
    searchQuery;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-[95vw] max-w-[1400px] h-[95vh] max-h-[900px] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 bg-[#f4f7ed] rounded-xl flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-[#558866]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#1f5333]">
                  {examId ? 'Quản lý câu hỏi' : 'Chọn câu hỏi'}
                </h2>
                <p className="text-sm text-gray-500">
                  {filteredQuestions.length} câu hỏi • {selectedIds.length} đã chọn
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm câu hỏi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[15px] focus:outline-none focus:ring-2 focus:ring-[#c7cf35] focus:border-transparent"
              />
            </div>

            {/* Filter pills */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-[13px] text-gray-500">
                <Filter className="h-4 w-4" />
                <span>Lọc:</span>
              </div>

              <select
                value={filters.sourceType}
                onChange={(e) =>
                  setFilters({ ...filters, sourceType: e.target.value })
                }
                className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#c7cf35]"
              >
                {SOURCE_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              <select
                value={filters.questionType}
                onChange={(e) =>
                  setFilters({ ...filters, questionType: e.target.value })
                }
                className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#c7cf35]"
              >
                {QUESTION_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              <select
                value={filters.hskLevel}
                onChange={(e) =>
                  setFilters({ ...filters, hskLevel: e.target.value })
                }
                className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#c7cf35]"
              >
                {HSK_LEVEL_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              <select
                value={filters.difficulty}
                onChange={(e) =>
                  setFilters({ ...filters, difficulty: e.target.value })
                }
                className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#c7cf35]"
              >
                {DIFFICULTY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="px-3 py-1.5 text-[13px] text-[#e55353] hover:bg-red-50 rounded-lg transition-colors"
                >
                  Xóa lọc
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Question List */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Select All */}
          <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-xl">
            <button
              onClick={handleSelectAll}
              className={`h-5 w-5 rounded border-2 flex items-center justify-center transition-colors ${
                selectAll
                  ? 'bg-[#1f5333] border-[#1f5333] text-white'
                  : 'border-gray-300 hover:border-[#1f5333]'
              }`}
            >
              {selectAll && <Check className="h-3 w-3" />}
            </button>
            <span className="text-[14px] font-medium text-gray-700">
              Chọn tất cả {filteredQuestions.length} câu hỏi
            </span>
          </div>

          {/* Questions */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pb-4">
            {filteredQuestions.map((question) => {
              const isSelected = selectedIds.includes(question.id);
              const sourceBadge = getSourceTypeBadge(question.sourceType);

              return (
                <div
                  key={question.id}
                  onClick={() => handleToggle(question.id)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col h-full ${
                    isSelected
                      ? 'border-[#1f5333] bg-[#f4f7ed]'
                      : 'border-gray-100 bg-white hover:border-[#dde8a6]'
                  }`}
                >
                  <div className="flex items-start gap-4 h-full">
                    {/* Checkbox */}
                    <button
                      className={`mt-1 h-5 w-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-[#1f5333] border-[#1f5333] text-white'
                          : 'border-gray-300 hover:border-[#1f5333]'
                      }`}
                    >
                      {isSelected && <Check className="h-3 w-3" />}
                    </button>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center flex-wrap gap-2 mb-2">
                        {/* Source badge */}
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide"
                          style={{
                            backgroundColor: `${sourceBadge.color}20`,
                            color: sourceBadge.color,
                          }}
                        >
                          {sourceBadge.label}
                        </span>

                        {/* Type */}
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-bold uppercase tracking-wide">
                          {question.type}
                        </span>

                        {/* Difficulty */}
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide"
                          style={{
                            backgroundColor: `${getDifficultyColor(question.difficulty)}20`,
                            color: getDifficultyColor(question.difficulty),
                          }}
                        >
                          {question.difficulty}
                        </span>

                        {/* HSK Level */}
                        {question.hskLevel && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-600 rounded text-[10px] font-bold">
                            HSK {question.hskLevel}
                          </span>
                        )}

                        {/* Tags */}
                        {question.tags?.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 bg-gray-50 text-gray-500 rounded text-[10px]"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>

                      {/* Preview */}
                      <p className="text-[14px] text-gray-700 font-medium mb-2">
                        {getQuestionPreview(question)}
                      </p>

                      {/* Explanation */}
                      {question.explanation && (
                        <p className="text-[12px] text-gray-500 italic">
                          💡 {question.explanation}
                        </p>
                      )}
                    </div>

                    {/* Source icon */}
                    <div className="flex-shrink-0">
                      {question.sourceType === 'PRACTICE' && (
                        <div className="h-10 w-10 bg-[#f4f7ed] rounded-lg flex items-center justify-center">
                          <FileText className="h-5 w-5 text-[#78993a]" />
                        </div>
                      )}
                      {question.sourceType === 'EXAM' && (
                        <div className="h-10 w-10 bg-[#eef5e9] rounded-lg flex items-center justify-center">
                          <Layers className="h-5 w-5 text-[#558866]" />
                        </div>
                      )}
                      {question.sourceType === 'BOTH' && (
                        <div className="h-10 w-10 bg-[#fcfce8] rounded-lg flex items-center justify-center">
                          <BookOpen className="h-5 w-5 text-[#c7cf35]" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredQuestions.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-[15px] font-medium">Không tìm thấy câu hỏi</p>
                <p className="text-[13px] text-gray-400 mt-1">
                  Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-[14px] text-gray-500">
              <span className="font-bold text-[#1f5333]">{selectedIds.length}</span> câu hỏi đã chọn
              {selectedIds.length > 0 && (
                <span className="ml-2">({filteredQuestions.length} khả dụng)</span>
              )}
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={onClose}>
                Hủy
              </Button>
              <Button onClick={onConfirm}>
                {examId ? 'Cập nhật' : 'Tạo đề'} với {selectedIds.length} câu hỏi
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
