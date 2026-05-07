'use client';

import { Suspense } from 'react';
import { useParams } from 'next/navigation';
import { AuthProvider, useCategory, useProducts, useFavorites, useCategories } from '@/hooks';
import { Navbar } from '@/components/features/layout/Navbar';
import { CategoryNav } from '@/components/features/categories/CategoryNav';
import { Footer } from '@/components/features/layout/Footer';
import { ProductGrid } from '@/components/features/products/ProductGrid';
import { ProductFilters } from '@/components/features/products/ProductFilters';
import { SearchBar } from '@/components/features/products/SearchBar';
import { CategoryCard } from '@/components/features/categories/CategoryCard';
import { Button } from '@/components/ui/Button';
import { Loader2 } from 'lucide-react';
import type { SearchFilters } from '@/types';
import Link from 'next/link';

function CategoryContent() {
  const params = useParams();
  const slug = params.slug as string;
  const { category, isLoading: categoryLoading } = useCategory(slug);
  const { categories: allCategories } = useCategories();
  const { products, isLoading: productsLoading, filters, updateFilters } = useProducts({
    categoryId: category?.id,
  });
  const { favoriteIds, toggleFavorite } = useFavorites();

  const childCategories = allCategories.find(c => c.slug === slug)?.children || [];

  if (categoryLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#f25c05]" />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <CategoryNav />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-[#112237] mb-2">Categoría no encontrada</h2>
            <Link href="/categories">
              <Button>Ver todas las categorías</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <CategoryNav activeSlug={slug} />

      <div className="flex-1 bg-[#f8fafc]">
        <div className="container mx-auto px-4 py-6">
          <nav className="mb-6">
            <Link href="/" className="text-[#64748b] hover:text-[#f25c05]">
              ← Inicio
            </Link>
            <span className="mx-2 text-[#64748b]">/</span>
            <span className="text-[#112237]">{category.name}</span>
          </nav>

          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[#112237] flex items-center gap-3">
              <span className="text-3xl">{category.icon}</span>
              {category.name}
            </h1>
          </div>

          {childCategories.length > 0 && (
            <div className="mb-8">
              <h2 className="text-sm font-medium text-[#64748b] mb-4">Subcategorías</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
                {childCategories.map((child) => (
                  <CategoryCard key={child.id} category={child} />
                ))}
              </div>
            </div>
          )}

          <div className="mb-6">
            <SearchBar
              placeholder={`Buscar en ${category.name}...`}
              onSearch={(q) => updateFilters({ ...filters, query: q })}
            />
          </div>

          {productsLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-[#f25c05]" />
            </div>
          ) : (
            <ProductGrid
              products={products}
              favorites={favoriteIds}
              onToggleFavorite={toggleFavorite}
              showSeller
              emptyMessage={`No hay productos en ${category.name}`}
            />
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}



export default function CategoryPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#f25c05]" />
      </div>
    }>
      <AuthProvider>
        <CategoryContent />
      </AuthProvider>
    </Suspense>
  );
}