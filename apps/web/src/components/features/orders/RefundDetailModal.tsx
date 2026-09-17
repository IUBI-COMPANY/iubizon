"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Building2,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  MapPin,
  Package,
  Phone,
  RotateCcw,
  ShieldCheck,
  Truck,
  XCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { BuyerRefundTimeline } from "@/components/features/orders/BuyerRefundTimeline";
import { formatShortDateTime, formatShortDateWithPeriod } from "@/lib/utils";

export interface RefundDetailItem {
  id: string;
  order_item_id?: string;
  productId?: string;
  title: string;
  price: number;
  quantity: number;
  subtotal: number;
  image?: string | null;
  companyName?: string | null;
}

export interface RefundDetailData {
  id: string;
  orderCode?: string;
  status: string; // 'pending' | 'approved' | 'return_in_transit' | 'return_received' | 'refunded' | 'rejected'
  type: string; // 'full' | 'partial'
  reason: string;
  refundAmount: number;
  returnShippingCost?: number | null;
  returnShippingPaidBy?: string | null;
  returnAddress?: string | null;
  deliveryType?: string | null; // 'complete' | 'progressive'
  buyerReturnTracking?: string | null;
  returnCourier?: string | null;
  returnCarrierPhone?: string | null;
  returnTrackingUrl?: string | null;
  returnEstimatedDelivery?: string | null;
  adminNotes?: string | null;
  refundMethod?: string | null;
  refundReference?: string | null;
  createdAt: string;
  deliveredAt?: string | null;
  company?: {
    name: string;
    legal_name?: string | null;
    tax_id?: string | null;
    phone?: string | null;
  } | null;
  items: RefundDetailItem[];
}

interface RefundDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  refund: RefundDetailData | null;
  isBuyer?: boolean;
  isSeller?: boolean;
  onOpenReturnShipment?: (refundId: string) => void;
  onConfirmReceiptPrompt?: (refundId: string) => void;
}

function formatDate(isoString: string | null | undefined) {
  if (!isoString) return "Por confirmar";
  return formatShortDateTime(isoString);
}

export function RefundDetailModal({
  isOpen,
  onClose,
  refund,
  isBuyer = true,
  isSeller = false,
  onOpenReturnShipment,
  onConfirmReceiptPrompt,
}: RefundDetailModalProps) {
  const [copiedTracking, setCopiedTracking] = useState(false);

  if (!refund) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTracking(true);
    setTimeout(() => setCopiedTracking(false), 2000);
  };

  const statusConfig: Record<
    string,
    {
      label: string;
      icon: React.ReactNode;
      badgeVariant: "warning" | "success" | "pro" | "destructive" | "secondary";
    }
  > = {
    pending: {
      label: "En revisión",
      icon: <Clock className="w-3.5 h-3.5" />,
      badgeVariant: "warning",
    },
    approved: {
      label: "Aprobado",
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
      badgeVariant: "success",
    },
    return_in_transit: {
      label: "En camino de vuelta",
      icon: <Truck className="w-3.5 h-3.5" />,
      badgeVariant: "pro",
    },
    return_received: {
      label: "Devuelto",
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
      badgeVariant: "success",
    },
    rejected: {
      label: "Rechazado",
      icon: <XCircle className="w-3.5 h-3.5" />,
      badgeVariant: "destructive",
    },
    refunded: {
      label: "Reembolsado",
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
      badgeVariant: "success",
    },
  };

  const currentStatus = statusConfig[refund.status] || statusConfig.pending;
  const isConsolidated = refund.deliveryType === "complete";
  const refCode = `REF-${refund.id.slice(0, 8).toUpperCase()}`;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto p-6 rounded-3xl">
        <DialogHeader className="border-b border-[#f1f5f9] pb-3">
          <div className="flex items-center justify-between gap-3 pr-6">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-orange-50 text-[#f25c05] flex items-center justify-center">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-black text-[#112237]">
                  {refund.type === "full"
                    ? "Reembolso Completo"
                    : "Reembolso Parcial"}
                </DialogTitle>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                  {refund.orderCode && (
                    <span>Orden #{refund.orderCode} · </span>
                  )}
                  <span className="font-mono text-[#f25c05]">{refCode}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-extrabold text-[#f25c05]">
                S/ {Number(refund.refundAmount).toFixed(2)}
              </span>
              <Badge
                variant={currentStatus.badgeVariant}
                className="font-bold text-xs px-2.5 py-0.5 uppercase flex items-center gap-1"
              >
                {currentStatus.icon}
                {currentStatus.label}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* 1. Stepper Horizontal */}
          <div className="bg-[#f8fafc] rounded-2xl p-3.5 border border-[#e2e8f0]">
            <BuyerRefundTimeline
              status={refund.status}
              createdAt={refund.createdAt}
              estimatedDelivery={refund.returnEstimatedDelivery}
              deliveredAt={refund.deliveredAt}
              courier={refund.returnCourier}
              refundAmount={refund.refundAmount}
            />
          </div>

          {/* 2. Modalidad de Retorno y Motivo */}
          <div className="bg-[#f8fafc] rounded-2xl p-4 border border-[#e2e8f0] space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider">
                Modalidad de Devolución
              </span>
              <span className="text-[10px] font-extrabold text-slate-700 bg-slate-200/80 px-2 py-0.5 rounded">
                {isConsolidated
                  ? "Vía Almacén Central iubizon (3 Pasos)"
                  : "Retorno Directo a Tienda Vendedor (2 Pasos)"}
              </span>
            </div>

            <p className="text-[11px] text-[#334155] bg-white p-2.5 rounded-xl border border-slate-200/80">
              <strong className="text-[#112237] block mb-0.5">
                Motivo de la solicitud:
              </strong>
              &quot;{refund.reason}&quot;
            </p>

            {refund.adminNotes && (
              <p className="text-[11px] text-slate-600 bg-amber-50/60 p-2.5 rounded-xl border border-amber-200/60">
                <strong className="text-amber-900 block mb-0.5">
                  Notas de Soporte iubizon:
                </strong>
                {refund.adminNotes}
              </p>
            )}
          </div>

          {/* 3. Datos de Despacho de Devolución (Visible si está en tránsito o devuelto) */}
          {(refund.status === "return_in_transit" ||
            refund.status === "return_received" ||
            refund.status === "refunded") &&
            refund.buyerReturnTracking && (
              <div className="bg-[#f8fafc] rounded-2xl p-4 border border-[#e2e8f0] space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider block">
                    Datos del Despacho de Retorno
                  </span>
                  <span className="font-mono font-bold text-[11px] text-[#f25c05] bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-md">
                    {refund.returnCourier || "Movilidad Propia"}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-500 font-medium block text-[11px]">
                      N° de Guía / Tracking de Retorno:
                    </span>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="font-mono font-bold text-[#112237] bg-white border border-slate-200 px-2 py-0.5 rounded-lg select-all">
                        {refund.buyerReturnTracking}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(refund.buyerReturnTracking!)}
                        className="p-1 text-slate-400 hover:text-[#f25c05] transition-colors rounded hover:bg-slate-200 cursor-pointer"
                        title="Copiar Tracking"
                      >
                        {copiedTracking ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {refund.returnEstimatedDelivery && (
                    <div>
                      <span className="text-slate-500 font-medium block text-[11px]">
                        Llegada Estimada:
                      </span>
                      <span className="font-extrabold text-[#112237] mt-1 block">
                        {formatShortDateWithPeriod(
                          refund.returnEstimatedDelivery,
                        )}
                      </span>
                    </div>
                  )}

                  {refund.returnCarrierPhone && (
                    <div>
                      <span className="text-slate-500 font-medium block text-[11px]">
                        Teléfono de Contacto:
                      </span>
                      <a
                        href={`tel:${refund.returnCarrierPhone}`}
                        className="font-bold text-[#f25c05] hover:underline inline-flex items-center gap-1 mt-1"
                      >
                        <Phone className="w-3 h-3" />
                        <span>{refund.returnCarrierPhone}</span>
                      </a>
                    </div>
                  )}

                  {refund.returnTrackingUrl && (
                    <div>
                      <span className="text-slate-500 font-medium block text-[11px]">
                        Rastreo en Línea:
                      </span>
                      <a
                        href={refund.returnTrackingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bold text-[#f25c05] hover:underline inline-flex items-center gap-1 mt-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Ver seguimiento de agencia ↗</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

          {/* 4. Dirección de Retorno y Destinatario */}
          {refund.returnAddress && (
            <div className="bg-[#f8fafc] rounded-2xl p-4 border border-[#e2e8f0] space-y-2.5 text-xs">
              <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider block">
                Punto de Recepción de la Devolución
              </span>

              {refund.company ? (
                <div className="flex items-start gap-2 text-[11px]">
                  <Building2 className="w-4 h-4 text-[#f25c05] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#112237] block">
                      {refund.company.legal_name || refund.company.name}
                    </strong>
                    <span className="text-[10px] text-slate-500">
                      {refund.company.tax_id && `RUC: ${refund.company.tax_id}`}
                      {refund.company.tax_id && refund.company.phone && " · "}
                      {refund.company.phone && `Tel: ${refund.company.phone}`}
                    </span>
                  </div>
                </div>
              ) : null}

              <div className="flex items-start gap-2 text-[11px]">
                <MapPin className="w-4 h-4 text-[#f25c05] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#112237] block">Dirección:</strong>
                  <span className="text-slate-700">{refund.returnAddress}</span>
                </div>
              </div>

              {refund.returnShippingCost && (
                <div className="flex items-center justify-between bg-white rounded-lg px-2.5 py-1.5 border border-slate-200 text-xs">
                  <span className="font-semibold text-slate-700">
                    Costo de envío de devolución:
                  </span>
                  <span className="font-black text-[#f25c05]">
                    S/ {Number(refund.returnShippingCost).toFixed(2)}
                  </span>
                </div>
              )}

              {refund.returnShippingPaidBy === "seller" && (
                <p className="text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg p-2">
                  ✓ El costo de envío corre por cuenta del proveedor.
                </p>
              )}
              {refund.returnShippingPaidBy === "buyer" && (
                <p className="text-[10px] text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-2">
                  El envío de devolución corre por cuenta del comprador.
                </p>
              )}
            </div>
          )}

          {/* 5. Productos incluidos en el Reembolso */}
          <div className="bg-[#f8fafc] rounded-2xl p-4 border border-[#e2e8f0] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider block">
                {refund.items.length === 1
                  ? "Producto a Reembolsar"
                  : `Productos a Reembolsar (${refund.items.length})`}
              </span>
              <span className="text-xs font-black text-[#112237]">
                Total: S/ {Number(refund.refundAmount).toFixed(2)}
              </span>
            </div>

            <div className="divide-y divide-slate-200">
              {refund.items.map((item) => (
                <div
                  key={item.id || item.order_item_id}
                  className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0"
                >
                  <div className="relative w-11 h-11 bg-white rounded-xl border border-slate-200 overflow-hidden shrink-0 shadow-2xs">
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
                      <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-100">
                        <Package className="w-5 h-5" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-[#112237] line-clamp-1">
                      {item.title}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                      <span>Cant: {item.quantity} un.</span>
                      <span>·</span>
                      <span>S/ {Number(item.price).toFixed(2)} c/u</span>
                      {item.companyName && (
                        <>
                          <span>·</span>
                          <span className="text-[#f25c05] font-semibold">
                            {item.companyName}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <span className="text-xs font-black text-[#112237] shrink-0">
                    S/ {Number(item.subtotal).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 6. Liquidación de Reembolso (si está liquidado) */}
          {refund.status === "refunded" && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 text-xs text-emerald-900 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Reembolso Liquidado Exitosamente</span>
              </div>
              <p className="text-[11px] text-emerald-700">
                Monto devuelto:{" "}
                <strong>S/ {Number(refund.refundAmount).toFixed(2)}</strong>
                {refund.refundMethod && (
                  <span>
                    {" "}
                    · Método:{" "}
                    {refund.refundMethod === "niubiz"
                      ? "Pasarela Niubiz (Extorno a Tarjeta)"
                      : refund.refundMethod === "bank_transfer"
                        ? "Transferencia Bancaria"
                        : refund.refundMethod === "yape"
                          ? "Yape"
                          : refund.refundMethod === "plin"
                            ? "Plin"
                            : refund.refundMethod}
                  </span>
                )}
                {refund.refundReference && (
                  <span className="block font-mono mt-0.5">
                    Ref. Transacción: {refund.refundReference}
                  </span>
                )}
              </p>
            </div>
          )}

          {/* 7. Acciones Principales dentro del Modal */}
          <div className="pt-2 flex items-center justify-end gap-2">
            {!isSeller &&
              isBuyer &&
              refund.status === "approved" &&
              onOpenReturnShipment && (
                <Button
                  size="sm"
                  className="bg-[#f25c05] hover:bg-[#d94d04] text-white font-bold text-xs px-4 py-2 rounded-xl cursor-pointer"
                  onClick={() => {
                    onClose();
                    onOpenReturnShipment(refund.id);
                  }}
                >
                  <Truck className="w-4 h-4 mr-1.5" />
                  <span>Registrar Despacho de Devolución</span>
                </Button>
              )}

            {isSeller &&
              refund.status === "return_in_transit" &&
              onConfirmReceiptPrompt && (
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl cursor-pointer"
                  onClick={() => {
                    onClose();
                    onConfirmReceiptPrompt(refund.id);
                  }}
                >
                  <CheckCircle2 className="w-4 h-4 mr-1.5" />
                  <span>Confirmar Recepción del Producto</span>
                </Button>
              )}

            <Button
              size="sm"
              variant="outline"
              onClick={onClose}
              className="text-slate-700 font-bold text-xs px-4 py-2 rounded-xl"
            >
              Cerrar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
