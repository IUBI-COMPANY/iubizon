'use client';

import { Suspense, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthProvider, useAuth, useFavorites } from '@/hooks';
import { Navbar } from '@/components/features/layout/Navbar';
import { CategoryNav } from '@/components/features/categories/CategoryNav';
import { Footer } from '@/components/features/layout/Footer';
import { ProductGrid } from '@/components/features/products/ProductGrid';
import { Button } from '@/components/ui/Button';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

function FavoritesContent() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { favorites, isLoading, toggleFavorite } = useFavorites();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login?redirect=/favorites');
    }
  }, [user, authLoading, router]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#f25c05]" />
      </div>
    );
  }

  if (!user) return null;

  const products = favorites.map((f) => f.product).filter(Boolean);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <CategoryNav />

      <div className="flex-1 bg-[#f8fafc]">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold text-[#112237] mb-2">Mis favoritos</h1>
          <p className="text-[#64748b] mb-8">
            Productos que has guardado para ver después
          </p>

          {products.length > 0 ? (
            <ProductGrid
              products={products as any}
              favorites={favorites.map((f) => f.productId)}
              onToggleFavorite={toggleFavorite}
              showSeller
            />
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">❤️</div>
              <h2 className="text-xl font-semibold text-[#112237] mb-2">
                No tienes favoritos aún
              </h2>
              <p className="text-[#64748b] mb-6">
                Guarda productos que te interesen para verlos después
              </p>
              <Link href="/products">
                <Button>Explorar productos</Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function FavoritesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#f25c05]" />
      </div>
    }>
      <AuthProvider>
        <FavoritesContent />
      </AuthProvider>
    </Suspense>
  );
}