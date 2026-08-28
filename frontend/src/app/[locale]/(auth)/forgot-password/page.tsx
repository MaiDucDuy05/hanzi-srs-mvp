import type { Metadata } from 'next';
import Image from 'next/image';
import { ForgotPasswordForm } from '@/features/auth/components/forgot-password-form';

export const metadata: Metadata = {
  title: 'Quên mật khẩu — Hán Tự HSK',
  description: 'Khôi phục mật khẩu tài khoản Hán Tự HSK',
};

export default function ForgotPasswordPage() {
  return (
    <div className="relative flex flex-1 w-full min-h-screen items-center justify-center p-4 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0 bg-[#415e44]">
        <Image 
          src="/images/auth-bg.jpg" 
          alt="Cute Panda Forest" 
          fill 
          className="object-cover opacity-80 mix-blend-overlay"
          priority
        />
      </div>

      <ForgotPasswordForm />
    </div>
  );
}
