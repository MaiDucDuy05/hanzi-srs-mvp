'use client';

import { useEffect } from 'react';
import { ErrorState } from '@/features/ui/components/error-state';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-[calc(100vh-100px)] w-full items-center justify-center p-4">
      <ErrorState 
        message={error.message || 'Đã có lỗi xảy ra trong quá trình xử lý.'} 
        onRetry={reset} 
      />
    </div>
  );
}
