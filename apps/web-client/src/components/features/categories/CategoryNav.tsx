'use client';

import Link from 'next/link';
import { useCategories } from '@/hooks/useCategories';
import { cn } from '@/lib/utils';

interface CategoryNavProps {
  activeSlug?: string;
}

const defaultCategories = [
  { name: 'Todas', slug: '', icon: '🏠' },
  { name: 'Electrónica', slug: 'electronica', icon: '📱' },
  { name: 'Proyectores', slug: 'proyectores', icon: '📽️' },
  { name: 'Laptops', slug: 'laptops', icon: '💻' },
  { name: 'Móviles', slug: 'moviles', icon: '📲' },
  { name: 'Consolas', slug: 'consolas', icon: '🎮' },
  { name: 'TV y Audio', slug: 'tv-audio', icon: '📺' },
  { name: 'Hogar', slug: 'hogar', icon: '🏠' },
  { name: 'Herramientas', slug: 'herramientas', icon: '🔧' },
];

export const CategoryNav = ({ activeSlug }: CategoryNavProps) => {
  const { categories, isLoading } = useCategories();

  const displayCategories = categories.length > 0
    ? [
        { name: 'Todas', slug: '', icon: '🏠' },
        ...categories.map((c) => ({
          name: c.name,
          slug: c.slug,
          icon: c.icon || '📁',
        })),
      ]
    : defaultCategories;

  return (
    <div className="bg-white border-b border-[#e2e8f0]">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-2 py-3 overflow-x-auto scrollbar-hide">
          {displayCategories.map((category) => (
            <Link
              key={category.slug || 'all'}
              href={category.slug ? `/categories/${category.slug}` : '/'}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all',
                activeSlug === category.slug
                  ? 'bg-[#f25c05] text-white'
                  : 'bg-[#f8fafc] text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#112237]'
              )}
            >
              <span>{category.icon}</span>
              <span>{category.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};