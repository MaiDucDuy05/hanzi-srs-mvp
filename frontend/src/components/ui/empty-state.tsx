import type { ReactNode } from 'react';

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
 <p className="text-3xl">📭</p>
 <h3 className="font-medium text-foreground">{title}</h3>
 {description && <p className="max-w-md text-sm text-gray-500">{description}</p>}
 {action && <div className="mt-2">{action}</div>}
 </div>
 );
}
