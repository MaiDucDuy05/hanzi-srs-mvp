import type { ReactNode } from 'react';
import { Inbox } from 'lucide-react';

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-3xl border border-dashed border-bamboo bg-white/50 px-6 py-14 text-center">
      <div className="w-14 h-14 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 mb-1">
        <Inbox className="w-7 h-7" />
      </div>
      <h3 className="font-medium text-foreground">{title}</h3>
      {description && <p className="max-w-md text-sm text-gray-500">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
