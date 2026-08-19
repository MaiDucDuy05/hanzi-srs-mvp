'use client';

import Link from 'next/link';
import { useEffect, useState, type FormEvent } from 'react';
import { testApi } from '@/lib/api/endpoints';
import type { Test } from '@/lib/api/types';
import { useAuth } from '@/lib/auth/auth-context';
import { Card, CardBody, CardHeader } from '@/features/ui/components/card';
import { Button } from '@/features/ui/components/button';
import { Modal } from '@/features/ui/components/modal';
import { Field, Input } from '@/features/ui/components/form';
import { PageLoading } from '@/features/ui/components/spinner';
import { ErrorState } from '@/features/ui/components/error-state';
import { Badge } from '@/features/ui/components/badge';
import { formatDate } from '@/lib/utils/format';

export function TeacherTestsFeature() {
  const { user } = useAuth();
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    timeLimitMinutes: '30',
    attemptLimit: '1',
    accessCode: '',
    hskLevel: '1',
    shuffleQuestions: false,
    showAnswersAfter: false,
  });

  const load = () => {
    if (!user) return;
    setLoading(true);
    testApi
      .list({ teacherId: user.id })
      .then(setTests)
      .catch((e) => setError(e instanceof Error ? e.message : 'Lỗi tải bài kiểm tra.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, [user]);

  const create = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      await testApi.create({
        name: form.name,
        description: form.description || null,
        timeLimitMinutes: Number(form.timeLimitMinutes),
        attemptLimit: Number(form.attemptLimit),
        accessCode: form.accessCode || null,
        status: 'DRAFT',
        showScoreImmediately: true,
        hskLevel: Number(form.hskLevel),
        shuffleQuestions: form.shuffleQuestions,
        showAnswersAfter: form.showAnswersAfter,
      });
      setShowCreate(false);
      setForm({ name: '', description: '', timeLimitMinutes: '30', attemptLimit: '1', accessCode: '', hskLevel: '1', shuffleQuestions: false, showAnswersAfter: false });
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Tạo bài kiểm tra thất bại.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (test: Test) => {
    if (!window.confirm(`Xóa đề "${test.name}"?`)) return;
    try {
      await testApi.remove(test.id);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Xóa thất bại.');
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/teacher" className="text-sm text-brand hover:underline">
            ← Khu vực giáo viên
          </Link>
          <h1 className="mt-1 text-2xl font-bold">Quản lý bài kiểm tra</h1>
        </div>
        <Button onClick={() => setShowCreate(true)}>+ Đề mới</Button>
      </header>

      {loading && <PageLoading label="Đang tải bài kiểm tra..." />}
      {error && <ErrorState message={error} onRetry={load} />}

      {!loading && !error && (
        <div className="space-y-3">
          {tests.map((t) => (
            <Card key={t.id}>
              <CardHeader
                title={t.name}
                subtitle={t.description ?? ''}
                action={
                  <Badge tone={t.status === 'PUBLISHED' ? 'green' : 'gray'}>{t.status}</Badge>
                }
              />
              <CardBody>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-2 text-sm text-gray-500">
                    <span>⏱ {t.timeLimitMinutes} phút</span>
                    <span>❓ {t.attemptLimit} lần</span>
                    {t.accessCode && <span>🔑 {t.accessCode}</span>}
                    <span>Tạo {formatDate(t.createdAt)}</span>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/teacher/tests/${t.id}`}>
                      <Button variant="outline" size="sm">Quản lý</Button>
                    </Link>
                    <Button variant="danger" size="sm" onClick={() => remove(t)}>
                      Xóa
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
          {tests.length === 0 && (
            <p className="text-sm text-gray-500">Chưa có đề nào. Bấm "+ Đề mới" để tạo.</p>
          )}
        </div>
      )}

      <Modal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title="Tạo bài kiểm tra mới"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowCreate(false)}>Hủy</Button>
            <Button form="create-test-form" type="submit" loading={saving}>
              Tạo đề
            </Button>
          </>
        }
      >
        <form id="create-test-form" onSubmit={create} className="space-y-4">
          <Field label="Tên đề">
            <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Kiểm tra giữa kỳ HSK 1" />
          </Field>
          <Field label="Mô tả">
            <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Đề 25 phút..." />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Thời gian (phút)">
              <Input type="number" min={1} required value={form.timeLimitMinutes} onChange={(e) => setForm({ ...form, timeLimitMinutes: e.target.value })} />
            </Field>
            <Field label="Số lần làm tối đa">
              <Input type="number" min={1} required value={form.attemptLimit} onChange={(e) => setForm({ ...form, attemptLimit: e.target.value })} />
            </Field>
            <Field label="HSK Level">
              <Input type="number" min={1} max={6} required value={form.hskLevel} onChange={(e) => setForm({ ...form, hskLevel: e.target.value })} />
            </Field>
            <Field label="Mã truy cập (tùy chọn)">
              <Input value={form.accessCode} onChange={(e) => setForm({ ...form, accessCode: e.target.value })} placeholder="HSK1-2026" />
            </Field>
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.shuffleQuestions} onChange={(e) => setForm({ ...form, shuffleQuestions: e.target.checked })} />
              <span className="text-sm font-medium">Đảo câu hỏi</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.showAnswersAfter} onChange={(e) => setForm({ ...form, showAnswersAfter: e.target.checked })} />
              <span className="text-sm font-medium">Hiện đáp án sau khi nộp</span>
            </label>
          </div>
        </form>
      </Modal>
    </div>
  );
}
