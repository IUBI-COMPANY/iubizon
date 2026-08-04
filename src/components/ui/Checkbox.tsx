import React from "react";
import { twMerge } from "tailwind-merge";
import { Check } from "lucide-react";

interface Props {
  name?: string;
  value?: boolean;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  onCheckedChange?: (checked: boolean) => void;
  error?: boolean;
  helperText?: string;
  required?: boolean;
  hidden?: boolean;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export const Checkbox = ({
  name,
  value,
  checked,
  onChange,
  onCheckedChange,
  error = false,
  helperText,
  required = false,
  hidden = false,
  disabled = false,
  className,
  children,
}: Props) => {
  const isChecked = checked ?? value ?? false;
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!disabled) {
      onChange?.(e.target.checked);
      onCheckedChange?.(e.target.checked);
    }
  };

  return (
    <div className={twMerge("", hidden && "hidden")}>
      <div className="flex items-start gap-3">
        <div className="relative shrink-0">
          <input
            id={name}
            name={name}
            type="checkbox"
            checked={isChecked}
            onChange={handleChange}
            disabled={disabled}
            className={twMerge(
              "peer h-5 w-5 transition-all appearance-none rounded border-2 shadow-sm",
              "focus:ring-2 focus:ring-[#f25c05]/20 focus:ring-offset-2",
              disabled
                ? "cursor-not-allowed opacity-50"
                : "cursor-pointer hover:shadow-md",
              error
                ? "border-red-500 focus:border-red-500"
                : "border-[#e2e8f0] hover:border-[#f25c05] checked:bg-[#f25c05] checked:border-[#f25c05]",
              className,
            )}
            aria-describedby={error && name ? `${name}-error` : undefined}
            aria-invalid={error}
          />
          <Check
            className="absolute inset-0 m-0.5 h-4 w-4 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity"
            strokeWidth={3}
          />
        </div>

        {children && (
          <label
            htmlFor={name}
            className={twMerge(
              "text-sm leading-5 flex-1 font-medium text-[#112237]",
              disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
            )}
          >
            <span className="flex gap-1 items-start">
              {children}
              {required && <span className="text-red-400 text-base">*</span>}
            </span>
          </label>
        )}
      </div>
      {error && helperText && (
        <p
          id={name ? `${name}-error` : undefined}
          className="text-sm text-red-600 mt-1"
          role="alert"
        >
          {helperText}
        </p>
      )}
    </div>
  );
};
