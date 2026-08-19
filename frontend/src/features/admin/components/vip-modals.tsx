'use client';

import { useState } from 'react';
import { Modal } from '@/features/ui/components/modal';
import { Button } from '@/features/ui/components/button';

interface ActionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText: string;
  onConfirm: (data: any) => Promise<void>;
  loading?: boolean;
  requireNote?: boolean;
  requireDays?: boolean;
  variant?: 'default' | 'destructive';
}

export function VipActionModal({
  open,
  onOpenChange,
  title,
  description,
  confirmText,
  onConfirm,
  loading,
  requireNote,
  requireDays,
  variant = 'default'
}: ActionModalProps) {
  const [note, setNote] = useState('');
  const [days, setDays] = useState(30);

  const handleConfirm = async () => {
    await onConfirm({ note, days });
    setNote('');
    setDays(30);
  };

  return (
    <Modal
      open={open}
      onClose={() => !loading && onOpenChange(false)}
      title={title}
      footer={
        <>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={loading}>
            Hủy
          </Button>
          <Button 
            variant={variant === 'destructive' ? 'danger' : 'primary'} 
            onClick={handleConfirm} 
            disabled={loading || (variant === 'destructive' && requireNote && !note.trim())}
            loading={loading}
          >
            {confirmText}
          </Button>
        </>
      }
    >
      <div className="grid gap-4 py-2">
        <p className="text-gray-600 text-sm">{description}</p>

        {requireDays && (
          <div className="grid gap-2">
            <label className="text-sm font-medium">Số ngày gia hạn</label>
            <input
              type="number"
              min={1}
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="flex h-10 w-full rounded-md border border-light-bamboo bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>
        )}
        {requireNote && (
          <div className="grid gap-2">
            <label className="text-sm font-medium">Lý do / Ghi chú {variant === 'destructive' && <span className="text-red-500">*</span>}</label>
            <textarea
              placeholder="Nhập lý do..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="flex min-h-[80px] w-full rounded-md border border-light-bamboo bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>
        )}
      </div>
    </Modal>
  );
}
