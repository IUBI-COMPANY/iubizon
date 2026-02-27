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
}

export const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  value,
  onChange,
  min = 1,
  max = 100,
  className = "",
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

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <button
        type="button"
        onClick={decrement}
        disabled={value <= min}
        className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white/10"
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
        className="w-20 h-10 rounded-lg bg-white/10 border border-white/20 text-center text-2xl font-bold text-white placeholder:text-white/60 outline-none focus:outline-none focus:ring-2 focus:ring-primary/60"
      />
      <button
        type="button"
        onClick={increment}
        disabled={value >= max}
        className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white/10"
        aria-label="Aumentar cantidad"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
};
