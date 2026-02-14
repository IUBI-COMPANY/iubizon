"use client";

import Image from "next/image";
import MediaCarousel from "../../../components/ui/MediaCarousel";
import OtherProductsCarousel from "../../../components/ui/OtherProductsCarousel";
import { Product } from "@/data-list/products";
import { ChevronRight, Info } from "lucide-react";
import { NoFoundComponent } from "@/components/ui/NoFoundComponent";
import { InformationAndPriceCard } from "@/components/ui/InformationAndPriceCard";
import React, { useEffect, useState } from "react";
import { productsCondition } from "@/data-list/productsCondition";
import { MAGCUBICHY350 } from "./MAGCUBIC-HY350";
import { EPSONFH02 } from "./EPSON-FH02";
import { SummerBanner } from "@/components/ui/SummerBanner";

interface Props {
  product: Product;
}

const SPECIAL_PRODUCT_ID =
  "Proyector-Led-Portatil-Hy350-Magcubic-Full-Hd-1080p-Android";
const EPSON_FH02_ID = "Proyector-Portatil-EpiqVision-FH02-con-Android-TV-Epson";

// IDs de productos del bundle
const BUNDLE_PRODUCT_IDS = ["bundle-interactivo", "touch", "adaptador"];

export default function ProductDetailPage({ product }: Props) {
  const [showModal, setShowModal] = useState(false);

  const condition = productsCondition[product.condition];

  const showChristmasCampaign = Boolean(product?.campaign);

  // Verificar si es un producto del bundle
  const isBundleProduct = BUNDLE_PRODUCT_IDS.includes(product.id);
  const isBundleComplete = product.id === "bundle-interactivo";
  const isTouchOrAdapter = product.id === "touch" || product.id === "adaptador";

  // Títulos y descripciones personalizadas para productos del bundle
  const getBundleTitle = () => {
    if (isBundleComplete) {
      return "Estás a un paso de conseguir tu bundle educativo";
    }
    if (isTouchOrAdapter) {
      return "Estás a un paso de mejorar tu tecnología";
    }
    return null;
  };

  const getBundleDescription = () => {
    if (isBundleComplete) {
      return "Solución interactiva completa que integra proyección, interactividad táctil y conectividad inalámbrica. Moderniza tus aulas con tecnología profesional y fácil de usar.";
    }
    if (isTouchOrAdapter) {
      return "Potencia tu equipo actual con tecnología avanzada. Mejora la experiencia de presentación y colaboración con instalación simple y resultados profesionales.";
    }
    return null;
  };

  useEffect(() => {
    document.body.style.overflow = showModal ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showModal]);

  if (product.id.toUpperCase() === SPECIAL_PRODUCT_ID.toUpperCase()) {
    return <MAGCUBICHY350 product={product} />;
  }

  if (product.id.toUpperCase() === EPSON_FH02_ID.toUpperCase()) {
    return <EPSONFH02 product={product} />;
  }

  return (
    <>
      <div className="min-h-screen h-auto flex flex-col w-full bg-[#060e1e] font-sfpro">
        {!product ? (
          <NoFoundComponent />
        ) : (
          <div className="w-full">
            {/* Banner de Verano - Oculto para productos del bundle */}
            {!isBundleProduct && (
              <div className="w-full pt-5 max-w-[1470px] mx-auto px-7">
                <SummerBanner product={product} />
              </div>
            )}

            {/* Título y Descripción personalizados para productos del bundle */}
            {isBundleProduct && (
              <div className="relative py-16 px-6 overflow-hidden">
                {/* Background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-secondary via-secondary/95 to-primary opacity-95"></div>

                {/* Decorative circles */}
                <div className="absolute -top-20 -right-20 w-96 h-96 bg-primary/30 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl"></div>

                <div className="relative z-10 max-w-[1470px] mx-auto">
                  {/* Badge */}
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-4">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                    <span className="text-sm font-semibold text-white uppercase tracking-wide">
                      {isBundleComplete
                        ? "Solución Completa"
                        : "Mejora tu Equipo"}
                    </span>
                  </div>

                  {/* Title */}
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight drop-shadow-lg">
                    {getBundleTitle()}
                  </h1>

                  {/* Description */}
                  <p className="text-base md:text-lg text-white/90 leading-relaxed max-w-3xl">
                    {getBundleDescription()}
                  </p>

                  {/* Decorative line */}
                  <div className="mt-6 h-1 w-24 bg-primary rounded-full shadow-lg shadow-primary/50"></div>
                </div>
              </div>
            )}

            <main className="max-w-[1470px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                {/* Left Column - Product Media & Details */}
                <div className="lg:col-span-7">
                  {/*Product media*/}
                  {isBundleComplete ? (
                    // Bundle: Mostrar las 3 imágenes juntas
                    <div className="w-full mb-12 bg-gradient-to-br from-white/5 to-white/10 rounded-3xl p-8 border border-white/10">
                      <div className="relative flex items-center justify-center min-h-[400px] lg:min-h-[500px]">
                        {/* Touch Interactivo */}
                        <div className="absolute left-0 bottom-8 z-0">
                          <Image
                            src="/productos/bundle/touch.png"
                            alt="Touch Interactivo"
                            width={240}
                            height={240}
                            className="w-[160px] sm:w-[200px] lg:w-[240px] h-auto object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-300"
                          />
                        </div>

                        {/* Proyector - Centro */}
                        <div className="relative z-20">
                          <Image
                            src="/productos/bundle/upside109W.png"
                            alt="Proyector Epson 109W"
                            width={800}
                            height={800}
                            className="w-[400px] sm:w-[500px] lg:w-[650px] h-auto object-contain drop-shadow-2xl"
                          />
                        </div>

                        {/* MiraCast */}
                        <div className="absolute right-0 bottom-8 z-0">
                          <Image
                            src="/productos/bundle/miracast.png"
                            alt="MiraCast Dongle"
                            width={220}
                            height={220}
                            className="w-[140px] sm:w-[170px] lg:w-[200px] h-auto object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Otros productos: Carousel normal
                    <div className="mb-12">
                      <MediaCarousel product={product} />
                    </div>
                  )}

                  {/* Mobile: Information Card */}
                  <div className="block lg:hidden mb-12">
                    <InformationAndPriceCard
                      product={product}
                      showModal={showModal}
                      setShowModal={setShowModal}
                      condition={condition}
                      showChristmasCampaign={showChristmasCampaign}
                    />
                  </div>

                  {/*Product specifications*/}
                  <div className="bg-gradient-to-br from-white/5 to-white/10 rounded-3xl p-8 border border-white/10 mb-8">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                      <div className="w-1 h-8 bg-primary rounded-full"></div>
                      Especificaciones Técnicas
                    </h2>
                    <div className="grid grid-cols-1 gap-4">
                      {condition && (
                        <div className="flex justify-between items-center py-3 border-b border-white/10">
                          <span className="text-gray-400">Condición:</span>
                          <strong
                            className="inline-flex items-center gap-1 cursor-pointer text-primary hover:text-primary/80 transition-colors"
                            onClick={() => setShowModal(true)}
                          >
                            {condition.name} <Info className="w-4" />
                          </strong>
                        </div>
                      )}
                      {product?.displayTechnology && (
                        <div className="flex justify-between items-center py-3 border-b border-white/10">
                          <span className="text-gray-400">Tecnología:</span>
                          <span className="text-white font-semibold">
                            {product.displayTechnology}
                          </span>
                        </div>
                      )}
                      {product?.brand && (
                        <div className="flex justify-between items-center py-3 border-b border-white/10">
                          <span className="text-gray-400">Marca:</span>
                          <span className="text-white font-semibold">
                            {product.brand}
                          </span>
                        </div>
                      )}
                      {product?.type && (
                        <div className="flex justify-between items-center py-3 border-b border-white/10">
                          <span className="text-gray-400">Tipo:</span>
                          <span className="text-white font-semibold">
                            {product.type}
                          </span>
                        </div>
                      )}
                      {product?.lumensANSI && (
                        <div className="flex justify-between items-center py-3 border-b border-white/10">
                          <span className="text-gray-400">Lúmenes:</span>
                          <span className="text-white font-semibold">
                            {product.lumensANSI}
                          </span>
                        </div>
                      )}
                      {product?.connectivity && (
                        <div className="flex justify-between items-center py-3 border-b border-white/10">
                          <span className="text-gray-400">Conectividad:</span>
                          <span className="text-white font-semibold">
                            {product.connectivity}
                          </span>
                        </div>
                      )}
                      {product?.nativeResolution && (
                        <div className="flex justify-between items-center py-3 border-b border-white/10">
                          <span className="text-gray-400">Resolución:</span>
                          <span className="text-white font-semibold">
                            {product.nativeResolution}
                          </span>
                        </div>
                      )}
                      {product?.aspectRatio && (
                        <div className="flex justify-between items-center py-3 border-b border-white/10">
                          <span className="text-gray-400">Aspecto:</span>
                          <span className="text-white font-semibold">
                            {product.aspectRatio}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Descripción del producto */}
                  {product?.note && (
                    <div className="bg-gradient-to-br from-white/5 to-white/10 rounded-3xl p-8 border border-white/10">
                      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                        <div className="w-1 h-8 bg-primary rounded-full"></div>
                        Descripción del Producto
                      </h2>
                      <p className="text-gray-300 whitespace-pre-line leading-relaxed">
                        {product.note}
                      </p>
                    </div>
                  )}
                </div>

                {/* Right Column - Price Card (Desktop) */}
                <div className="hidden lg:block lg:col-span-5">
                  <div className="sticky top-24">
                    <InformationAndPriceCard
                      product={product}
                      showModal={showModal}
                      setShowModal={setShowModal}
                      condition={condition}
                      showChristmasCampaign={showChristmasCampaign}
                    />
                  </div>
                </div>
              </div>
            </main>

            {/* Ocultar recomendaciones para productos del bundle */}
            {!isBundleProduct && (
              <div className="max-w-[1470px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <OtherProductsCarousel currentProduct={product} />
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
