"use client";

import { useState } from "react";
import { QuantitySelector } from "@/components/ui/QuantitySelector";
import { AddToCartButton } from "./AddToCartButton";
import { AddToCartModal } from "@/components/features/cart/AddToCartModal";
import { useRealtimeStock } from "@/hooks/useRealtimeStock";

interface ProductActionsBlockProps {
  productId: string;
  productTitle: string;
  productPrice: number;
  sellerId: string;
  images?: any[];
  initialStock: number;
  initialStatus: string;
}

export function ProductActionsBlock({
  productId,
  productTitle,
  productPrice,
  sellerId,
  images,
  initialStock,
  initialStatus,
}: ProductActionsBlockProps) {
  // Hook de tiempo real con Supabase Postgres Changes
  const { stock, status, isOutOfStock } = useRealtimeStock(
    productId,
    initialStock,
    initialStatus
  );

  const [quantity, setQuantity] = useState<number>(1);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const mainImageUrl = typeof images?.[0] === "string" ? images[0] : images?.[0]?.url;

  return (
    <div className="space-y-4 pt-2">
      {/* Selector de Cantidad reutilizable con validación de stock */}
      {!isOutOfStock && (
        <div className="space-y-1.5 bg-[#f8fafc] border border-[#e2e8f0] p-3.5 rounded-2xl">
          <label className="text-xs font-bold text-[#112237] block">
            Cantidad a comprar
          </label>
          <QuantitySelector
            value={quantity}
            onChange={setQuantity}
            max={stock}
            disabled={isOutOfStock}
            size="md"
            align="left"
          />
        </div>
      )}

      {/* Botón de Agregar al Carrito */}
      <AddToCartButton
        productId={productId}
        productTitle={productTitle}
        productPrice={productPrice}
        sellerId={sellerId}
        images={images}
        stock={stock}
        status={status}
        quantity={quantity}
        onAdded={() => setIsModalOpen(true)}
      />

      {/* Popup / Modal de Confirmación y Paquete de Aula u Oficina */}
      <AddToCartModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        addedProduct={{
          id: productId,
          title: productTitle,
          price: productPrice,
          imageUrl: mainImageUrl,
          sellerId,
          stock,
          quantity,
        }}
      />
    </div>
  );
}
