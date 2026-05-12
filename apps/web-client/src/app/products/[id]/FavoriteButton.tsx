'use client';

import { useState } from 'react';
import { Heart } from 'lucide-react';
import { useFavoritesContext } from '@/hooks/useFavoritesContext';
import { cn } from '@/lib/utils';

interface FavoriteButtonProps {
  productId: string;
}

export function FavoriteButton({ productId }: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useFavoritesContext();
  const [animating, setAnimating] = useState(false);
  const favorited = isFavorite(productId);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setAnimating(true);
    await toggleFavorite(productId);
    setTimeout(() => setAnimating(false), 300);
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        'p-2 rounded-full transition-all duration-200',
        favorited
          ? 'text-red-500 hover:bg-red-50'
          : 'text-[#64748b] hover:text-red-500 hover:bg-[#f8fafc]'
      )}
      aria-label={favorited ? 'Quitar de deseos' : 'Agregar a deseos'}
    >
      <Heart
        className={cn(
          'w-6 h-6 transition-transform duration-200',
          favorited && 'fill-red-500 text-red-500',
          animating && 'scale-125'
        )}
      />
    </button>
  );
}