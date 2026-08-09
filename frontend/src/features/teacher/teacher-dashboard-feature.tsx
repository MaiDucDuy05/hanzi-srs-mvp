'use client';

import Link from 'next/link';
import { Card, CardBody } from '@/components/ui/card';

const LINKS = [
  {
    href: '/teacher/tests',
    title: '📝 Quản lý bài kiểm tra',
    desc: 'Tạo đề, biên soạn câu hỏi, xem kết quả học viên.',
  },
];

export function TeacherDashboardFeature() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Khu vực giáo viên</h1>
        <p className="mt-1 text-sm text-gray-500">
          Quản lý nội dung giảng dạy và theo dõi học viên.
        </p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2">
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href} className="group">
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardBody>
                <h2 className="font-bold group-hover:text-brand">{l.title}</h2>
                <p className="mt-1 text-sm text-gray-500">{l.desc}</p>
              </CardBody>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
