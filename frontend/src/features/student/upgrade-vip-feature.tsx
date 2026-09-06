'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { resourceApi } from '@/lib/api/endpoints';
import type { VipUpgradeRequest } from '@/lib/api/types';
import { AuthGuard } from '@/features/layout/components/auth-guard';
import { useAuth } from '@/lib/auth/auth-context';
import { Card, CardBody, CardHeader } from '@/features/ui/components/card';
import { Button } from '@/features/ui/components/button';
import { Field, Textarea } from '@/features/ui/components/form';
import { Badge } from '@/features/ui/components/badge';
import { PageLoading } from '@/features/ui/components/spinner';
import { ErrorState } from '@/features/ui/components/error-state';
import { formatDateTime } from '@/lib/utils/format';

type BenefitKey = 'unlimited' | 'documents' | 'support';

const BENEFIT_KEYS: BenefitKey[] = ['unlimited', 'documents', 'support'];

function statusKey(status: string): 'statusApproved' | 'statusRejected' | 'statusPending' {
  if (status === 'APPROVED') return 'statusApproved';
  if (status === 'REJECTED') return 'statusRejected';
  return 'statusPending';
}

function statusTone(s: string): 'green' | 'red' | 'amber' {
  return s === 'APPROVED' ? 'green' : s === 'REJECTED' ? 'red' : 'amber';
}

export function UpgradeVipFeature() {
  const t = useTranslations('Vip');
  const { user } = useAuth();
  const [requests, setRequests] = useState<VipUpgradeRequest[]>([]);
  const [note, setNote] = useState('');
  const [plan, setPlan] = useState('1_MONTH');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const load = () => {
    if (!user) return;
    setLoading(true);
    resourceApi
      .listVipRequests({ userId: user.id })
      .then(setRequests)
      .catch((e) => setError(e instanceof Error ? e.message : t('loadError')))
      .finally(() => setLoading(false));
  };

  useEffect(load, [user]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSending(true);
    try {
      await resourceApi.createVipRequest({
        userId: user.id,
        plan,
        amount: 0,
        note: note || undefined,
      });
      setSent(true);
      setNote('');
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('submitError'));
    } finally {
      setSending(false);
    }
  };

  return (
    <AuthGuard>
      <div className="space-y-6">
        <header>
          <h1 className="text-2xl font-bold">{t('heading')}</h1>
          <p className="mt-1 text-sm text-gray-500">{t('subheading')}</p>
        </header>

        <div className="grid gap-4 sm:grid-cols-3">
          {BENEFIT_KEYS.map((key) => (
            <Card key={key}>
              <CardBody className="text-center">
                <p className="text-3xl">{key === 'unlimited' ? '∞' : key === 'documents' ? '📄' : '🧑‍🏫'}</p>
                <h3 className="mt-2 font-bold">{t(`benefit${key.charAt(0).toUpperCase()}${key.slice(1)}Title`)}</h3>
                <p className="mt-1 text-sm text-gray-500">{t(`benefit${key.charAt(0).toUpperCase()}${key.slice(1)}Desc`)}</p>
              </CardBody>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader title={t('submitCardTitle')} subtitle={t('submitCardSubtitle')} />
            <CardBody>
              {sent ? (
                <div className="space-y-3 text-center">
                  <p className="text-3xl">📨</p>
                  <p className="font-medium">{t('submittedTitle')} {t('submittedDesc')}</p>
                  <Button variant="outline" size="sm" onClick={() => setSent(false)}>
                    {t('submittedAnother')}
                  </Button>
                </div>
              ) : (
                <form onSubmit={submit} className="space-y-4">
                  <Field label={t('planFieldLabel')}>
                    <select
                      value={plan}
                      onChange={(e) => setPlan(e.target.value)}
                      className="w-full rounded-xl border border-gray-300 p-2.5 focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest"
                    >
                      <option value="1_MONTH">{t('planOneMonth')}</option>
                      <option value="6_MONTHS">{t('planSixMonths')}</option>
                      <option value="1_YEAR">{t('planOneYear')}</option>
                    </select>
                  </Field>
                  <Field label={t('noteFieldLabel')}>
                    <Textarea
                      rows={3}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder={t('noteFieldPlaceholder')}
                    />
                  </Field>
                  <Button type="submit" className="w-full" loading={sending}>
                    {t('submitButton')}
                  </Button>
                </form>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title={t('historyTitle')} />
            <CardBody>
              {loading && <PageLoading label={t('loading')} />}
              {error && <ErrorState message={error} onRetry={load} />}
              {!loading && !error && (
                <ul className="space-y-2">
                  {requests.map((r) => (
                    <li key={r.id} className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2 text-sm">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-700">
                          {t('historyPlanPrefix', { plan: t(`planLabel.${r.plan as string}`) || r.plan })}
                        </span>
                        <span className="text-xs text-gray-500">{formatDateTime(r.requestedAt)}</span>
                      </div>
                      <Badge tone={statusTone(r.status)}>{t(statusKey(r.status))}</Badge>
                    </li>
                  ))}
                  {requests.length === 0 && (
                    <p className="text-sm text-gray-500">{t('historyEmpty')}</p>
                  )}
                </ul>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </AuthGuard>
  );
}
