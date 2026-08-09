"use client";

import { useEffect, useState, useCallback } from "react";
import { IconSearch, IconRefresh, IconTruck, IconCheck, IconX, IconClock, IconPackage, IconChevronDown, IconChevronUp, IconUser, IconMapPin, IconReceipt, IconAlertTriangle, IconExternalLink } from "@tabler/icons-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ConfirmModal } from "@/components/ui/confirm-modal";

type OrderStatus = "pending" | "paid" | "shipped" | "delivered" | "completed" | "cancelled";

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; icon: typeof IconClock }> = {
  pending:   { label: "Pendiente", color: "bg-amber-100 text-amber-800 border-amber-200", icon: IconClock },
  paid:      { label: "Pagado", color: "bg-blue-100 text-blue-800 border-blue-200", icon: IconCheck },
  shipped:   { label: "Enviado", color: "bg-purple-100 text-purple-800 border-purple-200", icon: IconTruck },
  delivered: { label: "Entregado", color: "bg-emerald-100 text-emerald-800 border-emerald-200", icon: IconPackage },
  completed: { label: "Completado", color: "bg-emerald-100 text-emerald-800 border-emerald-200", icon: IconCheck },
  cancelled: { label: "Cancelado", color: "bg-red-100 text-red-800 border-red-200", icon: IconX },
};

function formatMoney(v: unknown): string {
  const n = Number(v);
  return isNaN(n) ? "0.00" : n.toLocaleString("es-PE", { minimumFractionDigits: 2 });
}

function formatFullDate(iso: string | null) {
  if (!iso) return "-";
  const d = new Date(iso);
  return d.toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "">("");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<{ action: string; id: string; orderCode: string; newStatus?: OrderStatus } | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    if (search) params.set("search", search);
    const res = await fetch(`/api/orders?${params}`);
    const data = await res.json();
    setOrders(data.orders || []);
    setLoading(false);
  }, [statusFilter, search]);

  useEffect(() => { fetchOrders(); }, [statusFilter]);

  const executeAction = async () => {
    if (!confirm) return;
    const status = confirm.action === "cancel" ? "cancelled" : confirm.newStatus;
    if (!status) return;
    await fetch("/api/orders", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: confirm.id, status }) });
    setConfirm(null);
    fetchOrders();
  };

  const statusCounts = orders.reduce((acc: Record<string, number>, o) => { acc[o.status] = (acc[o.status] || 0) + 1; return acc; }, {});

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Órdenes</h1>
          <p className="text-muted-foreground text-sm">Monitoreo y soporte de órdenes</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchOrders}><IconRefresh className="w-4 h-4 mr-1" />Actualizar</Button>
      </div>

      <div className="flex gap-2 flex-wrap items-center">
        <Input placeholder="Buscar por código o comprador..." value={search} onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && fetchOrders()} className="max-w-xs" />
        <Button variant="outline" size="sm" onClick={fetchOrders}><IconSearch className="w-4 h-4" /></Button>
      </div>

      <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as OrderStatus | "")}>
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="">Todas ({orders.length})</TabsTrigger>
          {Object.entries(STATUS_CONFIG).map(([k, v]) => (
            <TabsTrigger key={k} value={k} className="gap-1"><v.icon className="w-3.5 h-3.5" />{v.label} ({statusCounts[k] || 0})</TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="flex justify-center py-12"><IconRefresh className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">No hay órdenes con este filtro</div>
      ) : (
        <div className="space-y-3">
          {orders.map((order: any) => {
            const sc = STATUS_CONFIG[order.status as OrderStatus] || STATUS_CONFIG.pending;
            const isExpanded = expandedId === order.id;
            const items = order.packages?.flatMap((p: any) => p.items?.map((i: any) => ({ ...i, company: p.company?.name }))) || [];
            const hasTracking = order.packages?.some((p: any) => p.tracking_number);

            return (
              <Card key={order.id} className="overflow-hidden">
                <div className="p-4 flex flex-col sm:flex-row sm:items-center gap-3 cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : order.id)}>
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Badge variant="outline" className={`font-mono text-xs shrink-0 ${sc.color}`}>#{order.order_code}</Badge>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <IconUser className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <span className="text-sm font-medium truncate">{order.buyer?.name || "Anónimo"}</span>
                        <span className="text-xs text-muted-foreground truncate">{order.buyer?.email}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-sm font-bold">S/ {formatMoney(order.total_amount)}</span>
                        <span className="text-xs text-muted-foreground">· {items.length} producto(s)</span>
                        {hasTracking && <span className="text-xs text-emerald-600 font-medium">· Con tracking</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge className={sc.color}><sc.icon className="w-3 h-3 mr-1" />{sc.label}</Badge>
                    {isExpanded ? <IconChevronUp className="w-4 h-4 text-muted-foreground" /> : <IconChevronDown className="w-4 h-4 text-muted-foreground" />}
                  </div>
                </div>

                {isExpanded && (
                  <CardContent className="border-t bg-muted/30 px-4 py-3 space-y-4">
                    {/* Tracking / envío */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      {order.shipping?.address && (
                        <div>
                          <p className="font-semibold text-muted-foreground uppercase mb-1">Dirección de envío</p>
                          <p className="flex items-start gap-1"><IconMapPin className="w-3 h-3 mt-0.5 shrink-0" />{order.shipping.address}</p>
                          {order.shipping.department && <p className="text-muted-foreground ml-4">{order.shipping.department}{order.shipping.province ? `, ${order.shipping.province}` : ""}{order.shipping.district ? `, ${order.shipping.district}` : ""}</p>}
                        </div>
                      )}

                      <div>
                        <p className="font-semibold text-muted-foreground uppercase mb-1">Tracking</p>
                        {order.packages?.filter((p: any) => p.tracking_number).map((p: any, i: number) => (
                          <div key={i} className="mb-1">
                            <p className="font-medium">{p.company?.name || "Proveedor"} — {p.courier || "Sin courier"}</p>
                            <p className="text-muted-foreground">#{p.tracking_number} · Est. {formatFullDate(p.estimated_delivery)}</p>
                            {p.tracking_url && <a href={p.tracking_url} target="_blank" className="text-primary hover:underline inline-flex items-center gap-0.5"><IconExternalLink className="w-3 h-3" />Ver</a>}
                          </div>
                        )) || <p className="text-muted-foreground">Sin tracking registrado</p>}
                      </div>
                    </div>

                    {/* Factura */}
                    {order.invoice?.type && (
                      <div className="text-xs">
                        <p className="font-semibold text-muted-foreground uppercase mb-1">Comprobante fiscal</p>
                        <p className="flex items-center gap-1"><IconReceipt className="w-3 h-3" />{order.invoice.type.toUpperCase()}: {order.invoice.number} — {order.invoice.legal_name}</p>
                      </div>
                    )}

                    {/* Productos */}
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Productos ({items.length})</p>
                      <div className="space-y-1.5">
                        {items.map((item: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between text-sm bg-background rounded-md px-3 py-1.5">
                            <span className="truncate flex-1">{item.product?.title || "Producto"}</span>
                            <span className="text-muted-foreground text-xs ml-2">x{item.quantity}</span>
                            <span className="font-medium ml-3">S/ {formatMoney(item.subtotal || item.unit_price * item.quantity)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between text-sm font-medium pt-2 mt-2 border-t">
                        <span>Total</span>
                        <span>S/ {formatMoney(order.total_amount)}</span>
                      </div>
                    </div>

                    {/* Soporte — acciones excepcionales */}
                    {order.status !== "cancelled" && order.status !== "completed" && (
                      <>
                        <Separator />
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-2">
                          <div className="flex items-center gap-2 text-amber-800">
                            <IconAlertTriangle className="w-4 h-4" />
                            <p className="text-xs font-semibold">Soporte — Forzar cambio de estado</p>
                          </div>
                          <p className="text-xs text-amber-700">Usar solo cuando el comprador o vendedor no puede completar la acción por su cuenta.</p>
                          <div className="flex flex-wrap gap-2">
                            <Select value="" onValueChange={(v) => setConfirm({ action: "advance", id: order.id, orderCode: order.order_code, newStatus: v as OrderStatus })}>
                              <SelectTrigger className="w-44 h-8 text-xs"><SelectValue placeholder="Forzar cambio a..." /></SelectTrigger>
                              <SelectContent>
                                {Object.entries(STATUS_CONFIG)
                                  .filter(([k]) => k !== order.status && k !== "cancelled")
                                  .map(([k, v]) => (
                                    <SelectItem key={k} value={k}>{v.label}</SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                            <Button size="sm" variant="destructive" className="h-8 text-xs"
                              onClick={() => setConfirm({ action: "cancel", id: order.id, orderCode: order.order_code })}>
                              <IconX className="w-3 h-3 mr-1" />Cancelar orden
                            </Button>
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <ConfirmModal
        open={!!confirm}
        onOpenChange={() => setConfirm(null)}
        title={confirm?.action === "cancel" ? "Cancelar orden" : `Forzar cambio de estado`}
        description={confirm?.action === "cancel"
          ? `¿Estás seguro de cancelar la orden #${confirm?.orderCode}? Esta acción no se puede deshacer.`
          : `¿Confirmas forzar el cambio de estado de la orden #${confirm?.orderCode} a "${confirm?.newStatus ? STATUS_CONFIG[confirm.newStatus].label : ""}"?`}
        confirmLabel={confirm?.action === "cancel" ? "Sí, cancelar" : "Forzar cambio"}
        variant={confirm?.action === "cancel" ? "destructive" : "default"}
        onConfirm={executeAction}
      />
    </div>
  );
}
