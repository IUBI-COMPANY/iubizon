'use client';

import Link from 'next/link';
import { Search, MapPin, Filter } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useCategories } from '@/hooks/useCategories';

interface HeroSectionProps {
  onSearch?: (query: string) => void;
}

export const HeroSection = ({ onSearch }: HeroSectionProps) => {
  const { categories } = useCategories();
  const popularCategories = categories.slice(0, 6);

  return (
    <section className="bg-gradient-to-b from-[#f8fafc] to-white py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[#112237] mb-4">
            Encuentra lo que necesitas en Iubizon
          </h1>
          <p className="text-lg text-[#64748b] mb-8">
            Compra y vende productos de segunda mano de forma segura en Perú
          </p>

          <div className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="¿Qué buscas?"
                className="w-full pl-10"
                icon={<Search className="w-5 h-5" />}
              />
            </div>
            <div className="relative w-full sm:w-48">
              <Input
                type="text"
                placeholder="Ubicación"
                className="w-full pl-10"
                icon={<MapPin className="w-5 h-5" />}
              />
            </div>
            <Button size="lg" className="w-full sm:w-auto">
              Buscar
            </Button>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-sm font-medium text-[#64748b] mb-4 text-center">
            Categorías populares
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            {popularCategories.map((category) => (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-[#e2e8f0] rounded-full hover:border-[#f25c05] hover:text-[#f25c05] transition-colors"
              >
                <span>{category.icon || '📁'}</span>
                <span className="text-sm font-medium">{category.name}</span>
              </Link>
            ))}
            <Link
              href="/categories"
              className="flex items-center gap-2 px-4 py-2 bg-white border border-[#e2e8f0] rounded-full hover:border-[#f25c05] hover:text-[#f25c05] transition-colors"
            >
              <span>➕</span>
              <span className="text-sm font-medium">Ver todas</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};