import type { Metadata } from 'next';
import { LoginForm } from '@/features/auth/components/login-form';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Đăng nhập',
  description: 'Đăng nhập vào hệ thống để tiếp tục.',
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { next } = await searchParams;
  const safeNext = typeof next === 'string' ? next : undefined;

  return (
    <>
      {/* Cột trái (Hình ảnh) */}
      <div className="hidden md:flex md:w-5/12 relative bg-[#415e44] text-white p-8 flex-col justify-end">
        <Image 
          src="/images/auth-bg.jpg" 
          alt="Cute Panda Forest" 
          fill 
          className="object-cover opacity-80 mix-blend-overlay"
          priority
        />
        <div className="relative z-10">
          <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
            <span className="text-3xl">🌲</span> Cute Panda Forest
          </h2>
          <p className="text-sm text-gray-100 font-medium">
            Join our sanctuary of learning and growth. Nurturing minds in a calm, organized environment.
          </p>
        </div>
        {/* Overlay gradient dưới cùng để chữ dễ đọc */}
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-[#1b3d26] to-transparent z-0"></div>
      </div>

      {/* Cột phải (Form) */}
      <div className="w-full md:w-7/12 p-8 md:p-12 lg:p-16 flex flex-col justify-center">
        <div className="max-w-md mx-auto w-full">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#1a472a] mb-3">
            Welcome Back!
          </h1>
          <p className="text-gray-600 mb-8 text-sm md:text-base">
            Log in to your sanctuary and continue nurturing your classroom.
          </p>
          
          <LoginForm next={safeNext} />
        </div>
      </div>
    </>
  );
}
