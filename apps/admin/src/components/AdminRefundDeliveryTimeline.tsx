import {
  IconCheck,
  IconBuildingWarehouse,
  IconMapPin,
  IconTruck,
  IconExternalLink,
  IconRefresh,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  DeliveryTimelineStepper,
  TimelineStepNode,
} from "@/components/ui/delivery-timeline-stepper";

export interface AdminRefundData {
  id: string;
  order_code: string;
  status: string; // 'pending' | 'approved' | 'approved_for_return' | 'return_in_transit' | 'return_shipped' | 'return_received' | 'refunded' | 'completed' | 'rejected'
  delivery_type?: string | null;
  buyer_name?: string | null;
  buyer_return_tracking?: string | null;
  return_courier?: string | null;
  return_carrier_phone?: string | null;
  return_tracking_url?: string | null;
  return_estimated_delivery?: string | null;
  return_address?: string | null;
  company_name?: string | null;
}

interface AdminRefundDeliveryTimelineProps {
  refund: AdminRefundData;
  onMarkReceivedInWarehouse?: (refundId: string, companyName: string) => void;
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

export function AdminRefundDeliveryTimeline({
  refund,
  onMarkReceivedInWarehouse,
}: AdminRefundDeliveryTimelineProps) {
  const isConsolidated = refund.delivery_type === "complete";
  const { isShipped, isReceived, isCompleted } = getRefundStatusFlags(
    refund.status,
  );

  const steps: TimelineStepNode[] = [
    {
      id: "buyer_return",
      label: "1. Comprador",
      status: isShipped
        ? ("completed" as const)
        : ("current" as const),
      icon: isShipped ? (
        <IconCheck className="w-3.5 h-3.5" />
      ) : (
        <IconTruck className="w-3.5 h-3.5" />
      ),
      badgeLabel: `1. Despacho del Comprador (${refund.buyer_name || "Cliente"})`,
      badgeColor: "emerald",
      content: (
        <div className="bg-white rounded-xl p-3 border border-slate-200 space-y-2 text-xs">
          <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded uppercase">
            1. Despacho del Comprador ({refund.buyer_name || "Cliente"})
          </span>
          {isShipped ? (
            <div className="space-y-1 pt-1 text-slate-700">
              <p>
                <strong>Transporte / Agencia:</strong>{" "}
                {refund.return_courier || "Movilidad Propia"}
              </p>
              <p>
                <strong>Guía / Tracking ID:</strong>{" "}
                {refund.buyer_return_tracking || "Sin guía"}
              </p>
              {refund.return_carrier_phone && (
                <p>
                  <strong>Teléfono Contacto:</strong>{" "}
                  {refund.return_carrier_phone}
                </p>
              )}
              {refund.return_estimated_delivery && (
                <p className="text-slate-500">
                  Llegada Estimada:{" "}
                  {formatDate(refund.return_estimated_delivery)}
                </p>
              )}
              {refund.return_tracking_url && (
                <a
                  href={refund.return_tracking_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#f25c05] font-bold hover:underline inline-flex items-center gap-1 pt-1"
                >
                  <IconExternalLink className="w-3.5 h-3.5" />
                  <span>Ver rastreo en la agencia ↗</span>
                </a>
              )}
            </div>
          ) : (
            <p className="text-slate-500 pt-1">
              Pendiente de registro de despacho por parte del comprador.
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
              <IconCheck className="w-3.5 h-3.5" />
            ) : (
              <IconBuildingWarehouse className="w-3.5 h-3.5" />
            ),
            badgeLabel: "2. Almacén Central iubizon (Chorrillos, Lima)",
            badgeColor: "orange" as const,
            content: (
              <div className="bg-orange-50/60 border border-orange-200 rounded-xl p-3.5 space-y-2 text-xs">
                <span className="text-[9px] font-black text-[#f25c05] bg-orange-100/80 border border-orange-200 px-2 py-0.5 rounded uppercase tracking-wider">
                  2. Almacén Central iubizon (Chorrillos, Lima)
                </span>

                <p className="text-[11px] text-slate-600 font-medium">
                  Dirección: Calle las acacias, Pje. los Jazmines 181,
                  Chorrillos, Lima (RUC: 20614600374)
                </p>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-orange-200/60">
                  <div>
                    <p className="font-bold text-[#112237] text-xs">
                      Estado Recepción:{" "}
                      {isReceived
                        ? "✓ Recepcionado en Almacén Chorrillos"
                        : "En espera de llegada de devolución"}
                    </p>
                  </div>

                  {!isReceived &&
                    isShipped &&
                    onMarkReceivedInWarehouse && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-[10px] font-bold border-amber-400 text-amber-900 bg-amber-50 hover:bg-amber-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          onMarkReceivedInWarehouse(
                            refund.id,
                            refund.company_name || "Vendedor",
                          );
                        }}
                      >
                        <IconBuildingWarehouse className="w-3.5 h-3.5 mr-1 text-amber-700" />
                        <span>Marcar Recepcionado en Almacén</span>
                      </Button>
                    )}
                </div>
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
        <IconCheck className="w-3.5 h-3.5" />
      ) : (
        <IconMapPin className="w-3.5 h-3.5" />
      ),
      badgeLabel: isConsolidated
        ? "3. Retorno al Vendedor"
        : "2. Recepción del Vendedor (Tienda)",
      badgeColor: "slate",
      content: (
        <div className="bg-white rounded-xl p-3 border border-slate-200 space-y-2 text-xs">
          <span className="text-[9px] font-extrabold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded uppercase">
            {isConsolidated
              ? "3. Retorno al Vendedor"
              : "2. Recepción del Vendedor (Tienda)"}
          </span>

          <div className="space-y-1 text-slate-700">
            <p>
              <strong>Vendedor / Tienda:</strong>{" "}
              {refund.company_name || "Vendedor"}
            </p>
            {refund.return_address && (
              <p>
                <strong>Dirección Retorno:</strong> {refund.return_address}
              </p>
            )}
            <p className="pt-1">
              <strong>Estado Final:</strong>{" "}
              {isCompleted
                ? "✓ Devolución completada y reembolso ejecutado por iubizon"
                : isReceived
                  ? "Producto recepcionado. Pendiente de procesar/liquidar pago de reembolso por admin"
                  : "Pendiente de retorno"}
            </p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <DeliveryTimelineStepper
      title="Timeline de Flujo de Devolución"
      titleIcon={<IconRefresh className="w-4 h-4 text-[#f25c05]" />}
      modalTitle={`Timeline Detallado de Devolución — Orden #${refund.order_code}`}
      badgeLabel={
        isConsolidated
          ? "Envío Consolidado por iubizon (3 Pasos)"
          : "Envío Directo del Proveedor (2 Pasos)"
      }
      badgeVariant={isConsolidated ? "slate" : "orange"}
      steps={steps}
      mode="modal"
      viewDetailsLabel="Ver timeline de devolución detallado"
      summaryContent={
        isConsolidated ? (
          <span>
            <strong>Almacén Central iubizon:</strong>{" "}
            {isReceived
              ? "Devolución recepcionada física en Chorrillos"
              : isShipped
                ? "En camino hacia el Almacén Chorrillos"
                : "En espera de despacho por parte del comprador"}
          </span>
        ) : (
          <span>
            <strong>Destino Retorno Vendedor:</strong>{" "}
            {isReceived
              ? "Producto recepcionado por el vendedor"
              : isShipped
                ? "En tránsito hacia la tienda del vendedor"
                : "En espera de despacho del comprador"}
          </span>
        )
      }
    />
  );
}
