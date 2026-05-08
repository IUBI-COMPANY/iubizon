import React, { useState, useEffect } from "react";
import { twMerge } from "tailwind-merge";

interface Props {
  name: string;
  label?: string;
  value?: number;
  onChange?: (value: number) => void;
  error?: boolean;
  helperText?: string;
  required?: boolean;
  hidden?: boolean;
  className?: string;
  placeholder?: string;
  min?: number;
  max?: number;
  textColor?: "white" | "secondary" | "dark";
}

export const InputNumber = ({
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
  textColor = "secondary",
}: Props) => {
  // Internal state to allow free typing before validation
  const [internalValue, setInternalValue] = useState<string>("");

  // Sync internal value with external value prop
  useEffect(() => {
    if (value !== undefined && value !== null) {
      setInternalValue(String(value));
    } else {
      setInternalValue("");
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    // Allow user to clear the field temporarily
    if (inputValue === "") {
      setInternalValue("");
      return;
    }

    // Parse as integer only
    const numValue = parseInt(inputValue, 10);

    // Only update if it's a valid number
    if (!isNaN(numValue)) {
      setInternalValue(String(numValue));
      onChange?.(numValue);
    }
  };

  const handleBlur = () => {
    // On blur, enforce min/max constraints and clean up empty values
    if (internalValue === "") {
      const fallbackValue = min ?? 0;
      setInternalValue(String(fallbackValue));
      onChange?.(fallbackValue);
      return;
    }

    let numValue = parseInt(internalValue, 10);

    // Enforce min constraint
    if (min !== undefined && numValue < min) {
      numValue = min;
    }

    // Enforce max constraint
    if (max !== undefined && numValue > max) {
      numValue = max;
    }

    setInternalValue(String(numValue));
    onChange?.(numValue);
  };

  return (
    <div className={twMerge("", hidden && "hidden")}>
      {label && (
        <label
          htmlFor={name}
          className={twMerge(
            "block text-sm/6 font-semibold mb-1.5 font-sfpro",
            textColor === "white" ? "text-white" : textColor === "dark" ? "text-gray-900" : "text-secondary",
          )}
        >
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}

      <input
        id={name}
        name={name}
        type="number"
        value={internalValue}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        min={min}
        max={max}
        step={1}
        className={twMerge(
          "block w-full rounded-md bg-white px-3.5 py-2 text-base placeholder:text-gray-400 transition-colors duration-200",
          "outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2",
          "appearance-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
          error
            ? "outline-red-500 border-red-500 focus:outline-red-500"
            : "focus:outline-secondary/70 hover:outline-gray-400",
          className,
        )}
        aria-describedby={error ? `${name}-error` : undefined}
        aria-invalid={error}
      />
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
