"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  name: string;
  label: string;
  required?: boolean;
  optional?: boolean;
  error?: string;
  hint?: string;
  className?: string;
  children: ReactNode;
}

export function FormField({
  name,
  label,
  required,
  optional,
  error,
  hint,
  className,
  children,
}: FormFieldProps) {
  const id = `field_${name}`;

  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={id} className="block text-xs font-bold text-[#112237]">
        {label}
        {required && <span className="text-[#f25c05] ml-0.5">*</span>}
        {optional && (
          <span className="text-[#94a3b8] font-normal ml-1">(Opcional)</span>
        )}
      </label>
      <div id={`${id}_wrapper`}>{children}</div>
      {hint && <p className="text-[10px] text-[#94a3b8]">{hint}</p>}
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
}
