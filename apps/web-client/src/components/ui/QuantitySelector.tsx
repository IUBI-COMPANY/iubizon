"use client";

import { AlertCircle, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuantitySelectorProps {
  value: number;
  onChange: (newValue: number) => void;
  max: number;
  min?: number;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  align?: "left" | "right";
  showLimitWarning?: boolean;
  className?: string;
}

export function QuantitySelector({
  value,
  onChange,
  max,
  min = 1,
  disabled = false,
  size = "md",
  align = "right",
  showLimitWarning = true,
  className,
}: QuantitySelectorProps) {
  const isMinReached = value <= min;
  const isMaxReached = value >= max || max <= 0;
  const isDisabled = disabled || max <= 0;

  const handleDecrement = () => {
    if (!isMinReached && !isDisabled) {
      onChange(Math.max(min, value - 1));
    }
  };

  const handleIncrement = () => {
    if (!isMaxReached && !isDisabled) {
      onChange(Math.min(max, value + 1));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    if (rawVal === "") {
      onChange(min);
      return;
    }
    const parsed = parseInt(rawVal, 10);
    if (isNaN(parsed)) return;

    if (parsed < min) {
      onChange(min);
    } else if (parsed > max) {
      onChange(max);
    } else {
      onChange(parsed);
    }
  };

  const sizeClasses = {
    sm: "h-8 px-1.5 text-xs rounded-xl",
    md: "h-10 px-2.5 text-sm rounded-xl",
    lg: "h-12 px-4 text-base rounded-2xl",
  };

  const buttonSizeClasses = {
    sm: "w-6 h-6 rounded-lg",
    md: "w-7 h-7 rounded-lg",
    lg: "w-9 h-9 rounded-xl",
  };

  const alignClasses = align === "right" ? "items-end" : "items-start";

  return (
    <div className={cn("inline-flex flex-col gap-1.5", alignClasses, className)}>
      <div
        className={cn(
          "inline-flex items-center gap-1.5 bg-[#f8fafc] border border-[#e2e8f0] p-1 shadow-xs transition-all",
          isDisabled && "opacity-50 bg-[#f1f5f9] cursor-not-allowed",
          sizeClasses[size]
        )}
      >
        <button
          type="button"
          onClick={handleDecrement}
          disabled={isDisabled || isMinReached}
          className={cn(
            "flex items-center justify-center text-[#334155] hover:bg-white active:bg-[#e2e8f0] transition-colors shrink-0 shadow-xs",
            buttonSizeClasses[size],
            (isDisabled || isMinReached) && "opacity-30 cursor-not-allowed hover:bg-transparent shadow-none"
          )}
          title={isMinReached ? `Cantidad mínima ${min}` : "Disminuir cantidad"}
        >
          <Minus className="w-3.5 h-3.5" />
        </button>

        <input
          type="number"
          min={min}
          max={max}
          value={value}
          onChange={handleInputChange}
          disabled={isDisabled}
          className="w-8 text-center font-bold text-[#112237] bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />

        <button
          type="button"
          onClick={handleIncrement}
          disabled={isDisabled || isMaxReached}
          className={cn(
            "flex items-center justify-center text-[#334155] hover:bg-white active:bg-[#e2e8f0] transition-colors shrink-0 shadow-xs",
            buttonSizeClasses[size],
            (isDisabled || isMaxReached) && "opacity-30 cursor-not-allowed hover:bg-transparent shadow-none"
          )}
          title={isMaxReached ? `Stock máximo alcanzado (${max})` : "Aumentar cantidad"}
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {isMaxReached && max > 0 && showLimitWarning && (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#fffbeb] border border-[#fef3c7] text-[#92400e] text-xs font-medium shrink-0 animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-[#f59e0b] shrink-0" />
          <span>Solo puedes llevar {max} {max === 1 ? "unidad" : "unidades"}</span>
        </div>
      )}
    </div>
  );
}
