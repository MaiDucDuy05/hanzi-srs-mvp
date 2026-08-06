'use client';

import { useState, type FormEvent } from 'react';
import { resourceApi } from '@/lib/api/endpoints';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Field, Input, Textarea } from '@/components/ui/form';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    setError(null);
    try {
      await resourceApi.createContact(form);
      setStatus('done');
      setForm({ name: '', email: '', phone: '', message: '' });
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Gửi liên hệ thất bại.');
    }
  };

  return (
    <div className="mx-auto mt-6 max-w-lg">
      <Card>
        <CardHeader title="Liên hệ với chúng tôi" subtitle="Phản hồi, góp ý hoặc cần hỗ trợ — chúng tôi sẽ phản hồi sớm." />
        <CardBody>
          {status === 'done' ? (
            <div className="space-y-3 text-center">
              <p className="text-3xl">✅</p>
              <p className="font-medium">Đã gửi liên hệ thành công!</p>
              <Button variant="outline" onClick={() => setStatus('idle')}>
                Gửi tiếp
              </Button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <Field label="Họ và tên">
                <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nguyễn Văn A" />
              </Field>
              <Field label="Email">
                <Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
              </Field>
              <Field label="Số điện thoại (tùy chọn)">
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="09xx xxx xxx" />
              </Field>
              <Field label="Nội dung">
                <Textarea required rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Mô tả thắc mắc hoặc góp ý..." />
              </Field>
              {error && (
                <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
                  {error}
                </p>
              )}
              <Button type="submit" className="w-full" loading={status === 'sending'}>
                Gửi liên hệ
              </Button>
            </form>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
