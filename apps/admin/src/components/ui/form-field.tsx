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

export function FormField({ name, label, required, optional, error, hint, className, children }: FormFieldProps) {
  const id = `field_${name}`;
  return (
    <div className={cn("space-y-2", className)}>
      <label htmlFor={id} className="text-sm font-medium">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
        {optional && <span className="text-muted-foreground font-normal ml-1">(Opcional)</span>}
      </label>
      <div id={`${id}_wrapper`}>{children}</div>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
