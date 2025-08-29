import React from "react";
import { Info, XCircle } from "lucide-react";
import { Product } from "@/data-list/products";

interface Props {
  product: Product;
  showModal: boolean;
  setShowModal: (showModal: boolean) => void;
}

export const InformationAndPriceCard = ({
  product,
  showModal,
  setShowModal,
}: Props) => {
  const options = [
    product?.brand,
    product?.model,
    product?.imageBrightness,
    product?.contrastRatio,
    product?.nativeResolution,
    product?.aspectRatio,
    product?.throwRatio,
  ].filter(Boolean);

  return (
    <section className="w-full">
      <div className="product-price-card bg-white/40 rounded-3xl p-0 md:p-5 border-0 md:border-1 md:border-secondary shadow-none md:shadow-md">
        <h1 className="text-4xl font-bold text-left mb-8 text-secondary">
          {product.name || product.model}
        </h1>
        {options.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-8">
            {options.map((opt, idx) => (
              <span
                key={idx}
                className={`px-4 py-[.3em] rounded-full font-semibold text-[.8em] shadow-sm focus:outline-none ${
                  idx === 0
                    ? "bg-secondary text-white"
                    : "bg-white/90 text-secondary border border-secondary/40"
                }`}
              >
                {opt}
              </span>
            ))}
          </div>
        )}
        {product?.price && (
          <div className="w-full h-auto my-7">
            <div className="flex flex-wrap gap-7 mb-3">
              <div className="flex items-center justify-start gap-1">
                <p className="text-base font-bold text-primary flex justify-center items-start gap-1">
                  <span className="text-[1em]">S/</span>
                  <span className="text-3xl">{product.price}</span>
                </p>
                <span className="text-secondary text-lg font-light ml-1">
                  c/u
                </span>
              </div>
              {product?.badge && (
                <div
                  className="w-auto py-1 px-3 bg-amber-400/60 text-secondary text-[.8em] font-bold rounded-2xl my-3 text-center"
                  style={{
                    animation: "scalePulse 1.5s ease-in-out infinite",
                  }}
                >
                  <span>{product.badge}</span>
                </div>
              )}
            </div>
            {product?.sub && (
              <div className="mb-7">
                <span className="text-sm font-semibold text-secondary">
                  {product.sub}
                </span>
              </div>
            )}
          </div>
        )}
        <ul className="mb-7 space-y-4 list-style-none">
          {product?.units && (
            <li className="my-3">
              <span className="text-sm text-secondary/90">
                <p className="mt-1 text-sm text-secondary/70">
                  Cantidad: {product.units}{" "}
                  {product.units === 1 ? "unidad" : "unidades"}
                  {product?.oldStock && (
                    <>
                      {" "}
                      /{" "}
                      <span className="line-through text-gray-400 mr-2">
                        {product?.oldStock}
                      </span>
                    </>
                  )}
                </p>
              </span>
            </li>
          )}
          {product?.condition && (
            <li className="flex items-start">
              <span className="mt-1 text-xl text-primary"></span>
              <span className="text-sm inline-flex items-center gap-4 text-font">
                Condición:
                <strong
                  className="inline-flex items-center gap-1 cursor-pointer"
                  onClick={() => setShowModal(true)}
                >
                  De exhibición <Info className="w-4" />
                </strong>
              </span>
              <div
                className={`fixed inset-0 z-40 flex items-center justify-center bg-black/40 transition-opacity duration-300 ${
                  showModal ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
                onClick={() => setShowModal(false)}
              >
                <div
                  className="relative z-40 bg-white rounded-lg shadow-lg p-8 max-w-md w-full transform transition-transform duration-300 scale-100"
                  onClick={(e) => e.stopPropagation()}
                >
                  <XCircle
                    className="absolute bg-gray right-3 top-3 cursor-pointer text-gray-500 hover:text-gray-700"
                    onClick={() => setShowModal(false)}
                  />
                  <h2 className="text-xl font-bold mb-4 text-secondary">
                    Condición del producto
                  </h2>
                  <p className="text-base mb-6 text-font">
                    {product.condition}
                  </p>
                </div>
              </div>
            </li>
          )}
        </ul>
        <a
          href={`https://wa.me/51972300301?text=Hola%20iubizon,%20me%20interesa%20el%20${product.type}%20${product.name}`}
          target="_blank"
          className="rounded-full mt-10 px-8 py-3 text-base text-center md:text-lg font-medium w-full md:w-auto shadow-lg transition bg-primary text-white hover:bg-primary/90 hover:scale-105 duration-300 flex items-center justify-center gap-2"
        >
          Contactar para comprar
        </a>
      </div>
    </section>
  );
};
