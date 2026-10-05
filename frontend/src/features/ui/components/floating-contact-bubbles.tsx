'use client';

import React, { useState } from 'react';
import { Phone, Check, Copy, Headphones, X } from 'lucide-react';

export const CONTACT_INFO = {
  phone: '083 700 0888',
  phoneRaw: '0837000888',
  email: 'ngoainguarete.edu@gmail.com',
  facebook: 'https://www.facebook.com/profile.php?id=61590318341983',
  zalo: 'https://zalo.me/0837000888',
  tiktok: 'https://www.tiktok.com/@arete_edu17?_r=1&_t=ZS-99rO9ce6FfR&fbclid=IwY2xjawUwU3NleHRuA2FlbQIxMABwZG9mBWJyaWQRMVdJeTlIaGFxN1NyUjdESXVzcnRjBmFwcF9pZBAyMjIwMzkxNzg4MjAwODkyAAEejqHsD_C2XQWUv9FZDWUhgcVG-QhPpS0LtzB8auDuAGjkjYro38eO2b61aOc_aem_yqFJV0F0mvp9LdpLfkGZbA',
};

const MEDIA_ASSETS = {
  zalo: '/assets/media/zalo.svg.webp',
  facebook: '/assets/media/fb.svg.webp',
  tiktok: '/assets/media/tikok.jpg',
  gmail: '/assets/media/gmail.webp',
};

/**
 * FloatingContactBubbles
 * Các quả bóng liên hệ nổi cố định bên góc dưới phải màn hình
 * Sử dụng hình ảnh media chính thức từ /assets/media:
 * - Zalo (zalo.svg.webp)
 * - Facebook (fb.svg.webp)
 * - TikTok (tikok.jpg)
 * - Gmail (gmail.webp)
 * - Hotline gọi ngay (kèm hiệu ứng sóng sonar)
 */
export function FloatingContactBubbles() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (e: React.MouseEvent, text: string, key: string) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 select-none print:hidden">
      {/* Danh sách các quả bóng liên hệ (Hiển thị khi mở) */}
      {isExpanded && (
        <div className="flex flex-col items-end gap-3 animate-in fade-in slide-in-from-bottom-5 duration-300">
          {/* Quả bóng 1: GMAIL (Dùng ảnh /assets/media/gmail.webp) */}
          <div className="group relative flex items-center justify-end">
            <span className="absolute right-14 whitespace-nowrap bg-white text-gray-800 font-bold text-xs px-3.5 py-1.5 rounded-full shadow-lg border border-gray-200 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0 pointer-events-none flex items-center gap-2">
              <span>{CONTACT_INFO.email}</span>
            </span>

            <a
              href={`mailto:${CONTACT_INFO.email}`}
              className="w-12 h-12 rounded-full bg-white border border-gray-200 shadow-md hover:shadow-xl hover:scale-110 active:scale-95 transition-all flex items-center justify-center p-2.5 overflow-hidden group"
              title="Gửi Email cho Mầm Tre Hoa Ngữ"
            >
              <img
                src={MEDIA_ASSETS.gmail}
                alt="Gmail"
                className="w-full h-full object-contain"
              />
            </a>
          </div>

          {/* Quả bóng 2: TIKTOK (Dùng ảnh /assets/media/tikok.jpg) */}
          <div className="group relative flex items-center justify-end">
            <span className="absolute right-14 whitespace-nowrap bg-white text-gray-900 font-bold text-xs px-3.5 py-1.5 rounded-full shadow-lg border border-gray-200 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0 pointer-events-none flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              TikTok: @arete_edu17
            </span>

            <a
              href={CONTACT_INFO.tiktok}
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 rounded-full bg-black border border-zinc-800 shadow-md hover:shadow-xl hover:scale-110 active:scale-95 transition-all flex items-center justify-center overflow-hidden"
              title="Kênh TikTok Mầm Tre Hoa Ngữ"
            >
              <img
                src={MEDIA_ASSETS.tiktok}
                alt="TikTok"
                className="w-full h-full object-cover scale-110"
              />
            </a>
          </div>

          {/* Quả bóng 3: FACEBOOK (Dùng ảnh /assets/media/fb.svg.webp) */}
          <div className="group relative flex items-center justify-end">
            <span className="absolute right-14 whitespace-nowrap bg-white text-[#1877F2] font-bold text-xs px-3.5 py-1.5 rounded-full shadow-lg border border-blue-100 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0 pointer-events-none flex items-center gap-1.5">
              Fanpage Facebook
            </span>

            <a
              href={CONTACT_INFO.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 rounded-full shadow-md hover:shadow-xl hover:scale-110 active:scale-95 transition-all flex items-center justify-center overflow-hidden border border-blue-200"
              title="Fanpage Facebook"
            >
              <img
                src={MEDIA_ASSETS.facebook}
                alt="Facebook"
                className="w-full h-full object-cover"
              />
            </a>
          </div>

          {/* Quả bóng 4: ZALO (Dùng ảnh /assets/media/zalo.svg.webp) */}
          <div className="group relative flex items-center justify-end">
            <span className="absolute right-14 whitespace-nowrap bg-white text-[#0068FF] font-bold text-xs px-3.5 py-1.5 rounded-full shadow-lg border border-blue-100 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0 pointer-events-none flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#0068FF] animate-pulse" />
              Chat Zalo: {CONTACT_INFO.phone}
            </span>

            <a
              href={CONTACT_INFO.zalo}
              target="_blank"
              rel="noopener noreferrer"
              className="relative w-12 h-12 rounded-full bg-white border border-blue-200 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:scale-110 active:scale-95 transition-all flex items-center justify-center overflow-hidden p-1.5"
              title="Chat Zalo hỗ trợ"
            >
              <span className="absolute inset-0 rounded-full bg-[#0068FF] animate-ping opacity-25 pointer-events-none" />
              <img
                src={MEDIA_ASSETS.zalo}
                alt="Zalo"
                className="w-full h-full object-contain relative z-10"
              />
            </a>
          </div>

          {/* Quả bóng 5: HOTLINE / PHONE (Nổi bật nhất với hiệu ứng rung & sóng sonar) */}
          <div className="group relative flex items-center justify-end">
            <div className="absolute right-14 whitespace-nowrap bg-white text-[#215b3b] font-black text-xs px-3.5 py-1.5 rounded-full shadow-lg border border-emerald-100 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Hotline: {CONTACT_INFO.phone}</span>
              <button
                onClick={(e) => handleCopy(e, CONTACT_INFO.phoneRaw, 'phone')}
                className="p-1 hover:bg-emerald-50 rounded text-gray-400 hover:text-emerald-700 pointer-events-auto"
                title="Sao chép SĐT"
              >
                {copiedKey === 'phone' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            <a
              href={`tel:${CONTACT_INFO.phoneRaw}`}
              className="relative w-13 h-13 rounded-full bg-gradient-to-tr from-[#1b4b31] via-[#215b3b] to-[#429562] text-white shadow-xl shadow-emerald-700/30 hover:shadow-2xl hover:scale-110 active:scale-95 transition-all flex items-center justify-center border-2 border-white/60"
              title={`Hotline gọi ngay: ${CONTACT_INFO.phone}`}
            >
              {/* Hiệu ứng sóng lan tỏa Sonar */}
              <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-40 pointer-events-none" />
              <Phone className="w-6 h-6 text-white animate-bounce" />
            </a>
          </div>
        </div>
      )}

      {/* Quả bóng điều khiển chính (Toggle thu gọn / bung ra) */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-11 h-11 rounded-full bg-white hover:bg-gray-50 border-2 border-[#eaf3c5] text-[#215b3b] shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center group"
        title={isExpanded ? 'Thu gọn các quả bóng hỗ trợ' : 'Mở các quả bóng hỗ trợ & Hotline'}
        aria-label="Toggle contact bubbles"
      >
        {isExpanded ? (
          <X className="w-5 h-5 text-gray-500 group-hover:text-rose-500 transition-colors" />
        ) : (
          <div className="relative flex items-center justify-center">
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <Headphones className="w-5 h-5 text-[#215b3b]" />
          </div>
        )}
      </button>
    </div>
  );
}
