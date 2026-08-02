import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string | boolean;
  icon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, icon, ...props }, ref) => {
    return (
      <div className="relative w-full">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]">
            {icon}
          </div>
        )}
        <input
          type={type}
          className={cn(
            'flex h-11 w-full rounded-lg border border-[#e2e8f0] bg-white px-4 py-2 text-sm transition-colors',
            'placeholder:text-[#94a3b8]',
            'focus:outline-none focus:ring-2 focus:ring-[#f25c05] focus:border-transparent',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-[#ef4444] focus:ring-[#ef4444]',
            icon && 'pl-10',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && typeof error === 'string' && (
          <p className="mt-1 text-xs text-[#ef4444]">{error}</p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input };