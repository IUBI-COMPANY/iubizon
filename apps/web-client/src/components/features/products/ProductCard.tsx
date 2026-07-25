"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, MapPin } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { cn, formatPrice, formatRelativeTime } from "@/lib/utils";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
  isFavorite?: boolean;
  onToggleFavorite?: (productId: string) => void;
  showSeller?: boolean;
}

export const ProductCard = ({
  product,
  isFavorite = false,
  onToggleFavorite,
  showSeller = false,
}: ProductCardProps) => {
  const sortedImages = [...(product.images || [])].sort(
    (a, b) => (a.position ?? 0) - (b.position ?? 0),
  );
  const mainImage = sortedImages[0]?.url;
  const hasMultipleImages = sortedImages.length > 1;

  return (
    <Link href={`/products/${product.id}`}>
      <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300">
        <div className="relative aspect-square overflow-hidden bg-[#f8fafc]">
          {mainImage ? (
            <Image
              src={mainImage}
              alt={product.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-[#94a3b8]">
              <span className="text-4xl">📦</span>
            </div>
          )}

          {product.is_bundle && (
            <Badge variant="default" className="absolute top-2 left-2">
              LOTE
            </Badge>
          )}

          {product.condition === "new" && (
            <Badge variant="success" className="absolute top-2 right-2">
              NUEVO
            </Badge>
          )}

          {hasMultipleImages && (
            <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-md">
              +{sortedImages.length - 1}
            </div>
          )}

          <button
            onClick={(e) => {
              e.preventDefault();
              onToggleFavorite?.(product.id);
            }}
            className={cn(
              "absolute top-2 right-2 p-2 rounded-full transition-all",
              "bg-white/90 hover:bg-white",
              isFavorite
                ? "text-[#ef4444]"
                : "text-[#64748b] hover:text-[#ef4444]",
            )}
          >
            <Heart className={cn("w-4 h-4", isFavorite && "fill-current")} />
          </button>
        </div>

        <div className="p-3">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-medium text-sm text-[#112237] line-clamp-2">
              {product.title}
            </h3>
          </div>

          <p className="text-lg font-bold text-[#f25c05] mb-2">
            {formatPrice(product.price)}
          </p>

          <div className="flex items-center gap-2 text-xs text-[#64748b]">
            <MapPin className="w-3 h-3" />
            <span>{product.seller?.name || "Lima"}</span>
            <span className="mx-1">•</span>
            <span>{formatRelativeTime(product.created_at)}</span>
          </div>

          {showSeller && product.seller && (
            <div className="mt-3 pt-3 border-t border-[#e2e8f0] flex items-center gap-2">
              <Avatar
                src={product.seller.avatar_url}
                alt={product.seller.name || "Vendedor"}
                size="sm"
                showProBadge={!!product.seller.is_pro}
              />
              <span className="text-xs text-[#64748b]">
                {product.seller.name}
              </span>
              {(product.seller.rating || 0) > 0 && (
                <span className="text-xs text-[#f59e0b]">
                  ★ {Number(product.seller.rating || 0).toFixed(1)}
                </span>
              )}
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
};
