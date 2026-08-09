'use client';

import { useEffect, useState } from 'react';
import { resourceApi, subscriptionApi } from '@/lib/api/endpoints';
import type { Resource } from '@/lib/api/types';
import { AuthGuard } from '@/features/layout/components/auth-guard';
import { useAuth } from '@/lib/auth/auth-context';
import { Card, CardBody, CardHeader } from '@/features/ui/components/card';
import { Button } from '@/features/ui/components/button';
import { PageLoading } from '@/features/ui/components/spinner';
import { ErrorState } from '@/features/ui/components/error-state';
import { Badge } from '@/features/ui/components/badge';

export default function ResourcesPage() {
  const { user } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [isVip, setIsVip] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await resourceApi.list({ status: 'PUBLISHED' });
        if (cancelled) return;
        setResources(list.filter((r) => !r.deletedAt));
        // Teacher/Admin được dùng tài liệu VIP theo ma trận BRD (docs.md);
        // học viên khác kiểm tra gói thật của mình qua GET /subscriptions/me.
        const vipRole = user?.role === 'TEACHER' || user?.role === 'ADMIN';
        let vipActive = false;
        if (!vipRole) {
          try {
            const me = await subscriptionApi.me();
            vipActive =
              !!me && me.plan === 'VIP' && me.status === 'ACTIVE' &&
              (!me.expiresAt || new Date(me.expiresAt) > new Date());
          } catch {
            vipActive = false;
          }
        }
        if (cancelled) return;
        setIsVip(vipRole || vipActive);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Lỗi tải tài liệu.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
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
