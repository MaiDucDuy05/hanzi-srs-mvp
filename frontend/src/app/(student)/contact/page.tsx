import type { Metadata } from 'next';
import { ContactForm } from '@/features/contact/components/contact-form';
import Image from 'next/image';
import { Mail } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Liên hệ',
  description: 'Phản hồi, góp ý hoặc cần hỗ trợ về nền tảng học tiếng Trung Hán Tự HSK.',
};

export default function ContactPage() {
  return (
    <div className="flex flex-1 items-center justify-center p-4 py-12 md:py-20 w-full relative">
      {/* Glow background effect */}
      <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-[#eaf4eb] rounded-full blur-[100px] -translate-y-1/2 opacity-70 z-0"></div>
      
      {/* Main Card */}
      <div className="bg-white rounded-[2.5rem] shadow-xl max-w-4xl w-full flex flex-col md:flex-row overflow-hidden relative z-10 border border-gray-100">
        
        {/* Left Side (Info Panel) */}
        <div className="bg-[#f5f5e9] w-full md:w-[35%] p-8 md:p-10 flex flex-col items-center justify-center text-center">
          {/* Avatar / Logo */}
          <div className="w-32 h-32 rounded-full border-4 border-white shadow-sm overflow-hidden mb-6 relative bg-white flex items-center justify-center">
            <Image 
              src="/assets/illustrations/panda/panda-bamboo-circle.svg" 
              alt="Cute Panda Support" 
              width={100}
              height={100}
              className="object-contain"
            />
          </div>
          
          <h3 className="text-xl font-bold text-[#1a472a] mb-2 font-serif">Hỗ trợ 24/7</h3>
          <p className="text-sm text-gray-600 mb-8 max-w-[200px]">
            Chúng tôi luôn sẵn sàng hỗ trợ các "người gác rừng" tận tâm.
          </p>
          
          <div className="bg-white px-4 py-2 rounded-full shadow-sm text-sm font-medium text-[#1a472a] flex items-center gap-2">
            <Mail className="w-4 h-4 text-[#2e5e3d]" />
            support@cutepanda.edu
          </div>
        </div>
        
        {/* Right Side (Form Panel) */}
        <div className="w-full md:w-[65%] p-8 md:p-12 lg:p-16 flex flex-col justify-center">
          <h1 className="text-3xl font-bold text-[#1a472a] mb-2 font-serif">Liên hệ với Khu Rừng Xanh</h1>
          <p className="text-sm text-gray-500 mb-8">
            Chúng tôi luôn lắng nghe ý kiến của bạn để khu rừng ngày một xanh tươi.
          </p>
          
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
