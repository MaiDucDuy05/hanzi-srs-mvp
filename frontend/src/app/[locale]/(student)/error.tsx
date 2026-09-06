'use client';

import { useEffect } from 'react';
import { ErrorState } from '@/features/ui/components/error-state';
import { useTranslations } from 'next-intl';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('Layout');

  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-full w-full items-center justify-center p-4">
      <ErrorState
        message={error.message || t('studentError')}
        onRetry={reset}
      />
    </div>
  );
}
