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
  companyId: string;
  images?: any[];
  initialStock: number;
  initialStatus: string;
}

export function ProductActionsBlock({
  productId,
  productTitle,
  productPrice,
  companyId,
  images,
  initialStock,
  initialStatus,
}: ProductActionsBlockProps) {
  const { user } = useAuth();
  const { activeCompany } = useCompany();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const { stock, status } = useRealtimeStock(
    productId,
    initialStock,
    initialStatus,
  );

  const isOwner = Boolean(
    user?.id && companyId && activeCompany?.id === companyId,
  );

  const canEdit = true;

  return (
    <div className="space-y-3">
      {isOwner ? (
        <Link href={`/products/edit/${productId}`} className="block w-full">
          <Button
            variant="outline"
            className="w-full font-semibold py-3 rounded-xl border-[#f25c05] text-[#f25c05] hover:bg-[#f25c05]/10 transition-colors"
            size="lg"
          >
            <Edit className="w-5 h-5 mr-2" />
            Editar mi publicación
          </Button>
        </Link>
      ) : (
        <>
          <QuantitySelector
            value={quantity}
            onChange={setQuantity}
            min={1}
            max={stock ?? 10}
          />

          <AddToCartButton
            productId={productId}
            productTitle={productTitle}
            productPrice={productPrice}
            companyId={companyId}
            images={images}
            stock={stock}
            status={status}
            quantity={quantity}
            onAdded={() => setIsModalOpen(true)}
          />

          <AddToCartModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            addedProduct={{
              id: productId,
              title: productTitle,
              price: productPrice,
              imageUrl: images?.[0]?.url,
              companyId: companyId,
              quantity,
            }}
          />
        </>
      )}
    </div>
  );
}
