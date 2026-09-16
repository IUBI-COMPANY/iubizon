"use client";

import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import {
  CheckCircle2,
  Clock,
  Eye,
  Loader2,
  Package,
  RotateCcw,
  Truck,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { formatShortDateTime } from "@/lib/utils";
import { BuyerRefundTimeline } from "./BuyerRefundTimeline";
import {
  RefundDetailModal,
  RefundDetailData,
} from "./RefundDetailModal";
import { ReturnShipmentModal } from "./ReturnShipmentModal";

interface RefundItemData {
  id: string;
  order_item_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  product_title: string | null;
  product_image: string | null;
  company_name: string | null;
}

interface RefundRequestData {
  id: string;
  status: string;
  type: string;
  reason: string;
  refund_amount: number;
  return_shipping_cost: number | null;
  return_shipping_paid_by: string | null;
  return_address: string | null;
  delivery_type?: string | null;
  buyer_return_tracking: string | null;
  return_courier: string | null;
  return_carrier_phone: string | null;
  return_tracking_url: string | null;
  return_estimated_delivery: string | null;
  admin_notes: string | null;
  refund_method: string | null;
  refund_reference: string | null;
  created_at: string;
  company: {
    name: string;
    legal_name: string | null;
    tax_id: string | null;
    phone: string | null;
  } | null;
  items: RefundItemData[];
}

interface RefundStatusProps {
  orderId: string;
  orderCode?: string;
  refetchKey?: number;
  isSeller?: boolean;
}

export const RefundStatus: React.FC<RefundStatusProps> = ({
  orderId,
  orderCode,
  refetchKey,
  isSeller = false,
}) => {
  const [requests, setRequests] = useState<RefundRequestData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRefundForDetail, setSelectedRefundForDetail] =
    useState<RefundDetailData | null>(null);
  const [returnShipmentModal, setReturnShipmentModal] = useState<{
    isOpen: boolean;
    refundId: string;
  }>({ isOpen: false, refundId: "" });
  const [confirmingReceipt, setConfirmingReceipt] = useState<string | null>(
    null,
  );
  const [refundToConfirm, setRefundToConfirm] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState("");

  const fetchRequests = useCallback(async () => {
    if (!orderId) return;
    try {
      const res = await fetch(
        `/api/orders/refund?orderId=${encodeURIComponent(orderId)}`,
      );
      if (!res.ok) throw new Error("Error al obtener reembolsos");
      const data = await res.json();
      setRequests(data.requests || data.refundRequests || []);
    } catch {
      // Sencillamente no muestra solicitudes si falla
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests, refetchKey]);

  useEffect(() => {
    if (!orderId) return;
    const interval = setInterval(() => {
      fetchRequests();
    }, 30_000);
    return () => clearInterval(interval);
  }, [orderId, fetchRequests]);

  const handleConfirmReceipt = async (refundId: string) => {
    setConfirmingReceipt(refundId);
    setConfirmError("");
    try {
      const res = await fetch("/api/orders/refund", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refundId, action: "confirm_return" }),
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error || "Error al confirmar recepción");
      await fetchRequests();
    } catch (err: unknown) {
      setConfirmError(
        err instanceof Error ? err.message : "Error al confirmar",
      );
    } finally {
      setConfirmingReceipt(null);
      setRefundToConfirm(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl border border-[#e2e8f0] p-6 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-[#f25c05]" />
          <span className="text-xs text-[#64748b]">
            Cargando estado de reembolso...
          </span>
        </div>
      </div>
    );
  }

  if (error) return null;
  if (requests.length === 0) return null;

  const statusConfig: Record<
    string,
    {
      label: string;
      icon: React.ReactNode;
      badgeVariant: "warning" | "success" | "pro" | "danger" | "secondary";
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
      badgeVariant: "danger",
    },
    refunded: {
      label: "Reembolsado",
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
      badgeVariant: "success",
    },
  };

  const formatDate = (dateStr: string) => formatShortDateTime(dateStr);

  return (
    <>
      <div className="space-y-4">
        {/* Cabecera Principal de la Sección */}
        <div className="flex items-center justify-between pb-1">
          <h2 className="text-sm font-extrabold text-[#112237] flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-[#f25c05]" />
            <span>
              Estado de Reembolso{requests.length > 1 ? "s" : ""} (
              {requests.length})
            </span>
          </h2>
        </div>

        {/* Tarjetas Minimalistas de Reembolso */}
        {requests.map((req, idx) => {
          const cfg = statusConfig[req.status] || statusConfig.pending;
          const refCode = `REF-${req.id.slice(0, 8).toUpperCase()}`;
          const totalUnits = req.items.reduce(
            (acc, it) => acc + (it.quantity || 1),
            0,
          );

          const refundDetailData: RefundDetailData = {
            id: req.id,
            orderCode,
            status: req.status,
            type: req.type,
            reason: req.reason,
            refundAmount: req.refund_amount,
            returnShippingCost: req.return_shipping_cost,
            returnShippingPaidBy: req.return_shipping_paid_by,
            returnAddress: req.return_address,
            deliveryType: req.delivery_type,
            buyerReturnTracking: req.buyer_return_tracking,
            returnCourier: req.return_courier,
            returnCarrierPhone: req.return_carrier_phone,
            returnTrackingUrl: req.return_tracking_url,
            returnEstimatedDelivery: req.return_estimated_delivery,
            adminNotes: req.admin_notes,
            refundMethod: req.refund_method,
            refundReference: req.refund_reference,
            createdAt: req.created_at,
            company: req.company,
            items: req.items.map((it) => ({
              id: it.id,
              order_item_id: it.order_item_id,
              title: it.product_title || "Producto",
              price: it.unit_price,
              quantity: it.quantity,
              subtotal: it.subtotal,
              image: it.product_image,
              companyName: it.company_name,
            })),
          };

          return (
            <div
              key={req.id}
              className="bg-white rounded-3xl border border-[#e2e8f0] p-6 shadow-xs space-y-4"
            >
              {/* 1. Cabecera del Reembolso */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#f1f5f9]">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-[#112237] text-white flex items-center justify-center text-xs font-black shrink-0">
                    {idx + 1}
                  </span>
                  <div>
                    <div className="flex items-center gap-2 text-sm font-extrabold text-[#112237]">
                      <span>
                        {req.type === "full"
                          ? "Reembolso Total"
                          : `Reembolso (${idx + 1} de ${requests.length})`}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">
                        · {totalUnits} {totalUnits === 1 ? "unidad" : "unidades"}
                      </span>
                    </div>

                    {/* Subtítulo con Monto y Fecha */}
                    <p className="text-xs text-slate-500 mt-0.5">
                      <strong className="text-[#f25c05] font-extrabold">
                        S/ {Number(req.refund_amount).toFixed(2)}
                      </strong>{" "}
                      · Solicitado el {formatDate(req.created_at)}
                    </p>
                  </div>
                </div>

                {/* Badge de Estado del Reembolso */}
                <div>
                  <Badge
                    variant={cfg.badgeVariant}
                    className="font-bold text-xs px-3 py-1 uppercase flex items-center gap-1"
                  >
                    {cfg.icon}
                    {cfg.label}
                  </Badge>
                </div>
              </div>

              {/* 2. Stepper Timeline de Reembolso */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <BuyerRefundTimeline
                  status={req.status}
                  createdAt={req.created_at}
                  estimatedDelivery={req.return_estimated_delivery}
                  courier={req.return_courier}
                  refundAmount={req.refund_amount}
                />
              </div>

              {/* 3. Productos en este Reembolso (Píldoras Compactas) */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider block">
                  {req.items.length === 1
                    ? "Producto en este reembolso:"
                    : `Productos en este reembolso (${req.items.length}):`}
                </span>
                <div className="flex flex-wrap gap-2">
                  {req.items.map((item) => (
                    <div
                      key={item.id || item.order_item_id}
                      className="bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#112237] flex items-center gap-2 shadow-2xs"
                    >
                      {item.product_image ? (
                        <div className="relative w-6 h-6 rounded-md overflow-hidden shrink-0 border border-slate-100">
                          <Image
                            src={item.product_image}
                            alt={item.product_title || "Producto"}
                            fill
                            sizes="24px"
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                          <Package className="w-3.5 h-3.5" />
                        </div>
                      )}
                      <span className="line-clamp-1 max-w-[200px]">
                        {item.product_title || "Producto"}
                      </span>
                      <span className="font-extrabold text-[#f25c05] bg-orange-50 px-1.5 py-0.5 rounded-md text-[11px]">
                        x{item.quantity || 1} un.
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Barra Inferior con Reference ID, Acciones y Ver Detalle */}
              <div className="pt-3 border-t border-[#f1f5f9] flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="font-mono font-bold text-[11px] text-[#f25c05] bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-md">
                    {refCode}
                  </span>
                  {req.return_courier && (
                    <span className="text-[11px] font-semibold text-[#64748b] truncate uppercase">
                      · {req.return_courier}
                    </span>
                  )}
                  {req.buyer_return_tracking && (
                    <span className="text-[11px] font-mono text-slate-500 truncate">
                      ({req.buyer_return_tracking})
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Botón de Comprador para Registrar Envío de Retorno */}
                  {!isSeller && req.status === "approved" && (
                    <Button
                      size="sm"
                      className="bg-[#f25c05] hover:bg-[#d94d04] text-white font-bold text-xs px-3 py-1.5 rounded-xl cursor-pointer flex items-center gap-1"
                      onClick={() =>
                        setReturnShipmentModal({
                          isOpen: true,
                          refundId: req.id,
                        })
                      }
                    >
                      <Truck className="w-3.5 h-3.5 mr-1" />
                      <span>Registrar Envío</span>
                    </Button>
                  )}

                  {/* Botón de Vendedor para Confirmar Recepción Física */}
                  {isSeller && req.status === "return_in_transit" && (
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-1.5 rounded-xl cursor-pointer flex items-center gap-1"
                      onClick={() => setRefundToConfirm(req.id)}
                      disabled={confirmingReceipt === req.id}
                    >
                      {confirmingReceipt === req.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      )}
                      <span>Confirmar Recepción</span>
                    </Button>
                  )}

                  {/* Botón Ver Detalle (Abre RefundDetailModal) */}
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedRefundForDetail(refundDetailData)}
                    className="border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs px-3 py-1.5 rounded-xl cursor-pointer flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-500" />
                    <span>Ver Detalle</span>
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de Detalle Completo del Reembolso */}
      <RefundDetailModal
        isOpen={Boolean(selectedRefundForDetail)}
        onClose={() => setSelectedRefundForDetail(null)}
        refund={selectedRefundForDetail}
        isBuyer={!isSeller}
        isSeller={isSeller}
        onOpenReturnShipment={(refundId) =>
          setReturnShipmentModal({ isOpen: true, refundId })
        }
        onConfirmReceiptPrompt={(refundId) => setRefundToConfirm(refundId)}
      />

      {/* Modal de Confirmación de Recepción por el Vendedor */}
      <ConfirmModal
        open={Boolean(refundToConfirm)}
        onOpenChange={(open) => {
          if (!open && !confirmingReceipt) setRefundToConfirm(null);
        }}
        title="Confirmar Recepción del Producto"
        description="¿Confirmas que has recibido físicamente el producto devuelto a entera satisfacción? Tras confirmar, iubizon procederá a revisar y liquidar el reembolso."
        confirmLabel="Sí, Confirmar Recepción"
        cancelLabel="Cancelar"
        variant="success"
        isLoading={Boolean(confirmingReceipt)}
        onConfirm={async () => {
          if (refundToConfirm) {
            await handleConfirmReceipt(refundToConfirm);
          }
        }}
      />

      {/* Modal para Registrar Envío de Devolución */}
      <ReturnShipmentModal
        isOpen={returnShipmentModal.isOpen}
        onClose={() => setReturnShipmentModal({ isOpen: false, refundId: "" })}
        refundId={returnShipmentModal.refundId}
        onSuccess={() => {
          fetchRequests();
        }}
      />
    </>
  );
};
