'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { curriculumApi } from '@/lib/api/endpoints';
import type { Topic } from '@/lib/api/types';
import { AuthGuard } from '@/components/layout/auth-guard';
import { Card, CardBody } from '@/components/ui/card';
import { PageLoading } from '@/components/ui/spinner';
import { ErrorState } from '@/components/ui/error-state';

export default function TopicsPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    curriculumApi
      .listTopics({ status: 'PUBLISHED' })
      .then((list) => setTopics(list.slice().sort((a, b) => a.displayOrder - b.displayOrder)))
      .catch((e) => setError(e instanceof Error ? e.message : 'Lỗi tải chủ đề.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AuthGuard>
      <div className="space-y-6">
        <header>
          <h1 className="text-2xl font-bold">Chủ đề học tập</h1>
          <p className="mt-1 text-sm text-gray-500">
            Ôn luyện từ vựng theo chủ đề thực tế: gia đình, ẩm thực, du lịch...
          </p>
        </header>

        {loading && <PageLoading label="Đang tải chủ đề..." />}
        {error && <ErrorState message={error} onRetry={() => location.reload()} />}

        {!loading && !error && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {topics.map((topic) => (
              <Link key={topic.id} href={`/topics/${topic.slug}`} className="group">
                <Card className="h-full transition-shadow hover:shadow-md">
                  <CardBody>
                    <h2 className="text-lg font-bold group-hover:text-brand">{topic.name}</h2>
                    {topic.description && (
                      <p className="mt-1 text-sm text-gray-500">{topic.description}</p>
                    )}
                  </CardBody>
                </Card>
              </Link>
            ))}
            {topics.length === 0 && (
              <p className="text-sm text-gray-500">Chưa có chủ đề nào.</p>
            )}
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
