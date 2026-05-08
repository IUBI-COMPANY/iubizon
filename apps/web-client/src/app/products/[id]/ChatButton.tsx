'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';

interface ChatButtonProps {
  sellerId: string;
  productId: string;
  productTitle: string;
}

export function ChatButton({ sellerId, productId, productTitle }: ChatButtonProps) {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [isSending, setIsSending] = useState(false);

  const handleChat = async () => {
    if (isLoading) return;

    if (!user) {
      router.push('/auth/login?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }

    if (user.id === sellerId) {
      alert('No puedes chatear contigo mismo');
      return;
    }

    setIsSending(true);

    try {
      const supabase = createClient();

      // Check if conversation already exists
      const { data: existingConv } = await supabase
        .from('conversations')
        .select('id')
        .eq('buyer_id', user.id)
        .eq('seller_id', sellerId)
        .eq('product_id', productId);

      if (existingConv && existingConv.length > 0) {
        router.push(`/user/dashboard/messages?conversation=${existingConv[0].id}`);
        return;
      }

      // Create new conversation
      const { data: conv, error } = await supabase
        .from('conversations')
        .insert({
          buyer_id: user.id,
          seller_id: sellerId,
          product_id: productId,
          status: 'active'
        })
        .select()
        .single();

      if (error) throw error;

      // Send initial message
      await supabase
        .from('messages')
        .insert({
          conversation_id: conv.id,
          sender_id: user.id,
          content: `Hola, me interesa tu producto: "${productTitle}"`,
        });

      router.push(`/user/dashboard/messages?conversation=${conv.id}`);
    } catch (error) {
      console.error('Error starting chat:', error);
      alert('Error al iniciar el chat. Intenta de nuevo.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Button 
      className="w-full" 
      size="lg" 
      onClick={handleChat}
      disabled={isSending}
    >
      <MessageCircle className="w-4 h-4" />
      {isSending ? 'Abriendo chat...' : 'Chatear con vendedor'}
    </Button>
  );
}