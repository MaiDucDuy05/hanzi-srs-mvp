'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { practiceApi, subscriptionApi, testApi } from '@/lib/api/endpoints';
import type { PracticeAttempt, Subscription, TestAttempt } from '@/lib/api/types';
import { useAuth } from '@/lib/auth/auth-context';
import { useTranslations } from 'next-intl';
import { Card, CardBody, CardHeader } from '@/features/ui/components/card';
import { Button } from '@/features/ui/components/button';
import { Badge } from '@/features/ui/components/badge';
import { PageLoading } from '@/features/ui/components/spinner';
import { ErrorState } from '@/features/ui/components/error-state';
import { labelForPracticeType, labelForRole } from '@/lib/utils/constants';
import { formatDate, formatDateTime } from '@/lib/utils/format';

export function ProfileFeature() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [attempts, setAttempts] = useState<PracticeAttempt[]>([]);
  const [testAttempts, setTestAttempts] = useState<TestAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      try {
        const [ats, tats, me] = await Promise.all([
          practiceApi.listAttempts({ userId: user.id }),
          testApi.listAttempts({ userId: user.id }),
          subscriptionApi.me().catch(() => null),
        ]);
        if (cancelled) return;
        setAttempts(ats.slice().reverse());
        setTestAttempts(tats.slice().reverse());
        setSubscriptions(me ? [me] : []);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : tProfile('loadError'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user]);

  const activeSub = subscriptions.find((s) => s.status === 'ACTIVE');
  const isVip = activeSub?.plan === 'VIP' && (!activeSub.expiresAt || new Date(activeSub.expiresAt) > new Date());
  const t = useTranslations('Constants');
  const tProfile = useTranslations('Profile');

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand text-lg font-bold text-white">
            {user?.fullName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="font-heading text-4xl font-black text-[#215b3b] mb-6">{user?.fullName}</h1>
            <p className="text-sm text-gray-500">{user?.email} · {user ? labelForRole(t, user.role) : ''}</p>
          </div>
        </div>
        <Button variant="outline" onClick={() => { logout(); router.push('/'); }}>{tProfile('logout')}</Button>
      </header>

      {loading && <PageLoading label={tProfile('loading')} />}
      {error && <ErrorState message={error} onRetry={() => location.reload()} />}

      {!loading && !error && (
        <>
          <section className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardBody className="text-center">
                <p className="text-3xl">{isVip ? '👑' : '🆓'}</p>
                <p className="mt-1 font-bold">{isVip ? tProfile('vipPlan') : tProfile('freePlan')}</p>
                {activeSub?.expiresAt && <p className="text-xs text-gray-500">{tProfile('expiresOn', { date: formatDate(activeSub.expiresAt) })}</p>}
                {!isVip && <a href="/upgrade-vip" className="text-xs text-brand underline">{tProfile('upgradeVipCta')}</a>}
              </CardBody>
            </Card>
            <Card><CardBody className="text-center"><p className="text-3xl">📝</p><p className="mt-1 font-bold">{attempts.length}</p><p className="text-xs text-gray-500">{tProfile('practiceAttempts')}</p></CardBody></Card>
            <Card><CardBody className="text-center"><p className="text-3xl">🎯</p><p className="mt-1 font-bold">{testAttempts.length}</p><p className="text-xs text-gray-500">{tProfile('testsTaken')}</p></CardBody></Card>
          </section>

          <section>
            <Card><CardHeader title={tProfile('recentPractice')} /><CardBody>
              {attempts.length === 0 ? <p className="text-sm text-gray-500">{tProfile('noPracticeYet')}</p> : (
                <ul className="divide-y divide-gray-100">
                  {attempts.slice(0, 8).map((a) => (
                    <li key={a.id} className="flex items-center justify-between gap-2 py-2.5 text-sm">
                      <div className="flex items-center gap-2"><Badge tone={a.status === 'COMPLETED' ? 'green' : 'amber'}>{labelForPracticeType(t, a.practiceType)}</Badge><span className="text-gray-500">{formatDateTime(a.startedAt)}</span></div>
                      <span className="font-mono text-gray-600">{a.score}%</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardBody></Card>
          </section>

          <section>
            <Card><CardHeader title={tProfile('recentTests')} /><CardBody>
              {testAttempts.length === 0 ? <p className="text-sm text-gray-500">{tProfile('noTestsYet')}</p> : (
                <ul className="divide-y divide-gray-100">
                  {testAttempts.slice(0, 8).map((a) => (
                    <li key={a.id} className="flex items-center justify-between gap-2 py-2.5 text-sm">
                      <div className="flex items-center gap-2"><Badge tone={a.status === 'SUBMITTED' ? 'green' : 'amber'}>{a.status}</Badge><span className="text-gray-500">{formatDateTime(a.startedAt)}</span></div>
                      <span className="font-mono text-gray-600">{a.score}%</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardBody></Card>
          </section>
        </>
      )}
    </div>
  );
}
