import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Product } from "@/data-list/products";

interface Props {
  product: Product;
}

export const InnovadorCard = ({ product }: Props) => {
  return (
    <article className="w-full group rounded-2xl bg-gradient-to-br from-white via-blue-50/30 to-white border-2 border-secondary/20 overflow-hidden transition-all duration-300 hover:border-secondary/40 hover:shadow-xl hover:shadow-secondary/10">
      <Link
        href={`/productos/${product.id}`}
        className="flex flex-col sm:flex-row"
      >
        {/* Imagen */}
        <div className="relative w-full sm:w-[40%] lg:w-[35%] aspect-[4/3] sm:aspect-square overflow-hidden bg-gradient-to-br from-secondary/10 to-white">
          <Image
            src={product?.mainImage || "/product-not-found.png"}
            width={400}
            height={400}
            alt={product?.name || "Producto"}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, 40vw"
          />
        </div>

        {/* Contenido */}
        <div className="flex-1 p-5 sm:p-6 flex flex-col justify-center">
          {/* Marca */}
          {product?.brand && (
            <span className="text-xs font-bold text-secondary uppercase tracking-widest mb-2">
              {product.brand}
            </span>
          )}

          <h2 className="text-lg sm:text-xl font-bold text-gray-900 leading-tight mb-2 group-hover:text-secondary transition-colors">
            {product?.name}
          </h2>

          {product?.description && (
            <p className="text-sm text-gray-600 leading-relaxed mb-3 line-clamp-2">
              {product.description}
            </p>
          )}

          <div className="mt-auto flex items-center justify-between gap-4">
            <div>
              <span className="text-2xl font-black text-gray-900">
                S/ {product.price?.toLocaleString()}
              </span>
            </div>
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-secondary group-hover:text-secondary/80 transition-colors">
              Ver producto
              <svg
                className="w-4 h-4 transition-transform group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
};
