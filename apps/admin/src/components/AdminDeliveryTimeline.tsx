import {
  IconCheck,
  IconBuildingWarehouse,
  IconMapPin,
  IconExternalLink,
  IconTruck,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

export interface AdminPackageItem {
  id?: string;
  quantity: number;
  unit_price: number;
  subtotal?: number;
  product?: {
    title?: string;
  };
}

export interface AdminPackage {
  id: string;
  status: string;
  delivery_type?: string | null;
  courier?: string | null;
  tracking_number?: string | null;
  tracking_url?: string | null;
  carrier_phone?: string | null;
  estimated_delivery?: string | null;
  company?: {
    name?: string | null;
  } | null;
  items?: AdminPackageItem[];
}

export interface AdminOrder {
  id: string;
  order_code: string;
  status: string;
  total_amount: number;
  created_at?: string;
  buyer?: {
    name?: string | null;
    email?: string | null;
    phone?: string | null;
  } | null;
  shipping?: {
    name?: string | null;
    phone?: string | null;
    address?: string | null;
    district?: string | null;
    province?: string | null;
    department?: string | null;
  } | null;
  packages?: AdminPackage[];
}

interface AdminDeliveryTimelineProps {
  order: AdminOrder;
  onMarkReceived: (packageId: string, companyName: string) => void;
  onOpenDispatchModal: (pkg: AdminPackage) => void;
}

import {
  DeliveryTimelineStepper,
  TimelineStepNode,
} from "@/components/ui/delivery-timeline-stepper";

export function AdminDeliveryTimeline({
  order,
  onMarkReceived,
  onOpenDispatchModal,
}: AdminDeliveryTimelineProps) {
  const isConsolidated = order.packages?.some(
    (p: any) => p.delivery_type === "complete",
  );
  const allReceived = order.packages?.every(
    (p: any) =>
      p.status === "received_in_warehouse" ||
      p.status === "shipped" ||
      p.status === "delivered" ||
      p.status === "completed",
  );
  const isShipped =
    order.status === "shipped" ||
    order.status === "delivered" ||
    order.status === "completed";
  const isDelivered =
    order.status === "delivered" || order.status === "completed";

  const steps: TimelineStepNode[] = [
    {
      id: "origin",
      label: "Origen",
      status: "completed",
      badgeLabel: "Punto de Origen (Proveedor / Vendedor)",
      badgeColor: "emerald",
      content: (
        <div className="bg-white rounded-xl p-3 border border-slate-200 space-y-2 text-xs">
          <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded uppercase">
            Punto de Origen (Proveedor / Vendedor)
          </span>
          <div className="space-y-1.5 pt-1">
            {order.packages?.map((pkg: any, idx: number) => (
              <div key={pkg.id || idx} className="text-xs space-y-0.5">
                <p className="font-bold text-[#112237]">
                  {pkg.company?.name || "Vendedor"}
                </p>
                <p className="text-[11px] text-slate-500">
                  Courier del Proveedor:{" "}
                  {pkg.courier || "Pendiente de despacho"} · Tracking:{" "}
                  {pkg.tracking_number || "Sin guía"}
                </p>
                {pkg.tracking_url && (
                  <a
                    href={pkg.tracking_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#f25c05] font-bold text-[11px] hover:underline inline-flex items-center gap-1"
                  >
                    <IconExternalLink className="w-3 h-3" />
                    <span>Ver rastreo del proveedor ↗</span>
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      ),
    },
    ...(isConsolidated
      ? [
          {
            id: "warehouse",
            label: "Almacén iubizon",
            status: allReceived ? ("completed" as const) : ("current" as const),
            icon: allReceived ? (
              <IconCheck className="w-3.5 h-3.5" />
            ) : (
              <IconBuildingWarehouse className="w-3.5 h-3.5 text-[#f25c05]" />
            ),
            badgeLabel: "Almacén Central iubizon (Chorrillos, Lima)",
            badgeColor: "orange" as const,
            content: (
              <div className="bg-orange-50/60 border border-orange-200 rounded-xl p-3.5 space-y-2 text-xs">
                <span className="text-[9px] font-black text-[#f25c05] bg-orange-100/80 border border-orange-200 px-2 py-0.5 rounded uppercase tracking-wider">
                  Almacén Central iubizon (Chorrillos, Lima)
                </span>

                <p className="text-[11px] text-slate-600 font-medium">
                  Dirección: Calle las acacias, Pje. los Jazmines 181,
                  Chorrillos, Lima (RUC: 20614600374)
                </p>

                <div className="space-y-2 pt-1 border-t border-orange-200/60">
                  {order.packages?.map((pkg: any, idx: number) => {
                    const isPkgReceived =
                      pkg.status === "received_in_warehouse" ||
                      pkg.status === "shipped" ||
                      pkg.status === "delivered" ||
                      pkg.status === "completed";

                    return (
                      <div
                        key={pkg.id || idx}
                        className="flex flex-wrap items-center justify-between gap-2 bg-white p-2.5 rounded-lg border border-orange-200/60"
                      >
                        <div>
                          <p className="font-bold text-[#112237] text-xs">
                            Paquete: {pkg.company?.name}
                          </p>
                          <p className="text-[10px] text-slate-600">
                            Estado:{" "}
                            {isPkgReceived
                              ? "Recepcionado en Almacén"
                              : "En espera de llegada"}
                          </p>
                        </div>

                        {!isPkgReceived && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-[10px] font-bold border-amber-400 text-amber-900 bg-amber-50 hover:bg-amber-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              onMarkReceived(
                                pkg.id,
                                pkg.company?.name || "Vendedor",
                              );
                            }}
                          >
                            <IconBuildingWarehouse className="w-3 h-3 mr-1 text-amber-700" />
                            <span>Marcar Recepcionado</span>
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ),
          },
        ]
      : []),
    {
      id: "destination",
      label: "Destino Cliente",
      status: isDelivered
        ? ("completed" as const)
        : isShipped
          ? ("current" as const)
          : ("pending" as const),
      icon: isDelivered ? (
        <IconCheck className="w-3.5 h-3.5" />
      ) : (
        <IconMapPin className="w-3.5 h-3.5 text-slate-500" />
      ),
      badgeLabel: isConsolidated
        ? "Destino Final Cliente (iubizon realiza el envío final)"
        : "Destino Final Cliente (Envío Directo)",
      badgeColor: "slate",
      content: (
        <div className="bg-white rounded-xl p-3 border border-slate-200 space-y-2 text-xs">
          <span className="text-[9px] font-extrabold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded uppercase">
            {isConsolidated
              ? "Destino Final Cliente (iubizon realiza el envío final)"
              : "Destino Final Cliente (Envío Directo)"}
          </span>

          <div className="space-y-1 text-slate-700">
            <p>
              <strong>Destinatario:</strong>{" "}
              {order.shipping?.name || order.buyer?.name} (
              {order.shipping?.phone || order.buyer?.phone || "Sin tel"})
            </p>
            <p>
              <strong>Dirección:</strong> {order.shipping?.address}
            </p>
            {order.shipping?.district && (
              <p className="text-slate-500">
                Ubigeo:{" "}
                {[
                  order.shipping.district,
                  order.shipping.province,
                  order.shipping.department,
                ]
                  .filter(Boolean)
                  .join(", ")}
              </p>
            )}
          </div>

          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            {order.packages?.map((pkg: any, idx: number) => (
              <div
                key={pkg.id || idx}
                className="w-full flex flex-wrap items-center justify-between gap-2 bg-orange-50/50 p-2.5 rounded-xl border border-orange-200/60"
              >
                <div>
                  <p className="font-bold text-[#112237] text-xs">
                    Despacho Final ({pkg.company?.name}):
                  </p>
                  <p className="text-[10px] text-slate-600">
                    {pkg.courier
                      ? `${pkg.courier} — ${pkg.tracking_number || "Sin guía"}`
                      : "Pendiente de registrar despacho final"}
                  </p>
                </div>
                <Button
                  size="sm"
                  className="h-7 text-[10px] font-bold bg-[#f25c05] hover:bg-[#d94d04] text-white rounded-xl"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenDispatchModal(pkg);
                  }}
                >
                  <IconTruck className="w-3 h-3 mr-1" />
                  <span>Registrar Despacho iubizon ➔ Cliente</span>
                </Button>
              </div>
            ))}
          </div>
        </div>
      ),
    },
  ];

  return (
    <DeliveryTimelineStepper
      title="Timeline de Flujo de Entrega"
      modalTitle={`Timeline Detallado de Flujo de Entrega — Orden #${order.order_code}`}
      badgeLabel={
        isConsolidated
          ? "Envío Consolidado por iubizon"
          : "Envío Directo del Proveedor"
      }
      badgeVariant={isConsolidated ? "slate" : "orange"}
      steps={steps}
      mode="modal"
      viewDetailsLabel="Ver timeline de envío detallado"
      summaryContent={
        isConsolidated ? (
          <span>
            <strong>Almacén Central iubizon:</strong>{" "}
            {allReceived
              ? "Paquetes recepcionados en Chorrillos"
              : "En espera de recepción física de proveedores"}
          </span>
        ) : (
          <span>
            <strong>Destino Final:</strong>{" "}
            {order.shipping?.address || "Dirección del cliente"}
          </span>
        )
      }
    />
  );
}
