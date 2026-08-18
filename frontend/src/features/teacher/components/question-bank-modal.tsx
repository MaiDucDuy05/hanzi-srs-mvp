'use client';

import { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import type { QuestionBankItem } from '@/lib/api/endpoints/question-bank';
import { Input } from '@/features/ui/components/form';
import { Badge } from '@/features/ui/components/badge';
import { QuestionRenderer } from './question-renderer';
import { cn } from '@/lib/utils/cn';

interface QuestionBankModalProps {
  questions: QuestionBankItem[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
}

export function QuestionBankModal({
  questions,
  selectedIds,
  onSelectionChange,
}: QuestionBankModalProps) {
  const [searchText, setSearchText] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');

  // Get unique values for filters
  const types = useMemo(() => {
    const unique = new Set(questions.map((q) => q.type).filter(Boolean));
    return Array.from(unique).sort();
  }, [questions]);

  const levels = useMemo(() => {
    const unique = new Set(questions.map((q) => q.hskLevel).filter(Boolean));
    return Array.from(unique).sort() as number[];
  }, [questions]);

  const difficulties = useMemo(() => {
    const unique = new Set(questions.map((q) => q.difficulty).filter(Boolean));
    return Array.from(unique);
  }, [questions]);

  // Filter questions
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const matchSearch =
        !searchText ||
        JSON.stringify(q.content).toLowerCase().includes(searchText.toLowerCase()) ||
        (q.tags || []).some((tag) => tag.toLowerCase().includes(searchText.toLowerCase()));

      const matchType = !selectedType || q.type === selectedType;
      const matchLevel = !selectedLevel || q.hskLevel === Number(selectedLevel);
      const matchDifficulty = !selectedDifficulty || q.difficulty === selectedDifficulty;

      return matchSearch && matchType && matchLevel && matchDifficulty;
    });
  }, [questions, searchText, selectedType, selectedLevel, selectedDifficulty]);

  const handleSelectQuestion = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((sid) => sid !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
      {/* Filters Sidebar */}
      <div className="lg:col-span-1 space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200 h-fit">
        <h3 className="font-bold text-gray-900">Lọc câu hỏi</h3>

        {/* Search */}
        <div>
          <label className="text-xs font-bold text-gray-600 uppercase mb-2 block">
            Tìm kiếm
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm câu hỏi..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Type Filter */}
        <div>
          <label className="text-xs font-bold text-gray-600 uppercase mb-2 block">
            Dạng câu hỏi
          </label>
          <div className="space-y-1">
            <label className="flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-white">
              <input
                type="radio"
                checked={selectedType === ''}
                onChange={() => setSelectedType('')}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-700">Tất cả</span>
            </label>
            {types.map((type) => (
              <label key={type} className="flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-white">
                <input
                  type="radio"
                  checked={selectedType === type}
                  onChange={() => setSelectedType(type)}
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-700">{getTypeLabel(type)}</span>
                <span className="text-xs text-gray-500">
                  ({questions.filter((q) => q.type === type).length})
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Level Filter */}
        <div>
          <label className="text-xs font-bold text-gray-600 uppercase mb-2 block">
            HSK Level
          </label>
          <div className="space-y-1">
            <label className="flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-white">
              <input
                type="radio"
                checked={selectedLevel === ''}
                onChange={() => setSelectedLevel('')}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-700">Tất cả</span>
            </label>
            {levels.map((level) => (
              <label key={level} className="flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-white">
                <input
                  type="radio"
                  checked={selectedLevel === String(level)}
                  onChange={() => setSelectedLevel(String(level))}
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-700">HSK {level}</span>
                <span className="text-xs text-gray-500">
                  ({questions.filter((q) => q.hskLevel === level).length})
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Difficulty Filter */}
        <div>
          <label className="text-xs font-bold text-gray-600 uppercase mb-2 block">
            Độ khó
          </label>
          <div className="space-y-1">
            <label className="flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-white">
              <input
                type="radio"
                checked={selectedDifficulty === ''}
                onChange={() => setSelectedDifficulty('')}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-700">Tất cả</span>
            </label>
            {difficulties.map((diff) => (
              <label key={diff} className="flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-white">
                <input
                  type="radio"
                  checked={selectedDifficulty === diff}
                  onChange={() => setSelectedDifficulty(diff)}
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-700">
                  {diff === 'EASY' ? '🟢 Dễ' : diff === 'MEDIUM' ? '🟡 Trung bình' : '🔴 Khó'}
                </span>
                <span className="text-xs text-gray-500">
                  ({questions.filter((q) => q.difficulty === diff).length})
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Clear Filters */}
        {(searchText || selectedType || selectedLevel || selectedDifficulty) && (
          <button
            onClick={() => {
              setSearchText('');
              setSelectedType('');
              setSelectedLevel('');
              setSelectedDifficulty('');
            }}
            className="w-full px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded border border-red-200"
          >
            Xóa bộ lọc
          </button>
        )}
      </div>

      {/* Questions List */}
      <div className="lg:col-span-3 space-y-3">
        {filteredQuestions.length === 0 ? (
          <div className="col-span-full py-12 text-center">
            <p className="text-gray-500 font-medium">Không tìm thấy câu hỏi nào</p>
            <p className="text-sm text-gray-400">Thử thay đổi bộ lọc</p>
          </div>
        ) : (
          filteredQuestions.map((q) => {
            const isSelected = selectedIds.includes(q.id);
            return (
              <div
                key={q.id}
                onClick={() => handleSelectQuestion(q.id)}
                className={cn(
                  'border-2 rounded-lg p-4 cursor-pointer transition-all',
                  isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                )}
              >
                <div className="flex gap-3">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}}
                    className="w-5 h-5 mt-1 accent-blue-500 cursor-pointer"
                  />
                  <div className="flex-1 min-w-0">
                    {/* Question Preview with Renderer */}
                    <div className="mb-3">
                      <QuestionRenderer question={{ id: q.id, testId: '', points: 1, displayOrder: 0, question: q } as any} compact={true} />
                    </div>

                    {/* Question Metadata */}
                    <div className="flex flex-wrap gap-2 items-center">
                      <Badge tone="blue">{q.type}</Badge>
                      {q.hskLevel && <Badge tone="gray">HSK {q.hskLevel}</Badge>}
                      {q.difficulty && (
                        <Badge
                          tone={
                            q.difficulty === 'EASY' ? 'green' : q.difficulty === 'MEDIUM' ? 'amber' : 'red'
                          }
                        >
                          {q.difficulty === 'EASY' ? 'Dễ' : q.difficulty === 'MEDIUM' ? 'Trung bình' : 'Khó'}
                        </Badge>
                      )}
                      {q.visibility && (
                        <Badge tone={q.visibility === 'PUBLIC' ? 'green' : 'gray'}>
                          {q.visibility === 'PUBLIC' ? '🌐 Công khai' : '🔒 Riêng tư'}
                        </Badge>
                      )}
                    </div>

                    {/* Tags */}
                    {q.tags && q.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {q.tags.map((tag) => (
                          <span key={tag} className="inline-block px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
