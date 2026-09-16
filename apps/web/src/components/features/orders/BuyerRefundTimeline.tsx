"use client";

import React from "react";
import { Check, Circle, X } from "lucide-react";

export interface BuyerRefundTimelineProps {
  status: string; // 'pending' | 'approved' | 'return_in_transit' | 'return_received' | 'refunded' | 'rejected'
  createdAt: string;
  estimatedDelivery?: string | null;
  deliveredAt?: string | null;
  courier?: string | null;
  refundAmount?: number | string | null;
}

export function BuyerRefundTimeline({
  status,
  createdAt,
  estimatedDelivery,
  deliveredAt,
  courier,
  refundAmount,
}: BuyerRefundTimelineProps) {
  const isRejected = status === "rejected";
  const isApproved =
    status === "approved" ||
    status === "return_in_transit" ||
    status === "return_received" ||
    status === "refunded";
  const isInTransit =
    status === "return_in_transit" ||
    status === "return_received" ||
    status === "refunded";
  const isReceived = status === "return_received" || status === "refunded";
  const isRefunded = status === "refunded";

  const formatShortDate = (dateStr?: string | null) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return "";
      return new Intl.DateTimeFormat("es-PE", {
        month: "short",
        day: "numeric",
      }).format(d);
    } catch {
      return "";
    }
  };

  const formatMoney = (amount?: number | string | null) => {
    if (amount === undefined || amount === null || amount === "") return "";
    const num = typeof amount === "number" ? amount : Number(amount);
    return isNaN(num) ? "" : num.toFixed(2);
  };

  const requestedDateText = formatShortDate(createdAt);
  const estDeliveryText = formatShortDate(estimatedDelivery);
  const completionDateText = formatShortDate(deliveredAt);

  return (
    <div className="py-2">
      {/* Stepper horizontal alineado al tope para simetría exacta */}
      <div className="relative flex items-start justify-between">
        {/* Línea conectora 1 (Solicitado -> En camino de vuelta) */}
        <div
          className={`absolute left-[15%] right-[50%] top-3.5 h-1 -translate-y-1/2 transition-all rounded-full ${
            isInTransit ? "bg-[#f25c05]" : "bg-slate-200"
          }`}
        />
        {/* Línea conectora 2 (En camino de vuelta -> Devuelto / Reembolsado) */}
        <div
          className={`absolute left-[50%] right-[15%] top-3.5 h-1 -translate-y-1/2 transition-all rounded-full ${
            isReceived ? "bg-[#f25c05]" : "bg-slate-200"
          }`}
        />

        {/* Punto 1: Solicitado */}
        <div className="relative z-10 flex flex-col items-center text-center">
          <div
            className={`w-7 h-7 rounded-full text-white flex items-center justify-center shadow-xs ${
              isRejected ? "bg-red-500" : "bg-[#f25c05]"
            }`}
          >
            {isRejected ? (
              <X className="w-4 h-4 stroke-[3]" />
            ) : (
              <Check className="w-4 h-4 stroke-[3]" />
            )}
          </div>
          <span
            className={`text-xs font-bold mt-1.5 ${isRejected ? "text-red-700" : "text-[#112237]"}`}
          >
            {isRejected ? "Rechazado" : "Solicitado"}
          </span>
          <span className="text-[10px] text-slate-500 font-medium min-h-[15px]">
            {requestedDateText || "\u00A0"}
          </span>
        </div>

        {/* Punto 2: En camino de vuelta */}
        <div className="relative z-10 flex flex-col items-center text-center">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center shadow-xs ${
              isInTransit
                ? "bg-[#f25c05] text-white"
                : isApproved
                  ? "bg-amber-500 text-white"
                  : "bg-white border-2 border-slate-300 text-slate-300"
            }`}
          >
            {isInTransit ? (
              <Check className="w-4 h-4 stroke-[3]" />
            ) : isApproved ? (
              <Circle className="w-2.5 h-2.5 fill-white" />
            ) : (
              <Circle className="w-2 h-2 fill-slate-300" />
            )}
          </div>
          <span
            className={`text-xs font-bold mt-1.5 ${
              isInTransit || isApproved ? "text-[#112237]" : "text-slate-400"
            }`}
          >
            En camino de vuelta
          </span>
          <span className="text-[10px] text-[#f25c05] font-semibold min-h-[15px]">
            {estDeliveryText && isInTransit && !isReceived
              ? `Est. ${estDeliveryText}`
              : isApproved && !isInTransit
                ? "Aprobado (Por despachar)"
                : courier
                  ? courier
                  : "\u00A0"}
          </span>
        </div>

        {/* Punto 3: Devuelto / Reembolsado */}
        <div className="relative z-10 flex flex-col items-center text-center">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center shadow-xs ${
              isRefunded || isReceived
                ? "bg-[#f25c05] text-white"
                : "bg-white border-2 border-slate-300 text-slate-300"
            }`}
          >
            {isRefunded || isReceived ? (
              <Check className="w-4 h-4 stroke-[3]" />
            ) : (
              <Circle className="w-2 h-2 fill-slate-300" />
            )}
          </div>
          <span
            className={`text-xs font-bold mt-1.5 ${
              isRefunded
                ? "text-emerald-700"
                : isReceived
                  ? "text-teal-700"
                  : "text-slate-400"
            }`}
          >
            {isRefunded
              ? "Reembolsado"
              : isReceived
                ? "Devuelto"
                : "Reembolsado"}
          </span>
          <span className="text-[10px] text-emerald-600 font-medium min-h-[15px]">
            {isRefunded
              ? completionDateText ||
                (formatMoney(refundAmount) ? `S/ ${formatMoney(refundAmount)}` : "Liquidado")
              : isReceived
                ? "En revisión final"
                : "\u00A0"}
          </span>
        </div>
      </div>
    </div>
  );
}
