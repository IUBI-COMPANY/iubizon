"use client";

import Image from "next/image";
import { Loader2, Package, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";

export interface OrderBump {
  id: string;
  title: string;
  price: number;
  seller_id: string;
  company_id?: string | null;
  image_url?: string | null;
}

interface CartOrderBumpsProps {
  recommendations: OrderBump[];
  loading: boolean;
  onAddBump: (bump: OrderBump) => void;
}

export const CartOrderBumps = ({
  recommendations,
  loading,
  onAddBump,
}: CartOrderBumpsProps) => {
  return (
    <div className="bg-gradient-to-br from-[#112237] to-[#1e3a5f] text-white rounded-3xl p-6 shadow-md">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-[#f25c05]" />
        <h3 className="font-bold text-base">
          Ofertas exclusivas para tu set
        </h3>
      </div>
      <p className="text-xs text-slate-300 mb-4">
        Añade estas ofertas únicas a tu pedido con un solo clic antes de finalizar tu compra:
      </p>

      {loading ? (
        <div className="text-center py-6">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#f25c05]" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {recommendations.map((bump) => (
            <div
              key={bump.id}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/15 flex items-center justify-between gap-3 hover:bg-white/15 transition-all"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative w-12 h-12 bg-white rounded-xl overflow-hidden shrink-0 flex items-center justify-center">
                  {bump.image_url ? (
                    <Image
                      src={bump.image_url}
                      alt={bump.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <Package className="w-5 h-5 text-gray-400" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white truncate">
                    {bump.title}
                  </p>
                  <p className="text-xs font-bold text-[#f25c05] mt-0.5">
                    S/ {bump.price.toFixed(2)}
                  </p>
                </div>
              </div>

              <Button
                onClick={() => onAddBump(bump)}
                size="sm"
                className="bg-[#f25c05] hover:bg-[#d94d04] text-white text-[11px] font-bold px-3 py-1.5 rounded-xl shrink-0 shadow-sm"
              >
                + Añadir
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
