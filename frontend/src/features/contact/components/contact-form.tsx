'use client';

import { useState, type FormEvent } from 'react';
import { resourceApi } from '@/lib/api/endpoints/resource';
import { Button } from '@/features/ui/components/button';
import { User, Mail, Phone, MessageSquare, CheckCircle2 } from 'lucide-react';

export function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    setError(null);
    try {
      await resourceApi.createContact(form);
      setStatus('done');
      setForm({ name: '', email: '', phone: '', message: '' });
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Gửi liên hệ thất bại.');
    }
  };

  if (status === 'done') {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-8 bg-[#f5f5e9]/50 rounded-3xl h-full border border-[#e5e5d9]">
        <CheckCircle2 className="w-16 h-16 text-[#2e5e3d]" />
        <p className="font-medium text-lg text-[#1a472a]">Đã gửi liên hệ thành công!</p>
        <p className="text-sm text-gray-500 max-w-[250px] text-center mb-4">
          Chúng tôi sẽ phản hồi lại bạn qua email trong thời gian sớm nhất.
        </p>
        <Button 
          variant="outline" 
          onClick={() => setStatus('idle')}
          className="rounded-full px-8 text-[#1a472a] border-[#2e5e3d]/30 hover:bg-[#eaf4eb]"
        >
          Gửi yêu cầu khác
        </Button>
      </div>
    );
  }

  const inputClass = "w-full bg-[#e5e7dc]/50 border-0 rounded-full px-5 py-3.5 pl-12 text-sm text-[#1a472a] placeholder-gray-400 focus:ring-2 focus:ring-[#2e5e3d]/50 focus:bg-[#eaf4eb] transition-all outline-none";

  return (
    <form onSubmit={submit} className="space-y-4 w-full">
      <div className="relative">
        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          required
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Họ và Tên"
          className={inputClass}
        />
      </div>

      <div className="relative">
        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          required
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="Địa chỉ Email"
          className={inputClass}
        />
      </div>

      <div className="relative">
        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          placeholder="Số điện thoại"
          className={inputClass}
        />
      </div>

      <div className="relative">
        <MessageSquare className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
        <textarea
          required
          rows={4}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          placeholder="Nội dung tin nhắn..."
          className="w-full bg-[#e5e7dc]/50 border-0 rounded-3xl px-5 py-4 pl-12 text-sm text-[#1a472a] placeholder-gray-400 focus:ring-2 focus:ring-[#2e5e3d]/50 focus:bg-[#eaf4eb] transition-all outline-none resize-none"
        />
      </div>

      {error && (
        <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600 border border-red-100 text-center">
          {error}
        </p>
      )}

      <Button 
        type="submit" 
        className="w-full rounded-full bg-[#163f22] hover:bg-[#0f2e18] text-white py-6 text-sm font-medium shadow-md transition-all hover:shadow-lg flex items-center justify-center gap-2 group"
        loading={status === 'sending'}
      >
        Gửi tin nhắn 
        <span className="group-hover:translate-x-1 transition-transform">→</span>
      </Button>
    </form>
  );
}
