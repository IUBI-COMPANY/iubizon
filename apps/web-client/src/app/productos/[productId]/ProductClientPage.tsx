"use client";

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

export default function ProductDetailPage({ product }: Props) {
  const [showModal, setShowModal] = useState(false);

  const condition = productsCondition[product.condition];

  const showChristmasCampaign = Boolean(product?.campaign);

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
      <div className="min-h-screen h-auto flex flex-col w-full bg-white">
        {!product ? (
          <NoFoundComponent />
        ) : (
          <div className="content-wrapper px-7 max-w-[1470px] m-auto w-full">
            {/* Banner de Verano */}
            <div className="w-full pt-5">
              <SummerBanner product={product} />
            </div>

            <main className="grid grid-cols-12 py-5 w-full relative">
              <section className="col-span-12 lg:col-span-8 w-full flex justify-center items-center">
                <div className="w-full">
                  {/*Product media*/}
                  <MediaCarousel product={product} />
                  <div className="block lg:hidden w-full my-10 mb-10 lg:mb-30">
                    <InformationAndPriceCard
                      product={product}
                      showModal={showModal}
                      setShowModal={setShowModal}
                      condition={condition}
                      showChristmasCampaign={showChristmasCampaign}
                    />
                  </div>
                  {/*Product specifications*/}
                  <div className="w-full h-auto m-auto my-10 md:my-0 md:pt-20">
                    <div className="text-2xl mb-5 text-secondary font-bold">
                      Especificaciones del producto:
                    </div>
                    <div className="product-characteristics w-full grid grid-cols-1 lg:grid-cols-[1fr_40%] gap-x-10 gap-y-4">
                      <div className="w-full flex flex-col gap-2 text-foreground font-mediun text-[.9em] ">
                        {condition && (
                          <div className="flex flex-col md:flex-row flex-wrap items-start md:items-end">
                            <div className="pr-4 w-[11em] leading-5">
                              Condición:
                            </div>{" "}
                            <div className="text-secondary">
                              <strong
                                className="inline-flex items-center gap-1 cursor-pointer"
                                onClick={() => setShowModal(true)}
                              >
                                {condition.name} <Info className="w-4" />
                              </strong>
                            </div>
                          </div>
                        )}
                        {product?.displayTechnology && (
                          <div className="flex flex-col md:flex-row flex-wrap items-start md:items-end">
                            <div className="pr-4 w-[11em] leading-5">
                              Tecnología de visualización:
                            </div>{" "}
                            <div className="text-secondary">
                              {product.displayTechnology}
                            </div>
                          </div>
                        )}
                        {product?.aspectRatio && (
                          <div className="flex flex-col md:flex-row flex-wrap items-start md:items-end">
                            <div className="pr-4 w-[11em] leading-5">
                              Relación de aspecto:
                            </div>{" "}
                            <div className="text-secondary">
                              {product.aspectRatio}
                            </div>
                          </div>
                        )}
                        {product?.brand && (
                          <div className="flex flex-col md:flex-row flex-wrap items-start md:items-end">
                            <div className="pr-4 w-[11em] leading-5">
                              Marca:
                            </div>{" "}
                            <div className="text-secondary">
                              {product.brand}
                            </div>
                          </div>
                        )}
                        {product?.type && (
                          <div className="flex flex-col md:flex-row flex-wrap items-start md:items-end">
                            <div className="pr-4 w-[11em] leading-5">Tipo:</div>{" "}
                            <div className="text-secondary">{product.type}</div>
                          </div>
                        )}
                        {product?.lumensANSI && (
                          <div className="flex flex-col md:flex-row flex-wrap items-start md:items-end">
                            <div className="pr-4 w-[11em] leading-5">
                              Lúmenes:
                            </div>{" "}
                            <div className="text-secondary">
                              {product.lumensANSI}
                            </div>
                          </div>
                        )}
                        {product?.contrastRatio && (
                          <div className="flex flex-col md:flex-row flex-wrap items-start md:items-end">
                            <div className="pr-4 w-[11em] leading-5">
                              Relación de contraste:
                            </div>{" "}
                            <div className="text-secondary">
                              {product.contrastRatio}
                            </div>
                          </div>
                        )}
                        {product?.connectivity && (
                          <div className="flex flex-col md:flex-row flex-wrap items-start md:items-end">
                            <div className="pr-4 w-[11em] leading-5">
                              Conectividad:
                            </div>{" "}
                            <div className="text-secondary">
                              {product.connectivity}
                            </div>
                          </div>
                        )}
                        {product?.features && (
                          <div className="flex flex-col md:flex-row flex-wrap items-start md:items-end">
                            <div className="pr-4 w-[11em] leading-5">
                              Características:
                            </div>{" "}
                            <div className="text-secondary">
                              {product.features}
                            </div>
                          </div>
                        )}
                        {product?.throwRatio && (
                          <div className="flex flex-col md:flex-row flex-wrap items-start md:items-end">
                            <div className="pr-4 w-[11em] leading-5">
                              Relación de proyección:
                            </div>{" "}
                            <div className="text-secondary">
                              {product.throwRatio}
                            </div>
                          </div>
                        )}
                        {product?.category && (
                          <div className="flex flex-col md:flex-row flex-wrap items-start md:items-end">
                            <div className="pr-4 w-[11em] leading-5">
                              Categoría:
                            </div>
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
                      <div className="w-full flex flex-col gap-2 text-foreground font-mediun text-[.9em]">
                        {product.type === "Proyector" && (
                          <div className="flex flex-col md:flex-row flex-wrap items-start md:items-end">
                            <div className="pr-4 w-[11em] leading-5">
                              Advertencia:
                            </div>
                            <div className="text-secondary">
                              Las lámparas del proyector contienen mercurio.
                            </div>
                          </div>
                        )}
                        {product?.aspectRatio && (
                          <div className="flex flex-col md:flex-row flex-wrap items-start md:items-end">
                            <div className="pr-4 w-[11em] leading-5 ">
                              Relación de aspecto:
                            </div>{" "}
                            <div className="text-secondary">
                              {product.aspectRatio}
                            </div>
                          </div>
                        )}
                        {product?.model && (
                          <div className="flex flex-col md:flex-row flex-wrap items-start md:items-end">
                            <div className="pr-4 w-[11em] leading-5 ">
                              Modelo:
                            </div>{" "}
                            <div className="text-secondary">
                              {product.model}
                            </div>
                          </div>
                        )}
                        {product?.nativeResolution && (
                          <div className="flex flex-col md:flex-row flex-wrap items-start md:items-end">
                            <div className="pr-4 w-[11em] leading-5 ">
                              Resolución nativa:
                            </div>{" "}
                            <div className="text-secondary">
                              {product.nativeResolution}
                            </div>
                          </div>
                        )}
                        {product?.technicalSheetUrl && (
                          <div className="flex flex-col md:flex-row flex-wrap items-start md:items-end">
                            <div className="pr-4 w-[11em] leading-5 ">
                              Ficha técnica:
                            </div>{" "}
                            <div className="text-secondary">
                              <a
                                href={product.technicalSheetUrl}
                                target="_blank"
                                className="text-blue-500 hover:underline"
                              >
                                ¡Click aquí!
                              </a>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </section>
              <div className="hidden lg:block col-span-12 lg:col-span-4 w-full mx-auto mt-15 lg:mt-0 px-0 lg:px-10 md:sticky top-4 self-start">
                <InformationAndPriceCard
                  product={product}
                  showModal={showModal}
                  setShowModal={setShowModal}
                  condition={condition}
                  showChristmasCampaign={showChristmasCampaign}
                />
              </div>
            </main>
            {product?.note && (
              <div className="w-full h-auto m-auto py-10 md:py-5 mb-0 md:mb-10">
                <div className="text-2xl mb-3 text-secondary font-bold">
                  Descripción del artículo:
                </div>
                <p className="text-base text-black/90 whitespace-pre-line">
                  {product.note}
                </p>
              </div>
            )}
            <OtherProductsCarousel currentProduct={product} />
          </div>
        )}
      </div>
    </>
  );
}
