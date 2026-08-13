'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { Button } from '@/features/ui/components/button';
import { Field, Input } from '@/features/ui/components/form';

/**
 * Validate redirect URL to prevent open redirect attacks.
 * Only allows relative paths starting with / and not // or containing protocols.
 */
function isValidRedirect(url: string | undefined): boolean {
  if (!url) return false;
  // Must start with / but not // (prevents protocol-relative URLs)
  // Must not contain :// (prevents URLs like javascript:, https:, etc.)
  // Must not start with /http or /https
  return (
    url.startsWith('/') &&
    !url.startsWith('//') &&
    !url.includes('://') &&
    !url.match(/^\/https?/)
  );
}

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
    if (password.length < 8) {
      setError('Mật khẩu phải có ít nhất 8 ký tự.');
      return;
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(password)) {
      setError('Mật khẩu phải có chữ hoa, chữ thường, số và ký tự đặc biệt.');
      return;
    }
    if (password !== confirm) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }
    setSubmitting(true);
    try {
      const user = await register(email.trim(), password, fullName.trim());
      const target = isValidRedirect(next)
        ? (next as string)
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
      <Field label="Mật khẩu" hint="Ít nhất 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt">
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
