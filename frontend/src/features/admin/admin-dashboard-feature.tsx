'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardBody } from '@/features/ui/components/card';

const LINKS = [
  { href: '/admin/curriculum', title: '📚 Chương trình học', desc: 'Cấp độ, bài học, từ vựng, ngữ pháp' },
  { href: '/admin/topics', title: '🗂️ Chủ đề', desc: 'Tạo chủ đề và gắn từ vựng' },
  { href: '/admin/questions', title: '❓ Câu hỏi luyện tập', desc: 'Biên soạn câu hỏi điền khuyết, sắp xếp câu' },
  { href: '/admin/users', title: '👥 Người dùng & VIP', desc: 'Quản lý tài khoản, duyệt yêu cầu nâng cấp VIP' },
];

export function AdminDashboardFeature() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Quản trị hệ thống</h1>
        <p className="mt-1 text-sm text-gray-500">Quản lý nội dung và người dùng.</p>
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
