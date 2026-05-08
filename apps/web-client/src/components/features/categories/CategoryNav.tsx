'use client';

import { useCategories } from '@/hooks/useCategories';
import { CategoryCarousel } from './CategoryCarousel';

interface CategoryNavProps {
  activeSlug?: string;
}

const defaultCategories = [
  { id: '2', name: 'Proyectores', slug: 'proyectores', icon: '📽️' },
  { id: '3', name: 'Laptops', slug: 'laptops', icon: '💻' },
  { id: '4', name: 'Móviles', slug: 'moviles', icon: '📲' },
  { id: '5', name: 'Consolas', slug: 'consolas', icon: '🎮' },
  { id: '6', name: 'TV y Audio', slug: 'tv-audio', icon: '📺' },
  { id: '1', name: 'Electrónica', slug: 'electronica', icon: '📱' },
];

const techSlugs = ['electronica', 'laptops', 'proyectores', 'moviles', 'consolas', 'tv-audio'];

export const CategoryNav = ({ activeSlug }: CategoryNavProps) => {
  const { categories } = useCategories();
  
  const techCategories = categories.length > 0
    ? categories
        .filter((c) => techSlugs.includes(c.slug))
        .map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          icon: c.icon || '📁',
        }))
    : defaultCategories;

  return (
    <div className="bg-white border-b border-[#e2e8f0]">
      <CategoryCarousel categories={techCategories} activeSlug={activeSlug} />
    </div>
  );
};