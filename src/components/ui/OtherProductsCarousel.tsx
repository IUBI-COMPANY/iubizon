import React, { useState } from "react";
import { Product, products as allProducts } from "../../data-list/products";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import { ProductCard } from "@/components/ui/ProductCard";

interface OtherProductsCarouselProps {
  currentProduct: Product;
}

export default function OtherProductsCarousel({
  currentProduct,
}: OtherProductsCarouselProps) {
  const products = allProducts.filter((p) => p.id !== currentProduct.id);
  const [current, setCurrent] = useState(0);
  const [sliderRef, slider] = useKeenSlider<HTMLDivElement>({
    slides: { perView: 3, spacing: 16 },
    loop: true,
    slideChanged(s) {
      setCurrent(s.track.details.rel);
    },
    breakpoints: {
      "(max-width: 900px)": { slides: { perView: 2, spacing: 12 } },
      "(max-width: 600px)": { slides: { perView: 1, spacing: 8 } },
    },
  });

  return (
    <div className="my-6 p-3 rounded-xl w-full max-w-[1370px] mx-auto">
      <h2 className="ml-4 text-[2em] font-semibold mb-2 text-primary">
        Otros productos
      </h2>
      <div className="w-full relative">
        <div ref={sliderRef} className="keen-slider relative">
          {products.map((product, index) => (
            <ProductCard product={product} key={index} />
          ))}
        </div>

        {products.length > 1 && (
          <div className="absolute w-full top-[40%] flex items-center justify-center min-h-[40px]">
            <div className="flex items-center justify-center w-full h-full">
              <button
                onClick={() => slider.current?.prev()}
                className="absolute w-[3em] h-[3em] left-[-1.5em] top-1/2 -translate-y-1/2 text-white rounded-full p-2 shadow bg-[#222f40] hover:bg-[#f25c05] transition z-10 cursor-pointer border-solid border-2 border-primary"
                aria-label="Anterior"
              >
                ◀
              </button>
              <button
                onClick={() => slider.current?.next()}
                className="absolute w-[3em] h-[3em] right-[-1.5em] top-1/2 -translate-y-1/2 text-white rounded-full p-2 shadow bg-[#222f40] hover:bg-[#f25c05] transition z-10 cursor-pointer border-solid border-2 border-primary"
                aria-label="Siguiente"
              >
                ▶
              </button>
            </div>
          </div>
        )}
        {products.length > 1 && (
          <div className="flex gap-2 justify-center mt-2">
            {products.map((_, idx) => (
              <button
                key={idx}
                onClick={() => slider.current?.moveToIdx(idx)}
                className={`w-3 h-3 rounded-full border-2 cursor-pointer ${
                  current === idx
                    ? "border-primary/100 bg-primary/80"
                    : "border-secondary bg-white"
                } transition`}
                aria-label={`Ver producto ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
