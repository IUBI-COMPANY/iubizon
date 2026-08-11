"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  IconCheck,
  IconChevronDown,
  IconChevronUp,
  IconClock,
  IconSearch,
  IconShield,
  IconTruck,
  IconX,
  IconCash,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface RefundItem {
  order_item_id: string;
  product_title: string;
  product_image: string | null;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

interface Refund {
  id: string;
  order_code: string;
  buyer_name: string;
  buyer_email: string | null;
  type: string;
  status: string;
  reason: string;
  refund_amount: number;
  return_shipping_cost: number | null;
  return_shipping_paid_by: string | null;
  return_address: string | null;
  buyer_return_tracking: string | null;
  return_courier: string | null;
  return_estimated_delivery: string | null;
  return_tracking_url: string | null;
  admin_notes: string | null;
  refund_method: string | null;
  refund_reference: string | null;
  processed_at: string | null;
  created_at: string;
  company_name: string;
  company_location: string | null;
  items: RefundItem[];
}

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; icon: React.ElementType }
> = {
  pending: {
    label: "Pendiente",
    color: "bg-amber-100 text-amber-800 border-amber-200",
    icon: IconClock,
  },
  approved: {
    label: "Aprobado",
    color: "bg-emerald-100 text-emerald-800 border-emerald-200",
    icon: IconCheck,
  },
  return_in_transit: {
    label: "En camino",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: IconTruck,
  },
  return_received: {
    label: "Devuelto",
    color: "bg-teal-100 text-teal-800 border-teal-200",
    icon: IconCheck,
  },
  refunded: {
    label: "Reembolsado",
    color: "bg-violet-100 text-violet-800 border-violet-200",
    icon: IconCash,
  },
  rejected: {
    label: "Rechazado",
    color: "bg-red-100 text-red-800 border-red-200",
    icon: IconX,
  },
};

function formatMoney(v: number): string {
  return v.toLocaleString("es-PE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatDate(iso: string | null): string {
  if (!iso) return "-";
  return new Date(iso).toLocaleString("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ReembolsosPage() {
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [statusTab, setStatusTab] = useState("pending");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [processConfirm, setProcessConfirm] = useState<Refund | null>(null);
  const [refundMethod, setRefundMethod] = useState("niubiz");
  const [refundReference, setRefundReference] = useState("");
  const [approveConfirm, setApproveConfirm] = useState<Refund | null>(null);
  const [rejectConfirm, setRejectConfirm] = useState<Refund | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const searchTimerRef = useRef<NodeJS.Timeout | null>(null);
  const searchRef = useRef("");

  const [approveForm, setApproveForm] = useState<
    Record<
      string,
      { address: string; cost: string; paidBy: string; notes: string }
    >
  >({});
  const [rejectForm, setRejectForm] = useState<
    Record<string, { notes: string }>
  >({});

  const fetchRefunds = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusTab && statusTab !== "all") {
        if (statusTab === "active") {
          params.set("status", "approved,return_in_transit");
        } else {
          params.set("status", statusTab);
        }
      }
      if (searchRef.current.trim()) params.set("search", searchRef.current.trim());
      const res = await fetch(`/api/refunds?${params.toString()}`);
      const text = await res.text();
      let data: any;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Respuesta inválida del servidor");
      }
      if (!res.ok) throw new Error(data.error || "Error al cargar");
      setRefunds(data.refunds || []);
      setCounts({
        pending: data.pendingCount || 0,
        approved: data.approvedCount || 0,
        return_in_transit: data.inTransitCount || 0,
        return_received: data.returnedCount || 0,
        refunded: data.refundedCount || 0,
        rejected: data.rejectedCount || 0,
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al cargar");
    } finally {
      setLoading(false);
    }
  }, [statusTab]);

  useEffect(() => {
    fetchRefunds();
  }, [fetchRefunds]);

  const handleApprove = async (refundId: string) => {
    const form = approveForm[refundId];
    if (!form?.address?.trim()) return;
    setSubmittingId(refundId);
    setError("");
    try {
      const res = await fetch("/api/refunds", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "approve",
          refundId,
          return_address: form.address.trim(),
          return_shipping_cost: form.cost ? Number(form.cost) : null,
          return_shipping_paid_by: form.paidBy || "buyer",
          admin_notes: form.notes?.trim() || null,
        }),
      });
      const text = await res.text();
      let data: any;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Respuesta inválida del servidor");
      }
      if (!res.ok) throw new Error(data.error || "Error al aprobar");
      setExpandedId(null);
      await fetchRefunds();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al aprobar");
    } finally {
      setSubmittingId(null);
    }
  };

  const handleReject = async (refundId: string) => {
    setSubmittingId(refundId);
    setError("");
    try {
      const res = await fetch("/api/refunds", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reject",
          refundId,
          admin_notes: rejectForm[refundId]?.notes?.trim() || null,
        }),
      });
      const text = await res.text();
      let data: any;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Respuesta inválida del servidor");
      }
      if (!res.ok) throw new Error(data.error || "Error al rechazar");
      setExpandedId(null);
      await fetchRefunds();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al rechazar");
    } finally {
      setSubmittingId(null);
    }
  };

  const handleProcessRefund = async () => {
    if (!processConfirm) return;
    setProcessingId(processConfirm.id);
    setError("");
    try {
      const res = await fetch("/api/refunds", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "process_refund",
          refundId: processConfirm.id,
          refund_method: refundMethod,
          refund_reference: refundReference.trim() || null,
        }),
      });
      const text = await res.text();
      let data: any;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Respuesta inválida del servidor");
      }
      if (!res.ok) throw new Error(data.error || "Error al procesar");
      setProcessConfirm(null);
      await fetchRefunds();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al procesar");
    } finally {
      setProcessingId(null);
    }
  };

  const confirmApprove = async () => {
    if (!approveConfirm) return;
    const id = approveConfirm.id;
    setApproveConfirm(null);
    await handleApprove(id);
  };

  const confirmReject = async () => {
    if (!rejectConfirm) return;
    const id = rejectConfirm.id;
    setRejectConfirm(null);
    await handleReject(id);
  };

  const initApproveForm = (ref: Refund) => {
    if (!approveForm[ref.id]) {
      setApproveForm((prev) => ({
        ...prev,
        [ref.id]: {
          address: ref.company_location || "",
          cost: ref.return_shipping_cost?.toString() || "",
          paidBy: ref.return_shipping_paid_by || "buyer",
          notes: ref.admin_notes || "",
        },
      }));
    }
  };

  const initRejectForm = (refundId: string) => {
    if (!rejectForm[refundId]) {
      setRejectForm((prev) => ({ ...prev, [refundId]: { notes: "" } }));
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reembolsos</h1>
          <p className="text-muted-foreground text-sm">
            Gestiona las solicitudes de reembolso y devoluciones
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <IconSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por orden o comprador..."
            className="pl-8"
            value={search}
            onChange={(e) => {
              const value = e.target.value;
              setSearch(value);
              searchRef.current = value;
              if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
              searchTimerRef.current = setTimeout(() => {
                fetchRefunds();
              }, 400);
            }}
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-4 rounded-lg">
          {error}
        </div>
      )}

      <Tabs value={statusTab} onValueChange={setStatusTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="pending">
            Pendientes
            {counts.pending > 0 && (
              <Badge
                variant="secondary"
                className="ml-1.5 px-1.5 py-0 text-[10px] bg-amber-100"
              >
                {counts.pending}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="active">
            En Proceso
            {(counts.approved || 0) + (counts.return_in_transit || 0) > 0 && (
              <Badge
                variant="secondary"
                className="ml-1.5 px-1.5 py-0 text-[10px] bg-blue-100"
              >
                {(counts.approved || 0) + (counts.return_in_transit || 0)}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="return_received">
            Devueltos
            {counts.return_received > 0 && (
              <Badge
                variant="secondary"
                className="ml-1.5 px-1.5 py-0 text-[10px] bg-teal-100"
              >
                {counts.return_received}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="refunded">
            Reembolsados
            {counts.refunded > 0 && (
              <Badge
                variant="secondary"
                className="ml-1.5 px-1.5 py-0 text-[10px] bg-violet-100"
              >
                {counts.refunded}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rechazados
            {counts.rejected > 0 && (
              <Badge
                variant="secondary"
                className="ml-1.5 px-1.5 py-0 text-[10px] bg-red-100"
              >
                {counts.rejected}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="all">Todos</TabsTrigger>
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 w-48 bg-muted rounded" />
                <div className="h-3 w-64 bg-muted rounded" />
              </div>
            </Card>
          ))}
        </div>
      ) : refunds.length === 0 ? (
        <Card className="p-12 text-center">
          <IconShield className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-sm font-medium">
            No hay solicitudes de reembolso en esta categoría
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {refunds.map((r) => {
            const cfg = STATUS_CONFIG[r.status] || STATUS_CONFIG.pending;
            const isExpanded = expandedId === r.id;

            return (
              <Card key={r.id} className="overflow-hidden">
                <div
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => {
                    toggleExpand(r.id);
                    if (!isExpanded) initApproveForm(r);
                    initRejectForm(r.id);
                  }}
                >
                  <div className="flex items-center gap-2 flex-wrap min-w-0">
                    <span className="text-sm font-bold text-foreground">
                      ORDEN #{r.order_code}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      · {r.buyer_name} · {formatDate(r.created_at)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right text-xs text-muted-foreground">
                      {r.type === "full"
                        ? "Reembolso Total"
                        : "Reembolso Parcial"}
                      <span className="block text-sm font-bold text-foreground">
                        S/ {formatMoney(r.refund_amount)}
                      </span>
                    </div>
                    <Badge className={cfg.color}>
                      <cfg.icon className="w-3 h-3 mr-1" />
                      {cfg.label}
                    </Badge>
                    {isExpanded ? (
                      <IconChevronUp className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <IconChevronDown className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <CardContent className="border-t bg-muted/30 px-4 py-4 space-y-4">
                    {/* Buyer & order info */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                      <div>
                        <span className="text-muted-foreground block">
                          Comprador
                        </span>
                        <span className="font-medium">{r.buyer_name}</span>
                        {r.buyer_email && (
                          <span className="text-muted-foreground block truncate">
                            {r.buyer_email}
                          </span>
                        )}
                      </div>
                      <div>
                        <span className="text-muted-foreground block">
                          Empresa
                        </span>
                        <span className="font-medium">{r.company_name}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block">
                          Motivo
                        </span>
                        <span className="font-medium">{r.reason}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block">
                          Tipo
                        </span>
                        <span className="font-medium">
                          {r.type === "full"
                            ? "Reembolso Total"
                            : "Reembolso Parcial"}
                        </span>
                      </div>
                    </div>

                    {/* Items */}
                    <div>
                      <Label className="text-xs text-muted-foreground mb-1 block">
                        Productos
                      </Label>
                      <div className="space-y-1.5">
                        {r.items.map((item) => (
                          <div
                            key={item.order_item_id}
                            className="flex items-center gap-3 bg-background rounded-lg px-3 py-2 border"
                          >
                            {item.product_image ? (
                              <img
                                src={item.product_image}
                                alt={item.product_title}
                                className="w-10 h-10 rounded-md object-cover border"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center">
                                <IconShield className="w-4 h-4 text-muted-foreground" />
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-medium truncate">
                                {item.product_title}
                              </p>
                              <p className="text-[11px] text-muted-foreground">
                                {item.quantity} × S/{" "}
                                {formatMoney(item.unit_price)}
                              </p>
                            </div>
                            <span className="text-xs font-bold text-foreground shrink-0">
                              S/ {formatMoney(item.subtotal)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Admin notes if present */}
                    {r.admin_notes && (
                      <div className="bg-muted rounded-lg p-3 text-xs">
                        <span className="text-muted-foreground">Notas: </span>
                        {r.admin_notes}
                      </div>
                    )}

                    {/* Return tracking info (for approved/in_transit/returned/refunded/rejected) */}
                    {r.status !== "pending" && (
                      <div className="bg-muted rounded-lg p-3 space-y-1.5 text-xs">
                        <span className="font-medium block">
                          Información de Devolución
                        </span>
                        <div className="grid grid-cols-2 gap-2">
                          {r.return_address && (
                            <div>
                              <span className="text-muted-foreground">
                                Dirección:
                              </span>
                              <span className="ml-1">{r.return_address}</span>
                            </div>
                          )}
                          {r.return_shipping_cost != null && (
                            <div>
                              <span className="text-muted-foreground">
                                Costo envío:
                              </span>
                              <span className="ml-1 font-medium">
                                S/ {r.return_shipping_cost.toFixed(2)}
                              </span>
                            </div>
                          )}
                          {r.return_shipping_paid_by && (
                            <div>
                              <span className="text-muted-foreground">
                                Paga:
                              </span>
                              <span className="ml-1">
                                {r.return_shipping_paid_by === "seller"
                                  ? "Proveedor"
                                  : "Comprador"}
                              </span>
                            </div>
                          )}
                          {r.buyer_return_tracking && (
                            <div>
                              <span className="text-muted-foreground">
                                Tracking:
                              </span>
                              <span className="ml-1 font-mono">
                                {r.buyer_return_tracking}
                              </span>
                            </div>
                          )}
                          {r.return_courier && (
                            <div>
                              <span className="text-muted-foreground">
                                Agencia:
                              </span>
                              <span className="ml-1">{r.return_courier}</span>
                            </div>
                          )}
                          {r.return_estimated_delivery && (
                            <div>
                              <span className="text-muted-foreground">
                                Est. llegada:
                              </span>
                              <span className="ml-1">
                                {formatDate(r.return_estimated_delivery)}
                              </span>
                            </div>
                          )}
                          {r.return_tracking_url && (
                            <div className="col-span-2">
                              <a
                                href={r.return_tracking_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                Ver rastreo en agencia →
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Processed info for refunded status */}
                    {r.status === "refunded" && r.processed_at && (
                      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs">
                        <p className="text-emerald-800 font-semibold">
                          Reembolso procesado el {formatDate(r.processed_at)}
                        </p>
                        {r.refund_method && r.refund_method !== "niubiz" && (
                          <p className="text-emerald-700 mt-1">
                            Método:{" "}
                            {r.refund_method === "bank_transfer"
                              ? "Transferencia Bancaria"
                              : r.refund_method === "yape"
                                ? "Yape"
                                : r.refund_method === "plin"
                                  ? "Plin"
                                  : r.refund_method}
                            {r.refund_reference && ` · Ref: ${r.refund_reference}`}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Approval form (only for pending) */}
                    {r.status === "pending" && (
                      <div className="bg-background rounded-lg p-4 border space-y-3">
                        <span className="text-sm font-semibold block">
                          Aprobar o Rechazar Reembolso
                        </span>

                        <div className="space-y-2">
                          <div>
                            <Label className="text-xs">
                              Dirección de Devolución *
                            </Label>
                            <Input
                              className="h-8 text-xs"
                              value={approveForm[r.id]?.address || ""}
                              onChange={(e) =>
                                setApproveForm((prev) => ({
                                  ...prev,
                                  [r.id]: {
                                    ...prev[r.id],
                                    address: e.target.value,
                                  },
                                }))
                              }
                              placeholder="Av. Los Olivos 123, Lima"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label className="text-xs">
                                Costo de Envío (S/)
                              </Label>
                              <Input
                                type="number"
                                className="h-8 text-xs"
                                value={approveForm[r.id]?.cost || ""}
                                onChange={(e) =>
                                  setApproveForm((prev) => ({
                                    ...prev,
                                    [r.id]: {
                                      ...prev[r.id],
                                      cost: e.target.value,
                                    },
                                  }))
                                }
                                placeholder="0.00"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">
                                ¿Quién paga el envío?
                              </Label>
                              <Select
                                value={approveForm[r.id]?.paidBy || "buyer"}
                                onValueChange={(v) =>
                                  setApproveForm((prev) => ({
                                    ...prev,
                                    [r.id]: { ...prev[r.id], paidBy: v },
                                  }))
                                }
                              >
                                <SelectTrigger className="h-8 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="buyer">
                                    Comprador
                                  </SelectItem>
                                  <SelectItem value="seller">
                                    Proveedor
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div>
                            <Label className="text-xs">Notas (internas)</Label>
                            <Input
                              className="h-8 text-xs"
                              value={approveForm[r.id]?.notes || ""}
                              onChange={(e) =>
                                setApproveForm((prev) => ({
                                  ...prev,
                                  [r.id]: {
                                    ...prev[r.id],
                                    notes: e.target.value,
                                  },
                                }))
                              }
                              placeholder="Observaciones para el equipo..."
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Notas de rechazo</Label>
                            <Input
                              className="h-8 text-xs"
                              value={rejectForm[r.id]?.notes || ""}
                              onChange={(e) =>
                                setRejectForm((prev) => ({
                                  ...prev,
                                  [r.id]: { notes: e.target.value },
                                }))
                              }
                              placeholder="Motivo del rechazo..."
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                          <Button
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                            onClick={() => setApproveConfirm(r)}
                            disabled={
                              submittingId === r.id ||
                              !approveForm[r.id]?.address?.trim()
                            }
                          >
                            {submittingId === r.id
                              ? "Procesando..."
                              : "Aprobar Reembolso"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-200 hover:bg-red-50 text-xs"
                            onClick={() => setRejectConfirm(r)}
                            disabled={submittingId === r.id}
                          >
                            {submittingId === r.id
                              ? "Procesando..."
                              : "Rechazar"}
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Return received — process refund */}
                    {r.status === "return_received" && (
                      <div className="bg-teal-50 border border-teal-200 rounded-lg p-3 space-y-2">
                        <p className="text-xs text-teal-800">
                          El vendedor confirmó la recepción del producto.
                        </p>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Select
                              value={refundMethod}
                              onValueChange={setRefundMethod}
                            >
                              <SelectTrigger className="h-8 text-xs flex-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="niubiz">Vía Niubiz</SelectItem>
                                <SelectItem value="bank_transfer">Transferencia Bancaria</SelectItem>
                                <SelectItem value="yape">Yape</SelectItem>
                                <SelectItem value="plin">Plin</SelectItem>
                              </SelectContent>
                            </Select>
                            {refundMethod !== "niubiz" && (
                              <Input
                                className="h-8 text-xs w-[180px]"
                                placeholder="N° de operación / ref."
                                value={refundReference}
                                onChange={(e) => setRefundReference(e.target.value)}
                              />
                            )}
                          </div>
                          <Button
                            size="sm"
                            className="bg-violet-600 hover:bg-violet-700 text-white text-xs w-full"
                            onClick={() => setProcessConfirm(r)}
                          >
                            {refundMethod === "niubiz"
                              ? "Procesar Reembolso vía Niubiz"
                              : `Procesar Reembolso por ${refundMethod === "bank_transfer" ? "Transferencia" : refundMethod === "yape" ? "Yape" : "Plin"}`}
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <ConfirmModal
        open={!!approveConfirm}
        onOpenChange={() => setApproveConfirm(null)}
        title="Aprobar Reembolso"
        description={
          approveConfirm
            ? `¿Estás seguro de aprobar el reembolso por S/ ${formatMoney(approveConfirm.refund_amount)} de la orden #${approveConfirm.order_code}? Se notificará al comprador y al vendedor.`
            : ""
        }
        confirmLabel={submittingId ? "Aprobando..." : "Sí, Aprobar Reembolso"}
        onConfirm={confirmApprove}
      />

      <ConfirmModal
        open={!!rejectConfirm}
        onOpenChange={() => setRejectConfirm(null)}
        title="Rechazar Reembolso"
        description={
          rejectConfirm
            ? `¿Estás seguro de rechazar el reembolso por S/ ${formatMoney(rejectConfirm.refund_amount)} de la orden #${rejectConfirm.order_code}? Se notificará al comprador.`
            : ""
        }
        confirmLabel={submittingId ? "Rechazando..." : "Sí, Rechazar"}
        variant="destructive"
        onConfirm={confirmReject}
      />

      <ConfirmModal
        open={!!processConfirm}
        onOpenChange={() => setProcessConfirm(null)}
        title="Procesar Reembolso"
        description={
          processConfirm
            ? `¿Estás seguro de procesar el reembolso por S/ ${formatMoney(processConfirm.refund_amount)} de la orden #${processConfirm.order_code}? ${refundMethod !== "niubiz" ? `Método: ${refundMethod === "bank_transfer" ? "Transferencia Bancaria" : refundMethod === "yape" ? "Yape" : "Plin"}${refundReference ? ` · Ref: ${refundReference}` : ""}` : "Se realizará el cargo inverso en Niubiz a la tarjeta del comprador."}`
            : ""
        }
        confirmLabel={processingId ? "Procesando..." : "Sí, Procesar Reembolso"}
        onConfirm={handleProcessRefund}
      />
    </div>
  );
}
