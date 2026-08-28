"use client";

import { Building2, Check, CheckCircle, MapPin, Truck } from "lucide-react";
import { DeliveryType } from "@/components/features/cart/checkout-schema";

export interface BuyerTrackingPackage {
  packageId: string;
  companyName: string | null;
  trackingNumber: string | null;
  courier: string | null;
  trackingUrl: string | null;
  estimatedDelivery: string | null;
  deliveryType?: DeliveryType | string | null;
  status: string;
}

export function BuyerDeliveryTimeline({ pkg }: { pkg: BuyerTrackingPackage }) {
  const isConsolidated = pkg.deliveryType === "complete";
  const isShipped =
    pkg.status === "shipped" ||
    pkg.status === "delivered" ||
    pkg.status === "completed";
  const isDelivered = pkg.status === "delivered" || pkg.status === "completed";
  const isWarehouseReceived =
    pkg.status === "received_in_warehouse" || isShipped;

  return (
    <div className="bg-[#f8fafc] rounded-2xl p-4 border border-[#e2e8f0] space-y-3">
      {/* Stepper Horizontal Limpio */}
      <div className="flex items-center justify-between text-xs font-bold">
        <div className="flex items-center gap-1.5 text-emerald-700">
          <Check className="w-4 h-4 bg-emerald-100 rounded-full p-0.5 shrink-0" />
          <span>Origen</span>
        </div>

        {isConsolidated && (
          <>
            <div className="h-0.5 flex-1 mx-2 bg-slate-200 rounded" />
            <div
              className={`flex items-center gap-1.5 ${
                isWarehouseReceived
                  ? "text-emerald-700 font-bold"
                  : "text-[#f25c05] font-bold"
              }`}
            >
              {isWarehouseReceived ? (
                <Check className="w-4 h-4 bg-emerald-100 rounded-full p-0.5 shrink-0" />
              ) : (
                <Building2 className="w-4 h-4 shrink-0" />
              )}
              <span>Almacén iubizon</span>
            </div>
          </>
        )}

        <div className="h-0.5 flex-1 mx-2 bg-slate-200 rounded" />
        <div
          className={`flex items-center gap-1.5 ${
            isDelivered
              ? "text-emerald-700 font-bold"
              : isShipped
                ? "text-[#f25c05] font-bold"
                : "text-slate-400"
          }`}
        >
          {isDelivered ? (
            <Check className="w-4 h-4 bg-emerald-100 rounded-full p-0.5 shrink-0" />
          ) : isShipped ? (
            <Truck className="w-4 h-4 text-[#f25c05] shrink-0" />
          ) : (
            <MapPin className="w-4 h-4 shrink-0" />
          )}
          <span>Tu Domicilio</span>
        </div>
      </div>

      {/* Mensaje de Estado Contextual */}
      <div className="pt-2 border-t border-slate-200/60 text-xs text-[#475569]">
        {isDelivered ? (
          <p className="flex items-center gap-1.5 text-emerald-700 font-bold">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>¡Producto entregado a satisfacción en tu domicilio!</span>
          </p>
        ) : isShipped ? (
          <p className="text-[#334155]">
            <strong>Estado:</strong> Tus productos están en camino a tu
            domicilio.
          </p>
        ) : isWarehouseReceived ? (
          <p className="text-[#334155]">
            <strong>Estado:</strong> Paquete recepcionado y preparado en el
            Almacén Central iubizon.
          </p>
        ) : (
          <p className="text-amber-800 font-medium">
            El vendedor está preparando tus productos para el despacho.
          </p>
        )}
      </div>
    </div>
  );
}
