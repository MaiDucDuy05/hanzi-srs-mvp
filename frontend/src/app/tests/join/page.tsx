'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { testApi } from '@/lib/api/endpoints';
import type { Test } from '@/lib/api/types';
import { AuthGuard } from '@/features/layout/components/auth-guard';
import { Card, CardBody, CardHeader } from '@/features/ui/components/card';
import { Button } from '@/features/ui/components/button';
import { PageLoading } from '@/features/ui/components/spinner';
import { ErrorState } from '@/features/ui/components/error-state';
import { Badge } from '@/features/ui/components/badge';

export default function JoinTestPage() {
  const [tests, setTests] = useState<Test[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    testApi
      .list({ status: 'PUBLISHED' })
      .then((list) => {
        if (!cancelled) setTests(list.filter((t) => !t.deletedAt));
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Lỗi tải bài kiểm tra.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AuthGuard>
      <div className="space-y-6">
        <header>
          <h1 className="text-2xl font-bold">Làm bài kiểm tra</h1>
          <p className="mt-1 text-sm text-gray-500">
            Chọn đề do giáo viên biên soạn và làm bài trực tuyến.
          </p>
        </header>

        {loading && <PageLoading label="Đang tải bài kiểm tra..." />}
        {error && <ErrorState message={error} onRetry={() => location.reload()} />}

        {!loading && !error && (
          <div className="grid gap-4 sm:grid-cols-2">
            {tests.map((test) => (
              <Card key={test.id}>
                <CardHeader
                  title={test.name}
                  subtitle={test.description ?? ''}
                  action={<Badge tone={test.accessCode ? 'amber' : 'green'}>{test.accessCode ? 'Có mã truy cập' : 'Mở tự do'}</Badge>}
                />
                <CardBody className="space-y-3">
                  <div className="flex flex-wrap gap-2 text-sm text-gray-500">
                    <span>⏱ {test.timeLimitMinutes} phút</span>
                    <span>🔁 Tối đa {test.attemptLimit} lần</span>
                    {test.accessCode && <span>🔑 {test.accessCode}</span>}
                  </div>
                  <Link href={`/tests/${test.id}`} className="block">
                    <Button className="w-full">Vào làm bài</Button>
                  </Link>
                </CardBody>
              </Card>
            ))}
            {tests.length === 0 && (
              <p className="text-sm text-gray-500">Chưa có bài kiểm tra nào.</p>
            )}
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
