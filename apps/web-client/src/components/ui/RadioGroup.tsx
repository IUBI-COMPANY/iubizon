import React from "react";
import { twMerge } from "tailwind-merge";
import { Radio } from "@/components/ui/Radio";

interface Option {
  value: string;
  label: React.ReactNode;
  description?: string;
  disabled?: boolean;
  hidden?: boolean;
}

interface Props {
  name: string;
  label?: string;
  options: Option[];
  value?: string;
  onChange?: (value: string) => void;
  error?: boolean;
  helperText?: string;
  required?: boolean;
  hidden?: boolean;
  className?: string;
  direction?: "vertical" | "horizontal";
  columns?: number;
  disabled?: boolean;
  optionType?: "radio" | "button";
  buttonStyle?: "solid" | "outline";
}

export const RadioGroup = ({
  name,
  label,
  options,
  value = "",
  onChange,
  error = false,
  helperText,
  required = false,
  hidden = false,
  className,
  direction = "vertical",
  columns = 1,
  disabled = false,
  optionType = "radio",
  buttonStyle = "outline",
}: Props) => {
  const handleCheckboxChange = (optionValue: string, checked: boolean) => {
    if (!onChange) return;

    if (checked) {
      // Add value if not already present
      if (!value.includes(optionValue)) {
        onChange(optionValue);
      }
    } else {
      // Remove value
      onChange("");
    }
  };

  const handleButtonClick = (optionValue: string) => {
    if (!onChange || disabled) return;
    onChange(optionValue);
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

  const getButtonClasses = (isSelected: boolean, isDisabled: boolean) => {
    const baseClasses =
      "px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary";

    if (isDisabled) {
      return twMerge(
        baseClasses,
        "cursor-not-allowed opacity-50",
        buttonStyle === "solid"
          ? "bg-gray-300 text-gray-500"
          : "border-2 border-gray-300 text-gray-400",
      );
    }

    if (buttonStyle === "solid") {
      return twMerge(
        baseClasses,
        isSelected
          ? "bg-primary text-white shadow-md"
          : "bg-gray-200 text-gray-700 hover:bg-gray-300",
      );
    }

    // outline style
    return twMerge(
      baseClasses,
      isSelected
        ? "border-2 border-primary bg-primary/10 text-primary"
        : "border-2 border-gray-300 text-gray-700 hover:border-primary/50 hover:bg-gray-50",
    );
  };

  if (optionType === "button") {
    return (
      <div className={twMerge("", hidden && "hidden", className)}>
        {label && (
          <div className="mb-3">
            <label className="block text-md font-semibold text-secondary">
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </label>
          </div>
        )}

        <div
          className={twMerge(
            "flex gap-2 w-full",
            direction === "vertical" && "flex-col",
          )}
          role="radiogroup"
          aria-labelledby={label ? `${name}-label` : undefined}
          aria-describedby={error ? `${name}-error` : undefined}
        >
          {options.map((option) => {
            const isSelected = value === option.value;
            const isDisabled = disabled || option.disabled || false;

            return (
              <button
                key={`${name}-${option.value}`}
                type="button"
                role="radio"
                aria-checked={isSelected}
                disabled={isDisabled}
                onClick={() => handleButtonClick(option.value)}
                className={twMerge(
                  getButtonClasses(isSelected, isDisabled),
                  "flex-1",
                )}
              >
                {option.label}
                {option?.description}
              </button>
            );
          })}
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
  }

  // Default radio button rendering
  return (
    <div className={twMerge("", hidden && "hidden", className)}>
      {label && (
        <div className="mb-3">
          <label className="block text-md font-semibold text-secondary">
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
          <Radio
            key={`${name}-${option.value}-${index}`}
            name={`${name}-${option.value}`}
            checked={value.includes(option.value)}
            onChange={(checked) => handleCheckboxChange(option.value, checked)}
            error={false} // Individual checkboxes don't show errors, only the group
            disabled={disabled || option.disabled}
            message={option?.description}
            hidden={option?.hidden}
          >
            {option.label}
          </Radio>
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
