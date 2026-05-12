'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface FormSelectProps {
  name: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { label: string; value: string }[];
  placeholder?: string;
  error?: boolean | string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  label?: string;
  textColor?: string;
  className?: string;
}

export function FormSelect({
  name,
  value,
  onChange,
  options,
  placeholder,
  error,
  helperText,
  required,
  disabled,
  label,
  textColor,
  className,
}: FormSelectProps) {
  const errorText = typeof error === 'string' ? error : undefined;
  const hasError = typeof error === 'string' ? !!error : !!error;

  return (
    <div className={cn('space-y-1', className)}>
      {label && (
        <label
          htmlFor={name}
          className={cn(
            'block text-sm font-medium',
            textColor || 'text-[#112237]',
            required && "after:content-['*'] after:ml-0.5 after:text-red-500"
          )}
        >
          {label}
        </label>
      )}
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={cn(
          'flex h-11 w-full rounded-lg border bg-white px-4 py-2 text-sm appearance-none',
          'focus:outline-none focus:ring-2 focus:ring-[#f25c05] focus:border-transparent',
          'disabled:cursor-not-allowed disabled:opacity-50',
          hasError ? 'border-[#ef4444] focus:ring-[#ef4444]' : 'border-[#e2e8f0]',
          textColor || 'text-[#112237]'
        )}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {hasError && helperText && (
        <p className="text-xs text-[#ef4444]">{helperText}</p>
      )}
      {errorText && !helperText && (
        <p className="text-xs text-[#ef4444]">{errorText}</p>
      )}
    </div>
  );
}