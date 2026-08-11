import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
 variant?: Variant;
 size?: Size;
 loading?: boolean;
 /** Pill CTA (rounded-full) — dùng cho nút kêu gọi hành động kiểu panda. */
 pill?: boolean;
}

const VARIANTS: Record<Variant, string> = {
 primary: 'bg-brand text-white hover:bg-brand-dark disabled:bg-gray-200 disabled:text-gray-400',
 secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 disabled:opacity-50',
 ghost: 'text-gray-700 hover:bg-gray-100 disabled:opacity-50',
 danger: 'bg-red-600 text-white hover:bg-red-700 disabled:opacity-50',
 outline:
 'border border-bamboo text-forest hover:bg-pale-green disabled:opacity-50',
};

const SIZES: Record<Size, string> = {
 sm: 'h-8 px-3 text-sm rounded-md',
 md: 'h-10 px-4 text-sm rounded-lg',
 lg: 'h-12 px-6 text-base rounded-lg',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
 function Button(
 {
 variant = 'primary',
 size = 'md',
 pill,
 loading,
 className,
 children,
 disabled,
 ...rest
 },
 ref,
 ) {
 return (
 <button
 ref={ref}
 className={cn(
 'inline-flex items-center justify-center gap-2 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-brand/40 disabled:cursor-not-allowed',
 VARIANTS[variant],
 SIZES[size],
 pill && 'rounded-full px-6 py-3',
 className,
 )}
 disabled={disabled || loading}
 {...rest}
 >
 {loading && (
 <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
 )}
 {children}
 </button>
 );
 },
);
