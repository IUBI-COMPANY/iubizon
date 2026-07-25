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
}

export function AddToCartButton({
  productId,
  productTitle,
  productPrice,
  sellerId,
  images,
}: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    addItem({
      id: productId,
      title: productTitle,
      price: productPrice,
      seller_id: sellerId,
      images,
    });
    setAdded(true);
    toast.success('¡Producto agregado al carrito!');

    setTimeout(() => {
      setAdded(false);
    }, 2000);
  };

  return (
    <Button
      className="w-full bg-[#f25c05] hover:bg-[#d94d04] text-white font-semibold py-3 rounded-xl shadow-md transition-all"
      size="lg"
      onClick={handleAddToCart}
    >
      {added ? (
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
