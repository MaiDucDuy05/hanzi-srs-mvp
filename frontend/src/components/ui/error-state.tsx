import { Button } from '@/components/ui/button';

export function ErrorState({
 message,
 onRetry,
}: {
 message?: string;
 onRetry?: () => void;
}) {
 return (
 <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-red-200 bg-red-50 px-6 py-12 text-center">
 <p className="text-3xl">⚠️</p>
 <h3 className="font-medium text-red-800">Có lỗi xảy ra</h3>
 <p className="max-w-md text-sm text-red-600">
 {message ?? 'Không thể tải dữ liệu. Vui lòng thử lại.'}
 </p>
 {onRetry && (
 <Button variant="outline" size="sm" onClick={onRetry}>
 Thử lại
 </Button>
 )}
 </div>
 );
}
