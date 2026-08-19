"use client";

import { useEffect, useState, useCallback } from "react";
import {
  IconSearch,
  IconRefresh,
  IconTruck,
  IconCheck,
  IconX,
  IconClock,
  IconPackage,
  IconChevronDown,
  IconChevronUp,
  IconUser,
  IconReceipt,
  IconAlertTriangle,
  IconBuildingWarehouse,
} from "@tabler/icons-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { AdminDispatchModal } from "@/components/AdminDispatchModal";
import {
  AdminDeliveryTimeline,
  AdminOrder,
} from "@/components/AdminDeliveryTimeline";

type OrderStatus =
  "pending" | "paid" | "shipped" | "delivered" | "completed" | "cancelled";

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; color: string; icon: typeof IconClock }
> = {
  pending: {
    label: "Pendiente",
    color: "bg-amber-100 text-amber-800 border-amber-200",
    icon: IconClock,
  },
  paid: {
    label: "Pagado",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: IconCheck,
  },
  shipped: {
    label: "Enviado",
    color: "bg-purple-100 text-purple-800 border-purple-200",
    icon: IconTruck,
  },
  delivered: {
    label: "Entregado",
    color: "bg-emerald-100 text-emerald-800 border-emerald-200",
    icon: IconPackage,
  },
  completed: {
    label: "Completado",
    color: "bg-emerald-100 text-emerald-800 border-emerald-200",
    icon: IconCheck,
  },
  cancelled: {
    label: "Cancelado",
    color: "bg-red-100 text-red-800 border-red-200",
    icon: IconX,
  },
};

function formatMoney(v: unknown): string {
  const n = Number(v);
  return isNaN(n)
    ? "0.00"
    : n.toLocaleString("es-PE", { minimumFractionDigits: 2 });
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "">("");
  const [onlyConsolidated, setOnlyConsolidated] = useState(false);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [confirm, setConfirm] = useState<{
    action: string;
    id: string;
    orderCode: string;
    newStatus?: OrderStatus;
  } | null>(null);

  const [confirmModalData, setConfirmModalData] = useState<{
    open: boolean;
    title: string;
    description: string;
    confirmLabel?: string;
    variant?: "default" | "destructive";
    onConfirm: () => void;
  } | null>(null);

  const [dispatchModalData, setDispatchModalData] = useState<{
    open: boolean;
    packageId: string;
    orderCode?: string;
    companyName?: string;
    buyerName?: string;
    destinationAddress?: string;
    courier?: string | null;
    trackingNumber?: string | null;
    trackingUrl?: string | null;
    carrierPhone?: string | null;
    estimatedDelivery?: string | null;
  } | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    if (onlyConsolidated) params.set("deliveryType", "complete");
    if (search) params.set("search", search);
    const res = await fetch(`/api/orders?${params}`);
    const data = await res.json();
    setOrders(data.orders || []);
    setLoading(false);
  }, [statusFilter, onlyConsolidated, search]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const executeAction = async () => {
    if (!confirm) return;
    try {
      if (confirm.action === "cancel") {
        await fetch(`/api/orders?id=${confirm.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "cancel" }),
        });
      } else if (confirm.action === "advance" && confirm.newStatus) {
        await fetch(`/api/orders?id=${confirm.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "force_status",
            status: confirm.newStatus,
          }),
        });
      }
      await fetchOrders();
    } catch (e) {
      console.error(e);
    } finally {
      setConfirm(null);
    }
  };

  const promptMarkPackageReceived = (
    packageId: string,
    companyName: string,
  ) => {
    setConfirmModalData({
      open: true,
      title: "Confirmar Recepción en Almacén",
      description: `¿Estás seguro de marcar el paquete de "${companyName}" como recepcionado físicamente en el Almacén Central iubizon (Chorrillos)?`,
      confirmLabel: "Sí, marcar recepcionado",
      variant: "default",
      onConfirm: async () => {
        try {
          const res = await fetch("/api/orders", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "mark_received_in_warehouse",
              packageId,
            }),
          });
          if (!res.ok) throw new Error("Error al recepcionar paquete");
          await fetchOrders();
        } catch (e) {
          console.error(e);
        } finally {
          setConfirmModalData(null);
        }
      },
    });
  };

  const statusCounts = orders.reduce(
    (acc, o) => {
      acc[o.status] = (acc[o.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const consolidatedCount = orders.filter((o) =>
    o.packages?.some((p: any) => p.delivery_type === "complete"),
  ).length;

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#112237]">
            Gestión de Órdenes & Despachos
          </h1>
          <p className="text-xs text-muted-foreground">
            Monitoreo y administración centralizada de pedidos, almacén y
            envíos.
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={fetchOrders}
          className="h-9 font-semibold"
        >
          <IconRefresh className="w-4 h-4 mr-2" />
          Actualizar
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por código de orden, cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>

        <Button
          variant={onlyConsolidated ? "default" : "outline"}
          size="sm"
          onClick={() => setOnlyConsolidated(!onlyConsolidated)}
          className={`gap-1.5 font-bold transition-all text-xs h-9 ${
            onlyConsolidated
              ? "bg-slate-900 text-white hover:bg-slate-800"
              : "border-slate-800 text-slate-800 hover:bg-slate-100"
          }`}
        >
          <IconBuildingWarehouse className="w-4 h-4 text-[#f25c05]" />
          <span>Consolidados iubizon</span>
          {consolidatedCount > 0 && (
            <Badge className="ml-1 bg-[#f25c05] text-white text-[10px] px-1.5 py-0">
              {consolidatedCount}
            </Badge>
          )}
        </Button>
      </div>

      <Tabs
        value={statusFilter}
        onValueChange={(v) => setStatusFilter(v as OrderStatus | "")}
      >
        <TabsList className="w-full justify-start overflow-x-auto gap-1">
          <TabsTrigger value="">
            Todas
            {orders.length > 0 && (
              <span
                className={`ml-1.5 inline-flex items-center justify-center min-w-[18px] h-4.5 text-[10px] font-extrabold px-1.5 rounded-full ${statusFilter === "" ? "bg-[#f25c05] text-white" : "bg-slate-200 text-slate-700"}`}
              >
                {orders.length}
              </span>
            )}
          </TabsTrigger>
          {Object.entries(STATUS_CONFIG).map(([k, v]) => {
            const count = statusCounts[k] || 0;
            return (
              <TabsTrigger key={k} value={k} className="gap-1">
                <v.icon className="w-3.5 h-3.5" />
                {v.label}
                {count > 0 && (
                  <span
                    className={`ml-1.5 inline-flex items-center justify-center min-w-[18px] h-4.5 text-[10px] font-extrabold px-1.5 rounded-full ${statusFilter === k ? "bg-[#f25c05] text-white" : "bg-slate-200 text-slate-700"}`}
                  >
                    {count}
                  </span>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="flex justify-center py-12">
          <IconRefresh className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No hay órdenes con este filtro
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order: any) => {
            const sc =
              STATUS_CONFIG[order.status as OrderStatus] ||
              STATUS_CONFIG.pending;
            const isExpanded = expandedId === order.id;
            const items =
              order.packages?.flatMap((p: any) =>
                p.items?.map((i: any) => ({ ...i, company: p.company?.name })),
              ) || [];

            const isConsolidated = order.packages?.some(
              (p: any) => p.delivery_type === "complete",
            );

            return (
              <Card
                key={order.id}
                className={`overflow-hidden transition-all ${
                  isConsolidated
                    ? "border-2 border-orange-200 bg-orange-50/20 shadow-xs"
                    : ""
                }`}
              >
                <div
                  className="p-4 flex flex-col sm:flex-row sm:items-center gap-3 cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : order.id)}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Badge
                      variant="outline"
                      className={`font-mono text-xs shrink-0 ${sc.color}`}
                    >
                      #{order.order_code}
                    </Badge>

                    {isConsolidated && (
                      <Badge className="bg-orange-50 text-[#f25c05] font-extrabold text-[10px] uppercase tracking-wider px-2 py-0.5 border border-orange-200 shrink-0">
                        Recepción & Despacho iubizon
                      </Badge>
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <IconUser className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <span className="text-sm font-medium truncate">
                          {order.buyer?.name || "Anónimo"}
                        </span>
                        <span className="text-xs text-muted-foreground truncate">
                          {order.buyer?.email}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-xs">
                        <span className="font-bold text-[#112237]">
                          S/ {formatMoney(order.total_amount)}
                        </span>
                        <span className="text-slate-500">
                          · {items.length} producto(s)
                        </span>
                        {isConsolidated ? (
                          <span className="text-[#f25c05] font-bold">
                            · Almacén iubizon
                          </span>
                        ) : (
                          <span className="text-emerald-600 font-medium">
                            · Envío Directo
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Badge className={sc.color}>
                      <sc.icon className="w-3 h-3 mr-1" />
                      {sc.label}
                    </Badge>
                    {isExpanded ? (
                      <IconChevronUp className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <IconChevronDown className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <CardContent className="border-t bg-muted/30 px-4 py-3 space-y-4">
                    {/* Componente AdminDeliveryTimeline con Summary Compacto + Modal Detallado */}
                    <AdminDeliveryTimeline
                      order={order}
                      onMarkReceived={promptMarkPackageReceived}
                      onOpenDispatchModal={(pkg) => {
                        setDispatchModalData({
                          open: true,
                          packageId: pkg.id,
                          orderCode: order.order_code,
                          companyName: pkg.company?.name || undefined,
                          buyerName:
                            order.shipping?.name ||
                            order.buyer?.name ||
                            undefined,
                          destinationAddress:
                            order.shipping?.address || undefined,
                          courier: pkg.courier,
                          trackingNumber: pkg.tracking_number,
                          trackingUrl: pkg.tracking_url,
                          carrierPhone: pkg.carrier_phone,
                          estimatedDelivery: pkg.estimated_delivery,
                        });
                      }}
                    />

                    {order.invoice?.type && (
                      <div className="text-xs">
                        <p className="font-semibold text-muted-foreground uppercase mb-1">
                          Comprobante fiscal
                        </p>
                        <p className="flex items-center gap-1">
                          <IconReceipt className="w-3 h-3" />
                          {order.invoice.type.toUpperCase()}:{" "}
                          {order.invoice.number} — {order.invoice.legal_name}
                        </p>
                      </div>
                    )}

                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        Productos ({items.length})
                      </p>
                      <div className="space-y-1.5">
                        {items.map((item: any, idx: number) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between text-sm bg-background rounded-md px-3 py-1.5"
                          >
                            <span className="truncate flex-1">
                              {item.product?.title || "Producto"}
                            </span>
                            <span className="text-muted-foreground text-xs ml-2">
                              x{item.quantity}
                            </span>
                            <span className="font-medium ml-3">
                              S/{" "}
                              {formatMoney(
                                item.subtotal ||
                                  item.unit_price * item.quantity,
                              )}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between text-sm font-medium pt-2 mt-2 border-t">
                        <span>Total</span>
                        <span>S/ {formatMoney(order.total_amount)}</span>
                      </div>
                    </div>

                    {order.status !== "cancelled" &&
                      order.status !== "completed" && (
                        <>
                          <Separator />
                          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-2">
                            <div className="flex items-center gap-2 text-amber-800">
                              <IconAlertTriangle className="w-4 h-4" />
                              <p className="text-xs font-semibold">
                                Soporte — Forzar cambio de estado
                              </p>
                            </div>
                            <p className="text-xs text-amber-700">
                              Usar solo cuando el comprador o vendedor no puede
                              completar la acción por su cuenta.
                            </p>
                            <div className="flex flex-wrap gap-2">
                              <Select
                                value=""
                                onValueChange={(v) =>
                                  setConfirm({
                                    action: "advance",
                                    id: order.id,
                                    orderCode: order.order_code,
                                    newStatus: v as OrderStatus,
                                  })
                                }
                              >
                                <SelectTrigger className="w-44 h-8 text-xs">
                                  <SelectValue placeholder="Forzar cambio a..." />
                                </SelectTrigger>
                                <SelectContent>
                                  {Object.entries(STATUS_CONFIG)
                                    .filter(
                                      ([k]) =>
                                        k !== order.status && k !== "cancelled",
                                    )
                                    .map(([k, v]) => (
                                      <SelectItem key={k} value={k}>
                                        {v.label}
                                      </SelectItem>
                                    ))}
                                </SelectContent>
                              </Select>
                              <Button
                                size="sm"
                                variant="destructive"
                                className="h-8 text-xs"
                                onClick={() =>
                                  setConfirm({
                                    action: "cancel",
                                    id: order.id,
                                    orderCode: order.order_code,
                                  })
                                }
                              >
                                <IconX className="w-3 h-3 mr-1" />
                                Cancelar orden
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
        title={
          confirm?.action === "cancel"
            ? "Cancelar orden"
            : `Forzar cambio de estado`
        }
        description={
          confirm?.action === "cancel"
            ? `¿Estás seguro de cancelar la orden #${confirm?.orderCode}? Esta acción no se puede deshacer.`
            : `¿Confirmas forzar el cambio de estado de la orden #${confirm?.orderCode} a "${confirm?.newStatus ? STATUS_CONFIG[confirm.newStatus].label : ""}"?`
        }
        confirmLabel={
          confirm?.action === "cancel" ? "Sí, cancelar" : "Forzar cambio"
        }
        variant={confirm?.action === "cancel" ? "destructive" : "default"}
        onConfirm={executeAction}
      />

      {confirmModalData && (
        <ConfirmModal
          open={confirmModalData.open}
          onOpenChange={(open) =>
            setConfirmModalData(open ? confirmModalData : null)
          }
          title={confirmModalData.title}
          description={confirmModalData.description}
          confirmLabel={confirmModalData.confirmLabel}
          variant={confirmModalData.variant}
          onConfirm={confirmModalData.onConfirm}
        />
      )}

      {dispatchModalData && (
        <AdminDispatchModal
          isOpen={dispatchModalData.open}
          onClose={() => setDispatchModalData(null)}
          packageId={dispatchModalData.packageId}
          orderCode={dispatchModalData.orderCode}
          buyerName={dispatchModalData.buyerName}
          destinationAddress={dispatchModalData.destinationAddress}
          currentCarrierName={dispatchModalData.courier}
          currentTrackingNumber={dispatchModalData.trackingNumber}
          currentEstimatedDelivery={dispatchModalData.estimatedDelivery}
          currentCarrierPhone={dispatchModalData.carrierPhone}
          currentTrackingUrl={dispatchModalData.trackingUrl}
          onSuccess={() => fetchOrders()}
        />
      )}
    </div>
  );
}
