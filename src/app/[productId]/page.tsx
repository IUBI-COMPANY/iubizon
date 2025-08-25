"use client";

import React, { useEffect, useState } from "react";
import MediaCarousel from "../../components/ui/MediaCarousel";
import OtherProductsCarousel from "../../components/ui/OtherProductsCarousel";
import Link from "next/link";
import Image from "next/image";
import { products } from "@/data-list/products";
import { Info, XCircle } from "lucide-react";
import { useParams } from "next/navigation";

export default function ProductDetailPage() {
  const { productId } = useParams();
  const [showModal, setShowModal] = useState(false);

  const product = products.find((product) => product.id === productId);

  useEffect(() => {
    document.body.style.overflow = showModal ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showModal]);

  if (!product)
    return (
      <div className="min-h-screen flex flex-col w-full bg-white">
        <h2>404</h2>
      </div>
    );

  const options = [product.model, product.badge].filter(Boolean);

  return (
    <div className="min-h-screen flex flex-col w-full bg-white">
      <header className="relative overflow-hidden bg-gradient-to-r from-secondary/90 via-secondary/100 to-secondary/90">
        <div className="top-header w-full p-4">
          <div className="item-logo flex justify-center">
            <Link href="/">
              <Image
                src="/images/logo.png"
                width={144}
                height={40}
                alt="iubizon logo"
                className="w-[9em] h-auto object-contain m-auto"
              />
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-8 px-4 md:px-12 py-15 w-full">
        <section className="col-span-7 w-full flex justify-center items-center">
          <MediaCarousel product={product} />
        </section>
        <section className="col-span-5 flex flex-col justify-start w-full max-w-xl mx-auto px-8 py-3">
          <h1 className="text-4xl font-bold text-left mb-5 text-secondary">
            {product.name || product.model}
          </h1>
          {options.length > 0 && (
            <div className="flex gap-3 mb-6">
              {options.map((opt, idx) => (
                <span
                  key={idx}
                  className={`px-5 py-2 rounded-full font-semibold text-base shadow-sm focus:outline-none ${
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
          {product.price && (
            <div className="text-left">
              <span className="text-2xl font-semibold text-primary">
                S/ {product.price} c/u
              </span>
            </div>
          )}
          <div className="mb-7">
            <span className="text-sm font-semibold text-secondary">
              {product.sub}
            </span>
          </div>
          <ul className="mb-7 space-y-4 list-style-none">
            {product.description && (
              <li className="flex items-start">
                <span className="mt-1 text-xl text-primary"></span>
                <span className="text-sm inline-flex items-center gap-4 text-gray">
                  Condición:
                  <strong
                    className="inline-flex items-center gap-1 cursor-pointer"
                    onClick={() => setShowModal(true)}
                  >
                    De exhibición <Info className="w-4" />
                  </strong>
                </span>
                <div
                  className={`fixed inset-0 z-50 flex items-center justify-center bg-black/40 transition-opacity duration-300 ${
                    showModal ? "opacity-100" : "opacity-0 pointer-events-none"
                  }`}
                  onClick={() => setShowModal(false)}
                >
                  <div
                    className="relative bg-white rounded-lg shadow-lg p-8 max-w-md w-full transform transition-transform duration-300 scale-100"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <XCircle
                      className="absolute bg-gray right-3 top-3 cursor-pointer text-gray-500 hover:text-gray-700"
                      onClick={() => setShowModal(false)}
                    />
                    <h2 className="text-xl font-bold mb-4">
                      Condición del producto
                    </h2>
                    <p className="text-base mb-6">
                      Este producto es de exhibición y puede tener detalles
                      menores por uso en tienda.
                    </p>
                  </div>
                </div>
              </li>
            )}
          </ul>
          <a
            href={`https://wa.me/51972300301?text=Hola%20iubizon,%20me%20interesa%20el%20modelo%20${product.model}`}
            className="rounded-full px-8 py-3 text-base text-center md:text-lg font-medium w-full md:w-auto shadow-lg transition bg-primary text-white hover:bg-primary/90 hover:scale-105 duration-300 flex items-center justify-center gap-2"
          >
            Contactar para comprar
          </a>
        </section>
      </main>
      <div className="w-full max-w-[1300px] h-auto m-auto py-10">
        <li className="flex gap-2 items-start">
          <span className="text-base md:text-lg">
            <strong className="text-secondary">
              Especificaciones del artículo:
            </strong>{" "}
            <br />
            <p className="pre-line text-base text-black/90">{product.note}</p>
          </span>
        </li>
      </div>
      <div className="w-full max-w-[1300px] h-auto m-auto py-10">
        {product?.note && (
          <li className="flex gap-2 items-start">
            <span className="text-base md:text-lg">
              <strong className="text-secondary">Nota:</strong> <br />
              <p className="pre-line text-base text-black/90">{product.note}</p>
            </span>
          </li>
        )}
      </div>
      <OtherProductsCarousel currentProduct={product} />
    </div>
  );
}
