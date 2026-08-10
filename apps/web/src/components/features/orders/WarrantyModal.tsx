"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Clock,
  HelpCircle,
  Loader2,
  ShieldCheck,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

export interface RefundableItem {
  orderItemId: string;
  title: string;
  price: number;
  quantity: number;
  companyName?: string;
}

export interface WarrantyModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId?: string;
  orderCode: string;
  createdAt: string;
  sellerName?: string | null;
  productTitle?: string;
  warrantyText?: string;
  warrantyConditions?: string | null;
  items?: RefundableItem[];
  orderTotal?: number;
  onRefundCreated?: () => void;
}

export const WarrantyModal: React.FC<WarrantyModalProps> = ({
  isOpen,
  onClose,
  orderId,
  orderCode,
  createdAt,
  sellerName,
  productTitle,
  warrantyText = "6 meses por falla de fábrica (Garantía del vendedor)",
  warrantyConditions,
  items,
  orderTotal,
  onRefundCreated,
}) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [reason, setReason] = useState("");
  const [refundType, setRefundType] = useState<"full" | "partial">("full");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [protectionDays, setProtectionDays] = useState(7);
  const [existingRefunds, setExistingRefunds] = useState<
    {
      id: string;
      status: string;
      type: string;
      items: { order_item_id: string }[];
    }[]
  >([]);

  useEffect(() => {
    if (isOpen) {
      setRefundType("full");
      setSelectedIds(new Set());
      setReason("");
      setError("");
      setSuccess(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    fetch("/api/settings?key=BUYER_PROTECTION_DAYS")
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.days === "number") setProtectionDays(data.days);
      })
      .catch(() => {});
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !orderId) return;
    fetch(`/api/orders/refund?orderId=${encodeURIComponent(orderId)}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("[WarrantyModal] Existing refunds:", data.requests);
        setExistingRefunds(data.requests || []);
      })
      .catch((err) =>
        console.error("[WarrantyModal] Error fetching refunds:", err),
      );
  }, [isOpen, orderId]);

  const hasItems = items && items.length > 1;

  const selectedTotal = useMemo(() => {
    if (!items) return 0;
    return items
      .filter((i) => selectedIds.has(i.orderItemId))
      .reduce((sum, i) => sum + i.price * i.quantity, 0);
  }, [items, selectedIds]);

  const allIds = useMemo(() => {
    if (!items) return new Set<string>();
    return new Set(items.map((i) => i.orderItemId));
  }, [items]);

  const blockedItemIds = useMemo(() => {
    const ids = new Set<string>();
    existingRefunds.forEach((req) => {
      if (["pending", "approved"].includes(req.status)) {
        req.items.forEach((item) => ids.add(item.order_item_id));
      }
    });
    return ids;
  }, [existingRefunds]);

  const hasAnyRefund = existingRefunds.some((r) =>
    ["pending", "approved"].includes(r.status),
  );

  const availableIds = useMemo(() => {
    const ids = new Set(allIds);
    blockedItemIds.forEach((id) => ids.delete(id));
    return ids;
  }, [allIds, blockedItemIds]);

  useEffect(() => {
    if (
      allIds.size > 0 &&
      selectedIds.size === allIds.size &&
      refundType === "partial"
    ) {
      setRefundType("full");
      setSelectedIds(new Set());
    }
  }, [selectedIds.size, allIds.size, refundType]);

  const toggleItem = (id: string) => {
    if (blockedItemIds.has(id)) return;
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAll = () => {
    setSelectedIds(new Set(availableIds));
  };

  if (!isOpen) return null;

  const orderDate = new Date(createdAt);
  const now = new Date();
  const diffDays = Math.floor(
    (now.getTime() - orderDate.getTime()) / (1000 * 3600 * 24),
  );
  const isWithinProtection = diffDays <= protectionDays;

  const canSubmit =
    refundType === "full" ? !hasAnyRefund : selectedIds.size > 0;

  const handleRefundRequest = async () => {
    if (!orderId) return;
    if (!canSubmit) return;
    setLoading(true);
    setError("");
    try {
      const body: Record<string, unknown> = {
        orderId,
        reason:
          reason.trim() || "Solicitud de reembolso por protección al comprador",
        type: refundType,
      };
      if (refundType === "partial") {
        body.items = Array.from(selectedIds).map((id) => ({
          orderItemId: id,
          quantity: items?.find((i) => i.orderItemId === id)?.quantity || 1,
        }));
      }
      const res = await fetch("/api/orders/refund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al enviar solicitud");
      setSuccess(true);
      onRefundCreated?.();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al procesar");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
        <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#e2e8f0] relative space-y-5">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-[#94a3b8] hover:text-[#112237]"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="text-center space-y-3 pt-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#112237]">
                ¡Solicitud Enviada!
              </h3>
              <p className="text-sm text-[#64748b] mt-1">
                Tu solicitud de reembolso para la orden{" "}
                <strong>#{orderCode}</strong> ha sido recibida. Nuestro equipo
                la revisará y te notificará por correo.
              </p>
            </div>
            <Button
              onClick={onClose}
              className="w-full bg-[#f25c05] hover:bg-[#d94d04] text-white font-bold rounded-xl"
            >
              Entendido
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#e2e8f0] relative space-y-5 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#94a3b8] hover:text-[#112237]"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-[#f25c05]/10 text-[#f25c05] rounded-2xl flex items-center justify-center mx-auto">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-[#112237]">
            Protección al Comprador Iubizon
          </h3>
          <p
            className={`text-xs font-semibold px-3 py-1 rounded-full inline-block ${isWithinProtection ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}
          >
            {isWithinProtection
              ? `Dentro del plazo · ${protectionDays - diffDays} días restantes`
              : "Plazo de protección inicial vencido"}
          </p>
        </div>

        <div className="bg-[#f8fafc] rounded-2xl p-4 space-y-3 text-xs text-[#475569]">
          <p className="font-bold text-[#112237]">Cobertura de Protección:</p>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
              Producto no coincide con la descripción
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
              Producto llegó dañado o defectuoso
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
              Producto no fue entregado
            </li>
          </ul>
          {productTitle && !hasItems && (
            <p className="text-[11px] pt-1 italic">
              Producto: <strong>{productTitle}</strong>
              {sellerName ? ` · Vendedor: ${sellerName}` : ""}
            </p>
          )}
        </div>

        {isWithinProtection && (
          <div className="space-y-4">
            {hasItems && (
              <div className="space-y-3">
                <div className="flex bg-[#f1f5f9] rounded-xl p-1">
                  <button
                    className={`flex-1 text-xs font-bold py-2 rounded-lg transition-all ${refundType === "full" ? "bg-white text-[#112237] shadow-sm" : "text-[#64748b]"}`}
                    onClick={() => setRefundType("full")}
                  >
                    Reembolso Total
                  </button>
                  <button
                    className={`flex-1 text-xs font-bold py-2 rounded-lg transition-all ${refundType === "partial" ? "bg-white text-[#112237] shadow-sm" : "text-[#64748b]"}`}
                    onClick={() => setRefundType("partial")}
                  >
                    Reembolso Parcial
                  </button>
                </div>

                {refundType === "partial" && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#112237]">
                        Selecciona los productos a reembolsar:
                      </span>
                      {availableIds.size > 0 &&
                        selectedIds.size < availableIds.size && (
                          <button
                            className="text-[11px] text-[#f25c05] font-semibold hover:underline"
                            onClick={handleSelectAll}
                          >
                            Seleccionar todos
                          </button>
                        )}
                    </div>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto">
                      {(() => {
                        const grouped = new Map<string, RefundableItem[]>();
                        items!.forEach((item) => {
                          const key = item.companyName || "Proveedor";
                          if (!grouped.has(key)) grouped.set(key, []);
                          grouped.get(key)!.push(item);
                        });

                        return Array.from(grouped.entries()).map(
                          ([companyName, companyItems]) => (
                            <div key={companyName}>
                              {grouped.size > 1 && (
                                <div className="flex items-center gap-1.5 mb-0.5 px-1">
                                  <Building2 className="w-3 h-3 text-[#f25c05]" />
                                  <span className="text-[10px] font-semibold text-[#64748b] uppercase tracking-wide">
                                    {companyName}
                                  </span>
                                </div>
                              )}
                              {companyItems.map((item) => {
                                const isBlocked = blockedItemIds.has(
                                  item.orderItemId,
                                );

                                if (isBlocked) {
                                  return (
                                    <div
                                      key={item.orderItemId}
                                      className="flex items-center gap-3 p-3 rounded-xl border border-amber-200 bg-amber-50/60 mb-1"
                                    >
                                      <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                                      <div className="min-w-0 flex-1">
                                        <p className="text-xs font-semibold text-[#64748b] truncate">
                                          {item.title}
                                        </p>
                                        <p className="text-[11px] text-amber-600">
                                          S/ {item.price.toFixed(2)} ×{" "}
                                          {item.quantity} · Reembolso pendiente
                                        </p>
                                      </div>
                                      <span className="text-[11px] font-semibold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full shrink-0">
                                        Pendiente
                                      </span>
                                    </div>
                                  );
                                }

                                return (
                                  <label
                                    key={item.orderItemId}
                                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all mb-1 ${selectedIds.has(item.orderItemId) ? "border-[#f25c05] bg-orange-50/60" : "border-[#e2e8f0] bg-white hover:border-[#cbd5e1]"}`}
                                  >
                                    <input
                                      type="checkbox"
                                      className="accent-[#f25c05] w-4 h-4 shrink-0"
                                      checked={selectedIds.has(
                                        item.orderItemId,
                                      )}
                                      onChange={() =>
                                        toggleItem(item.orderItemId)
                                      }
                                    />
                                    <div className="min-w-0 flex-1">
                                      <p className="text-xs font-semibold text-[#112237] truncate">
                                        {item.title}
                                      </p>
                                      <p className="text-[11px] text-[#64748b]">
                                        S/ {item.price.toFixed(2)} ×{" "}
                                        {item.quantity}
                                      </p>
                                    </div>
                                    <span className="text-xs font-extrabold text-[#f25c05] shrink-0">
                                      S/{" "}
                                      {(item.price * item.quantity).toFixed(2)}
                                    </span>
                                  </label>
                                );
                              })}
                            </div>
                          ),
                        );
                      })()}
                    </div>
                    {selectedIds.size > 0 && (
                      <div className="flex items-center justify-between bg-[#f8fafc] rounded-xl p-3 border border-[#e2e8f0]">
                        <span className="text-xs font-semibold text-[#112237]">
                          {selectedIds.size}{" "}
                          {selectedIds.size === 1
                            ? "producto seleccionado"
                            : "productos seleccionados"}
                        </span>
                        <span className="text-sm font-black text-[#f25c05]">
                          S/ {selectedTotal.toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {refundType === "full" && hasItems && !hasAnyRefund && (
                  <div className="bg-[#f8fafc] rounded-xl p-3 border border-[#e2e8f0] text-center">
                    <p className="text-[11px] text-[#64748b]">
                      Se reembolsará el monto total de la orden (incluye envío)
                    </p>
                    <p className="text-sm font-black text-[#f25c05]">
                      S/ {(orderTotal || 0).toFixed(2)}
                    </p>
                  </div>
                )}

                {hasAnyRefund && (
                  <div className="bg-amber-50 rounded-xl p-3 border border-amber-200 text-center">
                    <p className="text-[11px] font-semibold text-amber-700">
                      Ya existe una solicitud de reembolso en proceso para esta
                      orden. No puedes solicitar uno nuevo hasta que sea
                      resuelto.
                    </p>
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#112237] mb-1">
                Motivo del reembolso <span className="text-[#f25c05]">*</span>
              </label>
              <textarea
                className="w-full text-xs border border-[#e2e8f0] rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#f25c05]/30 focus:border-[#f25c05]"
                rows={3}
                placeholder="Describe el motivo de tu solicitud de reembolso..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
            <Button
              className="w-full bg-[#f25c05] hover:bg-[#d94d04] text-white text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-2"
              onClick={handleRefundRequest}
              disabled={loading || !canSubmit}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              <span>
                {loading
                  ? "Enviando..."
                  : refundType === "partial" && selectedIds.size > 0
                    ? `Solicitar Reembolso Parcial · S/ ${selectedTotal.toFixed(2)}`
                    : "Solicitar Reembolso (Protección " +
                      protectionDays +
                      " Días)"}
              </span>
            </Button>
          </div>
        )}

        {!isWithinProtection && (
          <Button
            className="w-full bg-[#112237] hover:bg-[#1a3352] text-white text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-2"
            onClick={() => {
              onClose();
              alert(
                `Solicitud de mediación enviada para la orden #${orderCode}. Un agente de Iubizon revisará el caso con el vendedor.`,
              );
            }}
          >
            <HelpCircle className="w-4 h-4 text-[#f25c05]" />
            <span>Solicitar Mediación Iubizon</span>
          </Button>
        )}

        <Button
          variant="outline"
          className="w-full text-xs font-semibold py-2.5 rounded-xl border-[#cbd5e1] hover:bg-slate-50"
          onClick={onClose}
        >
          Cerrar
        </Button>
      </div>
    </div>
  );
};
