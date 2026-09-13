'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { resourceApi } from '@/lib/api/endpoints';
import type { VipUpgradeRequest } from '@/lib/api/types';
import { AuthGuard } from '@/features/layout/components/auth-guard';
import { useAuth } from '@/lib/auth/auth-context';
import { Badge } from '@/features/ui/components/badge';
import { PageLoading } from '@/features/ui/components/spinner';
import { ErrorState } from '@/features/ui/components/error-state';
import { formatDateTime } from '@/lib/utils/format';
import { Infinity, FileText, Headset, MailCheck, Inbox } from 'lucide-react';

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
      <div className="flex h-full w-full flex-col">
        <div className="w-full px-2 py-4 sm:px-6 sm:py-6 lg:px-8 max-w-5xl mx-auto space-y-8">
          <header className="mb-8">
            <h1 className="font-heading text-4xl font-black text-[#215b3b]">{t('heading')}</h1>
            <p className="mt-2 text-lg text-gray-500 font-medium">{t('subheading')}</p>
          </header>

          <div className="grid gap-6 sm:grid-cols-3">
            {BENEFIT_KEYS.map((key) => (
              <div key={key} className="bg-white rounded-[2rem] p-6 text-center border-4 border-transparent hover:border-[#aadd4a] transition-all shadow-sm hover:shadow-md group flex flex-col items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-[#f9fdf5] flex items-center justify-center text-[#215b3b] mb-4 group-hover:scale-110 transition-transform">
                  {key === 'unlimited' ? <Infinity className="w-10 h-10" strokeWidth={2.5} /> : 
                   key === 'documents' ? <FileText className="w-10 h-10" strokeWidth={2.5} /> : 
                   <Headset className="w-10 h-10" strokeWidth={2.5} />}
                </div>
                <h3 className="text-xl font-bold text-[#215b3b]">{t(`benefit${key.charAt(0).toUpperCase()}${key.slice(1)}Title`)}</h3>
                <p className="mt-2 text-sm text-gray-500 font-medium">{t(`benefit${key.charAt(0).toUpperCase()}${key.slice(1)}Desc`)}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-sm border border-gray-100 flex flex-col">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-[#215b3b] font-heading">{t('submitCardTitle')}</h2>
                <p className="text-sm text-gray-500 font-medium mt-1">{t('submitCardSubtitle')}</p>
              </div>
              
              {sent ? (
                <div className="flex-1 flex flex-col items-center justify-center space-y-4 py-8">
                  <div className="w-24 h-24 bg-[#e5f5eb] rounded-full flex items-center justify-center text-[#215b3b]">
                    <MailCheck className="w-12 h-12" strokeWidth={2} />
                  </div>
                  <p className="font-bold text-[#215b3b] text-xl text-center">{t('submittedTitle')} {t('submittedDesc')}</p>
                  <button 
                    onClick={() => setSent(false)}
                    className="mt-4 px-6 py-2.5 rounded-xl border-2 border-[#aadd4a] text-[#215b3b] font-bold hover:bg-[#f3f9f5] transition-colors"
                  >
                    {t('submittedAnother')}
                  </button>
                </div>
              ) : (
                <form onSubmit={submit} className="flex-1 flex flex-col space-y-5">
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-700">{t('planFieldLabel')}</label>
                    <select
                      value={plan}
                      onChange={(e) => setPlan(e.target.value)}
                      className="w-full rounded-2xl border-2 border-gray-100 bg-gray-50 p-3.5 focus:border-[#aadd4a] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#aadd4a]/20 transition-all font-medium text-gray-700"
                    >
                      <option value="1_MONTH">{t('planOneMonth')}</option>
                      <option value="6_MONTHS">{t('planSixMonths')}</option>
                      <option value="1_YEAR">{t('planOneYear')}</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-700">{t('noteFieldLabel')}</label>
                    <textarea
                      rows={4}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder={t('noteFieldPlaceholder')}
                      className="w-full rounded-2xl border-2 border-gray-100 bg-gray-50 p-3.5 focus:border-[#aadd4a] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#aadd4a]/20 transition-all font-medium text-gray-700 resize-none"
                    />
                  </div>
                  <button 
                    type="submit" 
                    disabled={sending}
                    className="w-full mt-auto bg-[#aadd4a] hover:bg-[#99cc33] text-[#215b3b] font-black text-lg py-4 rounded-2xl transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {sending ? t('loading') : t('submitButton')}
                  </button>
                </form>
              )}
            </div>

            <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-sm border border-gray-100 flex flex-col">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-[#215b3b] font-heading">{t('historyTitle')}</h2>
              </div>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 min-h-[300px]">
                {loading && (
                  <div className="flex justify-center items-center h-full">
                    <PageLoading label={t('loading')} />
                  </div>
                )}
                {error && <ErrorState message={error} onRetry={load} />}
                {!loading && !error && (
                  <ul className="space-y-3">
                    {requests.map((r) => (
                      <li key={r.id} className="flex items-center justify-between rounded-[1.5rem] bg-gray-50 border border-gray-100 px-5 py-4 transition-colors hover:bg-gray-100">
                        <div className="flex flex-col gap-1">
                          <span className="font-bold text-[#215b3b]">
                            {t('historyPlanPrefix', { plan: t(`planLabel.${r.plan as string}`) || r.plan })}
                          </span>
                          <span className="text-xs font-medium text-gray-500">{formatDateTime(r.requestedAt)}</span>
                        </div>
                        <Badge tone={statusTone(r.status)} className="px-3 py-1 font-bold rounded-xl text-xs uppercase tracking-wide">
                          {t(statusKey(r.status))}
                        </Badge>
                      </li>
                    ))}
                    {requests.length === 0 && (
                      <div className="flex flex-col items-center justify-center h-full space-y-3 py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                          <Inbox className="w-8 h-8" strokeWidth={2} />
                        </div>
                        <p className="text-sm font-medium text-gray-500">{t('historyEmpty')}</p>
                      </div>
                    )}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
