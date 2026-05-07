'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { AuthProvider, useCategories } from '@/hooks';
import { Navbar } from '@/components/features/layout/Navbar';
import { CategoryNav } from '@/components/features/categories/CategoryNav';
import { Footer } from '@/components/features/layout/Footer';
import { CategoryCard } from '@/components/features/categories/CategoryCard';
import { Loader2 } from 'lucide-react';

function CategoriesContent() {
  const { categories, isLoading } = useCategories();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#f25c05]" />
      </div>
    );
  }

  const parentCategories = categories.filter((c) => !c.parentId);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <CategoryNav />

      <div className="flex-1 bg-[#f8fafc]">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold text-[#112237] mb-2">Categorías</h1>
          <p className="text-[#64748b] mb-8">
            Explora todas las categorías disponibles en Iubizon
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {parentCategories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function CategoriesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#f25c05]" />
      </div>
    }>
      <AuthProvider>
        <CategoriesContent />
      </AuthProvider>
    </Suspense>
  );
}