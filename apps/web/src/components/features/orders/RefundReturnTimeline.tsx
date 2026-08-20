"use client";

import {useState} from "react";
import {Building2, Check, ExternalLink, MapPin, RotateCcw, Truck,} from "lucide-react";
import {Button} from "@/components/ui/Button";
import {BuyerReturnDispatchModal} from "./BuyerReturnDispatchModal";
import {DeliveryTimelineStepper, TimelineStepNode,} from "@/components/ui/DeliveryTimelineStepper";

export interface RefundReturnData {
  id: string;
  status: string; // 'pending' | 'approved_for_return' | 'return_shipped' | 'return_received' | 'completed' | 'rejected'
  deliveryType?: string | null;
  buyerReturnTracking?: string | null;
  returnCourier?: string | null;
  returnCarrierPhone?: string | null;
  returnTrackingUrl?: string | null;
  returnEstimatedDelivery?: string | null;
  returnAddress?: string | null;
  orderCode?: string;
}

interface RefundReturnTimelineProps {
  refund: RefundReturnData;
  isBuyer?: boolean;
  isSeller?: boolean;
  onRefresh?: () => void;
}

function formatDate(isoString?: string | null): string {
  if (!isoString) return "-";
  try {
    const d = new Date(isoString);
    return new Intl.DateTimeFormat("es-PE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(d);
  } catch {
    return isoString;
  }
}

export function getRefundStatusFlags(status?: string | null) {
  const s = status || "";
  const isShipped =
    s === "return_in_transit" ||
    s === "return_shipped" ||
    s === "return_received" ||
    s === "refunded" ||
    s === "completed";

  const isReceived =
    s === "return_received" ||
    s === "refunded" ||
    s === "completed";

  const isCompleted = s === "refunded" || s === "completed";

  return { isShipped, isReceived, isCompleted };
}

export function RefundReturnTimeline({
  refund,
  isBuyer,
  isSeller,
  onRefresh,
}: RefundReturnTimelineProps) {
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [isConfirmingReceipt, setIsConfirmingReceipt] = useState(false);

  const isConsolidated = refund.deliveryType === "complete";
  const { isShipped, isReceived, isCompleted } = getRefundStatusFlags(
    refund.status,
  );

  const handleConfirmSellerReceipt = async () => {
    try {
      setIsConfirmingReceipt(true);
      const res = await fetch("/api/orders/refund", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "confirm_return_receipt",
          refundRequestId: refund.id,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al confirmar recepción");
      }

      if (onRefresh) onRefresh();
    } catch (e) {
      console.error(e);
      alert(e instanceof Error ? e.message : "Error al confirmar recepción");
    } finally {
      setIsConfirmingReceipt(false);
    }
  };

  const steps: TimelineStepNode[] = [
    {
      id: "buyer_return",
      label: "1. Comprador",
      status: isShipped ? ("completed" as const) : ("current" as const),
      icon: isShipped ? (
        <Check className="w-3.5 h-3.5" />
      ) : (
        <Truck className="w-3.5 h-3.5" />
      ),
      badgeLabel: "1. Despacho del Comprador",
      badgeColor: "emerald",
      content: (
        <div className="bg-white rounded-xl p-3 border border-orange-200/80 space-y-1 text-xs">
          <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded uppercase">
            1. Despacho del Comprador
          </span>
          {isShipped ? (
            <div className="space-y-0.5 text-slate-700 pt-0.5">
              <p>
                <strong>Transporte:</strong>{" "}
                {refund.returnCourier || "Movilidad Propia"}
              </p>
              <p>
                <strong>Guía / Tracking:</strong>{" "}
                {refund.buyerReturnTracking || "Sin guía"}
              </p>
              {refund.returnEstimatedDelivery && (
                <p className="text-[#64748b]">
                  Llegada estimada: {formatDate(refund.returnEstimatedDelivery)}
                </p>
              )}
              {refund.returnTrackingUrl && (
                <a
                  href={refund.returnTrackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#f25c05] font-bold hover:underline inline-flex items-center gap-1 pt-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Rastrear paquete de devolución ↗</span>
                </a>
              )}
            </div>
          ) : (
            <p className="text-slate-500 pt-0.5">
              Esperando que el comprador despache el producto y registre su número de guía.
            </p>
          )}
        </div>
      ),
    },
    ...(isConsolidated
      ? [
          {
            id: "warehouse_return",
            label: "2. Almacén iubizon",
            status: isReceived
              ? ("completed" as const)
              : isShipped
                ? ("current" as const)
                : ("pending" as const),
            icon: isReceived ? (
              <Check className="w-3.5 h-3.5" />
            ) : (
              <Building2 className="w-3.5 h-3.5" />
            ),
            badgeLabel: "2. Almacén Central iubizon (Chorrillos, Lima)",
            badgeColor: "orange" as const,
            content: (
              <div className="bg-orange-50/60 border border-orange-200 rounded-xl p-3 space-y-1 text-xs">
                <span className="text-[9px] font-black text-[#f25c05] bg-orange-100/80 border border-orange-200 px-2 py-0.5 rounded uppercase">
                  2. Almacén Central iubizon (Chorrillos, Lima)
                </span>
                <p className="text-slate-700 font-bold text-xs pt-0.5">
                  {isReceived
                    ? "✓ Paquete recepcionado e inspeccionado en Chorrillos"
                    : "El producto llegará aquí para verificación de calidad antes del retorno final"}
                </p>
              </div>
            ),
          },
        ]
      : []),
    {
      id: "seller_return",
      label: isConsolidated ? "3. Vendedor" : "2. Vendedor (Tienda)",
      status: isCompleted
        ? ("completed" as const)
        : isReceived
          ? ("current" as const)
          : ("pending" as const),
      icon: isCompleted ? (
        <Check className="w-3.5 h-3.5" />
      ) : (
        <MapPin className="w-3.5 h-3.5" />
      ),
      badgeLabel: isConsolidated
        ? "3. Retorno al Vendedor"
        : "2. Recepción del Vendedor (Tienda)",
      badgeColor: "slate",
      content: (
        <div className="bg-white rounded-xl p-3 border border-orange-200/80 space-y-1 text-xs">
          <span className="text-[9px] font-extrabold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded uppercase">
            {isConsolidated
              ? "3. Retorno al Vendedor"
              : "2. Recepción del Vendedor (Tienda)"}
          </span>
          <p className="text-slate-700 font-bold text-xs pt-0.5">
            {isCompleted
              ? "✓ Devolución finalizada y reembolso efectuado"
              : isReceived
                ? "Paquete verificado. Pendiente de liquidación de reembolso por iubizon"
                : "Pendiente de recepción física en la tienda del vendedor"}
          </p>
        </div>
      ),
    },
  ];

  return (
    <>
      <DeliveryTimelineStepper
        title="Ruta y Seguimiento de Devolución por Reembolso"
        titleIcon={<RotateCcw className="w-4 h-4 text-[#f25c05]" />}
        badgeLabel={
          isConsolidated
            ? "Retorno Vía Almacén iubizon (3 Pasos)"
            : "Retorno Directo a Tienda del Vendedor (2 Pasos)"
        }
        badgeVariant="orange"
        steps={steps}
        mode="collapsible"
        viewDetailsLabel="Ver timeline de devolución"
        summaryContent={
          <span>
            <strong>Estado Retorno:</strong>{" "}
            {isCompleted
              ? " Devuelto y reembolso liquidado exitosamente"
              : isReceived
                ? " Paquete devuelto recepcionado y verificado"
                : isShipped
                  ? ` En tránsito de retorno via ${refund.returnCourier || "Courier"}`
                  : refund.status === "approved_for_return"
                    ? " Reembolso Aprobado. Esperando que el comprador despache el paquete"
                    : " Solicitud de reembolso en revisión por iubizon"}
          </span>
        }
        renderExtraActions={() => (
          <>
            {isBuyer && refund.status === "approved_for_return" && (
              <Button
                type="button"
                size="sm"
                onClick={() => setIsDispatchModalOpen(true)}
                className="h-7 text-[11px] font-bold bg-[#f25c05] hover:bg-[#d94d04] text-white px-3 rounded-lg flex items-center gap-1 shadow-xs"
              >
                <Truck className="w-3.5 h-3.5" />
                <span>Registrar Despacho de Devolución</span>
              </Button>
            )}

            {isSeller && !isConsolidated && refund.status === "return_shipped" && (
              <Button
                type="button"
                size="sm"
                disabled={isConfirmingReceipt}
                onClick={handleConfirmSellerReceipt}
                className="h-7 text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-3 rounded-lg flex items-center gap-1 shadow-xs"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Confirmar Recepción en Tienda</span>
              </Button>
            )}
          </>
        )}
      />

      {isDispatchModalOpen && (
        <BuyerReturnDispatchModal
          isOpen={isDispatchModalOpen}
          onClose={() => setIsDispatchModalOpen(false)}
          refundRequestId={refund.id}
          orderCode={refund.orderCode}
          destinationAddress={refund.returnAddress || undefined}
          isConsolidated={isConsolidated}
          onSuccess={() => {
            if (onRefresh) onRefresh();
          }}
        />
      )}
    </>
  );
}
