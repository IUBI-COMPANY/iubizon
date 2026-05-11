"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface Banner {
  src: string;
  alt: string;
}

interface BannerSliderProps {
  banners: Banner[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

export default function BannerSlider({
  banners,
  autoPlay = true,
  autoPlayInterval = 5000,
}: BannerSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!autoPlay || banners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, banners.length]);

  if (banners.length === 0) return null;

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="relative w-full h-[170px] sm:h-[250px] md:h-[350px] lg:h-[450px]">
      {banners.map((banner, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-500 ${
            index === currentIndex ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src={banner.src}
            alt={banner.alt}
            fill
            className="object-fill"
            priority={index === 0}
            sizes="100vw"
          />
        </div>
      ))}

      {/* Navigation Arrows */}
      {banners.length > 1 && (
        <>
          <button
            onClick={goToPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center bg-white/70 hover:bg-white/90 rounded-full shadow transition"
            aria-label="Imagen anterior"
          >
            <span className="text-xl">‹</span>
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center bg-white/70 hover:bg-white/90 rounded-full shadow transition"
            aria-label="Siguiente imagen"
          >
            <span className="text-xl">›</span>
          </button>
        </>
      )}

      {/* Dots */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex
                  ? "bg-white w-6"
                  : "bg-white/50 hover:bg-white/80"
              }`}
              aria-label={`Ir a imagen ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
