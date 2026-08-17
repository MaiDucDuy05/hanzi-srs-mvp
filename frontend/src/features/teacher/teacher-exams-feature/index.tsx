'use client';

import { useState } from 'react';
import { ExamFilter, Exam } from './types';
import { EXAM_FILTERS, MOCK_EXAMS } from './utils';
import { ExamHeader } from './components/exam-header';
import { QuickTemplates } from './components/quick-templates';
import { FeaturedExam } from './components/featured-exam';
import { ExamList } from './components/exam-list';
import { FloatingActionButton } from './components/floating-action-button';

export function TeacherExamsFeature() {
  const [filter, setFilter] = useState<ExamFilter>('All');

  // Mock data - in real app, this would come from API
  const templates = MOCK_EXAMS.slice(0, 3).map((_, i) => ({
    id: String(i + 1),
    title: ['10-Min Warm-up', 'Unit Test', 'Mock HSK'][i],
    description: [
      'Vocabulary & tone recall exercises to start the day.',
      'Comprehensive assessment covering multiple chapters.',
      'Official format simulation with standardized grading.',
    ][i],
    icon: ['TIMER', 'FILE_TEXT', 'AWARD'][i] as 'TIMER' | 'FILE_TEXT' | 'AWARD',
    accentColor: ['#78993a', '#558866', '#64748b'][i],
    bgColor: ['#f4f7ed', '#eef5e9', '#f0f2f5'][i],
    hoverBorderColor: ['#c7cf35', '#558866', '#64748b'][i],
  }));

  const handleTemplateClick = (templateId: string) => {
    console.log('Create exam from template:', templateId);
    // TODO: Navigate to exam creation with template
  };

  const handleEditExam = (id: string) => {
    console.log('Edit exam:', id);
    // TODO: Navigate to exam editor
  };

  const handlePreviewExam = (id: string) => {
    console.log('Preview exam:', id);
    // TODO: Open exam preview modal
  };

  const handleDeleteExam = (id: string) => {
    console.log('Delete exam:', id);
    // TODO: Show delete confirmation
  };

  const handleNewExam = () => {
    console.log('Create new exam');
    // TODO: Navigate to exam creation
  };

  return (
    <div className="max-w-[1100px] pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <ExamHeader />

      <QuickTemplates templates={templates} onTemplateClick={handleTemplateClick} />

      <FeaturedExam />

      <ExamList
        exams={MOCK_EXAMS}
        filters={EXAM_FILTERS}
        activeFilter={filter}
        onFilterChange={setFilter}
        onEditExam={handleEditExam}
        onPreviewExam={handlePreviewExam}
        onDeleteExam={handleDeleteExam}
      />

      <FloatingActionButton onClick={handleNewExam} />
    </div>
  );
}
