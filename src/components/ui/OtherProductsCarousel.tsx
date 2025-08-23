import React, { useState } from "react";
import { products as allProducts } from "../data-list/products";
import MediaCarouselInCard from "./MediaCarouselInCard";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import { Check } from "lucide-react";
import Link from "next/link";

interface OtherProductsCarouselProps {
  colors: {
    primary: string;
    primary2: string;
    secondary: string;
    tertiary: string;
    text: string;
    gray: string;
    ice?: string;
  };
  currentModel?: string;
}

export default function OtherProductsCarousel({
  colors,
  currentModel,
}: OtherProductsCarouselProps) {
  const products = allProducts.filter((p) => p.model !== currentModel);
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
      <h2 className="ml-4 text-[2em] font-semibold mb-2">Otros productos</h2>
      <div className="w-full relative">
        <div ref={sliderRef} className="keen-slider relative">
          {products.map((it, idx) => (
            <article
              key={it.model}
              className="keen-slider__slide flex flex-col h-full group rounded-2xl border p-5 shadow-sm hover:shadow-md"
              style={{ borderColor: colors.gray, background: "#fff" }}
            >
              <div className="flex items-start justify-between">
                <h3
                  className="text-lg font-semibold mb-2"
                  style={{ color: colors.secondary }}
                >
                  {it.model}
                </h3>
                {it.badge && (
                  <span
                    className="rounded-full px-2.5 py-1 text-xs font-semibold"
                    style={{ background: colors.primary, color: "#fff" }}
                  >
                    {it.badge}
                  </span>
                )}
              </div>

              <div className="mb-3">
                <div className="relative w-full h-48 rounded-xl overflow-hidden bg-gray-100">
                  <img
                    src={`./${it?.mainImage || "product-not-found.png"}`}
                    alt={`Imagen de ${it.model}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <p className="mt-1 text-sm" style={{ color: colors.tertiary }}>
                Stock: {it.units} {it.units === 1 ? "unidad" : "unidades"}
              </p>

              <div
                className="mt-3 rounded-xl p-3"
                style={{ background: colors.ice }}
              >
                <p className="text-sm" style={{ color: colors.tertiary }}>
                  {it.note}
                </p>
                <p
                  className="mt-1 text-base font-bold"
                  style={{ color: colors.primary }}
                >
                  {it.price}
                </p>
                {it.sub && (
                  <p className="text-xs" style={{ color: colors.tertiary }}>
                    {it.sub}
                  </p>
                )}
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span
                  className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs"
                  style={{ background: colors.ice, color: colors.secondary }}
                >
                  <Check className="h-3.5 w-3.5" /> Descuento por volumen
                </span>
              </div>

              <div className="mt-5 grid gap-2 grid-cols-[1fr_auto] row-span-1 items-end">
                <a
                  href={`https://wa.me/51972300301?text=Hola%20iubizon,%20me%20interesa%20el%20modelo%20${it.model}`}
                  className="w-full rounded-xl px-4 py-2 text-center text-sm font-semibold shadow-sm transition"
                  style={{ background: colors.secondary, color: "#fff" }}
                >
                  Pedir cotización
                </a>
                <Link
                  href={`/${it.model}`}
                  className="rounded-xl px-4 py-2 text-sm font-semibold"
                  style={{
                    border: `1px solid ${colors.gray}`,
                    color: colors.secondary,
                  }}
                >
                  Ver más
                </Link>
              </div>
            </article>
          ))}
        </div>
        {products.length > 1 && (
          <div
            className="absolute top-[47%] w-full flex items-center justify-center"
            style={{ minHeight: 40 }}
          >
            <div className="flex items-center justify-center w-full h-full">
              <button
                onClick={() => slider.current?.prev()}
                className="absolute w-[3em] h-[3em] left-4 top-1/2 -translate-y-1/2 text-white rounded-full p-2 shadow bg-[#222f40] hover:bg-[#f25c05] transition z-10 cursor-pointer"
                aria-label="Anterior"
                style={{ border: `2px solid ${colors.primary}` }}
              >
                ◀
              </button>
              <button
                onClick={() => slider.current?.next()}
                className="absolute w-[3em] h-[3em] right-4 top-1/2 -translate-y-1/2 text-white rounded-full p-2 shadow bg-[#222f40] hover:bg-[#f25c05] transition z-10 cursor-pointer"
                aria-label="Siguiente"
                style={{ border: `2px solid ${colors.primary}` }}
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
                    ? "border-[#f25c05] bg-[#f25c05]"
                    : "border-gray-800 bg-white"
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
