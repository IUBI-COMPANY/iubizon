"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { useCompany } from "@/context/CompanyContext";
import { useRealtimeOrders } from "@/hooks/useRealtimeOrders";
import { Navbar } from "@/components/features/layout/Navbar";
import { Footer } from "@/components/features/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { DispatchModal } from "@/components/features/orders/DispatchModal";
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  Eye,
  Loader2,
  Package,
  ShoppingCart,
  ShieldAlert,
  Truck,
  User as UserIcon,
  Wallet,
} from "lucide-react";

import {
  SellerOrder,
  SellerOrderShipment,
} from "@/app/api/seller/orders/route";

function formatMoney(value: number | string | undefined | null): string {
  const num = typeof value === "number" ? value : Number(value || 0);
  return (isNaN(num) ? 0 : num).toFixed(2);
}

function formatFullDate(isoString: string) {
  try {
    const d = new Date(isoString);
    return new Intl.DateTimeFormat("es-PE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(d);
  } catch {
    return isoString;
  }
}

function OrdersContent() {
  const { user, isLoading: authLoading } = useAuth();
  const { companies, activeCompany, isLoadingCompanies } = useCompany();
  const router = useRouter();

  const [orders, setOrders] = useState<SellerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusTab, setStatusTab] = useState("pending");
  const hasLoadedOnce = useRef(false);

  // Estado del modal de despacho
  const [selectedOrderForDispatch, setSelectedOrderForDispatch] =
    useState<SellerOrder | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login?redirect=/user/dashboard/orders");
    }
  }, [user, authLoading, router]);

  // Solo usuarios con empresa (o miembros de una) pueden acceder a esta ruta.
  useEffect(() => {
    if (!authLoading && user && !isLoadingCompanies && companies.length === 0) {
      router.replace("/user/dashboard");
    }
  }, [authLoading, user, isLoadingCompanies, companies.length, router]);

  const fetchOrders = useCallback(async () => {
    if (!user || isLoadingCompanies) return;
    try {
      if (hasLoadedOnce.current) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      const url = activeCompany?.id
        ? `/api/seller/orders?company_id=${activeCompany.id}`
        : `/api/seller/orders`;

      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al cargar las ventas.");
      }
      setOrders(data.orders || []);
      hasLoadedOnce.current = true;
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Error al obtener las ventas.",
      );
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [user, isLoadingCompanies, activeCompany?.id]);

  useRealtimeOrders({
    companyId: activeCompany?.id,
    onUpdate: fetchOrders,
  });

  useEffect(() => {
    if (user && !isLoadingCompanies) {
      fetchOrders();
    }
  }, [user, isLoadingCompanies, activeCompany?.id, fetchOrders]);

  useEffect(() => {
    if (!user || orders.length === 0) return;
    const interval = setInterval(() => {
      fetchOrders();
    }, 60_000);
    return () => clearInterval(interval);
  }, [user, orders.length, fetchOrders]);

  const filteredOrders = orders.filter((ord) => {
    if (statusTab === "all") return true;
    if (statusTab === "pending") return ord.status === "pending";
    if (statusTab === "shipped") return ord.status === "shipped";
    if (statusTab === "completed")
      return ord.status === "delivered" || ord.status === "completed";
    if (statusTab === "refund") return ord.hasPendingRefund;
    return true;
  });

  const pendingCount = orders.filter((o) => o.status === "pending").length;
  const shippedCount = orders.filter((o) => o.status === "shipped").length;
  const completedCount = orders.filter(
    (o) => o.status === "delivered" || o.status === "completed",
  ).length;
  const refundCount = orders.filter((o) => o.hasPendingRefund).length;
  const totalNetEarnings = orders.reduce(
    (acc, o) => acc + (o.netEarnings || 0),
    0,
  );

  if (authLoading || isLoadingCompanies || (loading && !isRefreshing)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <Loader2 className="w-8 h-8 animate-spin text-[#f25c05]" />
      </div>
    );
  }

  if (!user) return null;

  // Evitar renderizar la UI de ventas mientras se redirige a usuarios sin empresa.
  if (companies.length === 0) return null;

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/user/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-black text-[#112237]">
              Gestión de Pedidos & Ventas{" "}
              {activeCompany ? `de ${activeCompany.name}` : ""}
            </h1>
            <p className="text-xs text-[#64748b] mt-0.5">
              {activeCompany
                ? `Administra los despachos y consulta las ventas de ${activeCompany.name}.`
                : "Administra los despachos asignados y consulta el estado de cada venta."}
            </p>
          </div>
        </div>

        {/* KPIs Informativos de Ventas */}
        {!loading && (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-[#e2e8f0] shadow-sm">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="p-2.5 bg-blue-500/10 rounded-xl">
                  <ShoppingCart className="w-5 h-5 text-blue-500" />
                </div>
                <span className="text-xs font-bold text-[#64748b] uppercase tracking-wider">
                  Nuevas Ventas
                </span>
              </div>
              <p className="text-2xl font-black text-[#112237]">
                {pendingCount}
              </p>
              <p className="text-xs text-[#64748b] mt-0.5">
                {pendingCount === 1
                  ? "pendiente de despacho"
                  : "pendientes de despacho"}
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-[#e2e8f0] shadow-sm">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="p-2.5 bg-amber-500/10 rounded-xl">
                  <Truck className="w-5 h-5 text-amber-500" />
                </div>
                <span className="text-xs font-bold text-[#64748b] uppercase tracking-wider">
                  En Camino
                </span>
              </div>
              <p className="text-2xl font-black text-[#112237]">
                {shippedCount}
              </p>
              <p className="text-xs text-[#64748b] mt-0.5">
                {shippedCount === 1
                  ? "pedido en proceso"
                  : "pedidos en proceso"}
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-[#e2e8f0] shadow-sm">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="p-2.5 bg-emerald-500/10 rounded-xl">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                </div>
                <span className="text-xs font-bold text-[#64748b] uppercase tracking-wider">
                  Completadas
                </span>
              </div>
              <p className="text-2xl font-black text-[#112237]">
                {completedCount}
              </p>
              <p className="text-xs text-[#64748b] mt-0.5">
                {completedCount === 1 ? "venta entregada" : "ventas entregadas"}
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-[#e2e8f0] shadow-sm">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="p-2.5 bg-red-500/10 rounded-xl">
                  <ShieldAlert className="w-5 h-5 text-red-500" />
                </div>
                <span className="text-xs font-bold text-[#64748b] uppercase tracking-wider">
                  Reembolsos
                </span>
              </div>
              <p className="text-2xl font-black text-[#112237]">
                {refundCount}
              </p>
              <p className="text-xs text-[#64748b] mt-0.5">
                {refundCount === 1
                  ? "solicitud pendiente"
                  : "solicitudes pendientes"}
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-[#e2e8f0] shadow-sm col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="p-2.5 bg-[#f25c05]/10 rounded-xl">
                  <Wallet className="w-5 h-5 text-[#f25c05]" />
                </div>
                <span className="text-xs font-bold text-[#64748b] uppercase tracking-wider">
                  Neto Total
                </span>
              </div>
              <p className="text-2xl font-black text-emerald-600">
                S/ {formatMoney(totalNetEarnings)}
              </p>
              <p className="text-xs text-[#64748b] mt-0.5">
                acumulado a recibir
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-4 rounded-2xl">
            {error}
          </div>
        )}

        {/* Pestañas de Estado y Filtros */}
        <div className="space-y-4">
          <Tabs value={statusTab} onValueChange={setStatusTab}>
            <TabsList className="bg-white border border-[#e2e8f0] p-1 rounded-2xl shadow-xs">
              <TabsTrigger value="pending">
                Pendientes
                {pendingCount > 0 && (
                  <span
                    className={`ml-1.5 inline-flex items-center justify-center min-w-[18px] h-4.5 text-[10px] font-extrabold px-1.5 rounded-full ${
                      statusTab === "pending"
                        ? "bg-[#f25c05] text-white"
                        : "bg-amber-100 text-amber-900"
                    }`}
                  >
                    {pendingCount}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="shipped">
                En proceso
                {shippedCount > 0 && (
                  <span
                    className={`ml-1.5 inline-flex items-center justify-center min-w-[18px] h-4.5 text-[10px] font-extrabold px-1.5 rounded-full ${
                      statusTab === "shipped"
                        ? "bg-[#f25c05] text-white"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {shippedCount}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completados
                {completedCount > 0 && (
                  <span
                    className={`ml-1.5 inline-flex items-center justify-center min-w-[18px] h-4.5 text-[10px] font-extrabold px-1.5 rounded-full ${
                      statusTab === "completed"
                        ? "bg-[#f25c05] text-white"
                        : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    {completedCount}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="refund">
                Reembolsos
                {refundCount > 0 && (
                  <span
                    className={`ml-1.5 inline-flex items-center justify-center min-w-[18px] h-4.5 text-[10px] font-extrabold px-1.5 rounded-full ${
                      statusTab === "refund"
                        ? "bg-red-500 text-white"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {refundCount}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="all">
                Todos
                {orders.length > 0 && (
                  <span
                    className={`ml-1.5 inline-flex items-center justify-center min-w-[18px] h-4.5 text-[10px] font-extrabold px-1.5 rounded-full ${
                      statusTab === "all"
                        ? "bg-[#f25c05] text-white"
                        : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {orders.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {filteredOrders.length > 0 ? (
            <div className="space-y-4">
              {[...filteredOrders]
                .sort((a, b) => {
                  if (a.status === "pending" && b.status !== "pending")
                    return -1;
                  if (a.status !== "pending" && b.status === "pending")
                    return 1;
                  return 0;
                })
                .map((ord) => {
                  const isDelivered =
                    ord.status === "delivered" || ord.status === "completed";
                  const isShipped = ord.status === "shipped";
                  const isPending = ord.status === "pending";

                  const badgeStyle = isDelivered
                    ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                    : isShipped
                      ? "bg-blue-100 text-blue-800 border-blue-200"
                      : "bg-amber-100 text-amber-800 border-amber-200";

                  const badgeLabel = isDelivered
                    ? "ENTREGADO"
                    : isShipped
                      ? "EN CAMINO"
                      : "PENDIENTE DE DESPACHO";

                  return (
                    <div
                      key={ord.orderId}
                      className={`bg-white rounded-3xl border p-6 shadow-sm transition-all space-y-4 ${
                        isPending
                          ? "border-amber-300 hover:border-amber-400"
                          : "border-[#e2e8f0] hover:border-[#cbd5e1]"
                      }`}
                    >
                      {/* Fila Superior: Identificadores y Estado */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#f1f5f9]">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <span className="text-xs font-black text-[#112237] bg-slate-100 border border-slate-200 px-3 py-1 rounded-xl">
                            ORDEN #{ord.orderCode}
                          </span>

                          {/* Resumen de Guías de Despacho */}
                          {ord.packages.length > 1 ? (
                            <span className="text-xs font-extrabold text-blue-800 bg-blue-50 border border-blue-200 px-3 py-1 rounded-xl flex items-center gap-1.5">
                              <Truck className="w-3.5 h-3.5 text-blue-600" />
                              <span>
                                {ord.packages.length} Bultos en camino
                              </span>
                            </span>
                          ) : ord.packages.length === 1 &&
                            ord.packages[0].trackingNumber ? (
                            <span className="text-xs font-extrabold text-[#f25c05] bg-orange-50 border border-orange-200 px-3 py-1 rounded-xl flex items-center gap-1.5 max-w-xs truncate">
                              <Truck className="w-3.5 h-3.5 shrink-0" />
                              <span className="truncate">
                                Tracking: {ord.packages[0].trackingNumber}
                              </span>
                            </span>
                          ) : (
                            <span className="text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1 rounded-xl flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5" />
                              <span>Despacho Pendiente</span>
                            </span>
                          )}

                          <span className="text-xs font-semibold text-[#112237] bg-slate-100 px-3 py-1 rounded-xl flex items-center gap-1.5">
                            <UserIcon className="w-3.5 h-3.5 text-[#64748b]" />
                            <span>Venta a: {ord.buyerName}</span>
                          </span>

                          <span className="text-xs text-[#64748b] flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-[#f25c05]" />
                            <span>{formatFullDate(ord.createdAt)}</span>
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`px-3.5 py-1 rounded-full text-[11px] font-extrabold uppercase border ${badgeStyle}`}
                          >
                            {badgeLabel}
                          </span>

                          {ord.hasPendingRefund && (
                            <Link
                              href={`/user/dashboard/orders/${encodeURIComponent(ord.orderCode || ord.orderId)}`}
                              className="px-3 py-1 rounded-full text-[11px] font-extrabold uppercase border border-red-200 bg-red-50 text-red-700 flex items-center gap-1.5 hover:bg-red-100 transition-colors"
                            >
                              <ShieldAlert className="w-3 h-3" />
                              Reembolso{" "}
                              {ord.pendingRefundType === "partial"
                                ? "Parcial"
                                : "Total"}
                            </Link>
                          )}
                        </div>
                      </div>

                      {/* Previsualización Consolidada de Productos */}
                      <div className="flex items-center gap-3 overflow-x-auto py-1">
                        {ord.items.map((item) => (
                          <div
                            key={item.id || item.productId}
                            className="flex items-center gap-3 bg-[#f8fafc] p-2.5 rounded-2xl border border-[#e2e8f0] shrink-0 max-w-xs"
                          >
                            <div className="w-12 h-12 bg-white rounded-xl overflow-hidden relative shrink-0 border border-slate-200">
                              {item.image ? (
                                <Image
                                  src={item.image}
                                  alt={item.title}
                                  fill
                                  sizes="48px"
                                  className="object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-300">
                                  <Package className="w-5 h-5" />
                                </div>
                              )}
                            </div>
                            <div className="pr-2">
                              <p className="text-xs font-bold text-[#112237] line-clamp-1">
                                {item.title}
                              </p>
                              <p className="text-[11px] font-extrabold text-[#f25c05]">
                                S/ {formatMoney(item.price)}{" "}
                                <span className="text-[#64748b] font-normal">
                                  (x{item.quantity || 1})
                                </span>
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Barra Inferior Resumida Financiera & Acciones */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#f1f5f9]">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-[#64748b] font-medium">
                            Monto Neto a Recibir por iubizon:
                          </span>
                          <span className="text-xl font-black text-emerald-600">
                            S/ {formatMoney(ord.netEarnings)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap justify-end">
                          {isPending && (
                            <Button
                              size="sm"
                              onClick={() => setSelectedOrderForDispatch(ord)}
                              disabled={isUpdating}
                              className="bg-[#f25c05] hover:bg-[#d94d04] text-white font-extrabold text-xs px-4 py-2 rounded-xl shadow-xs cursor-pointer"
                            >
                              <Truck className="w-4 h-4 mr-1.5" />
                              Despachar Pedido
                            </Button>
                          )}

                          {isDelivered && (
                            <Link href="/user/dashboard/payouts">
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs font-extrabold border-emerald-300 text-emerald-700 hover:bg-emerald-50 rounded-xl cursor-pointer"
                              >
                                <Wallet className="w-3.5 h-3.5 mr-1" />
                                Ver pago en Mis Finanzas
                              </Button>
                            </Link>
                          )}

                          <Link
                            href={`/user/dashboard/orders/${encodeURIComponent(ord.orderCode || ord.orderId)}`}
                          >
                            <Button
                              size="sm"
                              variant="secondary"
                              className="bg-slate-100 hover:bg-slate-200 text-[#112237] text-xs font-extrabold px-4 py-2 rounded-xl cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5 mr-1.5 text-[#f25c05]" />
                              Ver detalle de la venta ➔
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-3xl border border-[#e2e8f0] shadow-sm">
              <ShoppingCart className="w-12 h-12 text-[#cbd5e1] mx-auto mb-3" />
              <h2 className="text-base font-bold text-[#112237] mb-1">
                No hay ventas en esta sección
              </h2>
              <p className="text-xs text-[#64748b] max-w-sm mx-auto">
                {statusTab === "pending"
                  ? "No tienes pedidos pendientes de despacho en este momento."
                  : statusTab === "shipped"
                    ? "No tienes envíos en tránsito actualmente."
                    : statusTab === "completed"
                      ? "No tienes ventas completadas registradas."
                      : "No hay registros con el filtro seleccionado."}
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Modal de Despacho Reutilizable */}
      {selectedOrderForDispatch && (
        <DispatchModal
          isOpen={Boolean(selectedOrderForDispatch)}
          onClose={() => setSelectedOrderForDispatch(null)}
          packageId={
            selectedOrderForDispatch.packages[0]?.packageId ||
            selectedOrderForDispatch.orderId
          }
          items={selectedOrderForDispatch.items}
          initialShipments={selectedOrderForDispatch.packages}
          onSuccess={() => {
            setSelectedOrderForDispatch(null);
            fetchOrders();
          }}
        />
      )}

      <Footer />
    </div>
  );
}

export default function SellerOrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
          <Loader2 className="w-8 h-8 animate-spin text-[#f25c05]" />
        </div>
      }
    >
      <OrdersContent />
    </Suspense>
  );
}
