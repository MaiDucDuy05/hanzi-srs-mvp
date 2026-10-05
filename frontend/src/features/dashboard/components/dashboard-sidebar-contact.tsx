'use client';

import React, { useState } from 'react';
import { Phone, Mail, Check, Copy, ExternalLink, Headphones } from 'lucide-react';
import { useTranslations } from 'next-intl';

const CONTACT_INFO = {
  phone: '083 700 0888',
  phoneRaw: '0837000888',
  email: 'ngoainguarete.edu@gmail.com',
  facebook: 'https://www.facebook.com/profile.php?id=61590318341983',
  zalo: 'https://zalo.me/0837000888',
  tiktok: 'https://www.tiktok.com/@arete_edu17?_r=1&_t=ZS-99rO9ce6FfR&fbclid=IwY2xjawUwU3NleHRuA2FlbQIxMABwZG9mBWJyaWQRMVdJeTlIaGFxN1NyUjdESXVzcnRjBmFwcF9pZBAyMjIwMzkxNzg4MjAwODkyAAEejqHsD_C2XQWUv9FZDWUhgcVG-QhPpS0LtzB8auDuAGjkjYro38eO2b61aOc_aem_yqFJV0F0mvp9LdpLfkGZbA',
};

function ZaloBadge({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="8" fill="#0068FF" />
      <text
        x="16"
        y="21"
        fill="white"
        fontSize="11"
        fontWeight="900"
        textAnchor="middle"
        fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        letterSpacing="-0.3"
      >
        Zalo
      </text>
    </svg>
  );
}

function FacebookBadge({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="#1877F2">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function TikTokBadge({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z" />
    </svg>
  );
}

function GmailBadge({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path fill="#4285F4" d="M1.5 5.5v13a2 2 0 0 0 2 2h3v-9.5L1.5 5.5z" />
      <path fill="#34A853" d="M17.5 20.5h3a2 2 0 0 0 2-2v-13l-5 5.5v9.5z" />
      <path fill="#EA4335" d="M17.5 11l4.5-5.5a2 2 0 0 0-1.8-1.5H3.8a2 2 0 0 0-1.8 1.5L6.5 11l5.5 4.2 5.5-4.2z" />
      <path fill="#FBBC05" d="M6.5 11V3.5h-2.7a2 2 0 0 0-1.8 1.5L6.5 11z" />
      <path fill="#C5221F" d="M17.5 11V3.5h2.7a2 2 0 0 1 1.8 1.5L17.5 11z" />
    </svg>
  );
}

/**
 * Component hiển thị thông tin và phương thức liên hệ (Zalo, Gmail, Hotline, FB, TikTok)
 * Đặt ngay dưới mục Cài đặt trên sidebar của Dashboard layout.
 */
export function DashboardSidebarContact() {
  const t = useTranslations('Sidebar');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey(null);
    }, 2000);
  };

  return (
    <div className="w-full lg:w-48 mx-auto mt-2 pt-3 border-t border-gray-100 flex flex-col gap-2">
      {/* Header title */}
      <div className="flex items-center justify-between px-1">
        <span className="flex items-center gap-1.5 font-[family-name:var(--font-nunito)] text-[12px] font-extrabold uppercase tracking-wider text-[#215b3b]">
          <Headphones className="w-3.5 h-3.5 text-[#215b3b]" />
          {t('contact')}
        </span>
        <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Online
        </span>
      </div>

      {/* Main contact card */}
      <div className="bg-[#f8faf8] border border-[#e2eae4] rounded-2xl p-2.5 flex flex-col gap-2 shadow-xs">
        {/* Hotline / Zalo */}
        <div className="flex items-center justify-between bg-white px-2 py-1.5 rounded-xl border border-gray-100 group">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0 text-[#215b3b]">
              <Phone className="w-3.5 h-3.5" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] font-bold text-gray-400 uppercase leading-none">
                Hotline / Zalo
              </span>
              <a
                href={`tel:${CONTACT_INFO.phoneRaw}`}
                className="text-[12px] font-black text-[#215b3b] hover:underline truncate"
                title={`Gọi ${CONTACT_INFO.phone}`}
              >
                {CONTACT_INFO.phone}
              </a>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <a
              href={CONTACT_INFO.zalo}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 text-xs text-[#0068FF] hover:bg-blue-50 rounded-md transition-colors"
              title="Nhắn Zalo"
            >
              <ZaloBadge className="w-4 h-4" />
            </a>
            <button
              onClick={() => handleCopy(CONTACT_INFO.phoneRaw, 'phone')}
              className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              title="Sao chép SĐT"
            >
              {copiedKey === 'phone' ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* Email */}
        <div className="flex items-center justify-between bg-white px-2 py-1.5 rounded-xl border border-gray-100 group">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
              <GmailBadge className="w-3.5 h-3.5" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] font-bold text-gray-400 uppercase leading-none">
                Gmail
              </span>
              <a
                href={`mailto:${CONTACT_INFO.email}`}
                className="text-[11px] font-black text-gray-700 hover:text-[#215b3b] hover:underline truncate"
                title={CONTACT_INFO.email}
              >
                {CONTACT_INFO.email}
              </a>
            </div>
          </div>
          <button
            onClick={() => handleCopy(CONTACT_INFO.email, 'email')}
            className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors shrink-0"
            title="Sao chép email"
          >
            {copiedKey === 'email' ? (
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* Social channels row */}
        <div className="flex items-center justify-between pt-1 border-t border-gray-100/80 px-1">
          <span className="text-[10px] font-bold text-gray-400">Kênh hỗ trợ:</span>
          <div className="flex items-center gap-1.5">
            {/* Zalo */}
            <a
              href={CONTACT_INFO.zalo}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 hover:scale-110 transition-transform"
              title="Chat qua Zalo"
            >
              <ZaloBadge className="w-4 h-4" />
            </a>

            {/* Facebook */}
            <a
              href={CONTACT_INFO.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 hover:scale-110 transition-transform"
              title="Fanpage Facebook"
            >
              <FacebookBadge className="w-4 h-4" />
            </a>

            {/* TikTok */}
            <a
              href={CONTACT_INFO.tiktok}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 text-black hover:scale-110 transition-transform"
              title="Kênh TikTok"
            >
              <TikTokBadge className="w-4 h-4" />
            </a>

            {/* Gmail */}
            <a
              href={`mailto:${CONTACT_INFO.email}`}
              className="p-1 hover:scale-110 transition-transform"
              title="Gửi Email"
            >
              <GmailBadge className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
