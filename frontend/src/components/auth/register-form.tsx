'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/form';

/**
 * Form đăng ký (client island). `next` = đường dẫn quay lại sau khi đăng ký
 * (chỉ nhận local path — chống open redirect).
 */
export function RegisterForm({ next }: { next?: string }) {
  const { register } = useAuth();
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }
    if (password !== confirm) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }
    setSubmitting(true);
    try {
      const user = await register(email.trim(), password, fullName.trim());
      const target =
        next && next.startsWith('/') && !next.startsWith('//')
          ? next
          : user.role === 'ADMIN'
            ? '/admin'
            : '/';
      router.replace(target);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đăng ký thất bại.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Họ và tên">
        <Input
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Nguyễn Văn A"
        />
      </Field>
      <Field label="Email">
        <Input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
      </Field>
      <Field label="Mật khẩu" hint="Ít nhất 6 ký tự">
        <Input
          type="password"
          required
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />
      </Field>
      <Field label="Xác nhận mật khẩu">
        <Input
          type="password"
          required
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="••••••••"
        />
      </Field>
      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700  ">
          {error}
        </p>
      )}
      <Button type="submit" className="w-full" loading={submitting}>
        Đăng ký
      </Button>
      <p className="mt-4 text-center text-sm text-gray-500">
        Đã có tài khoản?{' '}
        <Link href="/login" className="font-medium text-brand hover:underline">
          Đăng nhập
        </Link>
      </p>
    </form>
  );
}
