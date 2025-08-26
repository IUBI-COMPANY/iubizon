"use client";

import React, { useEffect, useState } from "react";
import MediaCarousel from "../../components/ui/MediaCarousel";
import OtherProductsCarousel from "../../components/ui/OtherProductsCarousel";
import Link from "next/link";
import Image from "next/image";
import { products } from "@/data-list/products";
import { ChevronRight, Info, XCircle } from "lucide-react";
import { useParams } from "next/navigation";
import { NoFoundComponent } from "@/components/ui/NoFoundComponent";

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
    <>
      <style>
        {`
      @keyframes scalePulse {
        0%, 100% {
          transform: scale(1);
        }
        50% {
          transform: scale(1.05);
        }
      }
    `}
      </style>
      <div className="min-h-screen h-auto flex flex-col w-full bg-white">
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
        {!product ? (
          <NoFoundComponent />
        ) : (
          <div className="content-wrapper px-7 max-w-[1470px] m-auto w-full">
            <main className="grid grid-cols-12 py-15 w-full relative">
              <section className="col-span-12 lg:col-span-8 w-full flex justify-center items-center">
                <div className="w-full">
                  {/*Product media*/}
                  <MediaCarousel product={product} />
                  {/*Product specifications*/}
                  <div className="w-full h-auto m-auto py-10">
                    <div className="text-2xl mb-5 text-secondary font-bold">
                      Especificaciones del producto:
                    </div>
                    <div className="product-characteristics w-full grid grid-cols-1 lg:grid-cols-[1fr_40%] gap-x-15 gap-y-4">
                      <div className="w-full flex flex-col gap-2 text-font font-mediun text-[.9em] ">
                        {product?.condition && (
                          <div className=" grid grid-cols-1 md:grid-cols-[14em_1fr]">
                            <div>Condición:</div>{" "}
                            <div className="text-secondary">
                              <strong
                                className="inline-flex items-center gap-1 cursor-pointer"
                                onClick={() => setShowModal(true)}
                              >
                                De exhibición <Info className="w-4" />
                              </strong>
                            </div>
                          </div>
                        )}
                        {product?.displayTechnology && (
                          <div className="grid grid-cols-1 md:grid-cols-[14em_1fr]">
                            <div className="pr-4">
                              Tecnología de visualización:
                            </div>{" "}
                            <div className="text-secondary">
                              {product.displayTechnology}
                            </div>
                          </div>
                        )}
                        {product?.aspectRatio && (
                          <div className="grid grid-cols-1 md:grid-cols-[14em_1fr]">
                            <div className="pr-4">Relación de aspecto:</div>{" "}
                            <div className="text-secondary">
                              {product.aspectRatio}
                            </div>
                          </div>
                        )}
                        {product?.brand && (
                          <div className="grid grid-cols-1 md:grid-cols-[14em_1fr]">
                            <div className="pr-4">Marca:</div>{" "}
                            <div className="text-secondary">
                              {product.brand}
                            </div>
                          </div>
                        )}
                        {product?.type && (
                          <div className="grid grid-cols-1 md:grid-cols-[14em_1fr]">
                            <div className="pr-4">Tipo:</div>{" "}
                            <div className="text-secondary">{product.type}</div>
                          </div>
                        )}
                        {product?.contrastRatio && (
                          <div className="grid grid-cols-1 md:grid-cols-[14em_1fr]">
                            <div className="pr-4">Relación de contraste:</div>{" "}
                            <div className="text-secondary">
                              {product.contrastRatio}
                            </div>
                          </div>
                        )}
                        {product?.connectivity && (
                          <div className="grid grid-cols-1 md:grid-cols-[14em_1fr]">
                            <div className="pr-4">Conectividad:</div>{" "}
                            <div className="text-secondary">
                              {product.connectivity}
                            </div>
                          </div>
                        )}
                        {product?.features && (
                          <div className="grid grid-cols-1 md:grid-cols-[14em_1fr]">
                            <div className="pr-4">Características:</div>{" "}
                            <div className="text-secondary">
                              {product.features}
                            </div>
                          </div>
                        )}
                        {product?.throwRatio && (
                          <div className="grid grid-cols-1 md:grid-cols-[14em_1fr]">
                            <div className="pr-4">Relación de proyección:</div>{" "}
                            <div className="text-secondary">
                              {product.throwRatio}
                            </div>
                          </div>
                        )}
                        {product?.category && (
                          <div className="grid grid-cols-1 md:grid-cols-[14em_1fr]">
                            <div className="pr-4">Categoría:</div>{" "}
                            <div className="text-secondary flex flex-wrap">
                              {(product?.category || []).map(
                                (category, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center gap-1 m-0"
                                  >
                                    {index !== 0 && (
                                      <ChevronRight className="h-[1em]" />
                                    )}
                                    <span>{category}</span>
                                  </div>
                                ),
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="w-full flex flex-col gap-2 text-font font-mediun text-[.9em]">
                        <div className="grid grid-cols-1 md:grid-cols-[11em_1fr]">
                          <div className="pr-4">Advertencia:</div>{" "}
                          <div className="text-secondary">
                            Las lámparas del proyector contienen mercurio.
                          </div>
                        </div>
                        {product?.imageBrightness && (
                          <div className="grid grid-cols-1 md:grid-cols-[11em_1fr]">
                            <div className="pr-4">Brillo de la imagen :</div>{" "}
                            <div className="text-secondary">
                              {product.imageBrightness}
                            </div>
                          </div>
                        )}
                        {product?.aspectRatio && (
                          <div className="grid grid-cols-1 md:grid-cols-[11em_1fr]">
                            <div className="pr-4">Relación de aspecto:</div>{" "}
                            <div className="text-secondary">
                              {product.aspectRatio}
                            </div>
                          </div>
                        )}

                        {product?.model && (
                          <div className="grid grid-cols-1 md:grid-cols-[11em_1fr]">
                            <div className="pr-4">Modelo:</div>{" "}
                            <div className="text-secondary">
                              {product.model}
                            </div>
                          </div>
                        )}
                        {product?.nativeResolution && (
                          <div className="grid grid-cols-1 md:grid-cols-[11em_1fr]">
                            <div className="pr-4">Resolución nativa:</div>{" "}
                            <div className="text-secondary">
                              {product.nativeResolution}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </section>
              {/*Product information and price*/}
              <section className="col-span-12 lg:col-span-4 w-full mx-auto px-0 lg:px-10 py-13 md:py-2 md:sticky top-0 self-start">
                <h1 className="text-4xl font-bold text-left mb-8 text-secondary">
                  {product.name || product.model}
                </h1>
                {options.length > 0 && (
                  <div className="flex flex-wrap gap-3 mb-8">
                    {options.map((opt, idx) => (
                      <span
                        key={idx}
                        className={`px-5 py-2 rounded-full font-semibold text-[.8em] shadow-sm focus:outline-none ${
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
                    <div className="flex flex-wrap gap-7">
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
                        className={`fixed inset-0 z-50 flex items-center justify-center bg-black/40 transition-opacity duration-300 ${
                          showModal
                            ? "opacity-100"
                            : "opacity-0 pointer-events-none"
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
                  href={`https://wa.me/51972300301?text=Hola%20iubizon,%20me%20interesa%20el%20modelo%20${product.model}`}
                  className="rounded-full mt-10 px-8 py-3 text-base text-center md:text-lg font-medium w-full md:w-auto shadow-lg transition bg-primary text-white hover:bg-primary/90 hover:scale-105 duration-300 flex items-center justify-center gap-2"
                >
                  Contactar para comprar
                </a>
              </section>
            </main>
            {product?.note && (
              <div className="w-full h-auto m-auto py-10">
                <div className="text-2xl mb-3 text-secondary font-bold">
                  Nota:
                </div>
                <p className="pre-line text-base text-black/90">
                  {product.note}
                </p>
              </div>
            )}
            <OtherProductsCarousel currentProduct={product} />
          </div>
        )}
      </div>
      );
    </>
  );
}
