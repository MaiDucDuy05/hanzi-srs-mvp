'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Modal } from '@/features/ui/components/modal';
import { Button } from '@/features/ui/components/button';
import { AlertTriangle, Info, ShieldAlert } from 'lucide-react';

type ConfirmVariant = 'danger' | 'warning' | 'info';

interface ConfirmOptions {
  title: string;
  message: string | ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmVariant;
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  return context.confirm;
};

export const ConfirmProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [resolver, setResolver] = useState<(value: boolean) => void>();

  const confirm = useCallback((opts: ConfirmOptions) => {
    setOptions(opts);
    setIsOpen(true);
    return new Promise<boolean>((resolve) => {
      setResolver(() => resolve);
    });
  }, []);

  const handleConfirm = () => {
    if (resolver) resolver(true);
    setIsOpen(false);
  };

  const handleCancel = () => {
    if (resolver) resolver(false);
    setIsOpen(false);
  };

  const variant = options?.variant || 'danger';

  let Icon = AlertTriangle;
  let iconClass = 'text-red-500 bg-red-100';
  let confirmVariant: 'primary' | 'danger' | 'outline' = 'danger';

  if (variant === 'warning') {
    Icon = AlertTriangle;
    iconClass = 'text-amber-500 bg-amber-100';
    confirmVariant = 'primary';
  } else if (variant === 'info') {
    Icon = Info;
    iconClass = 'text-blue-500 bg-blue-100';
    confirmVariant = 'primary';
  } else if (variant === 'danger') {
    Icon = ShieldAlert;
    iconClass = 'text-red-500 bg-red-100';
    confirmVariant = 'danger';
  }

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <Modal open={isOpen} onClose={handleCancel}>
        {options && (
          <div className="flex flex-col items-center text-center p-4">
            <div className={`p-4 rounded-full mb-4 ${iconClass}`}>
              <Icon className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">{options.title}</h2>
            <div className="text-gray-600 mb-6">{options.message}</div>
            
            <div className="flex gap-3 w-full justify-center">
              <Button variant="outline" onClick={handleCancel} className="flex-1 max-w-[120px]">
                {options.cancelText || 'Hủy'}
              </Button>
              <Button variant={confirmVariant} onClick={handleConfirm} className="flex-1 max-w-[120px]">
                {options.confirmText || 'Xác nhận'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </ConfirmContext.Provider>
  );
};
