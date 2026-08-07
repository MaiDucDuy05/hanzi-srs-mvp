'use client';

import { ErrorState } from '@/components/ui/error-state';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState message={error.message || 'Không thể hiển thị trang này.'} onRetry={reset} />
  );
}
