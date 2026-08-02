import React from "react";
import { twMerge } from "tailwind-merge";

interface Props {
  name: string;
  checked: boolean;
  onChange?: (checked: boolean) => void;
  error?: boolean;
  helperText?: string;
  required?: boolean;
  hidden?: boolean;
  label?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}

export const Switch = ({
  name,
  checked = false,
  onChange,
  error = false,
  helperText,
  required = false,
  hidden = false,
  label,
  description,
  disabled = false,
  className,
}: Props) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.checked);
  };

  return (
    <div className={twMerge("space-y-1", hidden && "hidden", className)}>
      <div className="flex items-center justify-between">
        {label && (
          <div className="flex-1">
            <label
              htmlFor={name}
              className={twMerge(
                "text-sm font-semibold text-secondary cursor-pointer",
                disabled && "opacity-50 cursor-not-allowed",
              )}
            >
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {description && (
              <p
                className={twMerge(
                  "text-sm text-gray-500 mt-0.5",
                  disabled && "opacity-50",
                )}
              >
                {description}
              </p>
            )}
          </div>
        )}

        <div className="relative">
          <input
            id={name}
            name={name}
            type="checkbox"
            checked={checked}
            onChange={handleChange}
            disabled={disabled}
            className="sr-only peer"
            aria-describedby={error ? `${name}-error` : undefined}
            aria-invalid={error}
          />

          <div
            className={twMerge(
              "relative w-11 h-6 rounded-full transition-colors duration-200 cursor-pointer",
              "focus-within:ring-2 focus-within:ring-secondary/20 focus-within:ring-offset-2",
              error
                ? "bg-red-100 peer-checked:bg-red-500"
                : "bg-gray-200 peer-checked:bg-secondary",
              disabled && "opacity-50 cursor-not-allowed",
            )}
          >
            <div
              className={twMerge(
                "absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200",
                "peer-checked:translate-x-5",
                error && "peer-checked:bg-white",
              )}
            />
          </div>
        </div>
      </div>

      {error && helperText && (
        <p
          id={`${name}-error`}
          className="text-sm text-red-600 scroll-error-anchor"
          role="alert"
        >
          {helperText}
        </p>
      )}
    </div>
  );
};
