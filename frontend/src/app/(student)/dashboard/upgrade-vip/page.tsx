'use client';

import { useEffect, useState, type FormEvent } from 'react';
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

const BENEFITS = [
  { emoji: '∞', title: 'Luyện tập không giới hạn', desc: 'Bỏ giới hạn 3 lượt/ngày cho mọi chế độ.' },
  { emoji: '📄', title: 'Tài liệu VIP', desc: 'Tải toàn bộ giáo trình và đề thi cao cấp.' },
  { emoji: '🧑‍🏫', title: 'Hỗ trợ ưu tiên', desc: 'Được giáo viên hỗ trợ nhanh hơn.' },
];

const planLabels: Record<string, string> = {
  '1_MONTH': '1 Tháng',
  '6_MONTHS': '6 Tháng',
  '1_YEAR': '1 Năm',
};

export default function UpgradeVipPage() {
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
      .catch((e) => setError(e instanceof Error ? e.message : 'Lỗi tải yêu cầu.'))
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
        note: note || undefined 
      });
      setSent(true);
      setNote('');
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gửi yêu cầu thất bại.');
    } finally {
      setSending(false);
    }
  };

  const toneFor = (s: string) =>
    s === 'APPROVED' ? 'green' : s === 'REJECTED' ? 'red' : 'amber';

  return (
    <AuthGuard>
      <div className="space-y-6">
        <header>
          <h1 className="text-2xl font-bold">Nâng cấp VIP</h1>
          <p className="mt-1 text-sm text-gray-500">
            Mở khóa toàn bộ tính năng để học tập hiệu quả hơn.
          </p>
        </header>

        <div className="grid gap-4 sm:grid-cols-3">
          {BENEFITS.map((b) => (
            <Card key={b.title}>
              <CardBody className="text-center">
                <p className="text-3xl">{b.emoji}</p>
                <h3 className="mt-2 font-bold">{b.title}</h3>
                <p className="mt-1 text-sm text-gray-500">{b.desc}</p>
              </CardBody>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader title="Gửi yêu cầu nâng cấp" subtitle="Quản trị viên sẽ xét duyệt thủ công." />
            <CardBody>
              {sent ? (
                <div className="space-y-3 text-center">
                  <p className="text-3xl">📨</p>
                  <p className="font-medium">Đã gửi yêu cầu! Chờ xét duyệt nhé.</p>
                  <Button variant="outline" size="sm" onClick={() => setSent(false)}>
                    Gửi yêu cầu khác
                  </Button>
                </div>
              ) : (
                <form onSubmit={submit} className="space-y-4">
                  <Field label="Gói VIP">
                    <select
                      value={plan}
                      onChange={(e) => setPlan(e.target.value)}
                      className="w-full rounded-xl border border-gray-300 p-2.5 focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest"
                    >
                      <option value="1_MONTH">1 Tháng</option>
                      <option value="6_MONTHS">6 Tháng</option>
                      <option value="1_YEAR">1 Năm</option>
                    </select>
                  </Field>
                  <Field label="Ghi chú (tùy chọn)">
                    <Textarea
                      rows={3}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Lý do bạn muốn nâng cấp, thời lượng mong muốn..."
                    />
                  </Field>
                  <Button type="submit" className="w-full" loading={sending}>
                    Gửi yêu cầu
                  </Button>
                </form>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Lịch sử yêu cầu" />
            <CardBody>
              {loading && <PageLoading label="Đang tải..." />}
              {error && <ErrorState message={error} onRetry={load} />}
              {!loading && !error && (
                <ul className="space-y-2">
                  {requests.map((r) => (
                    <li key={r.id} className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2 text-sm ">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-700">Gói {planLabels[r.plan as string] || r.plan}</span>
                        <span className="text-xs text-gray-500">{formatDateTime(r.requestedAt)}</span>
                      </div>
                      <Badge tone={toneFor(r.status) as 'green' | 'red' | 'amber'}>{r.status}</Badge>
                    </li>
                  ))}
                  {requests.length === 0 && (
                    <p className="text-sm text-gray-500">Chưa có yêu cầu nào.</p>
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
