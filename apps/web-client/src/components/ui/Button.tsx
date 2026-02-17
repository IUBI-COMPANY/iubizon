import React from "react";
import { twMerge } from "tailwind-merge";
import { Loader2 } from "lucide-react";

type ButtonVariant = "primary" | "secondary" | "tertiary";
type ButtonSize = "xs" | "sm" | "md" | "lg" | "xl";
type ButtonStyleVariant =
  | "solid"
  | "outline"
  | "outlined"
  | "dashed"
  | "filled"
  | "text"
  | "link"
  | "ghost";

interface Props extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "style"
> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  styleVariant?: ButtonStyleVariant;
  loading?: boolean;
  disabled?: boolean;
  block?: boolean;
  className?: string;
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  style?: React.CSSProperties;
}

export const Button = ({
  variant = "primary",
  size = "md",
  styleVariant = "solid",
  loading = false,
  disabled = false,
  block = false,
  className,
  children,
  onClick,
  type = "button",
  style,
  ...props
}: Props) => {
  const isDisabled = disabled || loading;

  const getVariantClasses = () => {
    const variants = {
      primary: {
        solid:
          "bg-primary text-white shadow-sm hover:bg-primary/90 focus-visible:outline-primary",
        filled:
          "bg-primary text-white shadow-lg hover:bg-primary/90 hover:shadow-xl focus-visible:outline-primary",
        outline:
          "border-2 border-primary text-primary bg-transparent hover:bg-primary hover:text-white focus-visible:outline-primary",
        outlined:
          "border border-primary text-primary bg-white hover:bg-primary/5 focus-visible:outline-primary",
        dashed:
          "border-2 border-dashed border-primary text-primary bg-transparent hover:bg-primary/5 focus-visible:outline-primary",
        text: "text-primary bg-transparent hover:bg-primary/10 focus-visible:outline-primary border-0 shadow-none",
        link: "text-primary bg-transparent hover:text-primary/80 underline underline-offset-4 hover:underline-offset-2 focus-visible:outline-primary border-0 shadow-none",
        ghost:
          "text-primary bg-transparent hover:bg-primary/10 focus-visible:outline-primary",
      },
      secondary: {
        solid:
          "bg-secondary text-white shadow-sm hover:bg-secondary/90 focus-visible:outline-secondary",
        filled:
          "bg-secondary text-white shadow-lg hover:bg-secondary/90 hover:shadow-xl focus-visible:outline-secondary",
        outline:
          "border-2 border-secondary text-secondary bg-transparent hover:bg-secondary hover:text-white focus-visible:outline-secondary",
        outlined:
          "border border-secondary text-secondary bg-white hover:bg-secondary/5 focus-visible:outline-secondary",
        dashed:
          "border-2 border-dashed border-secondary text-secondary bg-transparent hover:bg-secondary/5 focus-visible:outline-secondary",
        text: "text-secondary bg-transparent hover:bg-secondary/10 focus-visible:outline-secondary border-0 shadow-none",
        link: "text-secondary bg-transparent hover:text-secondary/80 underline underline-offset-4 hover:underline-offset-2 focus-visible:outline-secondary border-0 shadow-none",
        ghost:
          "text-secondary bg-transparent hover:bg-secondary/10 focus-visible:outline-secondary",
      },
      tertiary: {
        solid:
          "bg-gray-600 text-white shadow-sm hover:bg-gray-700 focus-visible:outline-gray-600",
        filled:
          "bg-gray-600 text-white shadow-lg hover:bg-gray-700 hover:shadow-xl focus-visible:outline-gray-600",
        outline:
          "border-2 border-gray-400 text-gray-600 bg-transparent hover:bg-gray-400 hover:text-white focus-visible:outline-gray-400",
        outlined:
          "border border-gray-400 text-gray-600 bg-white hover:bg-gray-50 focus-visible:outline-gray-400",
        dashed:
          "border-2 border-dashed border-gray-400 text-gray-600 bg-transparent hover:bg-gray-50 focus-visible:outline-gray-400",
        text: "text-gray-600 bg-transparent hover:bg-gray-100 focus-visible:outline-gray-400 border-0 shadow-none",
        link: "text-gray-600 bg-transparent hover:text-gray-800 underline underline-offset-4 hover:underline-offset-2 focus-visible:outline-gray-400 border-0 shadow-none",
        ghost:
          "text-gray-600 bg-transparent hover:bg-gray-100 focus-visible:outline-gray-400",
      },
    };

    return variants[variant][styleVariant];
  };

  const getSizeClasses = () => {
    const isTextVariant = styleVariant === "text" || styleVariant === "link";

    if (isTextVariant) {
      const textSizes = {
        xs: "px-1 py-0.5 text-xs font-medium",
        sm: "px-1.5 py-1 text-sm font-medium",
        md: "px-2 py-1.5 text-sm font-semibold",
        lg: "px-3 py-2 text-base font-semibold",
        xl: "px-4 py-2.5 text-lg font-semibold",
      };
      return textSizes[size];
    }

    const sizes = {
      xs: "px-2.5 py-1.5 text-xs font-medium",
      sm: "px-3 py-2 text-sm font-medium",
      md: "px-4 py-2.5 text-sm font-semibold",
      lg: "px-6 py-3 text-base font-semibold",
      xl: "px-8 py-4 text-lg font-semibold",
    };

    return sizes[size];
  };

  const getDisabledClasses = () => {
    if (styleVariant === "solid" || styleVariant === "filled") {
      return "opacity-50 cursor-not-allowed hover:bg-current hover:shadow-none";
    }
    if (
      styleVariant === "outline" ||
      styleVariant === "outlined" ||
      styleVariant === "dashed"
    ) {
      return "opacity-50 cursor-not-allowed hover:bg-transparent hover:text-current";
    }
    if (styleVariant === "link") {
      return "opacity-50 cursor-not-allowed hover:text-current hover:underline-offset-4";
    }
    return "opacity-50 cursor-not-allowed hover:bg-transparent";
  };

  const baseClasses = twMerge(
    // Base styles
    "cursor-pointer inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200",
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
    "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",

    // Block width
    block && "w-full",

    // Link specific styles
    styleVariant === "link" && "rounded-none",

    // Variant classes
    getVariantClasses(),

    // Size classes
    getSizeClasses(),

    // Disabled classes
    isDisabled && getDisabledClasses(),

    // Custom classes
    className,
  );

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!isDisabled && onClick) {
      onClick(e);
    }
  };

  return (
    <button
      type={type}
      disabled={isDisabled}
      onClick={handleClick}
      className={baseClasses}
      style={style}
      {...props}
    >
      {loading && (
        <Loader2
          className={twMerge(
            "animate-spin",
            size === "xs" && "h-3 w-3",
            size === "sm" && "h-4 w-4",
            size === "md" && "h-4 w-4",
            size === "lg" && "h-5 w-5",
            size === "xl" && "h-6 w-6",
          )}
        />
      )}

      <span className={twMerge("contents", loading && "opacity-75")}>
        {children}
      </span>
    </button>
  );
};
