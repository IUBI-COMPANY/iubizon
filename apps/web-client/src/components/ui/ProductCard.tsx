import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Product } from "@/data-list/products";
import { twMerge } from "tailwind-merge";

interface Props {
  product: Product;
}

export const ProductCard = ({ product }: Props) => {
  const isNew = product?.condition === "new";
  const isClearance = product?.classification === "clearance";
  const isByCampaign = product?.campaign;

  // Generate descriptive alt text for product card image
  const getProductImageAlt = () => {
    const productName = product?.name || "Proyector";
    const brand = product?.brand || "";
    const lumensANSI = product?.lumensANSI || "";
    const condition = isNew ? "Nuevo" : "Reacondicionado";

    return `${productName} ${brand} ${lumensANSI} - Proyector ${condition} en Lima, Perú`;
  };

  return (
    <article
      key={product.model}
      className={twMerge(
        "keen-slider__slide flex flex-col h-full group rounded-3xl p-5 bg-white relative overflow-hidden transition-all duration-300",
        // Productos reacondicionados - Borde secondary (prioridad)
        isClearance
          ? "border-[2px] border-[#d90429] shadow-lg hover:shadow-xl hover:shadow-red-500/20"
          : !isNew
            ? "border-[1px] border-[#99a1af] shadow-lg hover:shadow-xl hover:shadow-secondary/20"
            : // Productos NUEVOS en campaña - Borde azul oscuro (secondary)
              isByCampaign
              ? "border-[1px] border-secondary shadow-lg hover:shadow-xl hover:shadow-secondary/20"
              : // Productos nuevos normales - Borde gris
                "border border-gray-300/50 shadow-sm hover:shadow-md",
      )}
    >
      <div className="mb-3 relative z-10">
        <div className="relative w-full h-48 rounded-xl overflow-hidden bg-white group-hover:scale-[1.02] transition-transform duration-300">
          {/* Badge de condición */}
          {product?.condition && (
            <span
              className={twMerge(
                "rounded-full px-2.5 py-1 text-xs font-semibold absolute top-1 left-1 shadow-md transition-transform duration-300",
                isNew ? "bg-primary text-white" : "bg-secondary/70 text-white",
              )}
            >
              {isClearance ? "De Remate" : isNew ? "Premium" : "Exhibición"}
            </span>
          )}
          {/* Badge Oferta - para productos en campaña con color azul oscuro */}
          {isByCampaign && (
            <span className="rounded-full px-3 py-1 text-xs font-bold bg-secondary text-white absolute top-1 right-1 shadow-lg flex items-center gap-1 border-2 border-white uppercase tracking-wide">
              <span>Oferta del Verano</span>
            </span>
          )}
          <Image
            src={product?.mainImage || "product-not-found.png"}
            width={300}
            height={300}
            alt={getProductImageAlt()}
            className="w-full h-full object-cover transition-transform duration-300"
          />
        </div>
      </div>
      {/* Título del producto */}
      <div className="flex flex-wrap gap-2 item-center relative z-10">
        <Link href={`/productos/${product.id}`}>
          <h2 className="text-xl font-semibold text-gray-800 transition-colors duration-300 group-hover:text-[#2d5f3f]">
            {product?.name}
          </h2>
        </Link>
      </div>

      {/* Badges de características */}
      <div className="my-2 flex flex-wrap gap-2 justify-start items-center relative z-10">
        {product?.brand && (
          <span className="px-3 py-[.4em] rounded-full font-semibold text-[.6em] shadow-sm focus:outline-none bg-white/90 text-secondary border border-secondary/40">
            {product.brand}
          </span>
        )}
        {product?.lumensANSI && (
          <span className="px-3 py-[.4em] rounded-full font-semibold text-[.6em] shadow-sm focus:outline-none bg-white/90 text-secondary border border-secondary/40">
            {product.lumensANSI} Lúmenes ANSI
          </span>
        )}
        {product?.throwRatio && (
          <span className="px-3 py-[.4em] rounded-full font-semibold text-[.6em] shadow-sm focus:outline-none bg-white/90 text-secondary border border-secondary/40">
            {product.throwRatio}
          </span>
        )}
      </div>
      {/* Stock */}
      <p className="mt-1 text-sm text-secondary/70 relative z-10">
        Cantidad: {product.stock} {product.stock === 1 ? "unidad" : "unidades"}
        {product?.oldStock && (
          <>
            {" / "}
            <span className="line-through text-gray-400 mr-2">
              {product?.oldStock}
            </span>
          </>
        )}
      </p>

      {/* Disponibilidad */}
      {product.stock <= 0 ? (
        <p className="mt-1 text-xs text-red-600 relative z-10">
          Lo sentimos ya no queda stock, pero{" "}
          <span className="font-semibold cursor-pointer">
            puede comprarlo a pedido
          </span>
        </p>
      ) : (
        <p className="mt-1 text-xs font-medium text-green-600 relative z-10 transition-all duration-300 group-hover:text-[#2d5f3f] group-hover:font-semibold">
          Disponible puedes comprarlo ahora mismo
        </p>
      )}
      {/* Precio */}
      <div className="rounded-xl py-4 px-4 my-3 text-center relative z-10 transition-all duration-300 bg-gradient-to-br from-gray-50 to-white border-2 border-primary/20 shadow-sm group-hover:shadow-md group-hover:border-primary/40">
        <div className="flex items-end justify-center gap-3">
          <p className="text-base font-extrabold text-primary flex justify-center items-start gap-1 transition-transform duration-300 group-hover:scale-110">
            <span className="text-[.8em] font-bold">S/</span>
            <span className="text-3xl">{product?.subTotal}</span>
          </p>
          {product?.oldPrice && (
            <p className="text-sm font-normal text-gray-400 flex justify-center items-start gap-0.5 line-through">
              <span className="text-[.65em]">S/</span>
              <span className="text-base">{product.oldPrice}</span>
            </p>
          )}
          <span className="text-sm font-medium text-secondary ml-1">c/u</span>
        </div>
        {product?.sub && (
          <p className="text-xs text-secondary/80 mt-1 font-medium">
            {product.sub}
          </p>
        )}
        {isByCampaign && product?.oldPrice && (
          <div className="mt-2 text-secondary text-xs font-bold uppercase tracking-wide bg-secondary/10 py-1 px-3 rounded-full inline-block">
            Ahorra S/ {(product.oldPrice - product.price).toFixed(2)}
          </div>
        )}
      </div>
      {/* Características con checkmarks */}
      <div className="flex items-center mt-3 text-sm text-gray-600 mb-1 relative z-10">
        <svg
          className="w-5 h-5 text-[#2d5f3f] mr-2"
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
      {!isNew && (
        <div className="flex items-center text-sm text-gray-600 mb-1 relative z-10">
          <svg
            className="w-5 h-5 text-[#2d5f3f] mr-2"
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
      )}
      <div className="flex items-center text-sm text-gray-600 mb-1 relative z-10">
        <svg
          className="w-5 h-5 text-[#2d5f3f] mr-2"
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
        Garantía de {product?.condition === "new" ? "12 meses" : "6 meses"}
      </div>
      {/* Botones */}
      <div className="w-full mt-3 relative z-10">
        <Link
          href={`/productos/${product.id}`}
          className="block w-full rounded-full px-6 py-2.5 text-center text-sm font-bold shadow-md transition-all duration-300 uppercase tracking-wide bg-secondary text-white hover:shadow-lg hover:scale-105"
        >
          {product.stock <= 0 ? "Comprar a pedido" : "Comprar ahora"}
        </Link>
      </div>
    </article>
  );
};
