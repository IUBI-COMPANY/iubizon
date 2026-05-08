'use client';

import { AuthProvider } from '@/hooks/useAuth';
import { CartProvider } from '@/hooks/useCart';
import { WhatsAppFloatingButton } from '@/components/ui/WhatsAppFloatingButton';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/next';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>
        {children}
        <SpeedInsights />
        <Analytics />
        <WhatsAppFloatingButton />
      </CartProvider>
    </AuthProvider>
  );
}