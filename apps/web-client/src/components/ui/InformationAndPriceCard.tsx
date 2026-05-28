import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Info, XCircle } from "lucide-react";
import { twMerge } from "tailwind-merge";
import { Product } from "@/data-list/products";
import { DetailProductCondition } from "@/data-list/productsCondition";
import { PurchaseModal } from "./PurchaseModal";
import { QuantitySelector } from "./QuantitySelector";
import {
  formatPrice,
  getProductDiscountInfo,
  shouldShowCampaignBadge,
} from "@/utils/productPriceHelpers";

interface Props {
  product: Product;
  showModal: boolean;
  setShowModal: (showModal: boolean) => void;
  condition: DetailProductCondition;
  showChristmasCampaign?: boolean;
  getBundleDescription: () => string | null;
}

export const InformationAndPriceCard = ({
  product,
  showModal,
  setShowModal,
  condition,
  showChristmasCampaign = false,
  getBundleDescription,
}: Props) => {
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const minQuantity = 1;
  const maxQuantity = Math.max(minQuantity, product.stock ?? minQuantity);

  const clampQuantity = useCallback(
    (nextValue: number) => {
      return Math.min(maxQuantity, Math.max(minQuantity, nextValue));
    },
    [maxQuantity, minQuantity],
  );

  const handleQuantityChange = useCallback(
    (nextValue: number) => {
      const clamped = clampQuantity(nextValue);
      setQuantity(clamped);
      localStorage.setItem(`quantity_${product.id}`, String(clamped));
    },
    [clampQuantity, product.id],
  );

  useEffect(() => {
    const storedQuantity = localStorage.getItem(`quantity_${product.id}`);
    if (storedQuantity) {
      const parsed = Number(storedQuantity);
      if (!Number.isNaN(parsed)) {
        const clamped = clampQuantity(parsed);
        setQuantity(clamped);
        if (clamped !== parsed) {
          localStorage.setItem(`quantity_${product.id}`, String(clamped));
        }
      }
    } else {
      localStorage.setItem(`quantity_${product.id}`, String(minQuantity));
    }
  }, [product.id, product.stock, maxQuantity, clampQuantity]);

  const priceData = useMemo(() => {
    const basePrice = product.price ?? 0;
    const showIgv = product.withIgv === true;
    const igvRate = 0.18;

    const subtotal = basePrice * quantity;
    const igv = showIgv ? +(subtotal * igvRate).toFixed(2) : 0;
    const total = +(subtotal + igv).toFixed(2);

    return {
      subtotal,
      igv,
      total,
    };
  }, [product, quantity]);

  // Obtener información de descuento del producto
  const discountInfo = getProductDiscountInfo(product);
  const showCampaignBadge = shouldShowCampaignBadge(
    product,
    showChristmasCampaign,
  );

  const handlePurchaseClick = () => {
    // Guardar la cantidad actual en localStorage antes de abrir el modal
    const currentQuantity = localStorage.getItem(`quantity_${product.id}`);
    if (currentQuantity) {
      localStorage.setItem(`purchase_quantity_${product.id}`, currentQuantity);
    } else {
      localStorage.setItem(`purchase_quantity_${product.id}`, "1");
    }
    setShowPurchaseModal(true);
  };

  return (
    <>
      <section className="w-full">
        <div className="product-price-card bg-white rounded-3xl p-6 md:p-8 border-2 border-gray-200 shadow-xl">
          {/* 1. TÍTULO DEL PRODUCTO */}
          <h1 className="text-2xl md:text-3xl font-bold text-left mb-4 text-gray-900 leading-tight font-sfpro">
            {product.name || product.model}
          </h1>

          {/* Description */}
          <p className="text-base md:text-lg text-gray-600 leading-relaxed max-w-3xl">
            {getBundleDescription()}
          </p>

          <div className="tags flex flex-wrap gap-2 mb-4">
            {/* 2. BADGE DE OFERTA ESPECIAL - Solo si hay descuento real */}
            {showCampaignBadge && (
              <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-primary to-primary/80 text-white text-xs font-bold shadow-lg shadow-primary/30">
                <span>-{discountInfo.percentage}% OFF</span>
              </div>
            )}

            {product.classification === "clearance" && (
              <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-600 to-green-600 text-white text-xs font-bold shadow-lg">
                <span>Precio de remate</span>
              </div>
            )}
          </div>

          {/* 3. CONDICIÓN DEL PRODUCTO */}
          {product?.condition && (
            <div className="mb-5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-gray-600 font-sfpro">
                  Condición:
                </span>
                <button
                  className="inline-flex items-center gap-1 px-4 py-2 bg-primary/10 text-primary border border-primary/20 text-xs font-semibold rounded-full hover:bg-primary/20 transition-colors"
                  onClick={() => setShowModal(true)}
                >
                  {condition.name}
                  <Info className="w-3 h-3" />
                </button>
              </div>

              {/* Modal de información */}
              <div
                className={`fixed inset-0 z-40 flex items-center justify-center bg-black/50 transition-opacity duration-300 ${
                  showModal ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
                onClick={() => setShowModal(false)}
              >
                <div
                  className="bg-white rounded-3xl p-8 max-w-lg w-full mx-4 border-2 border-gray-200 shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 font-sfpro">
                      {condition.name}
                    </h3>
                    <button
                      onClick={() => setShowModal(false)}
                      className="text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      <XCircle className="w-6 h-6" />
                    </button>
                  </div>
                  <p className="text-gray-600 leading-relaxed whitespace-pre-line font-sfpro">
                    {condition.description}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 5. DESGLOSE DE PRECIOS */}
          {product?.price && (
            <div className="mb-6 p-5 rounded-2xl bg-gray-50 border border-gray-200">
              <div className="space-y-3">
                {/* Precio Lista - Solo mostrar si hay descuento */}
                {discountInfo.hasDiscount && (
                  <div className="flex justify-between text-sm items-center">
                    <span className="text-gray-500 font-sfpro">
                      Precio Lista:
                    </span>
                    <span className="font-medium text-gray-400 line-through font-sfpro">
                      {formatPrice(discountInfo.originalPrice)}
                    </span>
                  </div>
                )}

                {/* Descuento - Solo mostrar si hay descuento */}
                {discountInfo.hasDiscount && (
                  <div className="flex justify-between text-sm items-center">
                    <span className="text-primary font-semibold font-sfpro">
                      Descuento ({discountInfo.percentage}%):
                    </span>
                    <span className="font-bold text-primary font-sfpro">
                      - {formatPrice(discountInfo.amount)}
                    </span>
                  </div>
                )}

                {product.withIgv === true && priceData.igv > 0 ? (
                  <>
                    <div className="flex justify-between text-sm items-center">
                      <span className="text-gray-500 font-sfpro">SubTotal</span>
                      <span className="font-medium text-gray-700 font-sfpro">
                        {formatPrice(priceData.subtotal)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm items-center pb-3 border-b border-gray-200">
                      <span className="text-gray-500 font-sfpro">
                        IGV (18%)
                      </span>
                      <span className="font-medium text-gray-700 font-sfpro">
                        {formatPrice(priceData.igv)}
                      </span>
                    </div>
                  </>
                ) : null}

                {/* Total destacado */}
                <div className="flex justify-between items-center pt-3">
                  <span className="text-base font-bold text-gray-900 font-sfpro">
                    Total a Pagar:
                  </span>
                  <span className="text-[1.4em] font-black text-primary font-sfpro">
                    {formatPrice(priceData.total)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* STOCK Y DISPONIBILIDAD */}
          <div className="mb-4 p-3 rounded-xl bg-gray-50 border border-gray-200">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {product.stock <= 0 ? (
                  <span className="text-sm text-red-600 font-semibold">
                    Sin stock • Compra a pedido
                  </span>
                ) : (
                  <span className="text-sm text-gray-800 font-semibold">
                    Stock: {product.stock} unidad
                    {product.stock !== 1 ? "es" : ""}
                  </span>
                )}
              </div>
              {product?.availability && (
                <span
                  className={twMerge(
                    "text-[11px] font-bold px-2.5 py-1 rounded-full text-white",
                    product.availability === "inmediata"
                      ? "bg-green-600"
                      : "bg-blue-600",
                  )}
                >
                  {product.availability === "inmediata"
                    ? "Disponible"
                    : "Importación"}
                </span>
              )}
            </div>
            {product?.availability === "importacion" && (
              <p className="mt-2 text-[11px] text-blue-700 leading-relaxed">
                Nos encargamos de toda la logística: importación, aduanas y
                envío directo a tu dirección. Solo esperas de 10 a 13 días.
              </p>
            )}
          </div>

          {/* SELECTOR DE CANTIDAD */}
          <div className="mb-6 flex justify-center">
            <QuantitySelector
              value={quantity}
              onChange={handleQuantityChange}
              max={maxQuantity}
              theme="light"
            />
          </div>

          {/* BOTÓN DE ACCIÓN (CTA) */}
          <button
            onClick={handlePurchaseClick}
            className="block w-full rounded-full px-6 py-4 text-base font-bold text-center shadow-lg transition-all bg-primary text-white hover:bg-primary/90 hover:scale-105 duration-300 font-sfpro"
          >
            {product.stock <= 0 ? "Comprar a pedido" : "Comprar ahora"}
          </button>

          <p className="mt-3 text-center text-[11px] text-gray-500 leading-relaxed">
            Compras con boleta o factura es + el 18% de IGV.
            <br />
            Pagos con tarjeta + 5%.
          </p>
        </div>
      </section>

      {/* Purchase Modal */}
      <PurchaseModal
        isOpen={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        product={product}
      />
    </>
  );
};
