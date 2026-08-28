import { StudentResourcesFeature } from '@/features/student/student-resources-feature';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tài liệu tham khảo | Hanzi SRS',
  description: 'Thư viện tài liệu tham khảo dành cho học viên',
};

export default function StudentResourcesPage() {
  return (
    <div className="p-6">
      <StudentResourcesFeature />
    </div>
  );
}
