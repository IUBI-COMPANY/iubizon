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

import {
  DeliveryTimelineStepper,
  TimelineStepNode,
} from "@/components/ui/DeliveryTimelineStepper";

export function BuyerDeliveryTimeline({ pkg }: { pkg: BuyerTrackingPackage }) {
  const isConsolidated = pkg.deliveryType === "complete";
  const isShipped =
    pkg.status === "shipped" ||
    pkg.status === "delivered" ||
    pkg.status === "completed";
  const isDelivered = pkg.status === "delivered" || pkg.status === "completed";
  const isWarehouseReceived =
    pkg.status === "received_in_warehouse" || isShipped;

  const steps: TimelineStepNode[] = [
    {
      id: "origin",
      label: "Origen",
      status: "completed",
      badgeLabel: "1. Origen (Proveedor / Vendedor)",
      badgeColor: "emerald",
      content: (
        <div className="bg-white rounded-xl p-3 border border-[#e2e8f0] space-y-0.5 text-xs">
          <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded uppercase">
            1. Origen (Proveedor / Vendedor)
          </span>
          <p className="font-bold text-[#112237] text-xs mt-0.5">
            {pkg.companyName || "Vendedor"} preparó tu paquete
          </p>
        </div>
      ),
    },
    ...(isConsolidated
      ? [
          {
            id: "warehouse",
            label: "Almacén iubizon",
            status: isWarehouseReceived
              ? ("completed" as const)
              : ("current" as const),
            icon: isWarehouseReceived ? (
              <Check className="w-3.5 h-3.5" />
            ) : (
              <Building2 className="w-3.5 h-3.5 text-[#f25c05]" />
            ),
            badgeLabel: "2. Almacén Central iubizon",
            badgeColor: "orange" as const,
            content: (
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
            ),
          },
        ]
      : []),
    {
      id: "destination",
      label: "Tu Domicilio",
      status: isDelivered
        ? ("completed" as const)
        : isShipped
          ? ("current" as const)
          : ("pending" as const),
      icon: isDelivered ? (
        <Check className="w-3.5 h-3.5" />
      ) : isShipped ? (
        <Truck className="w-3.5 h-3.5 text-[#f25c05]" />
      ) : (
        <MapPin className="w-3.5 h-3.5 text-slate-500" />
      ),
      badgeLabel: isConsolidated
        ? "3. Despacho iubizon a tu Puerta"
        : "2. En Camino a Tu Domicilio",
      badgeColor: "slate",
      content: (
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
      ),
    },
  ];

  return (
    <DeliveryTimelineStepper
      title="Estado y Progreso de tu Envío"
      badgeLabel={
        isConsolidated
          ? "Envío Consolidado por iubizon"
          : "Envío Directo del Proveedor"
      }
      badgeVariant={isConsolidated ? "slate" : "orange"}
      steps={steps}
      mode="collapsible"
      summaryContent={
        <span>
          <strong>Estado:</strong>{" "}
          {isDelivered
            ? "¡Producto Entregado a Satisfacción!"
            : isShipped
              ? "¡Tus productos están en camino a tu domicilio!"
              : isWarehouseReceived
                ? "Paquete recepcionado y preparado en Almacén iubizon"
                : "El vendedor preparó tu paquete y va camino al Almacén iubizon"}
        </span>
      }
    />
  );
}
