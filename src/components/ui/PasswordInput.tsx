"use client";

import * as React from "react";
import { Lock, Eye, EyeOff, Check, X } from "lucide-react";
import { Input } from "./Input";
import { Label } from "./Label";
import { cn } from "@/lib/utils";

export interface PasswordRequirement {
  label: string;
  met: boolean;
}

export function getPasswordRequirements(
  password: string,
): PasswordRequirement[] {
  return [
    { label: "Al menos 8 caracteres", met: password.length >= 8 },
    { label: "Una letra mayúscula", met: /[A-Z]/.test(password) },
    { label: "Un número", met: /\d/.test(password) },
  ];
}

export function validatePasswordStrict(password: string): boolean {
  return getPasswordRequirements(password).every((req) => req.met);
}

export interface PasswordInputProps extends Omit<
  React.ComponentPropsWithoutRef<typeof Input>,
  "type"
> {
  label?: string;
  showRequirements?: boolean;
  confirmValue?: string;
  showMatchError?: boolean;
  helperText?: string;
}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  (
    {
      className,
      label,
      value = "",
      onChange,
      showRequirements = false,
      confirmValue,
      showMatchError = true,
      helperText,
      id,
      placeholder = "••••••••",
      disabled,
      ...props
    },
    ref,
  ) => {
    const [showPassword, setShowPassword] = React.useState(false);

    const stringValue = typeof value === "string" ? value : String(value || "");
    const requirements = React.useMemo(
      () => getPasswordRequirements(stringValue),
      [stringValue],
    );

    const isMatchError =
      showMatchError &&
      confirmValue !== undefined &&
      stringValue.length > 0 &&
      confirmValue.length > 0 &&
      stringValue !== confirmValue;

    const inputId =
      id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="space-y-2 w-full">
        {label && <Label htmlFor={inputId}>{label}</Label>}

        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" />
          <Input
            ref={ref}
            id={inputId}
            type={showPassword ? "text" : "password"}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            className={cn("pl-10 pr-10", className)}
            {...props}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            disabled={disabled}
            tabIndex={-1}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b] hover:text-[#112237] transition-colors focus:outline-none"
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>

        {helperText && !showRequirements && (
          <p className="text-xs text-[#94a3b8]">{helperText}</p>
        )}

        {showRequirements && stringValue.length > 0 && (
          <div className="p-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg space-y-1.5 text-xs mt-2">
            <p className="font-medium text-[#334155] mb-1">
              Requisitos de la contraseña:
            </p>
            {requirements.map((req, idx) => (
              <div key={idx} className="flex items-center gap-2">
                {req.met ? (
                  <Check className="w-3.5 h-3.5 text-[#10b981] shrink-0" />
                ) : (
                  <X className="w-3.5 h-3.5 text-[#ef4444] shrink-0" />
                )}
                <span
                  className={
                    req.met ? "text-[#10b981] font-medium" : "text-[#64748b]"
                  }
                >
                  {req.label}
                </span>
              </div>
            ))}
          </div>
        )}

        {isMatchError && (
          <p className="text-xs text-[#ef4444] font-medium">
            Las contraseñas no coinciden
          </p>
        )}
      </div>
    );
  },
);

PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
