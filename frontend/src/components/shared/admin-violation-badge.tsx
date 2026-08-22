import { AlertCircle } from 'lucide-react';

interface AdminViolationBadgeProps {
  hiddenByAdmin?: boolean;
  hideReason?: string | null;
  className?: string;
}

export const AdminViolationBadge = ({ hiddenByAdmin, hideReason, className = '' }: AdminViolationBadgeProps) => {
  if (!hiddenByAdmin) return null;

  return (
    <div className={`bg-red-50 border border-red-200 rounded-2xl p-4 flex gap-3 items-start ${className}`}>
      <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
      <div>
        <h4 className="text-sm font-bold text-red-700">Nội dung đã bị ẩn bởi Admin</h4>
        <p className="text-sm text-red-600 mt-1">
          <span className="font-semibold">Lý do:</span> {hideReason || 'Không có lý do cụ thể. Vui lòng liên hệ Admin.'}
        </p>
        <p className="text-xs text-red-500 mt-2">
          Học viên sẽ không thể nhìn thấy nội dung này cho đến khi bạn chỉnh sửa và yêu cầu mở lại.
        </p>
      </div>
    </div>
  );
};
