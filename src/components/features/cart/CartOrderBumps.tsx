"use client";

import Image from "next/image";
import {
  Loader2,
  Package,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

export interface OrderBump {
  id: string;
  title: string;
  price: number;
  company_id: string;
  image_url?: string | null;
  stock?: number | null;
}

interface CartOrderBumpsProps {
  recommendations: OrderBump[];
  loading: boolean;
  onAddBump: (bump: OrderBump) => void;
  page: number;
  hasMore: boolean;
  onPageChange: (newPage: number) => void;
}

export const CartOrderBumps = ({
  recommendations,
  loading,
  onAddBump,
  page,
  hasMore,
  onPageChange,
}: CartOrderBumpsProps) => {
  return (
    <div className="bg-gradient-to-br from-[#112237] to-[#1e3a5f] text-white rounded-3xl p-6 shadow-md">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-[#f25c05]" />
        <h3 className="font-bold text-base">Complementa tu paquete</h3>
      </div>
      <p className="text-xs text-slate-300 mb-4">
        Añade estos productos unicos con un solo clic antes de finalizar tu
        compra:
      </p>

      {loading ? (
        <div className="text-center py-8">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#f25c05]" />
        </div>
      ) : recommendations.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {recommendations.map((bump) => (
            <div
              key={bump.id}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/15 flex items-center justify-between gap-3 hover:bg-white/15 transition-all animate-fadeIn"
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
      ) : (
        <div className="text-center py-6 text-xs text-slate-400">
          No hay ofertas adicionales disponibles en este momento.
        </div>
      )}

      {/* Paginación */}
      {!loading && (page > 1 || hasMore) && (
        <div className="flex items-center justify-between mt-5 pt-4 border-t border-white/10 text-xs shrink-0">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            className={`flex items-center gap-1 font-semibold transition-all ${
              page === 1
                ? "text-white/30 cursor-not-allowed"
                : "text-white hover:text-[#f25c05] cursor-pointer"
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            Anterior
          </button>

          <span className="text-slate-300 font-medium bg-white/5 px-2.5 py-1 rounded-lg">
            Página {page}
          </span>

          <button
            onClick={() => onPageChange(page + 1)}
            disabled={!hasMore}
            className={`flex items-center gap-1 font-semibold transition-all ${
              !hasMore
                ? "text-white/30 cursor-not-allowed"
                : "text-white hover:text-[#f25c05] cursor-pointer"
            }`}
          >
            Siguiente
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
