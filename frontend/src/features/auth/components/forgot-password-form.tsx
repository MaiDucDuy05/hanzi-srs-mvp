'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Mail, Lock, KeyRound, Loader2, ArrowRight, RefreshCcw, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { authApi } from '@/lib/api/endpoints';

type Step = 1 | 2 | 3;

export function ForgotPasswordForm() {
  const router = useRouter();
  const { resetPassword } = useAuth();
  const t = useTranslations('Auth.forgotPassword');

  const [step, setStep] = useState<Step>(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1: Submit email to receive OTP
  const onSubmitEmail = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(t('emailError'));
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await authApi.requestForgotPasswordOtp({ email: email.trim() });
      setStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('genericError'));
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP
  const onVerifyOtp = async () => {
    const code = otp.join('');
    if (code.length < 6) {
      setError(t('otpLengthError'));
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await authApi.verifyForgotPasswordOtp({ email: email.trim(), otp: code });
      setStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('otpVerifyError'));
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Submit new password
  const onSubmitPassword = async (e: FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError(t('passwordLengthError'));
      return;
    }
    if (password !== confirmPassword) {
      setError(t('passwordMismatchError'));
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const code = otp.join('');
      const user = await resetPassword(email.trim(), code, password);

      // Auto-login and redirect
      const target = user.role === 'ADMIN' ? '/admin' : '/';
      router.replace(target);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('resetError'));
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
          {step === 1 && t('step1Heading')}
          {step === 2 && t('step2Heading')}
          {step === 3 && t('step3Heading')}
        </h2>
        <p className="text-gray-600 text-sm leading-relaxed px-4">
          {step === 1 && t('step1Subheading')}
          {step === 2 && t('step2Subheading')}
          {step === 3 && t('step3Subheading')}
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
            <label className="text-sm font-bold text-[#1f4a2d]">{t('emailLabel')}</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#285e3a] transition-colors" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('emailPlaceholder')}
                className="w-full h-[52px] bg-[#f8f9f2] rounded-2xl pl-12 pr-4 outline-none border border-transparent focus:border-[#285e3a]/30 focus:bg-white transition-all text-gray-700 font-medium placeholder:font-normal"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-[52px] bg-[#1a4a2a] hover:bg-[#143a21] text-white rounded-2xl font-bold text-base transition-all mt-2 shadow-lg shadow-[#1a4a2a]/20 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : t('submitButton')}
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
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : t('verifyOtpButton')}
            {!isLoading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
          </button>

          <button
            type="button"
            className="text-[#5E7F26] text-sm font-semibold hover:underline"
            onClick={() => setStep(1)}
          >
            {t('resendCode')}
          </button>
        </div>
      )}

      {/* Step 3: New Password Form */}
      {step === 3 && (
        <form onSubmit={onSubmitPassword} className="w-full flex flex-col gap-5">
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-[#1f4a2d]">{t('passwordLabel')}</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#285e3a] transition-colors" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('passwordPlaceholder')}
                className="w-full h-[52px] bg-[#f8f9f2] rounded-2xl pl-12 pr-4 outline-none border border-transparent focus:border-[#285e3a]/30 focus:bg-white transition-all text-gray-700 font-medium placeholder:font-normal"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-[#1f4a2d]">{t('confirmPasswordLabel')}</label>
            <div className="relative group">
              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#285e3a] transition-colors" />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t('confirmPasswordPlaceholder')}
                className="w-full h-[52px] bg-[#f8f9f2] rounded-2xl pl-12 pr-4 outline-none border border-transparent focus:border-[#285e3a]/30 focus:bg-white transition-all text-gray-700 font-medium placeholder:font-normal"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-[52px] bg-[#1a4a2a] hover:bg-[#143a21] text-white rounded-2xl font-bold text-base transition-all mt-2 shadow-lg shadow-[#1a4a2a]/20 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : t('submitPasswordButton')}
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
          {t('backToLogin')}
        </Link>
      </div>
    </div>
  );
}
