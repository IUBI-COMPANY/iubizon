"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Check,
  Copy,
  ExternalLink,
  Package,
  Pencil,
  Phone,
  Printer,
  Truck,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { BuyerDeliveryTimeline } from "@/components/features/orders/BuyerDeliveryTimeline";
import {
  ShippingLabelModal,
  ShippingLabelData,
} from "@/components/features/orders/ShippingLabelModal";
import {
  EditSingleShipmentModal,
  EditSingleShipmentData,
} from "@/components/features/orders/EditSingleShipmentModal";
import {
  formatTrackingId,
  isOwnMobilityCourier,
} from "@/lib/utils/tracking";

export interface PackageDetailItem {
  id: string;
  productId: string;
  title: string;
  price: number;
  quantity: number;
  subtotal: number;
  image?: string | null;
}

export interface PackageDetailData {
  packageId: string;
  packageNumber?: number;
  totalPackages?: number;
  trackingId?: string;
  orderCode?: string;
  companyName?: string | null;
  companyLegalName?: string | null;
  companyTaxId?: string | null;
  companyPhone?: string | null;
  companyLocation?: string | null;
  buyerName?: string;
  buyerDocumentType?: string | null;
  buyerDocumentNumber?: string | null;
  buyerPhone?: string | null;
  destinationAddress?: string | null;
  destinationDistrict?: string | null;
  destinationProvince?: string | null;
  destinationDepartment?: string | null;
  destinationReference?: string | null;
  status: string;
  courier?: string | null;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
  carrierPhone?: string | null;
  estimatedDelivery?: string | null;
  deliveredAt?: string | null;
  createdAt?: string | null;
  items: PackageDetailItem[];
}

interface PackageDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  pkg: PackageDetailData | null;
  onEditSuccess?: () => void;
}

function formatDate(isoString: string | null | undefined) {
  if (!isoString) return "Por confirmar";
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

export function PackageDetailModal({
  isOpen,
  onClose,
  pkg,
  onEditSuccess,
}: PackageDetailModalProps) {
  const [copiedTracking, setCopiedTracking] = useState(false);
  const [isLabelModalOpen, setIsLabelModalOpen] = useState(false);
  const [isEditShipmentOpen, setIsEditShipmentOpen] = useState(false);

  if (!pkg) return null;

  const isDelivered = pkg.status === "delivered" || pkg.status === "completed";
  const isShipped = pkg.status === "shipped" || isDelivered;
  const isMovilidadPropia =
    isOwnMobilityCourier(pkg.courier) ||
    isOwnMobilityCourier(pkg.trackingNumber);

  const orderCode = pkg.orderCode || "ORD";
  const pkgNumber = pkg.packageNumber || 1;
  const effectiveTrackingId =
    pkg.trackingId || formatTrackingId(orderCode, pkgNumber);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTracking(true);
    setTimeout(() => setCopiedTracking(false), 2000);
  };

  const totalUnits = pkg.items.reduce((acc, i) => acc + (i.quantity || 1), 0);

  const shippingLabelData: ShippingLabelData = {
    orderCode,
    packageNumber: pkgNumber,
    totalPackages: pkg.totalPackages || 1,
    trackingId: effectiveTrackingId,
    courier: pkg.courier,
    carrierTrackingNumber: pkg.trackingNumber,
    carrierPhone: pkg.carrierPhone,
    createdAt: pkg.createdAt,
    estimatedDelivery: pkg.estimatedDelivery,
    companyName: pkg.companyName || "Vendedor",
    companyLegalName: pkg.companyLegalName,
    companyTaxId: pkg.companyTaxId,
    companyPhone: pkg.companyPhone,
    companyLocation: pkg.companyLocation,
    buyerName: pkg.buyerName || "Comprador",
    buyerDocumentType: pkg.buyerDocumentType,
    buyerDocumentNumber: pkg.buyerDocumentNumber,
    buyerPhone: pkg.buyerPhone,
    destinationAddress: pkg.destinationAddress || null,
    destinationDistrict: pkg.destinationDistrict,
    destinationProvince: pkg.destinationProvince,
    destinationDepartment: pkg.destinationDepartment,
    destinationReference: pkg.destinationReference,
    items: pkg.items.map((i) => ({
      id: i.id,
      title: i.title,
      quantity: i.quantity || 1,
    })),
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto p-6 rounded-3xl">
          <DialogHeader className="border-b border-[#f1f5f9] pb-3">
            <div className="flex items-center justify-between gap-3 pr-6">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-orange-50 text-[#f25c05] flex items-center justify-center">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <DialogTitle className="text-base font-black text-[#112237]">
                    {pkg.totalPackages && pkg.totalPackages > 1
                      ? `Guía de Envío (${pkg.packageNumber || 1} de ${pkg.totalPackages})`
                      : "Guía de Envío"}
                  </DialogTitle>
                  {pkg.orderCode && (
                    <span className="text-xs text-slate-500 font-semibold">
                      Orden #{pkg.orderCode} · {effectiveTrackingId}
                    </span>
                  )}
                </div>
              </div>

              <Badge
                variant={isDelivered ? "success" : isShipped ? "pro" : "warning"}
                className="font-bold text-xs px-3 py-1 uppercase"
              >
                {isDelivered
                  ? "Entregado"
                  : isShipped
                    ? "En camino"
                    : "En preparación"}
              </Badge>
            </div>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            {/* Stepper horizontal */}
            <div className="bg-[#f8fafc] rounded-2xl p-3.5 border border-[#e2e8f0]">
              <BuyerDeliveryTimeline
                pkg={{
                  packageId: pkg.packageId,
                  packageNumber: pkg.packageNumber,
                  totalPackages: pkg.totalPackages,
                  companyName: pkg.companyName || null,
                  trackingNumber: pkg.trackingNumber || null,
                  courier: pkg.courier || null,
                  trackingUrl: pkg.trackingUrl || null,
                  estimatedDelivery: pkg.estimatedDelivery || null,
                  deliveredAt: pkg.deliveredAt,
                  createdAt: pkg.createdAt,
                  status: pkg.status,
                }}
                orderCreatedAt={pkg.createdAt || undefined}
                orderDeliveredAt={pkg.deliveredAt}
              />
            </div>

            {/* Información de Transporte */}
            <div className="bg-[#f8fafc] rounded-2xl p-4 border border-[#e2e8f0] space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider block">
                  Datos de Transporte & Despacho
                </span>
                <span className="font-mono font-bold text-[11px] text-[#f25c05] bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-md">
                  {effectiveTrackingId}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-500 font-medium block text-[11px]">
                    Modalidad / Empresa:
                  </span>
                  <span className="font-extrabold text-[#112237] mt-0.5 block">
                    {pkg.courier || "Movilidad Propia"}
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 font-medium block text-[11px]">
                    Llegada Estimada:
                  </span>
                  <span className="font-extrabold text-[#112237] mt-0.5 block">
                    {formatDate(pkg.estimatedDelivery)}
                  </span>
                </div>
              </div>

              {pkg.trackingNumber && (
                <div className="pt-2 border-t border-slate-200/60">
                  <span className="text-slate-500 font-medium block text-[11px]">
                    {isMovilidadPropia
                      ? "Detalles de Movilidad:"
                      : "N° de Guía / Tracking:"}
                  </span>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="font-mono font-bold text-[#112237] bg-white border border-slate-200 px-2.5 py-1 rounded-lg text-xs select-all">
                      {pkg.trackingNumber}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(pkg.trackingNumber!)}
                      className="p-1 text-slate-400 hover:text-[#f25c05] transition-colors rounded hover:bg-slate-200/60 cursor-pointer"
                      title="Copiar Tracking"
                    >
                      {copiedTracking ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>

                    {pkg.trackingUrl && (
                      <a
                        href={pkg.trackingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-bold text-[#f25c05] hover:underline ml-auto cursor-pointer"
                      >
                        <span>Rastrear en Agencia</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              )}

              {pkg.carrierPhone && (
                <div className="pt-2 border-t border-slate-200/60">
                  <span className="text-slate-500 font-medium block text-[11px]">
                    Teléfono de Contacto:
                  </span>
                  <a
                    href={`tel:${pkg.carrierPhone}`}
                    className="font-bold text-emerald-700 hover:underline inline-flex items-center gap-1.5 mt-0.5"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{pkg.carrierPhone}</span>
                  </a>
                </div>
              )}
            </div>

            {/* Productos en este Bulto */}
            <div className="bg-[#f8fafc] rounded-2xl p-4 border border-[#e2e8f0] space-y-2.5">
              <div className="flex items-center justify-between pb-1">
                <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider block">
                  {pkg.items.length === 1
                    ? "Producto en este bulto"
                    : `Productos en este bulto (${pkg.items.length})`}
                </span>
                <span className="text-xs font-bold text-[#64748b]">
                  {totalUnits} {totalUnits === 1 ? "unidad" : "unidades"}
                </span>
              </div>

              <div className="divide-y divide-[#e2e8f0]/80">
                {pkg.items.map((item) => (
                  <div
                    key={item.id}
                    className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative w-11 h-11 bg-white rounded-xl border border-[#e2e8f0] overflow-hidden shrink-0 flex items-center justify-center">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.title}
                            fill
                            sizes="44px"
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <Package className="w-5 h-5 text-[#cbd5e1]" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <span className="font-bold text-xs text-[#112237] block truncate">
                          {item.title}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-extrabold text-xs text-[#112237] bg-white border border-slate-200 px-2.5 py-1 rounded-lg">
                        x{item.quantity || 1} un.
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#f1f5f9] flex items-center justify-between gap-2 flex-wrap">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="text-xs font-bold px-4 py-2 rounded-xl cursor-pointer"
            >
              Cerrar
            </Button>

            <div className="flex items-center gap-2">
              {!isDelivered && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditShipmentOpen(true)}
                  className="border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs px-3.5 py-2 rounded-xl cursor-pointer flex items-center gap-1.5"
                >
                  <Pencil className="w-3.5 h-3.5 text-[#f25c05]" />
                  <span>Editar Guía</span>
                </Button>
              )}

              <Button
                type="button"
                onClick={() => setIsLabelModalOpen(true)}
                className="bg-[#112237] hover:bg-[#1e293b] text-white font-extrabold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Printer className="w-4 h-4 text-[#f25c05]" />
                <span>Imprimir Rótulo</span>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Impresión del Rótulo de Envío */}
      <ShippingLabelModal
        isOpen={isLabelModalOpen}
        onClose={() => setIsLabelModalOpen(false)}
        data={shippingLabelData}
      />

      {/* Modal para Editar Guía Individual */}
      <EditSingleShipmentModal
        isOpen={isEditShipmentOpen}
        onClose={() => setIsEditShipmentOpen(false)}
        shipment={{
          packageId: pkg.packageId,
          packageNumber: pkgNumber,
          totalPackages: pkg.totalPackages || 1,
          orderCode,
          trackingId: effectiveTrackingId,
          courier: pkg.courier,
          trackingNumber: pkg.trackingNumber,
          trackingUrl: pkg.trackingUrl,
          carrierPhone: pkg.carrierPhone,
          estimatedDelivery: pkg.estimatedDelivery,
          status: pkg.status,
          items: pkg.items.map((i) => ({
            id: i.id,
            productId: i.productId,
            title: i.title,
            quantity: i.quantity || 1,
            image: i.image,
          })),
        }}
        onSuccess={() => {
          setIsEditShipmentOpen(false);
          if (onEditSuccess) onEditSuccess();
        }}
      />
    </>
  );
}
