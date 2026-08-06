'use client';

import { useEffect, useState } from 'react';
import { resourceApi, subscriptionApi } from '@/lib/api/endpoints';
import type { Resource } from '@/lib/api/types';
import { AuthGuard } from '@/components/layout/auth-guard';
import { useAuth } from '@/lib/auth/auth-context';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageLoading } from '@/components/ui/spinner';
import { ErrorState } from '@/components/ui/error-state';
import { Badge } from '@/components/ui/badge';

export default function ResourcesPage() {
  const { user } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [isVip, setIsVip] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const list = await resourceApi.list({ status: 'PUBLISHED' });
        setResources(list.filter((r) => !r.deletedAt));
        if (user?.role === 'ADMIN') {
          try {
            const subs = await subscriptionApi.list({ userId: user.id });
            setIsVip(subs.some((s) => s.status === 'ACTIVE' && s.plan === 'VIP'));
          } catch {
            setIsVip(false);
          }
        } else {
          // Backend chưa có endpoint tự xem gói (GET /subscriptions là admin-only).
          // Dùng proxy theo role theo ma trận BRD: Teacher/Admin dùng được tài liệu VIP.
          setIsVip(user?.role === 'TEACHER');
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Lỗi tải tài liệu.');
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const download = async (r: Resource) => {
    try {
      const detail = await resourceApi.get(r.id);
      const key = detail.fileKey;
      if (/^https?:\/\//.test(key)) {
        window.open(key, '_blank', 'noopener');
      } else {
        window.alert(`Tài liệu chưa có đường dẫn tải (fileKey: ${key}).`);
      }
    } catch {
      window.alert('Không thể lấy thông tin tài liệu.');
    }
  };

  return (
    <AuthGuard>
      <div className="space-y-6">
        <header>
          <h1 className="text-2xl font-bold">Tài liệu học tập</h1>
          <p className="mt-1 text-sm text-gray-500">
            Giáo trình, đề thi và tài liệu tham khảo cho từng cấp độ HSK.
          </p>
        </header>

        {loading && <PageLoading label="Đang tải tài liệu..." />}
        {error && <ErrorState message={error} onRetry={() => location.reload()} />}

        {!loading && !error && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {resources.map((r) => (
              <Card key={r.id}>
                <CardHeader
                  title={r.title}
                  subtitle={r.description ?? ''}
                  action={<Badge tone={r.tier === 'VIP' ? 'amber' : 'green'}>{r.tier}</Badge>}
                />
                <CardBody>
                  {r.tier === 'VIP' && !isVip ? (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500">
                        Tài liệu VIP — nâng cấp để tải về.
                      </p>
                      <a href="/upgrade-vip">
                        <Button size="sm" className="w-full">Nâng cấp VIP</Button>
                      </a>
                    </div>
                  ) : (
                    <Button variant="outline" size="sm" className="w-full" onClick={() => void download(r)}>
                      ⬇ Tải về
                    </Button>
                  )}
                </CardBody>
              </Card>
            ))}
            {resources.length === 0 && (
              <p className="text-sm text-gray-500">Chưa có tài liệu công khai.</p>
            )}
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
