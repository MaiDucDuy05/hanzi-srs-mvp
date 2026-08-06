'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { curriculumApi } from '@/lib/api/endpoints';
import type { HskLevel } from '@/lib/api/types';
import { AuthGuard } from '@/components/layout/auth-guard';
import { Card, CardBody } from '@/components/ui/card';
import { PageLoading } from '@/components/ui/spinner';
import { ErrorState } from '@/components/ui/error-state';

export default function LearnPage() {
  const [levels, setLevels] = useState<HskLevel[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    curriculumApi
      .listLevels()
      .then(setLevels)
      .catch((e) => setError(e instanceof Error ? e.message : 'Lỗi tải cấp độ.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AuthGuard>
      <div className="space-y-6">
        <header>
          <h1 className="text-2xl font-bold">Học theo cấp độ</h1>
          <p className="mt-1 text-sm text-gray-500">
            Chọn cấp độ HSK để bắt đầu học từ vựng và ngữ pháp.
          </p>
        </header>

        {loading && <PageLoading label="Đang tải cấp độ..." />}
        {error && <ErrorState message={error} onRetry={() => location.reload()} />}

        {!loading && !error && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {levels
              .slice()
              .sort((a, b) => a.displayOrder - b.displayOrder)
              .map((level) => (
                <Link key={level.id} href={`/learn/${level.code}`} className="group">
                  <Card className="h-full transition-shadow hover:shadow-md">
                    <CardBody>
                      <p className="text-sm font-medium text-brand">{level.code}</p>
                      <h2 className="mt-1 text-lg font-bold group-hover:text-brand">
                        {level.name}
                      </h2>
                    </CardBody>
                  </Card>
                </Link>
              ))}
            {levels.length === 0 && (
              <p className="text-sm text-gray-500">Chưa có cấp độ nào.</p>
            )}
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
