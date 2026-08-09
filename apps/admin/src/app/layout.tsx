import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "iubizon Admin",
  description: "Panel de administración de iubizon",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
