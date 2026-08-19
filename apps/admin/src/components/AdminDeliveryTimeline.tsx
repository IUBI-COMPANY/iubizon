"use client";

import { useState } from "react";
import {
  IconCheck,
  IconBuildingWarehouse,
  IconMapPin,
  IconTruck,
  IconExternalLink,
  IconEye,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

export function AdminDeliveryTimeline({
  order,
  onMarkReceived,
  onOpenDispatchModal,
}: AdminDeliveryTimelineProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  return (
    <div className="bg-[#f8fafc] border border-slate-200 rounded-2xl p-4 space-y-3 text-xs">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
        <p className="font-extrabold text-[#112237] flex items-center gap-1.5 text-xs">
          <IconTruck className="w-4 h-4 text-[#f25c05]" />
          <span>Timeline de Flujo de Entrega</span>
        </p>
        <Badge
          className={
            isConsolidated
              ? "bg-slate-100 text-slate-800 border-slate-200 font-extrabold text-[10px]"
              : "bg-orange-50 text-[#f25c05] border-orange-200 font-extrabold text-[10px]"
          }
        >
          {isConsolidated
            ? "Envío Consolidado por iubizon"
            : "Envío Directo del Proveedor"}
        </Badge>
      </div>

      {/* Resumen Compacto de la Ruta (Vista en Card) */}
      <div className="bg-white rounded-xl p-3 border border-slate-200 space-y-2.5">
        {/* Stepper Horizontal Compacto */}
        <div className="flex items-center justify-between text-[11px] font-bold">
          <div className="flex items-center gap-1 text-emerald-700">
            <IconCheck className="w-3.5 h-3.5 bg-emerald-100 rounded-full p-0.5 shrink-0" />
            <span>Origen</span>
          </div>
          <div className="h-0.5 flex-1 mx-2 bg-slate-200 rounded" />
          <div
            className={`flex items-center gap-1 ${
              isConsolidated
                ? allReceived
                  ? "text-emerald-700 font-bold"
                  : "text-[#f25c05] font-bold animate-pulse"
                : "text-slate-400"
            }`}
          >
            {isConsolidated &&
              (allReceived ? (
                <IconCheck className="w-3.5 h-3.5 bg-emerald-100 rounded-full p-0.5 shrink-0" />
              ) : (
                <IconBuildingWarehouse className="w-3.5 h-3.5 shrink-0" />
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
              <IconCheck className="w-3.5 h-3.5 bg-emerald-100 rounded-full p-0.5 shrink-0" />
            ) : (
              <IconMapPin className="w-3.5 h-3.5 shrink-0" />
            )}
            <span>Destino Cliente</span>
          </div>
        </div>

        {/* Banner de Estado Resumido & Botón para abrir Modal */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
          <p className="text-[11px] text-slate-700 font-medium flex-1">
            {isConsolidated ? (
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
            )}
          </p>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsModalOpen(true)}
            className="h-7 text-[11px] font-bold text-[#f25c05] hover:text-[#d94d04] hover:bg-orange-50 px-2.5 rounded-lg flex items-center gap-1 shrink-0"
          >
            <IconEye className="w-3.5 h-3.5" />
            <span>Ver timeline de envío detallado</span>
          </Button>
        </div>
      </div>

      {/* Modal / Dialog del Timeline Detallado */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto bg-white rounded-3xl p-6 border border-slate-200">
          <DialogHeader className="border-b border-slate-100 pb-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <DialogTitle className="text-base font-black text-[#112237] flex items-center gap-2">
                <IconTruck className="w-5 h-5 text-[#f25c05]" />
                <span>
                  Timeline Detallado de Flujo de Entrega — Orden #
                  {order.order_code}
                </span>
              </DialogTitle>
              <Badge
                className={
                  isConsolidated
                    ? "bg-slate-100 text-slate-800 border-slate-200 font-extrabold text-[10px]"
                    : "bg-orange-50 text-[#f25c05] border-orange-200 font-extrabold text-[10px]"
                }
              >
                {isConsolidated
                  ? "Envío Consolidado por iubizon"
                  : "Envío Directo del Proveedor"}
              </Badge>
            </div>
          </DialogHeader>

          {/* Timeline Vertical Detallado para Admin dentro del Modal */}
          <div className="relative pl-6 space-y-5 pt-3 before:absolute before:left-2.5 before:top-5 before:bottom-3 before:w-0.5 before:bg-slate-300">
            {/* NODO 1: Proveedor(es) */}
            <div className="relative">
              <div className="absolute -left-[29px] top-0 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center ring-4 ring-[#f8fafc] shadow-xs">
                <IconCheck className="w-3.5 h-3.5" />
              </div>
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
            </div>

            {/* NODO 2 (SOLO CONSOLIDADO): Almacén Central iubizon */}
            {isConsolidated && (
              <div className="relative">
                <div
                  className={`absolute -left-[29px] top-0 w-6 h-6 rounded-full flex items-center justify-center ring-4 ring-[#f8fafc] shadow-xs ${
                    allReceived
                      ? "bg-emerald-500 text-white"
                      : "bg-[#f25c05] text-white animate-pulse"
                  }`}
                >
                  {allReceived ? (
                    <IconCheck className="w-3.5 h-3.5" />
                  ) : (
                    <IconBuildingWarehouse className="w-3.5 h-3.5" />
                  )}
                </div>

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
                      const isReceived =
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
                              {isReceived
                                ? "Recepcionado en Almacén"
                                : "En espera de llegada"}
                            </p>
                          </div>

                          {!isReceived && (
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
              </div>
            )}

            {/* NODO 3: Destino Final del Comprador */}
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
                  <IconCheck className="w-3.5 h-3.5" />
                ) : (
                  <IconMapPin className="w-3.5 h-3.5" />
                )}
              </div>

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
                          setIsModalOpen(false);
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
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
