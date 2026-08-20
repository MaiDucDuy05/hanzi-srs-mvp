'use client';

import { useState } from 'react';
import { AdminPracticeQuestionsTable } from './components/admin-practice-questions-table';
import { AdminExamQuestionsTable } from './components/admin-exam-questions-table';

export function AdminQuestionsFeature() {
  const [activeTab, setActiveTab] = useState<'PRACTICE' | 'EXAM'>('PRACTICE');

  return (
    <div className="flex flex-col gap-8 pb-10 max-w-[1400px]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-[32px] leading-tight font-extrabold text-[#11321e] mb-2">
            Quản lý Ngân hàng Câu hỏi
          </h1>
          <p className="text-sm text-gray-500 font-medium">
            Biên soạn câu hỏi luyện tập và câu hỏi thi cho toàn hệ thống.
          </p>
        </div>

        {/* Tabs Switcher */}
        <div className="flex bg-white rounded-full p-1 shadow-sm border border-gray-100 shrink-0">
          <button
            onClick={() => setActiveTab('PRACTICE')}
            className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
              activeTab === 'PRACTICE'
                ? 'bg-[#c7cf35] text-[#11321e] shadow-sm'
                : 'text-gray-500 hover:text-[#11321e]'
            }`}
          >
            Câu hỏi Luyện tập
          </button>
          <button
            onClick={() => setActiveTab('EXAM')}
            className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
              activeTab === 'EXAM'
                ? 'bg-[#c7cf35] text-[#11321e] shadow-sm'
                : 'text-gray-500 hover:text-[#11321e]'
            }`}
          >
            Câu hỏi Thi
          </button>
        </div>
      </div>
      
      {activeTab === 'PRACTICE' ? <AdminPracticeQuestionsTable /> : <AdminExamQuestionsTable />}
    </div>
  );
}
