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

      // ── 1. Check if conversation already exists ───────────────────────────
      const { data: existingConvs, error: checkError } = await supabase
        .from('conversations')
        .select('id')
        .eq('buyer_id', user.id)
        .eq('seller_id', sellerId)
        .eq('product_id', productId);

      if (checkError) {
        console.error('[ChatButton] Error checking existing conversation:', checkError);
        // Don't block — try to create anyway
      }

      if (existingConvs && existingConvs.length > 0) {
        // Conversation already exists — navigate to it
        // NOTE: do NOT return early here; let finally run first by setting state before redirect
        setIsSending(false);
        router.push(`/user/dashboard/messages?conversation=${existingConvs[0].id}`);
        return;
      }

      // ── 2. Create new conversation ────────────────────────────────────────
      // NOTE: `status` column does NOT exist in the conversations table — omit it
      const { data: conv, error: convError } = await supabase
        .from('conversations')
        .insert({
          buyer_id: user.id,
          seller_id: sellerId,
          product_id: productId,
        })
        .select('id')
        .single();

      if (convError) {
        console.error('[ChatButton] Error creating conversation:', convError);
        throw new Error(convError.message);
      }

      // ── 3. Send initial message ───────────────────────────────────────────
      const { error: msgError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conv.id,
          sender_id: user.id,
          content: `Hola, me interesa tu producto: "${productTitle}"`,
        });

      if (msgError) {
        // Non-fatal — conversation was created, just navigate even without initial message
        console.warn('[ChatButton] Could not send initial message:', msgError);
      }

      // ── 4. Navigate to messages ───────────────────────────────────────────
      setIsSending(false);
      router.push(`/user/dashboard/messages?conversation=${conv.id}`);
    } catch (err) {
      console.error('[ChatButton] Unexpected error:', err);
      alert('Error al iniciar el chat. Intenta de nuevo.');
      setIsSending(false);
    }
  };

  return (
    <Button
      className="w-full"
      size="lg"
      variant="outline"
      onClick={handleChat}
      disabled={isSending || isLoading}
    >
      <MessageCircle className="w-4 h-4 mr-2" />
      {isSending ? 'Abriendo chat...' : 'Chatear con vendedor'}
    </Button>
  );
}