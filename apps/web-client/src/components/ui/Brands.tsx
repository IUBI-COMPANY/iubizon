"use client";

import Image from "next/image";
import brandsData from "@/data-list/brands.json";

interface BrandsProps {
  title?: string;
  description?: string;
  columns?: 3 | 5;
  showTitle?: boolean;
  className?: string;
  theme?: "light" | "dark";
}

/**
 * Componente reutilizable para mostrar logos de marcas
 * Filtra y muestra las marcas con las que trabajamos
 */
export default function Brands({
  title = "Marcas con las que Trabajamos",
  description,
  columns = 5,
  showTitle = true,
  className = "",
  theme = "dark",
}: BrandsProps) {
  const gridClass = columns === 3 ? "md:grid-cols-3" : "md:grid-cols-5";
  const isDark = theme === "dark";

  return (
    <div className={className}>
      {showTitle && (
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6 border border-primary/20">
            <span className="text-sm font-semibold text-primary uppercase tracking-wide">
              Nuestros Partners
            </span>
          </div>
          <h2 className={`text-3xl md:text-4xl font-bold mb-4 font-sfpro ${isDark ? "text-white" : "text-gray-900"}`}>
            {title}
          </h2>
          {description && (
            <p className={`max-w-2xl mx-auto font-sfpro ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              {description}
            </p>
          )}
        </div>
      )}

      <div className={`rounded-3xl p-12 max-w-6xl mx-auto ${isDark ? "bg-gradient-to-br from-white/[0.07] to-white/[0.02] border border-white/10 backdrop-blur-sm" : "bg-white border border-gray-200 shadow-lg"}`}>
        <div
          className={`grid grid-cols-2 ${gridClass} gap-12 items-center justify-items-center`}
        >
          {brandsData.map((brand, idx) => (
            <div
              key={idx}
              className="flex items-center justify-center transition-all duration-300 w-full group"
            >
              <Image
                src={brand.logo}
                alt={brand.alt}
                width={140}
                height={70}
                className={`object-contain max-h-20 w-auto transition-opacity duration-300 ${isDark ? "brightness-0 invert opacity-70 group-hover:opacity-100" : "opacity-100 hover:opacity-80"}`}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}