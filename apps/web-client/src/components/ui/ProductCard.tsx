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
      className="flex flex-col h-full group rounded-[.7em] bg-white border border-gray-200 overflow-hidden transition-all duration-200 hover:border-orange-400 hover:shadow-lg"
    >
      {/* Imagen */}
      <Link href={`/productos/${product.id}`} className="block">
        <div className="relative w-full aspect-square overflow-hidden bg-gray-100">
          {product?.condition && (
            <span className="absolute top-1.5 left-1.5 z-10 bg-orange-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
              {product?.condition === "new"
                ? "Nuevo"
                : product?.condition === "reconditioned"
                  ? "Como nuevo"
                  : product?.condition}
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

      {/* Título, Marca y Precio */}
      <div className="p-3 flex flex-col">
        {/* Marca */}
        {product?.brand && (
          <span className="text-[10px] font-semibold text-primary uppercase tracking-wider mb-1">
            {product.brand}
          </span>
        )}

        <Link href={`/productos/${product.id}`}>
          <h2 className="text-sm font-medium text-gray-800 leading-tight line-clamp-2 mb-2 group-hover:text-orange-500 transition-colors">
            {product?.name}
          </h2>
        </Link>

        {/* Modelo */}
        {product?.model && (
          <span className="text-[10px] text-gray-500 mb-2">
            Modelo: {product.model}
          </span>
        )}

        <div className="mt-auto pt-2 border-t border-gray-100">
          <div className="flex items-baseline gap-1">
            {hasDiscount && (
              <span className="text-[10px] text-gray-400 line-through">
                S/ {product.oldPrice?.toFixed(0)}
              </span>
            )}
            <span className="text-base font-bold text-gray-900">
              S/ {product.subTotal?.toFixed(0)}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
};
