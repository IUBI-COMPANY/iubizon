'use client';

import { AuthProvider } from '@/hooks/useAuth';
import { WhatsAppFloatingButton } from '@/components/ui/WhatsAppFloatingButton';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/next';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <SpeedInsights />
      <Analytics />
      <WhatsAppFloatingButton />
    </AuthProvider>
  );
}