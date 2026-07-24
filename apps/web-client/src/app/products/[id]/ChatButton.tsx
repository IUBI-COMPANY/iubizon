'use client';

import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ChatButtonProps {
  sellerId: string;
  productId: string;
  productTitle: string;
}

export function ChatButton({ productId, productTitle }: ChatButtonProps) {
  const handleChat = () => {
    const text = encodeURIComponent(
      `Hola! Me interesa tu producto publicado en iubizon: "${productTitle}" (https://iubizon.com/products/${productId})`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <Button
      className="w-full"
      size="lg"
      variant="outline"
      onClick={handleChat}
    >
      <MessageCircle className="w-4 h-4 mr-2" />
      Chatear con vendedor
    </Button>
  );
}