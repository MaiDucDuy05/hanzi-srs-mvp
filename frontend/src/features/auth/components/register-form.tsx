'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { User, Mail, Lock, ArrowRight, Eye, EyeOff, ShieldCheck } from 'lucide-react';

function isValidRedirect(url: string | undefined): boolean {
  if (!url) return false;
  return (
    url.startsWith('/') &&
    !url.startsWith('//') &&
    !url.includes('://') &&
    !url.match(/^\/https?/)
  );
}

export function RegisterForm({ next }: { next?: string }) {
  const { requestRegisterOtp, verifyRegisterOtp } = useAuth();
  const router = useRouter();
  
  const [step, setStep] = useState<'FORM' | 'OTP'>('FORM');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [otp, setOtp] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleRequestOtp = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    
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
      await requestRegisterOtp(email.trim(), password, fullName.trim());
      setStep('OTP');
      setSuccessMsg(`Mã xác thực đã được gửi đến ${email.trim()}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Yêu cầu mã xác thực thất bại.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!otp || otp.length !== 6) {
      setError('Vui lòng nhập đúng 6 số mã xác thực.');
      return;
    }
    
    setSubmitting(true);
    try {
      const user = await verifyRegisterOtp(email.trim(), otp.trim());
      const target = isValidRedirect(next)
        ? (next as string)
        : user.role === 'ADMIN'
          ? '/admin'
          : '/';
      router.replace(target);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Xác thực thất bại.');
    } finally {
      setSubmitting(false);
    }
  };

  if (step === 'OTP') {
    return (
      <form onSubmit={handleVerifyOtp} className="space-y-4">
        {successMsg && (
          <p className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">
            {successMsg}
          </p>
        )}
        <div>
          <label className="block text-sm font-serif font-bold text-[#1a472a] mb-1.5 text-center">
            Nhập mã OTP 6 số
          </label>
          <div className="relative mt-2">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <ShieldCheck className="h-5 w-5 text-gray-500" />
            </div>
            <input
              type="text"
              required
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="123456"
              className="w-full text-center tracking-[0.5em] font-bold text-lg rounded-full border border-gray-200 bg-[#fbfbe9] py-3 pl-11 pr-4 text-gray-800 placeholder:text-gray-400 placeholder:tracking-normal focus:border-[#1a472a] focus:outline-none focus:ring-1 focus:ring-[#1a472a]"
            />
          </div>
        </div>

        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 text-center">
            {error}
          </p>
        )}

        <button 
          type="submit" 
          disabled={submitting}
          className="w-full rounded-full bg-[#1a472a] hover:bg-[#12361e] text-white py-3.5 px-4 flex items-center justify-center font-bold text-sm transition-colors disabled:opacity-70 disabled:cursor-not-allowed mt-4"
        >
          {submitting ? 'Đang xác thực...' : 'Hoàn tất Đăng ký'}
          {!submitting && <ArrowRight className="ml-2 h-4 w-4" />}
        </button>

        <button 
          type="button"
          onClick={() => {
            setStep('FORM');
            setError(null);
            setSuccessMsg(null);
            setOtp('');
          }}
          className="w-full mt-4 text-center text-sm font-bold text-gray-500 hover:text-gray-800 transition-colors"
        >
          Quay lại chỉnh sửa thông tin
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleRequestOtp} className="space-y-4">
      <div>
        <label className="block text-sm font-serif font-bold text-[#1a472a] mb-1.5">Full Name</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <User className="h-5 w-5 text-gray-500" />
          </div>
          <input
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Teacher Wei"
            className="w-full rounded-full border border-gray-200 bg-[#fbfbe9] py-3 pl-11 pr-4 text-sm text-gray-800 placeholder:text-gray-400 focus:border-[#1a472a] focus:outline-none focus:ring-1 focus:ring-[#1a472a]"
          />
        </div>
      </div>

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
            placeholder="wei@pandaforest.edu"
            className="w-full rounded-full border border-gray-200 bg-[#fbfbe9] py-3 pl-11 pr-4 text-sm text-gray-800 placeholder:text-gray-400 focus:border-[#1a472a] focus:outline-none focus:ring-1 focus:ring-[#1a472a]"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-serif font-bold text-[#1a472a] mb-1.5 flex items-center gap-2">
          Password
          <span className="text-[10px] text-gray-400 font-sans font-normal normal-case">(8+ chars, uppercase, number, symbol)</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-500" />
          </div>
          <input
            type={showPassword ? "text" : "password"}
            required
            autoComplete="new-password"
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

      <div>
        <label className="block text-sm font-serif font-bold text-[#1a472a] mb-1.5">Confirm Password</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-500" />
          </div>
          <input
            type={showConfirm ? "text" : "password"}
            required
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="••••••••"
            className="w-full rounded-full border border-gray-200 bg-[#fbfbe9] py-3 pl-11 pr-11 text-sm text-gray-800 placeholder:text-gray-400 focus:border-[#1a472a] focus:outline-none focus:ring-1 focus:ring-[#1a472a]"
          />
          <button 
            type="button" 
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
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
        {submitting ? 'Đang gửi mã...' : 'Tiếp tục'}
        {!submitting && <ArrowRight className="ml-2 h-4 w-4" />}
      </button>

      <p className="mt-6 text-center text-sm font-medium text-[#1a472a]">
        Already have a sanctuary?{' '}
        <Link href="/login" className="font-bold underline decoration-2 underline-offset-2 hover:text-[#12361e]">
          Log In
        </Link>
      </p>
    </form>
  );
}
