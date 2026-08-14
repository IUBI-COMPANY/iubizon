"use client";

import Link from "next/link";
import Image from "next/image";
import { Package, Trash2 } from "lucide-react";
import { QuantitySelector } from "@/components/ui/QuantitySelector";
import {
  CartOrderBumps,
  type OrderBump,
} from "@/components/features/cart/CartOrderBumps";
import { CartSummarySidebar } from "@/components/features/cart/CartSummarySidebar";
import { stockLabel } from "@/lib/utils/stockLabel";
import type { CartItem } from "@/hooks/useCart";

interface CheckoutStepCartProps {
  items: CartItem[];
  total: number;
  shippingCost: number;
  grandTotal: number;
  recommendations: OrderBump[];
  loadingRecs: boolean;
  recsPage: number;
  recsHasMore: boolean;
  onRemoveItem: (productId: string) => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onClearCart: () => void;
  onAddBump: (bump: OrderBump) => void;
  onLoadRecommendations: (page: number) => void;
  onNextStep: () => void;
}

export function CheckoutStepCart({
  items,
  total,
  shippingCost,
  grandTotal,
  recommendations,
  loadingRecs,
  recsPage,
  recsHasMore,
  onRemoveItem,
  onUpdateQuantity,
  onClearCart,
  onAddBump,
  onLoadRecommendations,
  onNextStep,
}: CheckoutStepCartProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-8 space-y-6">
        {/* Lista de Productos */}
        <div className="bg-white rounded-3xl border border-[#e2e8f0] p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-[#f1f5f9] mb-4">
            <h2 className="font-bold text-[#112237] text-base">
              Productos en tu Carrito ({items.length})
            </h2>
            {items.length > 0 && (
              <button
                onClick={onClearCart}
                className="text-xs text-red-500 hover:underline font-semibold flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Vaciar carrito
              </button>
            )}
          </div>

          {items.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-[#cbd5e1] mx-auto mb-3" />
              <p className="font-bold text-[#112237] text-sm">
                Tu carrito está vacío
              </p>
              <p className="text-xs text-[#64748b] mt-1 mb-6">
                Explora el catálogo y añade productos para continuar.
              </p>
              <Link
                href="/search"
                className="inline-flex items-center gap-2 bg-[#f25c05] text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md hover:bg-[#d94d04] transition-all"
              >
                Explorar Productos
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[#f1f5f9]">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="py-4 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5 flex-1 min-w-0">
                    <div className="relative w-14 h-14 bg-[#f8fafc] rounded-2xl overflow-hidden border border-[#e2e8f0] shrink-0 flex items-center justify-center">
                      {item.image_url ? (
                        <Image
                          src={item.image_url}
                          alt={item.title}
                          fill
                          sizes="56px"
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <Package className="w-6 h-6 text-[#cbd5e1]" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <a
                        href={`/products/${item.product_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-sm text-[#112237] truncate block hover:text-[#f25c05] hover:underline transition-colors"
                      >
                        {item.title}
                      </a>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-xs font-bold text-[#f25c05]">
                          S/ {item.price.toFixed(2)}
                        </p>
                        {(() => {
                          const s = stockLabel(item.stock);
                          return (
                            <span
                              className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                              style={{
                                backgroundColor: `${s.color}15`,
                                color: s.color,
                              }}
                            >
                              {s.label}
                            </span>
                          );
                        })()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <QuantitySelector
                      value={item.quantity}
                      onChange={(newQty) =>
                        onUpdateQuantity(item.product_id, newQty)
                      }
                      max={
                        typeof item.stock === "number" && item.stock > 0
                          ? item.stock
                          : 99
                      }
                      size="sm"
                      showLimitWarning={true}
                    />

                    <button
                      onClick={() => onRemoveItem(item.product_id)}
                      className="p-2 text-[#94a3b8] hover:text-red-500 transition-colors"
                      title="Eliminar ítem"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Order Bumps / Productos Complementarios */}
        <CartOrderBumps
          recommendations={recommendations}
          loading={loadingRecs}
          onAddBump={onAddBump}
          page={recsPage}
          hasMore={recsHasMore}
          onPageChange={onLoadRecommendations}
        />
      </div>

      {/* Sidebar Resumen */}
      <div className="lg:col-span-4">
        <CartSummarySidebar
          step={1}
          subtotal={total}
          shippingCost={shippingCost}
          grandTotal={grandTotal}
          itemCount={items.length}
          onNextStep={onNextStep}
        />
      </div>
    </div>
  );
}
