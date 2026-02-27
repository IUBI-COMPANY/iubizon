import React, { useState } from "react";
import { Info, XCircle } from "lucide-react";
import { Product } from "@/data-list/products";
import { GiftCardReaconditioned } from "./GiftCardReaconditioned";
import { GiftCardNews } from "./GiftCardNews";
import { DetailProductCondition } from "@/data-list/productsCondition";
import { PurchaseModal } from "./PurchaseModal";
import { QuantitySelector } from "./QuantitySelector";
import {
  getProductDiscountInfo,
  formatPrice,
  shouldShowCampaignBadge,
} from "@/utils/productPriceHelpers";

interface Props {
  product: Product;
  showModal: boolean;
  setShowModal: (showModal: boolean) => void;
  condition: DetailProductCondition;
  showChristmasCampaign?: boolean;
}

export const InformationAndPriceCard = ({
  product,
  showModal,
  setShowModal,
  condition,
  showChristmasCampaign = false,
}: Props) => {
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const priceData = React.useMemo(() => {
    return {
      subtotal: (product.subTotal ?? 0) * quantity,
      igv: (product.IGV ?? 0) * quantity,
      total: (product.totalPayment ?? 0) * quantity,
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
        <div className="product-price-card bg-gradient-to-br from-[#0a1628] via-[#0f1f3a] to-[#1a2942] rounded-3xl p-6 md:p-8 border-2 border-primary/20 shadow-[0_0_40px_rgba(242,95,12,0.15)]">
          {/* 1. TÍTULO DEL PRODUCTO */}
          <h1 className="text-2xl md:text-3xl font-bold text-left mb-4 text-white leading-tight font-sfpro">
            {product.name || product.model}
          </h1>

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

          {/* 3. STOCK Y DISPONIBILIDAD */}
          <div className="mb-5 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-300 font-sfpro">
                Stock:
              </span>
              <span className="text-lg font-bold text-primary font-sfpro">
                {product.stock} {product.stock === 1 ? "unidad" : "unidades"}
              </span>
            </div>
            {product.stock <= 0 ? (
              <p className="text-xs text-red-400 font-medium">
                ⚠️ Sin stock •{" "}
                <span className="font-semibold">Compra a pedido</span>
              </p>
            ) : (
              <p className="text-xs text-emerald-400 font-medium">
                ✓ Disponible para compra inmediata
              </p>
            )}
          </div>

          {/* 4. CONDICIÓN DEL PRODUCTO */}
          {product?.condition && (
            <div className="mb-5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-gray-400 font-sfpro">
                  Condición:
                </span>
                <button
                  className="inline-flex items-center gap-1 px-4 py-2 bg-primary/20 text-primary border border-primary/30 text-xs font-semibold rounded-full hover:bg-primary/30 transition-colors backdrop-blur-sm"
                  onClick={() => setShowModal(true)}
                >
                  {condition.name}
                  <Info className="w-3 h-3" />
                </button>
              </div>

              {/* Modal de información */}
              <div
                className={`fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
                  showModal ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
                onClick={() => setShowModal(false)}
              >
                <div
                  className="bg-gradient-to-br from-[#0a1628] to-[#1a2942] rounded-3xl p-8 max-w-lg w-full mx-4 border-2 border-primary/30 shadow-2xl shadow-primary/20"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="text-2xl font-bold text-white font-sfpro">
                      {condition.name}
                    </h3>
                    <button
                      onClick={() => setShowModal(false)}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <XCircle className="w-6 h-6" />
                    </button>
                  </div>
                  <p className="text-gray-300 leading-relaxed whitespace-pre-line font-sfpro">
                    {condition.description}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 5. DESGLOSE DE PRECIOS */}
          {product?.price && (
            <div className="mb-6 p-5 rounded-2xl bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm border border-white/10">
              <div className="space-y-3">
                {/* Precio Lista - Solo mostrar si hay descuento */}
                {discountInfo.hasDiscount && (
                  <div className="flex justify-between text-sm items-center">
                    <span className="text-gray-400 font-sfpro">
                      Precio Lista:
                    </span>
                    <span className="font-medium text-gray-300 line-through font-sfpro">
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

                <div className="flex justify-between text-sm items-center">
                  <span className="text-gray-400 font-sfpro">SubTotal</span>
                  <span className="font-medium text-gray-300 font-sfpro">
                    {formatPrice(priceData.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-sm items-center pb-3 border-b border-white/10">
                  <span className="text-gray-400 font-sfpro">IGV (18%)</span>
                  <span className="font-medium text-gray-300 font-sfpro">
                    {formatPrice(priceData.igv)}
                  </span>
                </div>

                {/* Total destacado */}
                <div className="flex justify-between items-center pt-3">
                  <span className="text-base font-bold text-white font-sfpro">
                    Total a Pagar:
                  </span>
                  <span className="text-3xl font-black text-primary font-sfpro drop-shadow-lg">
                    {formatPrice(priceData.total)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 6. REGALOS Y BENEFICIOS */}
          {product?.type === "Proyector" && (
            <div className="mb-5">
              {product?.condition === "new" && <GiftCardNews />}
              {product?.condition === "reconditioned" && (
                <GiftCardReaconditioned />
              )}
            </div>
          )}

          {/* SELECTOR DE CANTIDAD */}
          <div className="mb-6 flex justify-center">
            <QuantitySelector
              value={quantity}
              onChange={setQuantity}
              max={product.stock}
            />
          </div>

          {/* BOTÓN DE ACCIÓN (CTA) */}
          <button
            onClick={handlePurchaseClick}
            className="block w-full rounded-full px-6 py-4 text-base font-bold text-center shadow-[0_0_30px_rgba(242,95,12,0.4)] transition-all bg-primary text-white hover:bg-primary/90 hover:scale-105 hover:shadow-[0_0_50px_rgba(242,95,12,0.6)] duration-300 font-sfpro"
          >
            {product.stock <= 0 ? "Comprar a pedido" : "Comprar ahora"}
          </button>
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
