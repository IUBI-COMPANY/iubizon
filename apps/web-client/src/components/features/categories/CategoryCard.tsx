'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import type { Category } from '@/types';

interface CategoryCardProps {
  category: Category;
  productCount?: number;
}

export const CategoryCard = ({ category, productCount }: CategoryCardProps) => {
  return (
    <Link href={`/categories/${category.slug}`}>
      <Card className="flex flex-col items-center justify-center p-4 hover:border-[#f25c05] hover:shadow-md transition-all cursor-pointer">
        <div className="text-4xl mb-2">
          {category.icon || '📁'}
        </div>
        <h3 className="text-sm font-medium text-[#112237] text-center">
          {category.name}
        </h3>
        {productCount !== undefined && (
          <p className="text-xs text-[#64748b] mt-1">
            {productCount} productos
          </p>
        )}
      </Card>
    </Link>
  );
};