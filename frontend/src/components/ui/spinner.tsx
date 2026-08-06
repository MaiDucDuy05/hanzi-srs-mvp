import { cn } from '@/lib/utils/cn';

export function Spinner({ className }: { className?: string }) {
  return (
    <div
      role="status"
      aria-label="Đang tải"
      className={cn(
        'inline-block h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-brand',
        className,
      )}
    />
  );
}

export function PageLoading({ label = 'Đang tải...' }: { label?: string }) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-gray-500">
      <Spinner />
      <p className="text-sm">{label}</p>
    </div>
  );
}
