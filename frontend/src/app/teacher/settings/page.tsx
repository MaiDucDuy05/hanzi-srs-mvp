import type { Metadata } from 'next';
import { TeacherSettingsFeature } from '@/features/teacher/components/teacher-settings-feature';

export const metadata: Metadata = {
  title: 'Cài đặt - Giáo viên',
  description: 'Quản lý tài khoản giáo viên Hán Tự HSK',
};

export default function TeacherSettingsPage() {
  return <TeacherSettingsFeature />;
}
