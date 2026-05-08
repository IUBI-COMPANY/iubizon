"use client";
import React from "react";
import { Plus, Minus } from "lucide-react";
import { InputNumber } from "./InputNumber";

interface QuantitySelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  className?: string;
  theme?: "light" | "dark";
}

export const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  value,
  onChange,
  min = 1,
  max = 100,
  className = "",
  theme = "dark",
}) => {
  const safeMax = Math.max(min, max);
  const clampValue = (nextValue: number) => {
    return Math.min(safeMax, Math.max(min, nextValue));
  };

  const increment = () => {
    if (value < safeMax) onChange(value + 1);
  };

  const decrement = () => {
    if (value > min) onChange(value - 1);
  };

  const handleInputChange = (nextValue: number) => {
    onChange(clampValue(nextValue));
  };

  const isDark = theme === "dark";
  const bgClass = isDark ? "bg-white/10" : "bg-gray-100";
  const borderClass = isDark ? "border-white/20" : "border-gray-300";
  const textClass = isDark ? "text-white" : "text-gray-900";
  const hoverClass = isDark ? "hover:bg-white/20" : "hover:bg-gray-200";
  const disabledClass = isDark
    ? "disabled:hover:bg-white/10"
    : "disabled:hover:bg-gray-100";

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <button
        type="button"
        onClick={decrement}
        disabled={value <= min}
        className={`w-10 h-10 rounded-lg ${bgClass} ${borderClass} ${hoverClass} flex items-center justify-center ${textClass} transition-all disabled:opacity-50 disabled:cursor-not-allowed ${disabledClass}`}
        aria-label="Disminuir cantidad"
      >
        <Minus className="w-4 h-4" />
      </button>
      <InputNumber
        name="quantity"
        value={value}
        min={min}
        max={safeMax}
        onChange={handleInputChange}
        textColor={isDark ? "white" : "dark"}
        className={`w-20 h-10 rounded-lg ${bgClass} ${borderClass} text-center text-2xl font-bold ${textClass} outline-none focus:outline-none focus:ring-2 focus:ring-primary/60`}
      />
      <button
        type="button"
        onClick={increment}
        disabled={value >= max}
        className={`w-10 h-10 rounded-lg ${bgClass} ${borderClass} ${hoverClass} flex items-center justify-center ${textClass} transition-all disabled:opacity-50 disabled:cursor-not-allowed ${disabledClass}`}
        aria-label="Aumentar cantidad"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
};
