"use client";

import { ProductCard } from "./ProductCard";
import type { Product } from "@/types";

interface ProductGridProps {
  products: Product[];
  favorites?: string[];
  onToggleFavorite?: (productId: string) => void;
  showSeller?: boolean;
  emptyMessage?: string;
}

export const ProductGrid = ({
  products,
  favorites = [],
  onToggleFavorite,
  showSeller = false,
  emptyMessage = "No se encontraron productos",
}: ProductGridProps) => {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="text-6xl mb-4">🔍</div>
        <p className="text-[#64748b] text-lg">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {products.map((product, idx) => (
        <ProductCard
          key={product.id}
          product={product}
          showSeller={showSeller}
          priority={idx < 4}
        />
      ))}
    </div>
  );
};
