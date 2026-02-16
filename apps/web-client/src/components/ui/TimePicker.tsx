import React from "react";
import { twMerge } from "tailwind-merge";
import { ClockIcon } from "lucide-react";

interface Props {
  name: string;
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: boolean;
  helperText?: string;
  required?: boolean;
  hidden?: boolean;
  className?: string;
  placeholder?: string;
  min?: string;
  max?: string;
  step?: number;
  autoComplete?: string;
  textColor?: "white" | "secondary";
}

export const TimePicker = ({
  name,
  label,
  value,
  onChange,
  error = false,
  helperText,
  required = false,
  hidden = false,
  className,
  placeholder,
  min,
  max,
  step,
  autoComplete,
  textColor = "white",
}: Props) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value);
  };

  return (
    <div className={twMerge("", hidden && "hidden")}>
      {label && (
        <label
          htmlFor={name}
          className={twMerge(
            "block text-sm/6 font-semibold mb-1.5",
            textColor === "white" ? "text-white" : "text-secondary",
          )}
        >
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <input
          id={name}
          name={name}
          type="time"
          value={value ?? ""}
          onChange={handleChange}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          autoComplete={autoComplete}
          className={twMerge(
            "block w-full rounded-md bg-white px-3.5 py-2 pr-10 text-base text-gray-600 transition-colors duration-200",
            "outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2",
            "appearance-none cursor-pointer",
            "[&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-3 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:w-5 [&::-webkit-calendar-picker-indicator]:h-5",
            error
              ? "outline-red-500 border-red-500 focus:outline-red-500"
              : "focus:outline-secondary/70 hover:outline-gray-400",
            className,
          )}
          aria-describedby={error ? `${name}-error` : undefined}
          aria-invalid={error}
        />

        <ClockIcon
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
        />
      </div>

      {error && helperText && (
        <p
          id={`${name}-error`}
          className="mt-1 text-sm text-red-600 scroll-error-anchor"
          role="alert"
        >
          {helperText}
        </p>
      )}
    </div>
  );
};
