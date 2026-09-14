import { TeacherContentTable } from '@/features/admin/components/teacher-content-table';

export default function TeacherContentPage() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6">
        <h1 className="text-2xl font-bold text-[#11321e] mb-2">Nội dung Giáo viên</h1>
        <p className="text-gray-500">
          Duyệt và xử lý vi phạm đối với các nội dung do giáo viên đăng tải (Bài kiểm tra, Tài liệu, Câu hỏi).
        </p>
      </div>

      <TeacherContentTable />
    </div>
  );
}
