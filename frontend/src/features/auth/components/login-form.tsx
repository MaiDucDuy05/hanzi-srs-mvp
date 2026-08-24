'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';

function isValidRedirect(url: string | undefined): boolean {
  if (!url) return false;
  return (
    url.startsWith('/') &&
    !url.startsWith('//') &&
    !url.includes('://') &&
    !url.match(/^\/https?/)
  );
}

export function LoginForm({ next }: { next?: string }) {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const user = await login(email.trim(), password);
      const target =
        user.role === 'ADMIN'
          ? '/admin'
          : user.role === 'TEACHER'
            ? '/teacher'
            : isValidRedirect(next)
              ? (next as string)
              : '/';
      router.replace(target);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đăng nhập thất bại.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-serif font-bold text-[#1a472a] mb-1.5">Email Address</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Mail className="h-5 w-5 text-gray-500" />
          </div>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-full border border-gray-200 bg-[#fbfbe9] py-3 pl-11 pr-4 text-sm text-gray-800 placeholder:text-gray-400 focus:border-[#1a472a] focus:outline-none focus:ring-1 focus:ring-[#1a472a]"
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-sm font-serif font-bold text-[#1a472a]">Password</label>
          <Link href="/forgot-password" className="text-xs font-bold text-[#306844] hover:text-[#1a472a] hover:underline">
            Forgot password?
          </Link>
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-500" />
          </div>
          <input
            type={showPassword ? "text" : "password"}
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full rounded-full border border-gray-200 bg-[#fbfbe9] py-3 pl-11 pr-11 text-sm text-gray-800 placeholder:text-gray-400 focus:border-[#1a472a] focus:outline-none focus:ring-1 focus:ring-[#1a472a]"
          />
          <button 
            type="button" 
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <button 
        type="submit" 
        disabled={submitting}
        className="w-full rounded-full bg-[#1a472a] hover:bg-[#12361e] text-white py-3.5 px-4 flex items-center justify-center font-bold text-sm transition-colors disabled:opacity-70 disabled:cursor-not-allowed mt-2"
      >
        {submitting ? 'Please wait...' : 'Log In'}
        {!submitting && <ArrowRight className="ml-2 h-4 w-4" />}
      </button>

      <p className="mt-6 text-center text-sm font-medium text-[#1a472a]">
        Don't have a sanctuary?{' '}
        <Link href="/register" className="font-bold underline decoration-2 underline-offset-2 hover:text-[#12361e]">
          Create Account
        </Link>
      </p>
    </form>
  );
}
