'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { practiceApi, subscriptionApi, testApi } from '@/lib/api/endpoints';
import type { PracticeAttempt, Subscription, TestAttempt } from '@/lib/api/types';
import { AuthGuard } from '@/components/layout/auth-guard';
import { useAuth } from '@/lib/auth/auth-context';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageLoading } from '@/components/ui/spinner';
import { ErrorState } from '@/components/ui/error-state';
import { PRACTICE_TYPE_LABELS, ROLE_LABELS } from '@/lib/utils/constants';
import { formatDate, formatDateTime } from '@/lib/utils/format';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [attempts, setAttempts] = useState<PracticeAttempt[]>([]);
  const [testAttempts, setTestAttempts] = useState<TestAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const [ats, tats] = await Promise.all([
          practiceApi.listAttempts({ userId: user.id }),
          testApi.listAttempts({ userId: user.id }),
        ]);
        setAttempts(ats.slice().reverse());
        setTestAttempts(tats.slice().reverse());
        // GET /subscriptions chỉ dành cho ADMIN — người dùng khác không lấy được
        // gói của mình, không làm sập trang.
        if (user.role === 'ADMIN') {
          try {
            const subs = await subscriptionApi.list({ userId: user.id });
            setSubscriptions(subs);
          } catch {
            setSubscriptions([]);
          }
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Lỗi tải hồ sơ.');
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const activeSub = subscriptions.find((s) => s.status === 'ACTIVE');
  const isVip = activeSub?.plan === 'VIP';
  // Chỉ admin có dữ liệu gói; người dùng khác không xem được (endpoint admin-only).
  const planKnown = user?.role === 'ADMIN' && subscriptions.length > 0;

  return (
    <AuthGuard>
      <div className="space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand text-lg font-bold text-white">
              {user?.fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{user?.fullName}</h1>
              <p className="text-sm text-gray-500">
                {user?.email} · {user ? ROLE_LABELS[user.role] : ''}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              logout();
              router.push('/');
            }}
          >
            Đăng xuất
          </Button>
        </header>

        {loading && <PageLoading label="Đang tải hồ sơ..." />}
        {error && <ErrorState message={error} onRetry={() => location.reload()} />}

        {!loading && !error && (
          <>
            <section className="grid gap-4 sm:grid-cols-3">
              <Card>
                <CardBody className="text-center">
                  <p className="text-3xl">{planKnown ? (isVip ? '👑' : '🆓') : '❔'}</p>
                  <p className="mt-1 font-bold">
                    {planKnown ? (isVip ? 'Gói VIP' : 'Gói miễn phí') : 'Thông tin gói'}
                  </p>
                  {planKnown && activeSub?.expiresAt && (
                    <p className="text-xs text-gray-500">Đến {formatDate(activeSub.expiresAt)}</p>
                  )}
                  {!planKnown && (
                    <p className="text-xs text-gray-500">Gói VIP do quản trị viên quản lý.</p>
                  )}
                </CardBody>
              </Card>
              <Card>
                <CardBody className="text-center">
                  <p className="text-3xl">📝</p>
                  <p className="mt-1 font-bold">{attempts.length}</p>
                  <p className="text-xs text-gray-500">Lần luyện tập</p>
                </CardBody>
              </Card>
              <Card>
                <CardBody className="text-center">
                  <p className="text-3xl">🎯</p>
                  <p className="mt-1 font-bold">{testAttempts.length}</p>
                  <p className="text-xs text-gray-500">Bài kiểm tra đã làm</p>
                </CardBody>
              </Card>
            </section>

            <section>
              <Card>
                <CardHeader title="Luyện tập gần đây" />
                <CardBody>
                  {attempts.length === 0 ? (
                    <p className="text-sm text-gray-500">Chưa luyện tập lần nào.</p>
                  ) : (
                    <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                      {attempts.slice(0, 8).map((a) => (
                        <li key={a.id} className="flex items-center justify-between gap-2 py-2.5 text-sm">
                          <div className="flex items-center gap-2">
                            <Badge tone={a.status === 'COMPLETED' ? 'green' : 'amber'}>
                              {PRACTICE_TYPE_LABELS[a.practiceType]}
                            </Badge>
                            <span className="text-gray-500">{formatDateTime(a.startedAt)}</span>
                          </div>
                          <span className="font-mono text-gray-600">{a.score}%</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardBody>
              </Card>
            </section>

            <section>
              <Card>
                <CardHeader title="Bài kiểm tra gần đây" />
                <CardBody>
                  {testAttempts.length === 0 ? (
                    <p className="text-sm text-gray-500">Chưa làm bài kiểm tra nào.</p>
                  ) : (
                    <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                      {testAttempts.slice(0, 8).map((a) => (
                        <li key={a.id} className="flex items-center justify-between gap-2 py-2.5 text-sm">
                          <div className="flex items-center gap-2">
                            <Badge tone={a.status === 'SUBMITTED' ? 'green' : 'amber'}>{a.status}</Badge>
                            <span className="text-gray-500">{formatDateTime(a.startedAt)}</span>
                          </div>
                          <span className="font-mono text-gray-600">{a.score}%</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardBody>
              </Card>
            </section>
          </>
        )}
      </div>
    </AuthGuard>
  );
}
