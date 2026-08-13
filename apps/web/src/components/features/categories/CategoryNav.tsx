"use client";

import { useCategories } from "@/hooks/useCategories";
import { CategoryCarousel } from "./CategoryCarousel";

interface CategoryNavProps {
  activeSlug?: string;
}

const techSlugs = [
  "proyectores",
  "laptops",
  "pantallas-interactivas",
  "moviles",
  "audio",
  "mobiliario",
  "redes",
  "electronica",
  "accesorios",
  "utiles-suministros",
  "otros",
];

export const CategoryNav = ({ activeSlug }: CategoryNavProps) => {
  const { categories } = useCategories();

  const techCategories =
    categories.length > 0
      ? categories
          .filter((c) => techSlugs.includes(c.slug))
          .sort((a, b) => techSlugs.indexOf(a.slug) - techSlugs.indexOf(b.slug))
          .map((c) => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            icon: c.icon,
          }))
      : [];

  if (techCategories.length === 0) return null;

  return (
    <div className="bg-white border-b border-[#e2e8f0]">
      <CategoryCarousel categories={techCategories} activeSlug={activeSlug} />
    </div>
  );
};