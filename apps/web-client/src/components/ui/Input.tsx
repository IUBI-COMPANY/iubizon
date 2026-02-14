import React from "react";
import { twMerge } from "tailwind-merge";

interface Props {
  name: string;
  type?: "text" | "email" | "password" | "number" | "tel";
  label?: string;
  value?: string | number;
  onChange?: (value: string) => void;
  error?: boolean;
  helperText?: string;
  required?: boolean;
  hidden?: boolean;
  className?: string;
  placeholder?: string;
  autoComplete?: string;
}

export const Input = ({
  name,
  type = "text",
  label,
  value,
  onChange,
  error = false,
  helperText,
  required = false,
  hidden = false,
  className,
  placeholder,
  autoComplete,
}: Props) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value);
  };

  return (
    <div className={twMerge("", hidden && "hidden")}>
      {label && (
        <label
          htmlFor={name}
          className="block text-sm/6 font-semibold text-white mb-1.5 font-sfpro"
        >
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}

      <input
        id={name}
        name={name}
        type={type}
        value={value ?? ""}
        onChange={handleChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={twMerge(
          "block w-full rounded-md bg-white px-3.5 py-2 text-base placeholder:text-gray-400 transition-colors duration-200",
          "outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2",
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
