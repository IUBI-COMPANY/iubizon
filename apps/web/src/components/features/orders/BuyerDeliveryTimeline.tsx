"use client";

import { Check, Circle } from "lucide-react";

export interface BuyerTrackingPackage {
  packageId: string;
  packageNumber?: number;
  totalPackages?: number;
  companyName: string | null;
  trackingNumber: string | null;
  courier: string | null;
  trackingUrl: string | null;
  estimatedDelivery: string | null;
  deliveredAt?: string | null;
  createdAt?: string | null;
  status: string;
}

export function BuyerDeliveryTimeline({
  pkg,
  orderCreatedAt,
  orderDeliveredAt,
}: {
  pkg: BuyerTrackingPackage;
  orderCreatedAt?: string;
  orderDeliveredAt?: string | null;
}) {
  const isShipped =
    pkg.status === "shipped" ||
    pkg.status === "delivered" ||
    pkg.status === "completed";
  const isDelivered = pkg.status === "delivered" || pkg.status === "completed";

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

  const paidDateText = formatShortDate(orderCreatedAt || pkg.createdAt);
  const estDeliveryText = formatShortDate(pkg.estimatedDelivery);
  const deliveredDateText = formatShortDate(orderDeliveredAt || pkg.deliveredAt);

  return (
    <div className="py-2">
      {/* Stepper horizontal estilo eBay */}
      <div className="relative flex items-center justify-between">
        {/* Línea conectora 1 (Pagado -> En camino) */}
        <div
          className={`absolute left-[15%] right-[50%] top-3.5 h-1 -translate-y-1/2 transition-all rounded-full ${
            isShipped ? "bg-[#f25c05]" : "bg-slate-200"
          }`}
        />
        {/* Línea conectora 2 (En camino -> Entregado) */}
        <div
          className={`absolute left-[50%] right-[15%] top-3.5 h-1 -translate-y-1/2 transition-all rounded-full ${
            isDelivered ? "bg-[#f25c05]" : "bg-slate-200"
          }`}
        />

        {/* Punto 1: Pagado */}
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="w-7 h-7 rounded-full bg-[#f25c05] text-white flex items-center justify-center shadow-xs">
            <Check className="w-4 h-4 stroke-[3]" />
          </div>
          <span className="text-xs font-bold text-[#112237] mt-1.5">Pagado</span>
          {paidDateText && (
            <span className="text-[10px] text-slate-500 font-medium">
              {paidDateText}
            </span>
          )}
        </div>

        {/* Punto 2: Guía disponible / En camino */}
        <div className="relative z-10 flex flex-col items-center text-center">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center shadow-xs ${
              isShipped
                ? "bg-[#f25c05] text-white"
                : "bg-white border-2 border-slate-300 text-slate-300"
            }`}
          >
            {isShipped ? (
              <Check className="w-4 h-4 stroke-[3]" />
            ) : (
              <Circle className="w-2 h-2 fill-slate-300" />
            )}
          </div>
          <span
            className={`text-xs font-bold mt-1.5 ${
              isShipped ? "text-[#112237]" : "text-slate-400"
            }`}
          >
            En camino
          </span>
          {estDeliveryText && isShipped && !isDelivered && (
            <span className="text-[10px] text-[#f25c05] font-semibold">
              Est. {estDeliveryText}
            </span>
          )}
        </div>

        {/* Punto 3: Entregado */}
        <div className="relative z-10 flex flex-col items-center text-center">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center shadow-xs ${
              isDelivered
                ? "bg-[#f25c05] text-white"
                : "bg-white border-2 border-slate-300 text-slate-300"
            }`}
          >
            {isDelivered ? (
              <Check className="w-4 h-4 stroke-[3]" />
            ) : (
              <Circle className="w-2 h-2 fill-slate-300" />
            )}
          </div>
          <span
            className={`text-xs font-bold mt-1.5 ${
              isDelivered ? "text-emerald-700" : "text-slate-400"
            }`}
          >
            Entregado
          </span>
          {deliveredDateText && isDelivered && (
            <span className="text-[10px] text-emerald-600 font-medium">
              {deliveredDateText}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
