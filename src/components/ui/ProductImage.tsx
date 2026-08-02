"use client";

import Image from "next/image";
import { Package } from "lucide-react";

interface ProductImageProps {
  src?: string | null;
  alt?: string;
  sizeClassName?: string;
  iconSizeClassName?: string;
  roundedClassName?: string;
  className?: string;
}

export function ProductImage({
  src,
  alt = "Producto",
  sizeClassName = "w-12 h-12",
  iconSizeClassName = "w-5 h-5",
  roundedClassName = "rounded-xl",
  className = "",
}: ProductImageProps) {
  return (
    <div
      className={`relative bg-white border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center ${roundedClassName} ${sizeClassName} ${className}`}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          unoptimized
        />
      ) : (
        <Package className={`${iconSizeClassName} text-slate-300`} />
      )}
    </div>
  );
}
