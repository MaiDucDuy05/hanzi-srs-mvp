'use client';

import { AdminPracticeQuestionsTable } from './components/admin-practice-questions-table';

export function AdminQuestionsFeature() {
  return (
    <div className="flex flex-col gap-8 pb-10 max-w-[1400px]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-[32px] leading-tight font-extrabold text-[#11321e] mb-2">
            Quản lý Ngân hàng Câu hỏi
          </h1>
          <p className="text-sm text-gray-500 font-medium">
            Biên soạn câu hỏi luyện tập cho toàn hệ thống.
          </p>
        </div>
      </div>
      
      <AdminPracticeQuestionsTable />
    </div>
  );
}
