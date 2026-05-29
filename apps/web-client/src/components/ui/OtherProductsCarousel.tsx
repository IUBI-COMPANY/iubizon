import React, { useState, useRef, useEffect } from "react";
import { Product, products as allProducts } from "../../data-list/products";
import { ProductCard } from "@/components/ui/ProductCard";

interface OtherProductsCarouselProps {
  currentProduct: Product;
}

export default function OtherProductsCarousel({
  currentProduct,
}: OtherProductsCarouselProps) {
  const products = allProducts
    .filter((p) => p.id !== currentProduct.id)
    .sort((a, b) => {
      if (a.campaign && !b.campaign) return -1;
      if (!a.campaign && b.campaign) return 1;

      const aIsSameType = a.type === currentProduct.type;
      const bIsSameType = b.type === currentProduct.type;

      if (aIsSameType && !bIsSameType) return -1;
      if (!aIsSameType && bIsSameType) return 1;
      return 0;
    });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(4);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateItemsPerView = () => {
      setItemsPerView(window.innerWidth < 640 ? 2 : 4);
    };
    updateItemsPerView();
    window.addEventListener("resize", updateItemsPerView);
    return () => window.removeEventListener("resize", updateItemsPerView);
  }, []);

  const totalSlides = Math.ceil(products.length / itemsPerView);

  useEffect(() => {
    if (currentIndex >= totalSlides) {
      setCurrentIndex(Math.max(0, totalSlides - 1));
    }
  }, [itemsPerView, currentIndex, totalSlides]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === totalSlides - 1 ? 0 : prev + 1));
  };

  if (products.length === 0) return null;

  return (
    <div className="w-full max-w-[1470px] mx-auto py-8 px-4">
      <h2 className="text-xl font-semibold mb-6 text-gray-900">
        Otros productos
      </h2>
      <div className="relative">
        <div className="overflow-hidden">
          <div
            ref={containerRef}
            className="flex transition-transform duration-300 ease-out"
            style={{
              transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
            }}
          >
            {products.map((product, index) => (
              <div
                key={index}
                className="flex-shrink-0 px-2"
                style={{ width: `${100 / itemsPerView}%` }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>

        {products.length > itemsPerView && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-white border border-gray-200 rounded-full shadow-md hover:border-orange-400 hover:text-orange-500 z-10 transition -translate-x-2"
              aria-label="Anterior"
            >
              <span className="text-xl">‹</span>
            </button>
            <button
              onClick={handleNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-white border border-gray-200 rounded-full shadow-md hover:border-orange-400 hover:text-orange-500 z-10 transition translate-x-2"
              aria-label="Siguiente"
            >
              <span className="text-xl">›</span>
            </button>
          </>
        )}
      </div>

      {totalSlides > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: totalSlides }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-2 h-2 rounded-full transition-all ${
                currentIndex === idx
                  ? "bg-orange-500 w-6"
                  : "bg-gray-300 hover:bg-gray-400"
              }`}
              aria-label={`Ver grupo ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
