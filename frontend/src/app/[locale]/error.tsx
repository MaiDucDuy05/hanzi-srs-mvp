'use client';

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
  return (
    <ErrorState message={error.message || t('genericError')} onRetry={reset} />
  );
}
