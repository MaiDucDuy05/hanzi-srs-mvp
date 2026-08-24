'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { Mail, Lock, KeyRound, Loader2, ArrowRight, RefreshCcw, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { authApi } from '@/lib/api/endpoints';

type Step = 1 | 2 | 3;

export function ForgotPasswordForm() {
  const router = useRouter();
  const { resetPassword } = useAuth();
  const [step, setStep] = useState<Step>(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Xử lý gửi email để nhận OTP
  const onSubmitEmail = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Email không hợp lệ');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await authApi.requestForgotPasswordOtp({ email: email.trim() });
      setStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi, vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  // Xử lý xác nhận OTP
  const onVerifyOtp = async () => {
    const code = otp.join('');
    if (code.length < 6) {
      setError('Vui lòng nhập đủ 6 số OTP.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    try {
      await authApi.verifyForgotPasswordOtp({ email: email.trim(), otp: code });
      setStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Mã OTP không chính xác hoặc đã hết hạn.');
    } finally {
      setIsLoading(false);
    }
  };

  // Xử lý đổi mật khẩu mới
  const onSubmitPassword = async (e: FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError('Mật khẩu phải có ít nhất 8 ký tự');
      return;
    }
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const code = otp.join('');
      const user = await resetPassword(email.trim(), code, password);
      
      // Đăng nhập tự động và chuyển hướng
      const target = user.role === 'ADMIN' ? '/admin' : '/';
      router.replace(target);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể đổi mật khẩu, vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  return (
    <div className="w-full max-w-[440px] px-8 py-10 bg-white/95 backdrop-blur-md rounded-[2.5rem] shadow-2xl relative z-10 flex flex-col items-center">
      {/* Icon */}
      <div className="w-16 h-16 bg-[#eaf3ea] rounded-full flex items-center justify-center mb-6">
        {step === 1 && <RefreshCcw className="w-8 h-8 text-[#285e3a]" />}
        {step === 2 && <Mail className="w-8 h-8 text-[#285e3a]" />}
        {step === 3 && <RefreshCcw className="w-8 h-8 text-[#285e3a]" />}
      </div>

      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-[28px] font-black text-[#215b3b] font-[family-name:var(--font-nunito)] mb-3">
          {step === 1 && 'Quên mật khẩu?'}
          {step === 2 && 'Xác nhận mã OTP'}
          {step === 3 && 'Thiết lập mật khẩu mới'}
        </h2>
        <p className="text-gray-600 text-sm leading-relaxed px-4">
          {step === 1 && 'Đừng lo, hãy nhập email của bạn và chúng tôi sẽ gửi mã khôi phục.'}
          {step === 2 && 'Chúng tôi đã gửi mã xác minh đến email của bạn. Vui lòng nhập mã gồm 6 chữ số.'}
          {step === 3 && 'Hãy chọn một mật khẩu mạnh để bảo vệ tài khoản của bạn.'}
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="w-full bg-red-50 text-red-600 text-sm py-3 px-4 rounded-xl mb-6 font-medium text-center">
          {error}
        </div>
      )}

      {/* Step 1: Email Form */}
      {step === 1 && (
        <form onSubmit={onSubmitEmail} className="w-full flex flex-col gap-5">
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-[#1f4a2d]">Địa chỉ Email</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#285e3a] transition-colors" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ví dụ: teacher@cutepanda.edu"
                className="w-full h-[52px] bg-[#f8f9f2] rounded-2xl pl-12 pr-4 outline-none border border-transparent focus:border-[#285e3a]/30 focus:bg-white transition-all text-gray-700 font-medium placeholder:font-normal"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-[52px] bg-[#1a4a2a] hover:bg-[#143a21] text-white rounded-2xl font-bold text-base transition-all mt-2 shadow-lg shadow-[#1a4a2a]/20 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Gửi mã khôi phục'}
            {!isLoading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>
      )}

      {/* Step 2: OTP Form */}
      {step === 2 && (
        <div className="w-full flex flex-col gap-6 items-center">
          <div className="flex gap-2 justify-center w-full">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                className="w-12 h-14 bg-[#f8f9f2] border border-transparent focus:border-[#285e3a]/30 focus:bg-white rounded-xl text-center text-xl font-bold text-[#1f4a2d] outline-none transition-all shadow-sm"
              />
            ))}
          </div>

          <button
            onClick={onVerifyOtp}
            disabled={isLoading || otp.join('').length < 6}
            className="w-full h-[52px] bg-[#1a4a2a] hover:bg-[#143a21] text-white rounded-2xl font-bold text-base transition-all shadow-lg shadow-[#1a4a2a]/20 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Xác nhận mã'}
            {!isLoading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
          </button>

          <button 
            type="button" 
            className="text-[#5E7F26] text-sm font-semibold hover:underline"
            onClick={() => setStep(1)}
          >
            Gửi lại mã ngay
          </button>
        </div>
      )}

      {/* Step 3: New Password Form */}
      {step === 3 && (
        <form onSubmit={onSubmitPassword} className="w-full flex flex-col gap-5">
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-[#1f4a2d]">Mật khẩu mới</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#285e3a] transition-colors" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu mới"
                className="w-full h-[52px] bg-[#f8f9f2] rounded-2xl pl-12 pr-4 outline-none border border-transparent focus:border-[#285e3a]/30 focus:bg-white transition-all text-gray-700 font-medium placeholder:font-normal"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-[#1f4a2d]">Xác nhận mật khẩu</label>
            <div className="relative group">
              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#285e3a] transition-colors" />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu mới"
                className="w-full h-[52px] bg-[#f8f9f2] rounded-2xl pl-12 pr-4 outline-none border border-transparent focus:border-[#285e3a]/30 focus:bg-white transition-all text-gray-700 font-medium placeholder:font-normal"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-[52px] bg-[#1a4a2a] hover:bg-[#143a21] text-white rounded-2xl font-bold text-base transition-all mt-2 shadow-lg shadow-[#1a4a2a]/20 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Đổi mật khẩu'}
          </button>
        </form>
      )}

      {/* Footer Link */}
      <div className="mt-8">
        <Link 
          href="/login" 
          className="text-[#306844] hover:text-[#1f4a2d] font-bold text-sm flex items-center gap-1 group transition-colors"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Quay lại trang đăng nhập
        </Link>
      </div>
    </div>
  );
}
