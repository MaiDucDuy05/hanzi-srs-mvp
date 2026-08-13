'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { Button } from '@/features/ui/components/button';
import { Field, Input } from '@/features/ui/components/form';

/**
 * Form đăng nhập (client island). `next` = đường dẫn quay lại sau khi đăng nhập
 * (middleware gắn `?next=` khi chặn route). Chỉ nhận local path — chống open redirect.
 */
export function LoginForm({ next }: { next?: string }) {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const user = await login(email.trim(), password);
      console.log('Login success:', user);
      const target =
        user.role === 'ADMIN'
          ? '/admin'
          : user.role === 'TEACHER'
            ? '/teacher'
            : next && next.startsWith('/') && !next.startsWith('//')
              ? next
              : '/';
      console.log('Navigating to target:', target);
      router.replace(target);
      console.log('Router.replace called');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đăng nhập thất bại.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Email" hint="Tài khoản bạn đã đăng ký">
        <Input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
      </Field>
      <Field label="Mật khẩu">
        <Input
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />
      </Field>
      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700  ">
          {error}
        </p>
      )}
      <Button type="submit" className="w-full" loading={submitting}>
        Đăng nhập
      </Button>
      <p className="mt-4 text-center text-sm text-gray-500">
        Chưa có tài khoản?{' '}
        <Link href="/register" className="font-medium text-brand hover:underline">
          Đăng ký miễn phí
        </Link>
      </p>
    </form>
  );
}
