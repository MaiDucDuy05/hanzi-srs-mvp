'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { curriculumApi } from '@/lib/api/endpoints';
import type { HskLevel, Lesson } from '@/lib/api/types';
import { AuthGuard } from '@/components/layout/auth-guard';
import { Card, CardBody } from '@/components/ui/card';
import { PageLoading } from '@/components/ui/spinner';
import { ErrorState } from '@/components/ui/error-state';
import { Badge } from '@/components/ui/badge';

export default function LevelLessonsPage() {
  const { levelCode } = useParams<{ levelCode: string }>();
  const [level, setLevel] = useState<HskLevel | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const levels = await curriculumApi.listLevels();
        if (cancelled) return;
        const found = levels.find((l) => l.code === levelCode);
        if (!found) {
          setError('Không tìm thấy cấp độ này.');
          setLoading(false);
          return;
        }
        setLevel(found);
        const lessonList = await curriculumApi.listLessons({ levelId: found.id, status: 'PUBLISHED' });
        if (cancelled) return;
        setLessons(lessonList.slice().sort((a, b) => a.displayOrder - b.displayOrder));
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Lỗi tải bài học.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [levelCode]);

  return (
    <AuthGuard>
      <div className="space-y-6">
        <header>
          <Link href="/learn" className="text-sm text-brand hover:underline">
            ← Tất cả cấp độ
          </Link>
          <h1 className="mt-1 text-2xl font-bold">{level?.name ?? levelCode}</h1>
          <p className="mt-1 text-sm text-gray-500">
            {lessons.length} bài học — chọn bài để học từ vựng và ngữ pháp.
          </p>
        </header>

        {loading && <PageLoading label="Đang tải bài học..." />}
        {error && <ErrorState message={error} onRetry={() => location.reload()} />}

        {!loading && !error && (
          <div className="grid gap-4 sm:grid-cols-2">
            {lessons.map((lesson) => (
              <Link key={lesson.id} href={`/learn/${levelCode}/${lesson.id}`} className="group">
                <Card className="h-full transition-shadow hover:shadow-md">
                  <CardBody>
                    <div className="flex items-start justify-between gap-2">
                      <h2 className="font-bold group-hover:text-brand">{lesson.title}</h2>
                      <Badge tone={lesson.status === 'PUBLISHED' ? 'green' : 'gray'}>
                        {lesson.status}
                      </Badge>
                    </div>
                    {lesson.description && (
                      <p className="mt-1 text-sm text-gray-500">{lesson.description}</p>
                    )}
                  </CardBody>
                </Card>
              </Link>
            ))}
            {lessons.length === 0 && (
              <p className="text-sm text-gray-500">
                Cấp độ này chưa có bài học công khai.
              </p>
            )}
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
