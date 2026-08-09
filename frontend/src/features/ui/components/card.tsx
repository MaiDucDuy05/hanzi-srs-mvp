import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
 children: ReactNode;
}

/**
 * Panda Forest card — nền trắng, bo 24px (rounded-3xl), shadow rất nhẹ.
 * Light-only.
 */
export function Card({ children, className, ...rest }: CardProps) {
 return (
 <div
 className={cn(
 'rounded-3xl border border-light-bamboo bg-white shadow-soft',
 className,
 )}
 {...rest}
 >
 {children}
 </div>
 );
}

export function CardHeader({
 title,
 subtitle,
 action,
}: {
 title: ReactNode;
 subtitle?: ReactNode;
 action?: ReactNode;
}) {
 return (
 <div className="flex items-start justify-between gap-3 border-b border-light-bamboo p-5">
 <div>
 <h3 className="font-semibold text-foreground">{title}</h3>
 {subtitle && <p className="mt-0.5 text-sm text-gray-500">{subtitle}</p>}
 </div>
 {action}
 </div>
 );
}

export function CardBody({ children, className }: { children: ReactNode; className?: string }) {
 return <div className={cn('p-5', className)}>{children}</div>;
}
