'use client';

import { FileText } from 'lucide-react';
import { Exam, ExamFilter } from '../types';
import { ExamFilters } from './exam-filters';
import { ExamListItem } from './exam-list-item';

interface ExamListProps {
  exams: Exam[];
  filters: ExamFilter[];
  activeFilter: ExamFilter;
  onFilterChange: (filter: ExamFilter) => void;
  onEditExam?: (id: string) => void;
  onPreviewExam?: (id: string) => void;
  onDeleteExam?: (id: string) => void;
}

function filterExams(exams: Exam[], filter: ExamFilter): Exam[] {
  switch (filter) {
    case 'All':
      return exams;
    case 'Drafts':
      return exams.filter((e) => e.status === 'DRAFT');
    case 'Active':
      return exams.filter((e) => e.status === 'ACTIVE');
    case 'Completed':
      return exams.filter((e) => e.status === 'COMPLETED');
    default:
      return exams;
  }
}

export function ExamList({
  exams,
  filters,
  activeFilter,
  onFilterChange,
  onEditExam,
  onPreviewExam,
  onDeleteExam,
}: ExamListProps) {
  const filteredExams = filterExams(exams, activeFilter);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h2 className="font-bold text-[#1f5333] text-[18px] flex items-center gap-2">
          <FileText className="h-5 w-5 text-[#558866]" /> Exam Repository
        </h2>

        <ExamFilters
          filters={filters}
          activeFilter={activeFilter}
          onFilterChange={onFilterChange}
        />
      </div>

      <div className="space-y-3">
        {filteredExams.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-[15px] font-medium">No exams found</p>
            <p className="text-[13px] text-gray-400 mt-1">
              Create a new exam to get started
            </p>
          </div>
        ) : (
          filteredExams.map((exam, index) => (
            <ExamListItem
              key={exam.id}
              exam={exam}
              onEdit={onEditExam}
              onPreview={onPreviewExam}
              onDelete={onDeleteExam}
              isEven={index % 2 === 1}
            />
          ))
        )}
      </div>
    </div>
  );
}
