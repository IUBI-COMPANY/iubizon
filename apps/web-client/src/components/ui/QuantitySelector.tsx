"use client";
import React, { useState, useEffect } from "react";
import { Plus, Minus } from "lucide-react";

interface QuantitySelectorProps {
  productId: string;
  min?: number;
  max?: number;
  defaultValue?: number;
  className?: string;
}

export const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  productId,
  min = 1,
  max = 100,
  defaultValue = 1,
  className = "",
}) => {
  const [quantity, setQuantity] = useState(defaultValue);

  // Cargar cantidad desde localStorage al montar
  useEffect(() => {
    const stored = localStorage.getItem(`quantity_${productId}`);
    if (stored) {
      const parsedQuantity = parseInt(stored, 10);
      if (parsedQuantity >= min && parsedQuantity <= max) {
        setQuantity(parsedQuantity);
      }
    }
  }, [productId, min, max]);

  // Guardar en localStorage cuando cambia la cantidad
  useEffect(() => {
    localStorage.setItem(`quantity_${productId}`, quantity.toString());
  }, [quantity, productId]);

  const increment = () => {
    if (quantity < max) {
      setQuantity((prev) => prev + 1);
    }
  };

  const decrement = () => {
    if (quantity > min) {
      setQuantity((prev) => prev - 1);
    }
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <button
        type="button"
        onClick={decrement}
        disabled={quantity <= min}
        className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white/10"
        aria-label="Disminuir cantidad"
      >
        <Minus className="w-4 h-4" />
      </button>
      <div className="min-w-[60px] text-center">
        <span className="text-2xl font-bold text-white">{quantity}</span>
        <p className="text-xs text-gray-400">
          unidad{quantity !== 1 ? "es" : ""}
        </p>
      </div>
      <button
        type="button"
        onClick={increment}
        disabled={quantity >= max}
        className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white/10"
        aria-label="Aumentar cantidad"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
};
