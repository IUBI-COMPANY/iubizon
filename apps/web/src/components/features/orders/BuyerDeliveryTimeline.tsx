"use client";

import { useState } from "react";
import {
  Building2,
  Check,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  MapPin,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

export interface BuyerTrackingPackage {
  packageId: string;
  companyName: string | null;
  trackingNumber: string | null;
  courier: string | null;
  trackingUrl: string | null;
  estimatedDelivery: string | null;
  deliveryType?: string | null;
  status: string;
}

function formatDate(isoString: string | null): string {
  if (!isoString) return "-";
  try {
    const d = new Date(isoString);
    return new Intl.DateTimeFormat("es-PE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(d);
  } catch {
    return isoString;
  }
}

export function BuyerDeliveryTimeline({ pkg }: { pkg: BuyerTrackingPackage }) {
  const [isDetailedOpen, setIsDetailedOpen] = useState(false);

  const isConsolidated =
    pkg.deliveryType === "complete" || pkg.deliveryType === "consolidated";
  const isShipped =
    pkg.status === "shipped" ||
    pkg.status === "delivered" ||
    pkg.status === "completed";
  const isDelivered = pkg.status === "delivered" || pkg.status === "completed";
  const isWarehouseReceived =
    pkg.status === "received_in_warehouse" || isShipped;

  return (
    <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl p-4 space-y-3 text-xs">
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <p className="font-extrabold text-[#112237] flex items-center gap-1.5 text-xs">
          <Truck className="w-4 h-4 text-[#f25c05]" />
          <span>Estado y Progreso de tu Envío</span>
        </p>
        <span
          className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
            isConsolidated
              ? "bg-slate-100 text-slate-800 border-slate-200"
              : "bg-orange-50 text-[#f25c05] border-orange-200"
          }`}
        >
          {isConsolidated
            ? "Envío Consolidado por iubizon"
            : "Envío Directo del Proveedor"}
        </span>
      </div>

      {/* Resumen Compacto de la Ruta (Default View) */}
      <div className="bg-white rounded-xl p-3 border border-[#e2e8f0] space-y-2.5">
        {/* Stepper Horizontal Compacto del Comprador */}
        <div className="flex items-center justify-between text-[11px] font-bold">
          <div className="flex items-center gap-1 text-emerald-700">
            <Check className="w-3.5 h-3.5 bg-emerald-100 rounded-full p-0.5 shrink-0" />
            <span>Origen</span>
          </div>
          <div className="h-0.5 flex-1 mx-2 bg-slate-200 rounded" />
          <div
            className={`flex items-center gap-1 ${
              isConsolidated
                ? isWarehouseReceived
                  ? "text-emerald-700 font-bold"
                  : "text-[#f25c05] font-bold"
                : "text-slate-400"
            }`}
          >
            {isConsolidated &&
              (isWarehouseReceived ? (
                <Check className="w-3.5 h-3.5 bg-emerald-100 rounded-full p-0.5 shrink-0" />
              ) : (
                <Building2 className="w-3.5 h-3.5 shrink-0" />
              ))}
            <span>Almacén iubizon</span>
          </div>
          <div className="h-0.5 flex-1 mx-2 bg-slate-200 rounded" />
          <div
            className={`flex items-center gap-1 ${
              isDelivered
                ? "text-emerald-700 font-bold"
                : isShipped
                  ? "text-[#f25c05] font-bold"
                  : "text-slate-400"
            }`}
          >
            {isDelivered ? (
              <Check className="w-3.5 h-3.5 bg-emerald-100 rounded-full p-0.5 shrink-0" />
            ) : (
              <Truck className="w-3.5 h-3.5 shrink-0" />
            )}
            <span>Tu Domicilio</span>
          </div>
        </div>

        {/* Banner de Estado Resumido del Comprador */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
          <p className="text-[11px] text-[#334155] font-medium flex-1">
            <strong>Estado:</strong>{" "}
            {isDelivered
              ? "¡Producto Entregado a Satisfacción!"
              : isShipped
                ? "¡Tus productos están en camino a tu domicilio!"
                : isWarehouseReceived
                  ? "Paquete recepcionado y preparado en Almacén iubizon"
                  : "El vendedor preparó tu paquete y va camino al Almacén iubizon"}
          </p>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsDetailedOpen(!isDetailedOpen)}
            className="h-7 text-[11px] font-bold text-[#f25c05] hover:text-[#d94d04] hover:bg-orange-50 px-2.5 rounded-lg flex items-center gap-1 shrink-0"
          >
            <span>
              {isDetailedOpen ? "Ocultar detalles" : "Ver timeline detallado"}
            </span>
            {isDetailedOpen ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </Button>
        </div>
      </div>

      {/* Timeline Vertical del Comprador (Desplegable) */}
      {isDetailedOpen && (
        <div className="relative pl-6 space-y-4 pt-1 before:absolute before:left-2.5 before:top-4 before:bottom-3 before:w-0.5 before:bg-slate-300">
          {/* NODO 1: Preparación del Proveedor */}
          <div className="relative">
            <div className="absolute -left-[29px] top-0 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center ring-4 ring-[#f8fafc] shadow-xs">
              <Check className="w-3.5 h-3.5" />
            </div>
            <div className="bg-white rounded-xl p-3 border border-[#e2e8f0] space-y-0.5 text-xs">
              <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded uppercase">
                1. Origen (Proveedor / Vendedor)
              </span>
              <p className="font-bold text-[#112237] text-xs mt-0.5">
                {pkg.companyName || "Vendedor"} preparó tu paquete
              </p>
            </div>
          </div>

          {/* NODO 2 (SOLO CONSOLIDADO): Recepción en Almacén Central iubizon */}
          {isConsolidated && (
            <div className="relative">
              <div
                className={`absolute -left-[29px] top-0 w-6 h-6 rounded-full flex items-center justify-center ring-4 ring-[#f8fafc] shadow-xs ${
                  isWarehouseReceived
                    ? "bg-emerald-500 text-white"
                    : "bg-[#f25c05] text-white animate-pulse"
                }`}
              >
                {isWarehouseReceived ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  <Building2 className="w-3.5 h-3.5" />
                )}
              </div>

              <div className="bg-white rounded-xl p-3 border border-[#e2e8f0] space-y-1 text-xs">
                <span className="text-[9px] font-extrabold text-[#f25c05] bg-orange-50 border border-orange-200 px-2 py-0.5 rounded uppercase">
                  2. Almacén Central iubizon
                </span>
                <p className="font-bold text-[#112237] text-xs">
                  {isWarehouseReceived
                    ? "✓ Paquete recepcionado y consolidado en el Almacén Central iubizon (Chorrillos)"
                    : "Tu paquete va camino al Almacén iubizon para ser unificado con tus otros productos"}
                </p>
              </div>
            </div>
          )}

          {/* NODO 3: Despacho y Entrega a Tu Domicilio */}
          <div className="relative">
            <div
              className={`absolute -left-[29px] top-0 w-6 h-6 rounded-full flex items-center justify-center ring-4 ring-[#f8fafc] shadow-xs ${
                isDelivered
                  ? "bg-emerald-500 text-white"
                  : isShipped
                    ? "bg-[#f25c05] text-white animate-pulse"
                    : "bg-slate-300 text-slate-600"
              }`}
            >
              {isDelivered ? (
                <Check className="w-3.5 h-3.5" />
              ) : isShipped ? (
                <Truck className="w-3.5 h-3.5" />
              ) : (
                <MapPin className="w-3.5 h-3.5" />
              )}
            </div>

            <div className="bg-white rounded-xl p-3 border border-[#e2e8f0] space-y-1 text-xs">
              <span className="text-[9px] font-extrabold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded uppercase">
                {isConsolidated
                  ? "3. Despacho iubizon a tu Puerta"
                  : "2. En Camino a Tu Domicilio"}
              </span>

              <p className="font-bold text-[#112237] text-xs">
                {isDelivered
                  ? "¡Producto Entregado a Satisfacción!"
                  : isShipped
                    ? "¡Tus productos están en camino a tu domicilio!"
                    : "Pendiente de despacho a tu domicilio"}
              </p>

              {isShipped && pkg.courier && (
                <div className="pt-1 text-[#334155] space-y-1 font-medium bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <p>
                    <strong>Empresa / Transporte:</strong> {pkg.courier}
                  </p>
                  <p>
                    <strong>Tracking ID / Guía:</strong>{" "}
                    {pkg.trackingNumber || "Sin guía"}
                  </p>
                  {pkg.estimatedDelivery && (
                    <p>
                      <strong>Llegada Estimada:</strong>{" "}
                      {formatDate(pkg.estimatedDelivery)}
                    </p>
                  )}
                  {pkg.trackingUrl && (
                    <p className="pt-0.5">
                      <a
                        href={pkg.trackingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#f25c05] font-extrabold hover:underline inline-flex items-center gap-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Rastrear en la web de la agencia ➔</span>
                      </a>
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
