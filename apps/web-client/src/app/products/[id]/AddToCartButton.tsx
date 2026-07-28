'use client';

import { useState } from 'react';
import { ShoppingCart, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useCart } from '@/hooks/useCart';
import { toast } from 'sonner';

interface AddToCartButtonProps {
  productId: string;
  productTitle: string;
  productPrice: number;
  sellerId: string;
  images?: any[];
  stock?: number;
  status?: string;
  quantity?: number;
  onAdded?: () => void;
}

export function AddToCartButton({
  productId,
  productTitle,
  productPrice,
  sellerId,
  images,
  stock,
  status,
  quantity = 1,
  onAdded,
}: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const isOutOfStock = (stock !== undefined && stock <= 0) || status === 'sold';

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addItem(
      {
        id: productId,
        title: productTitle,
        price: productPrice,
        seller_id: sellerId,
        images,
        stock,
      },
      quantity
    );
    setAdded(true);
    if (onAdded) {
      onAdded();
    } else {
      toast.success(`¡${quantity} ${quantity === 1 ? 'unidad agregada' : 'unidades agregadas'} al carrito!`);
    }

    setTimeout(() => {
      setAdded(false);
    }, 2000);
  };

  return (
    <Button
      className={`w-full font-semibold py-3 rounded-xl shadow-md transition-all ${
        isOutOfStock
          ? 'bg-slate-200 text-slate-500 cursor-not-allowed hover:bg-slate-200 shadow-none'
          : 'bg-[#f25c05] hover:bg-[#d94d04] text-white'
      }`}
      size="lg"
      disabled={isOutOfStock}
      onClick={handleAddToCart}
    >
      {isOutOfStock ? (
        <>
          <ShoppingCart className="w-5 h-5 mr-2 opacity-50" />
          Agotado / Sin Stock
        </>
      ) : added ? (
        <>
          <Check className="w-5 h-5 mr-2" />
          ¡Agregado al carrito!
        </>
      ) : (
        <>
          <ShoppingCart className="w-5 h-5 mr-2" />
          Agregar al carrito
        </>
      )}
    </Button>
  );
}
