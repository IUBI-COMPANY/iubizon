"use client";

import { useState } from "react";
import Link from "next/link";
import { Edit, Info } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { QuantitySelector } from "@/components/ui/QuantitySelector";
import { AddToCartButton } from "./AddToCartButton";
import { AddToCartModal } from "@/components/features/cart/AddToCartModal";
import { useRealtimeStock } from "@/hooks/useRealtimeStock";
import { useAuth } from "@/hooks/useAuth";
import { useCompany } from "@/context/CompanyContext";

interface ProductActionsBlockProps {
  productId: string;
  productTitle: string;
  productPrice: number;
  sellerId: string;
  companyId?: string | null;
  images?: any[];
  initialStock: number;
  initialStatus: string;
}

export function ProductActionsBlock({
  productId,
  productTitle,
  productPrice,
  sellerId,
  companyId,
  images,
  initialStock,
  initialStatus,
}: ProductActionsBlockProps) {
  const { user } = useAuth();
  const { activeCompany } = useCompany();

  // Hook de tiempo real con Supabase Postgres Changes
  const { stock, status, isOutOfStock } = useRealtimeStock(
    productId,
    initialStock,
    initialStatus,
  );

  const [quantity, setQuantity] = useState<number>(1);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const mainImageUrl =
    typeof images?.[0] === "string" ? images[0] : images?.[0]?.url;

  // Detección estricta de propiedad
  const isOwner = Boolean(
    user?.id &&
    (user.id === sellerId || (companyId && activeCompany?.id === companyId)),
  );

  if (isOwner) {
    return (
      <div className="space-y-3 pt-2">
        <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl p-3.5 text-xs font-medium flex items-center gap-2">
          <Info className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            Esta es tu propia publicación. Puedes gestionarla o editarla desde
            tu panel.
          </span>
        </div>
        <Link href="/user/dashboard/products" className="block w-full">
          <Button className="w-full bg-[#112237] hover:bg-[#1a3454] text-white font-bold py-3.5 rounded-xl shadow-md flex items-center justify-center gap-2 text-xs">
            <Edit className="w-4 h-4 text-[#f25c05]" />
            <span>Gestionar / Editar mi Producto</span>
          </Button>
        </Link>
      </div>
    );
  }

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
