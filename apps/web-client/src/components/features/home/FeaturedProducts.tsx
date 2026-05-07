'use client';

import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { ProductGrid } from '@/components/features/products';
import { useProducts, useFavorites } from '@/hooks';
import type { Product } from '@/types';

interface FeaturedProductsProps {
  title?: string;
  subtitle?: string;
}

export const FeaturedProducts = ({
  title = 'Últimos productos publicados',
  subtitle,
}: FeaturedProductsProps) => {
  const { products, isLoading, error } = useProducts({ sortBy: 'newest' });
  const { favoriteIds, toggleFavorite } = useFavorites();

  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-[#112237]">{title}</h2>
            {subtitle && (
              <p className="text-sm text-[#64748b] mt-1">{subtitle}</p>
            )}
          </div>
          <Link
            href="/products"
            className="flex items-center gap-1 text-[#f25c05] font-medium hover:underline"
          >
            Ver todos
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="animate-pulse bg-[#f8fafc] rounded-xl aspect-square"
              />
            ))}
          </div>
        ) : (
          <ProductGrid
            products={products.slice(0, 10)}
            favorites={favoriteIds}
            onToggleFavorite={toggleFavorite}
          />
        )}
      </div>
    </section>
  );
};