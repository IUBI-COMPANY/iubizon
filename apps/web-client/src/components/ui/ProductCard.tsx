import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Product } from "@/data-list/products";

interface Props {
  product: Product;
}

export const ProductCard = ({ product }: Props) => {
  const hasDiscount =
    product?.oldPrice && product.oldPrice > (product?.subTotal || 0);

  return (
    <article
      key={product.model}
      className="flex flex-col h-full group rounded-[.7em] bg-white border border-gray-300 overflow-hidden transition-all duration-200 hover:border-orange-400"
    >
      {/* Imagen */}
      <Link href={`/productos/${product.id}`} className="block">
        <div className="relative w-full aspect-square overflow-hidden bg-gray-100">
          {product?.condition && (
            <span className="absolute top-1.5 left-1.5 z-10 bg-orange-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
              {product?.condition}
            </span>
          )}
          {hasDiscount && (
            <span className="absolute top-1.5 right-1.5 z-10 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
              -
              {Math.round(
                ((product.oldPrice! - (product?.subTotal || 0)) /
                  product.oldPrice!) *
                  100,
              )}
              %
            </span>
          )}
          <Image
            src={product?.mainImage || "/product-not-found.png"}
            width={200}
            height={200}
            alt={product?.name || "Producto"}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            sizes="(max-width: 640px) 25vw, (max-width: 1024px) 25vw, 25vw"
          />
        </div>
      </Link>

      {/* Título y Precio */}
      <div className="p-2 flex flex-col">
        <Link href={`/productos/${product.id}`}>
          <h2 className="text-md font-medium text-gray-800 leading-tight line-clamp-2 mb-1 group-hover:text-orange-500 transition-colors">
            {product?.name}
          </h2>
        </Link>

        <div className="mt-auto">
          <div className="flex items-baseline gap-1">
            {hasDiscount && (
              <span className="text-[10px] text-gray-400 line-through">
                S/ {product.oldPrice?.toFixed(0)}
              </span>
            )}
            <span className="text-sm font-bold text-gray-900">
              S/ {product.subTotal?.toFixed(0)}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
};
