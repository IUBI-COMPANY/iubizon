'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@/types';

interface BuyButtonProps {
  productId: string;
  productTitle: string;
  productPrice: number;
  sellerId: string;
}

export function BuyButton({ productId, productTitle, productPrice, sellerId }: BuyButtonProps) {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (authUser) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();
        
        if (profile) {
          setUser(profile as User);
        }
      }
      setIsLoading(false);
    };

    getUser();
  }, [supabase]);

  const handleBuy = async () => {
    if (!user) {
      router.push('/auth/register?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }

    if (user.id === sellerId) {
      alert('No puedes comprar tu propio producto');
      return;
    }

    setIsProcessing(true);

    try {
      const { data: existingOrder } = await supabase
        .from('orders')
        .select('id')
        .eq('product_id', productId)
        .eq('buyer_id', user.id)
        .in('status', ['pending', 'paid', 'shipped'])
        .maybeSingle();

      if (existingOrder) {
        alert('Ya tienes un pedido activo para este producto');
        setIsProcessing(false);
        return;
      }

      const { data: order, error } = await supabase
        .from('orders')
        .insert({
          product_id: productId,
          buyer_id: user.id,
          seller_id: sellerId,
          amount: productPrice,
          payment_method: 'contra_entrega',
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;

      router.push(`/user/dashboard/orders?order=${order.id}`);
    } catch (error: any) {
      console.error('Error creating order:', error);
      alert('Error al procesar la compra: ' + (error?.message || 'Intenta de nuevo'));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Button 
      className="w-full" 
      size="lg"
      onClick={handleBuy}
      disabled={isProcessing}
    >
      {isProcessing ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Procesando...
        </>
      ) : (
        <>
          <ShoppingBag className="w-4 h-4 mr-2" />
          Comprar ahora
        </>
      )}
    </Button>
  );
}