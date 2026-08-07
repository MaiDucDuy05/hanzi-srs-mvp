'use client';

import { useEffect, useState } from 'react';
import { resourceApi } from '@/lib/api/endpoints';
import type { User, VipUpgradeRequest } from '@/lib/api/types';
import { AdminGuard } from '@/components/layout/admin-guard';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageLoading } from '@/components/ui/spinner';
import { ErrorState } from '@/components/ui/error-state';
import { ROLE_LABELS } from '@/lib/utils/constants';
import { formatDateTime } from '@/lib/utils/format';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [requests, setRequests] = useState<VipUpgradeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [us, rs] = await Promise.all([
        resourceApi.listUsers({}),
        resourceApi.listVipRequests({}),
      ]);
      setUsers(us);
      setRequests(rs.slice().reverse());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Lỗi tải dữ liệu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const changeRole = async (u: User, role: User['role']) => {
    try {
      await resourceApi.updateUser(u.id, { role } as never);
      void load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Cập nhật vai trò thất bại.');
    }
  };

  const review = async (r: VipUpgradeRequest, status: 'APPROVED' | 'REJECTED') => {
    try {
      await resourceApi.reviewVipRequest(r.id, { status });
      void load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Xử lý yêu cầu thất bại.');
    }
  };

  const toneFor = (s: string) => (s === 'APPROVED' ? 'green' : s === 'REJECTED' ? 'red' : 'amber');

  return (
    <AdminGuard>
      <div className="space-y-8">
        <header>
          <h1 className="text-2xl font-bold">Người dùng & VIP</h1>
          <p className="mt-1 text-sm text-gray-500">Quản lý tài khoản và duyệt yêu cầu nâng cấp VIP.</p>
        </header>

        {loading && <PageLoading label="Đang tải..." />}
        {error && <ErrorState message={error} onRetry={() => void load()} />}

        {!loading && !error && (
          <>
            <section>
              <Card>
                <CardHeader title={`Tài khoản (${users.length})`} />
                <CardBody className="p-0">
                  <ul className="divide-y divide-gray-100 ">
                    {users.map((u) => (
                      <li key={u.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
                        <div className="min-w-0">
                          <p className="text-sm font-medium">{u.fullName}</p>
                          <p className="text-xs text-gray-500">{u.email} · {formatDateTime(u.createdAt)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge tone={u.role === 'ADMIN' ? 'red' : u.role === 'TEACHER' ? 'blue' : 'gray'}>
                            {ROLE_LABELS[u.role]}
                          </Badge>
                          {u.role !== 'ADMIN' && (
                            <select
                              value={u.role}
                              onChange={(e) => void changeRole(u, e.target.value as User['role'])}
                              className="rounded-md border border-gray-300 bg-white px-2 py-1 text-xs  "
                            >
                              <option value="FREE">FREE</option>
                              <option value="TEACHER">TEACHER</option>
                            </select>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardBody>
              </Card>
            </section>

            <section>
              <Card>
                <CardHeader title={`Yêu cầu nâng cấp VIP (${requests.length})`} />
                <CardBody className="p-0">
                  <ul className="divide-y divide-gray-100 ">
                    {requests.map((r) => (
                      <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
                        <div className="min-w-0">
                          <p className="text-sm">
                            <span className="font-medium">#{r.userId.slice(0, 8)}</span>
                            <span className="text-gray-500"> — {formatDateTime(r.requestedAt)}</span>
                          </p>
                          {r.note && <p className="text-xs text-gray-500">{r.note}</p>}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge tone={toneFor(r.status) as 'green' | 'red' | 'amber'}>{r.status}</Badge>
                          {r.status === 'PENDING' && (
                            <>
                              <Button size="sm" onClick={() => void review(r, 'APPROVED')}>Duyệt</Button>
                              <Button variant="danger" size="sm" onClick={() => void review(r, 'REJECTED')}>Từ chối</Button>
                            </>
                          )}
                        </div>
                      </li>
                    ))}
                    {requests.length === 0 && (
                      <li className="px-4 py-6 text-sm text-gray-500">Chưa có yêu cầu nào.</li>
                    )}
                  </ul>
                </CardBody>
              </Card>
            </section>
          </>
        )}
      </div>
    </AdminGuard>
  );
}
