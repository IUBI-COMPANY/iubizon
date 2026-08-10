"use client";

import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { Building2, CheckCircle2, Clock, ExternalLink, Loader2, MapPin, Package, Truck, XCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatShortDateTime, formatShortDateWithPeriod } from "@/lib/utils";

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
  buyer_return_tracking: string | null;
  return_courier: string | null;
  return_tracking_url: string | null;
  return_estimated_delivery: string | null;
  admin_notes: string | null;
  created_at: string;
  items: RefundItemData[];
}

interface RefundStatusProps {
  orderId: string;
  refetchKey?: number;
  isSeller?: boolean;
}

export const RefundStatus: React.FC<RefundStatusProps> = ({ orderId, refetchKey, isSeller = false }) => {
  const [requests, setRequests] = useState<RefundRequestData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tracking, setTracking] = useState("");
  const [returnCourier, setReturnCourier] = useState("");
  const [returnEstDelivery, setReturnEstDelivery] = useState("");
  const [returnTrackUrl, setReturnTrackUrl] = useState("");
  const [updatingTracking, setUpdatingTracking] = useState(false);
  const [trackingError, setTrackingError] = useState("");
  const [confirmingReceipt, setConfirmingReceipt] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState("");

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`/api/orders/refund?orderId=${encodeURIComponent(orderId)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al consultar");
      setRequests(data.requests || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al cargar");
    } finally {
      setLoading(false);
    }
  }, [orderId, refetchKey]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleUpdateTracking = async (refundId: string) => {
    if (!tracking.trim()) return;
    setUpdatingTracking(true);
    setTrackingError("");
    try {
      const res = await fetch("/api/orders/refund", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          refundId,
          action: "register_return",
          buyerReturnTracking: tracking.trim(),
          returnCourier: returnCourier.trim() || null,
          returnTrackingUrl: returnTrackUrl.trim() || null,
          returnEstimatedDelivery: returnEstDelivery || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al actualizar");
      setTracking("");
      setReturnCourier("");
      setReturnEstDelivery("");
      setReturnTrackUrl("");
      await fetchRequests();
    } catch (err: unknown) {
      setTrackingError(err instanceof Error ? err.message : "Error al actualizar");
    } finally {
      setUpdatingTracking(false);
    }
  };

  const handleConfirmReceipt = async (refundId: string) => {
    if (!confirm("¿Confirmas que has recibido el producto devuelto a satisfacción?")) return;
    setConfirmingReceipt(refundId);
    setConfirmError("");
    try {
      const res = await fetch("/api/orders/refund", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refundId, action: "confirm_return" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al confirmar recepción");
      await fetchRequests();
    } catch (err: unknown) {
      setConfirmError(err instanceof Error ? err.message : "Error al confirmar");
    } finally {
      setConfirmingReceipt(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl border border-[#e2e8f0] p-6 shadow-sm space-y-3">
        <div className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin text-[#f25c05]" /><span className="text-xs text-[#64748b]">Cargando estado de reembolso...</span></div>
      </div>
    );
  }

  if (error) return null;
  if (requests.length === 0) return null;

  const statusConfig: Record<string, { label: string; icon: React.ReactNode; className: string }> = {
    pending: { label: "En revisión", icon: <Clock className="w-4 h-4" />, className: "bg-amber-100 text-amber-800 border-amber-200" },
    approved: { label: "Aprobado", icon: <CheckCircle2 className="w-4 h-4" />, className: "bg-emerald-100 text-emerald-800 border-emerald-200" },
    return_in_transit: { label: "En camino de vuelta", icon: <Truck className="w-4 h-4" />, className: "bg-blue-100 text-blue-800 border-blue-200" },
    return_received: { label: "Devuelto", icon: <CheckCircle2 className="w-4 h-4" />, className: "bg-teal-100 text-teal-800 border-teal-200" },
    rejected: { label: "Rechazado", icon: <XCircle className="w-4 h-4" />, className: "bg-red-100 text-red-800 border-red-200" },
    refunded: { label: "Reembolsado", icon: <CheckCircle2 className="w-4 h-4" />, className: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  };

  const formatDate = (dateStr: string) => formatShortDateTime(dateStr);

  return (
    <div className="bg-white rounded-3xl border border-[#e2e8f0] p-6 shadow-sm space-y-5">
      <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-3">
        <h2 className="text-base font-extrabold text-[#112237] flex items-center gap-2">
          <Truck className="w-5 h-5 text-[#f25c05]" />
          <span>Estado de Reembolso{requests.length > 1 ? "s" : ""} ({requests.length})</span>
        </h2>
      </div>

      {requests.map((req, reqIdx) => {
        const cfg = statusConfig[req.status] || statusConfig.pending;

        return (
          <div key={req.id} className={reqIdx > 0 ? "pt-4 border-t border-[#f1f5f9]" : ""}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-[#64748b]">
                  {req.type === "full" ? "Reembolso Total" : "Reembolso Parcial"} · {formatDate(req.created_at)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-[#f25c05]">S/ {Number(req.refund_amount).toFixed(2)}</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${cfg.className} flex items-center gap-1`}>
                  {cfg.icon}{cfg.label}
                </span>
              </div>
            </div>

            <div className="space-y-3 text-xs text-[#334155]">
              <p className="text-[11px] text-[#64748b] italic">{req.reason}</p>

              {req.admin_notes && (
                <p className="text-[11px] text-[#112237]">
                  <span className="text-[#64748b]">Notas: </span>{req.admin_notes}
                </p>
              )}

              {/* Return instructions — visible when approved, in transit, or received */}
              {(req.status === "approved" || req.status === "return_in_transit" || req.status === "return_received") && req.return_address && (
                <div className="bg-[#f8fafc] rounded-2xl p-3 border border-[#e2e8f0] space-y-2.5">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-[#f25c05] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-[#112237] block text-[11px]">Dirección de Devolución:</strong>
                      <span className="text-[11px] text-[#334155]">{req.return_address}</span>
                    </div>
                  </div>

                  {req.return_shipping_cost && (
                    <div className="flex items-center justify-between bg-white rounded-lg px-2.5 py-2 border border-[#e2e8f0]">
                      <span className="text-[11px] font-semibold text-[#112237]">Costo de envío</span>
                      <span className="text-xs font-black text-[#f25c05]">S/ {Number(req.return_shipping_cost).toFixed(2)}</span>
                    </div>
                  )}

                  {req.return_shipping_paid_by === "seller" && (
                    <p className="text-[10px] text-emerald-700 bg-emerald-50 rounded-lg p-2 border border-emerald-200">
                      El proveedor cubre el costo de envío. El monto será transferido a tu cuenta.
                    </p>
                  )}
                  {req.return_shipping_paid_by === "buyer" && (
                    <p className="text-[10px] text-amber-700 bg-amber-50 rounded-lg p-2 border border-amber-200">
                      El envío de devolución corre por tu cuenta.
                    </p>
                  )}

                  {/* Buyer: show return shipment form when approved */}
                  {!isSeller && req.status === "approved" && (
                    <div className="space-y-2">
                      <span className="text-[11px] font-semibold text-[#112237] block">Registrar envío de devolución:</span>
                      <input
                        type="text"
                        className="w-full text-[11px] border border-[#e2e8f0] rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-[#f25c05]/30 focus:border-[#f25c05]"
                        placeholder="Empresa de transporte *"
                        value={returnCourier}
                        onChange={(e) => setReturnCourier(e.target.value)}
                      />
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          className="flex-1 text-[11px] border border-[#e2e8f0] rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-[#f25c05]/30 focus:border-[#f25c05]"
                          placeholder="Código de Tracking / Guía *"
                          value={tracking}
                          onChange={(e) => setTracking(e.target.value)}
                        />
                        <input
                          type="date"
                          className="w-[130px] text-[11px] border border-[#e2e8f0] rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-[#f25c05]/30 focus:border-[#f25c05]"
                          value={returnEstDelivery}
                          onChange={(e) => setReturnEstDelivery(e.target.value)}
                        />
                      </div>
                      <input
                        type="url"
                        className="w-full text-[11px] border border-[#e2e8f0] rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-[#f25c05]/30 focus:border-[#f25c05]"
                        placeholder="URL de rastreo (opcional)"
                        value={returnTrackUrl}
                        onChange={(e) => setReturnTrackUrl(e.target.value)}
                      />
                      <Button
                        className="w-full bg-[#f25c05] hover:bg-[#d94d04] text-white text-[11px] font-bold py-2 rounded-lg"
                        onClick={() => handleUpdateTracking(req.id)}
                        disabled={updatingTracking || !tracking.trim() || !returnCourier.trim()}
                      >
                        {updatingTracking ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : null}
                        {updatingTracking ? "Registrando..." : "Confirmar Envío de Devolución"}
                      </Button>
                      {trackingError && <p className="text-[10px] text-red-500">{trackingError}</p>}
                    </div>
                  )}

                  {/* Tracking info shown for in-transit and received */}
                  {(req.status === "return_in_transit" || req.status === "return_received") && (
                    <div className={`rounded-lg p-3 border space-y-1.5 ${req.status === "return_received" ? "bg-emerald-50 border-emerald-200" : "bg-blue-50 border-blue-200"}`}>
                      <span className={`text-[11px] font-extrabold flex items-center gap-1 ${req.status === "return_received" ? "text-emerald-700" : "text-blue-700"}`}>
                        <Truck className="w-3.5 h-3.5" />
                        {req.status === "return_received" ? "Producto devuelto exitosamente" : "Producto en camino de vuelta"}
                      </span>
                      <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                        {req.return_courier && (
                          <div>
                            <span className="text-[#64748b] block">Agencia:</span>
                            <span className="font-semibold text-[#112237]">{req.return_courier}</span>
                          </div>
                        )}
                        <div>
                          <span className="text-[#64748b] block">Tracking:</span>
                          <span className="font-semibold text-[#112237] font-mono">{req.buyer_return_tracking}</span>
                        </div>
                        {req.return_estimated_delivery && (
                          <div>
                            <span className="text-[#64748b] block">Entrega estimada:</span>
                            <span className="font-semibold text-[#112237]">
                              {formatShortDateWithPeriod(req.return_estimated_delivery)}
                            </span>
                          </div>
                        )}
                        {req.return_tracking_url && (
                          <div>
                            <span className="text-[#64748b] block">Rastreo:</span>
                            <a href={req.return_tracking_url} target="_blank" rel="noopener noreferrer" className="font-semibold text-[#f25c05] hover:underline">
                              Ver en agencia ↗
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Seller: show Confirm Receipt button when in transit */}
                  {isSeller && req.status === "return_in_transit" && (
                    <div className="space-y-1.5">
                      <Button
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold py-2 rounded-lg"
                        onClick={() => handleConfirmReceipt(req.id)}
                        disabled={confirmingReceipt === req.id}
                      >
                        {confirmingReceipt === req.id ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : null}
                        {confirmingReceipt === req.id ? "Confirmando..." : "Confirmar Recepción del Producto"}
                      </Button>
                      {confirmError && <p className="text-[10px] text-red-500">{confirmError}</p>}
                    </div>
                  )}

                  {/* Seller: info when returned */}
                  {isSeller && req.status === "return_received" && (
                    <p className="text-[10px] text-emerald-700 bg-emerald-100 rounded-lg p-2 border border-emerald-200 text-center">
                      Iubizon revisará el caso y procesará el reembolso.
                    </p>
                  )}
                </div>
              )}

              {/* Items in refund — grouped by company */}
              {req.items.length > 0 && (() => {
                const grouped = new Map<string, RefundItemData[]>();
                req.items.forEach((item) => {
                  const key = item.company_name || "Proveedor";
                  if (!grouped.has(key)) grouped.set(key, []);
                  grouped.get(key)!.push(item);
                });

                return (
                  <div className="space-y-2">
                    {Array.from(grouped.entries()).map(([companyName, companyItems]) => (
                      <div key={companyName}>
                        {grouped.size > 1 && (
                          <div className="flex items-center gap-1.5 mb-1">
                            <Building2 className="w-3 h-3 text-[#f25c05]" />
                            <span className="text-[10px] font-semibold text-[#64748b] uppercase tracking-wide">{companyName}</span>
                          </div>
                        )}
                        <div className="space-y-1">
                          {companyItems.map((item) => (
                            <div key={item.id} className="flex items-center gap-2.5 bg-[#f8fafc] rounded-lg px-2.5 py-2 border border-[#e2e8f0]">
                              <div className="relative w-8 h-8 bg-white rounded-md border border-[#e2e8f0] overflow-hidden shrink-0 flex items-center justify-center">
                                {item.product_image ? (
                                  <Image src={item.product_image} alt={item.product_title || "Producto"} fill sizes="32px" className="object-cover" unoptimized />
                                ) : (
                                  <Package className="w-4 h-4 text-[#cbd5e1]" />
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-[11px] font-semibold text-[#112237] truncate">{item.product_title || "Producto"}</p>
                                <p className="text-[10px] text-[#64748b]">{item.quantity}u × S/ {Number(item.unit_price).toFixed(2)}</p>
                              </div>
                              <span className="text-[11px] font-extrabold text-[#f25c05] shrink-0">S/ {Number(item.subtotal).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        );
      })}
    </div>
  );
};
