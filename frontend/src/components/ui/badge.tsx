import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

type Tone = 'red' | 'green' | 'gray' | 'amber' | 'blue';

/** Panda Forest tones — light-only, pastel nhẹ. */
const TONES: Record<Tone, string> = {
 red: 'bg-red-100 text-red-700',
 green: 'bg-soft-lime text-forest',
 gray: 'bg-gray-100 text-gray-600',
 amber: 'bg-amber-100 text-amber-700',
 blue: 'bg-blue-100 text-blue-700',
};

export function Badge({
 tone = 'gray',
 children,
 className,
}: {
 tone?: Tone;
 children: ReactNode;
 className?: string;
}) {
 return (
 <span
 className={cn(
 'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
 TONES[tone],
 className,
 )}
 >
 {children}
 </span>
 );
}
