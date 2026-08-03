'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Heart, ShoppingCart } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { useFavoritesContext } from '@/hooks/useFavoritesContext';
import { useCart } from '@/hooks/useCart';
import { AddToCartModal } from '@/components/features/cart/AddToCartModal';
import { formatPrice, formatRelativeTime, cn } from '@/lib/utils';
import type { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  showSeller?: boolean;
  priority?: boolean;
}

const conditionLabels: Record<string, string> = {
  new: 'Nuevo',
  like_new: 'Como nuevo',
  good: 'Buen estado',
  fair: 'Aceptable',
};

export const ProductCard = ({ product, showSeller = false, priority = false }: ProductCardProps) => {
  const router = useRouter();
  const { isFavorite, toggleFavorite } = useFavoritesContext();
  const { addItem } = useCart();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const favorited = isFavorite(product.id);

  const sortedImages = [...(product.images || [])].sort((a, b) =>
    (a.position ?? 0) - (b.position ?? 0)
  );
  const mainImage = sortedImages[0]?.url;

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleFavorite(product.id);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: product.id,
      title: product.title,
      price: product.price,
      seller_id: product.seller_id,
      images: product.images || [],
    });
    setIsModalOpen(true);
  };

  const handleCompanyClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.company) {
      router.push(`/companies/${product.company.slug || product.company.id}`);
    } else if (product.seller_id) {
      router.push(`/user/profile/${product.seller_id}`);
    }
  };

  return (
    <>
      <Link href={`/products/${product.id}`}>
        <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full">
          <div className="relative aspect-square overflow-hidden bg-[#f8fafc]">
            {mainImage ? (
              <Image
                src={mainImage}
                alt={product.title}
                fill
                priority={priority}
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl">
                <span className="text-[#94a3b8]">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </span>
              </div>
            )}

            {product.condition === 'new' && (
              <Badge variant="success" className="absolute top-2 right-2">
                NUEVO
              </Badge>
            )}

            {/* Botón Favorito */}
            <button
              onClick={handleFavorite}
              className={cn(
                'absolute top-2 left-2 z-10 w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200',
                favorited
                  ? 'bg-white text-red-500 shadow-sm'
                  : 'bg-white/80 backdrop-blur-sm text-gray-500 hover:text-red-500'
              )}
              aria-label={favorited ? 'Quitar de deseos' : 'Agregar a deseos'}
            >
              <Heart
                className={cn(
                  'w-4 h-4 transition-all duration-200',
                  favorited && 'fill-red-500 text-red-500'
                )}
              />
            </button>
          </div>

          <div className="p-3 flex flex-col justify-between flex-1">
            <div>
              <h3 className="font-medium text-[#112237] truncate text-sm">
                {product.title}
              </h3>
              <p className="text-xs text-[#64748b] mt-0.5 font-normal truncate">
                Por{' '}
                <span
                  onClick={handleCompanyClick}
                  className="hover:text-[#f25c05] hover:underline cursor-pointer font-medium transition-colors"
                >
                  {product.company?.name || product.seller?.name || 'Vendedor iubizon'}
                </span>
              </p>
              <p className="text-[#f25c05] font-bold mt-1.5 text-base">
                {formatPrice(product.price)}
              </p>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-[#64748b] capitalize">
                  {conditionLabels[product.condition] || product.condition}
                </span>
                <span className="text-xs text-[#94a3b8]">
                  {formatRelativeTime(product.created_at)}
                </span>
              </div>

              {showSeller && product.seller && (
                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-[#e2e8f0]">
                  <Avatar
                    src={product.seller.avatar_url}
                    alt={product.seller.name || 'Vendedor'}
                    size="sm"
                  />
                  <span className="text-xs text-[#64748b] truncate">
                    {product.seller.name}
                  </span>
                </div>
              )}
            </div>

            {/* Botón "Agregar al Carro" en la parte baja al hacer hover */}
            <div className="mt-3 pt-1 transition-all duration-300 opacity-0 group-hover:opacity-100 transform translate-y-1 group-hover:translate-y-0">
              <button
                onClick={handleAddToCart}
                className="w-full bg-[#112237] hover:bg-[#f25c05] text-white text-xs font-bold py-2.5 px-4 rounded-full shadow-md flex items-center justify-center gap-2 transition-colors"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Agregar al Carro</span>
              </button>
            </div>
          </div>
        </Card>
      </Link>

      <AddToCartModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        addedProduct={{
          id: product.id,
          title: product.title,
          price: product.price,
          imageUrl: mainImage,
          sellerId: product.seller_id,
          quantity: 1,
        }}
      />
    </>
  );
};