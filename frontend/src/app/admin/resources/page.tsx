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
import { Modal } from '@/features/ui/components/modal';
import { Field, Input, Select, Textarea } from '@/features/ui/components/form';

export default function ResourcesPage() {
  const { user } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [isVip, setIsVip] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ title: '', description: '', fileKey: '', tier: 'FREE' as 'FREE' | 'VIP', status: 'PUBLISHED' as 'DRAFT' | 'PUBLISHED' });
  const [creating, setCreating] = useState(false);

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

  const handleCreate = async () => {
    if (!createForm.title || !createForm.fileKey) {
      window.alert('Vui lòng nhập đủ tên và đường dẫn file');
      return;
    }
    try {
      setCreating(true);
      const newRes = await resourceApi.create(createForm);
      setResources([newRes, ...resources]);
      setIsModalOpen(false);
      setCreateForm({ title: '', description: '', fileKey: '', tier: 'FREE', status: 'PUBLISHED' });
    } catch (e) {
      window.alert(e instanceof Error ? e.message : 'Lỗi tạo tài liệu');
    } finally {
      setCreating(false);
    }
  };

  return (
    <AuthGuard>
      <div className="space-y-6">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Tài liệu học tập</h1>
            <p className="mt-1 text-sm text-gray-500">
              Giáo trình, đề thi và tài liệu tham khảo cho từng cấp độ HSK.
            </p>
          </div>
          {user?.role === 'ADMIN' && (
            <Button onClick={() => setIsModalOpen(true)}>Thêm tài liệu</Button>
          )}
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

        {/* Admin Create Modal */}
        {user?.role === 'ADMIN' && (
          <Modal 
            open={isModalOpen} 
            onClose={() => !creating && setIsModalOpen(false)} 
            title="Đăng tài liệu mới"
            footer={
              <>
                <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={creating}>Hủy</Button>
                <Button onClick={handleCreate} disabled={creating}>{creating ? 'Đang đăng...' : 'Đăng'}</Button>
              </>
            }
          >
            <div className="space-y-4">
              <Field label="Tên tài liệu (*)">
                <Input value={createForm.title} onChange={e => setCreateForm({...createForm, title: e.target.value})} disabled={creating} />
              </Field>
              <Field label="Mô tả">
                <Textarea value={createForm.description} onChange={e => setCreateForm({...createForm, description: e.target.value})} disabled={creating} />
              </Field>
              <Field label="URL/Đường dẫn (*)">
                <Input value={createForm.fileKey} onChange={e => setCreateForm({...createForm, fileKey: e.target.value})} disabled={creating} />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Loại tài liệu">
                  <Select value={createForm.tier} onChange={e => setCreateForm({...createForm, tier: e.target.value as 'FREE'|'VIP'})} disabled={creating}>
                    <option value="FREE">Miễn phí</option>
                    <option value="VIP">VIP</option>
                  </Select>
                </Field>
                <Field label="Trạng thái">
                  <Select value={createForm.status} onChange={e => setCreateForm({...createForm, status: e.target.value as 'DRAFT'|'PUBLISHED'})} disabled={creating}>
                    <option value="PUBLISHED">Công khai (Published)</option>
                    <option value="DRAFT">Nháp (Draft)</option>
                  </Select>
                </Field>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </AuthGuard>
  );
}
