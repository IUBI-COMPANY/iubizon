import React from "react";
import { twMerge } from "tailwind-merge";
import { ChevronDownIcon } from "lucide-react";

interface Option {
  value: string;
  label: string;
}

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
  options: Option[];
  autoComplete?: string;
  textColor?: "white" | "secondary";
}

export const Select = ({
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
  options,
  autoComplete,
  textColor = "white",
}: Props) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange?.(e.target.value);
  };

  return (
    <div className={twMerge("", hidden && "hidden")}>
      {label && (
        <label
          htmlFor={name}
          className={twMerge(
            "block text-sm/6 font-semibold mb-1.5 font-sfpro",
            textColor === "white" ? "text-white" : "text-secondary",
          )}
        >
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <select
          id={name}
          name={name}
          value={value ?? ""}
          onChange={handleChange}
          autoComplete={autoComplete}
          className={twMerge(
            "block w-full rounded-md bg-white px-3.5 py-2 pr-10 text-base transition-colors duration-200",
            "outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2",
            "appearance-none cursor-pointer",
            error
              ? "outline-red-500 border-red-500 focus:outline-red-500"
              : "focus:outline-secondary/70 hover:outline-gray-400",
            // Placeholder styling when no value is selected
            !value && "text-gray-400",
            className,
          )}
          aria-describedby={error ? `${name}-error` : undefined}
          aria-invalid={error}
        >
          {placeholder && (
            <option value="" disabled className="text-gray-400">
              {placeholder}
            </option>
          )}
          {options.map((option, index) => (
            <option
              key={`${option.value}-${index}`}
              value={option.value}
              className="text-gray-900"
            >
              {option.label}
            </option>
          ))}
        </select>

        <ChevronDownIcon
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
