import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Product } from "@/data-list/products";

interface Props {
  product: Product;
}

export const ProductCard = ({ product }: Props) => {
  return (
    <article
      key={product.model}
      className="keen-slider__slide flex flex-col h-full group rounded-2xl p-5 shadow-sm hover:shadow-md border-solid border-1 border-gray-400/40 bg-white"
    >
      <div className="mb-3">
        <div className="relative w-full h-48 rounded-xl overflow-hidden bg-gray-300">
          {product.badge && (
            <span className="rounded-full px-2.5 py-1 text-xs font-semibold bg-primary text-white absolute top-1 left-1">
              {product.badge}
            </span>
          )}
          <Image
            src={product?.mainImage || "product-not-found.png"}
            width={300}
            height={300}
            alt={`Imagen de ${product.model}`}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Título */}
      <h2 className="text-xl font-semibold text-gray-800">{product.name}</h2>

      {/* Stock */}
      <p className="mt-1 text-sm text-secondary/70">
        Stock: {product.units} {product.units === 1 ? "unidad" : "unidades"}
      </p>

      {/* Precio */}
      <div className="bg-orange-50 rounded-lg py-2 px-4 my-3 text-center">
        <div className="flex items-end justify-center gap-1">
          <p className="text-base font-bold text-primary flex justify-center items-start gap-1">
            <span className="text-[.7em]">S/</span>
            <span className="text-2xl">{product.price}</span>
          </p>
          <span className="text-secondary text-sm font-light ml-1">c/u</span>
        </div>
        {product.sub && (
          <p className="text-xs text-secondary/80">{product.sub}</p>
        )}
      </div>

      {/* Descuento */}
      <div className="flex items-center mt-3 text-sm text-gray-600 mb-1">
        <svg
          className="w-5 h-5 text-green-500 mr-2"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
        Descuento por volumen
      </div>
      <div className="flex items-center text-sm text-gray-600 mb-1">
        <svg
          className="w-5 h-5 text-green-500 mr-2"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
        Prueba de funcionamiento verificada
      </div>

      <div className="mt-3 grid gap-2 grid-cols-[1fr_auto] row-span-1 items-end">
        <a
          href={`https://wa.me/51972300301?text=Hola%20iubizon,%20me%20interesa%20el%20modelo%20${product.model}`}
          className="w-full rounded-xl px-4 py-2 text-center text-sm font-semibold shadow-sm transition bg-secondary text-white"
        >
          Pedir cotización
        </a>
        <Link
          href={`/${product.model}`}
          className="rounded-xl px-4 py-2 text-sm font-semibold text-secondary border-solid border-1 border-tertiary"
        >
          Ver más
        </Link>
      </div>
    </article>
  );
};
