import React from "react";
import { twMerge } from "tailwind-merge";
import { Checkbox } from "./Checkbox";

interface Option {
  value: string;
  label: React.ReactNode;
  disabled?: boolean;
}

interface Props {
  name: string;
  label?: string;
  options: Option[];
  values?: string[];
  onChange?: (values: string[]) => void;
  error?: boolean;
  helperText?: string;
  required?: boolean;
  hidden?: boolean;
  className?: string;
  direction?: "vertical" | "horizontal";
  columns?: number;
  disabled?: boolean;
}

export const CheckboxGroup = ({
  name,
  label,
  options,
  values = [],
  onChange,
  error = false,
  helperText,
  required = false,
  hidden = false,
  className,
  direction = "vertical",
  columns = 1,
  disabled = false,
}: Props) => {
  const handleCheckboxChange = (optionValue: string, checked: boolean) => {
    if (!onChange) return;

    if (checked) {
      // Add value if not already present
      if (!values.includes(optionValue)) {
        onChange([...values, optionValue]);
      }
    } else {
      // Remove value
      onChange(values.filter((value) => value !== optionValue));
    }
  };

  const getGridClasses = () => {
    if (direction === "horizontal") {
      return "flex flex-wrap gap-4";
    }

    if (columns > 1) {
      const colsClass =
        {
          2: "grid-cols-2",
          3: "grid-cols-3",
          4: "grid-cols-4",
        }[columns] || "grid-cols-2";

      return `grid ${colsClass} gap-2`;
    }

    return "space-y-2";
  };

  return (
    <div className={twMerge("", hidden && "hidden", className)}>
      {label && (
        <div className="mb-3">
          <label className="block text-sm/6 font-semibold text-secondary">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        </div>
      )}

      <div
        className={getGridClasses()}
        role="group"
        aria-labelledby={label ? `${name}-label` : undefined}
        aria-describedby={error ? `${name}-error` : undefined}
      >
        {options.map((option, index) => (
          <Checkbox
            key={`${name}-${option.value}-${index}`}
            name={`${name}-${option.value}`}
            value={values.includes(option.value)}
            onChange={(checked) => handleCheckboxChange(option.value, checked)}
            error={false} // Individual checkboxes don't show errors, only the group
            disabled={disabled || option.disabled}
          >
            {option.label}
          </Checkbox>
        ))}
      </div>

      {error && helperText && (
        <p
          id={`${name}-error`}
          className="mt-2 text-sm text-red-600 scroll-error-anchor"
          role="alert"
        >
          {helperText}
        </p>
      )}
    </div>
  );
};
