"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Calendar,
  ChevronRight,
  Package,
  ShieldAlert,
  ShoppingBag,
  Truck,
} from "lucide-react";
import Skeleton from "react-loading-skeleton";
import { Navbar } from "@/components/features/layout/Navbar";
import { Footer } from "@/components/features/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { useAuth } from "@/hooks/useAuth";
import { useInitialLoading } from "@/hooks/useInitialLoading";
import { useRealtimeOrders } from "@/hooks/useRealtimeOrders";

interface PackageItem {
  id: string;
  productId: string;
  title: string;
  price: number;
  image: string | null;
  company: {
    id: string;
    name: string;
    logoUrl: string | null;
    slug: string | null;
  } | null;
}

interface TrackingPackage {
  packageId: string;
  packageNumber?: number;
  totalPackages?: number;
  companyName: string | null;
  trackingNumber: string | null;
  courier: string | null;
  trackingUrl: string | null;
  estimatedDelivery: string | null;
  status: string;
  paymentMethod: string;
  cardBrand: string | null;
  cardLast4: string | null;
  subtotal: number;
  netEarnings: number;
  items: PackageItem[];
}

interface BuyerOrderSession {
  orderCode: string;
  createdAt: string;
  subtotal: number;
  taxAmount: number;
  shippingCost: number;
  totalAmount: number;
  totalItems: number;
  destinationAddress: string | null;
  packages: TrackingPackage[];
  hasRefund: boolean;
  refundStatus: string | null;
  refundType: string | null;
}

function formatFullDate(isoString: string) {
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

export default function UserOrdersPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [sessions, setSessions] = useState<BuyerOrderSession[]>([]);
  const { loading, startLoading, stopLoading } = useInitialLoading();
  const [error, setError] = useState<string | null>(null);
  const [statusTab, setStatusTab] = useState("all");

  const userId = user?.id;

  const fetchUserOrders = useCallback(async () => {
    try {
      startLoading();
      setError(null);
      const res = await fetch("/api/user/orders");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al obtener las compras.");
      }

      if (Array.isArray(data.sessions)) {
        setSessions(data.sessions);
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Error al cargar tus pedidos.",
      );
    } finally {
      stopLoading();
    }
  }, [startLoading, stopLoading]);

  useRealtimeOrders({
    userId: userId,
    onUpdate: fetchUserOrders,
  });

  useEffect(() => {
    if (userId) {
      fetchUserOrders();
    }
  }, [userId, fetchUserOrders]);

  if (authLoading || (loading && !error)) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f8fafc]">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton width={200} height={28} />
            <Skeleton width={120} height={36} borderRadius={12} />
          </div>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-3xl border border-[#e2e8f0] p-6 space-y-4 shadow-sm"
            >
              <div className="flex justify-between items-center pb-3 border-b border-[#f1f5f9]">
                <Skeleton width={150} height={22} borderRadius={8} />
                <Skeleton width={100} height={24} borderRadius={20} />
              </div>
              <Skeleton height={80} borderRadius={20} />
            </div>
          ))}
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        {/* Cabecera de Compras */}
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <Link
              href="/user/dashboard?view=personal"
              className="inline-flex items-center gap-1.5 text-xs text-[#64748b] hover:text-[#112237] font-semibold mb-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver a Mi Cuenta</span>
            </Link>
            <h1 className="text-2xl font-extrabold text-[#112237] flex items-center gap-2">
              <ShoppingBag className="w-6 h-6 text-[#f25c05]" />
              <span>Mis Compras & Pedidos</span>
            </h1>
            <p className="text-xs text-[#64748b] mt-0.5">
              Consulta el resumen de tus compras y haz clic en cualquiera para
              ver el seguimiento detallado.
            </p>
          </div>

          <span className="text-xs font-bold text-[#112237] bg-white px-3.5 py-2 rounded-xl border border-[#e2e8f0] shadow-sm">
            {sessions.length}{" "}
            {sessions.length === 1 ? "compra realizada" : "compras realizadas"}
          </span>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 text-xs font-semibold rounded-2xl">
            {error}
          </div>
        )}

        {/* Filtros de Estado */}
        {!loading &&
          sessions.length > 0 &&
          (() => {
            const pendingCount = sessions.filter((s) =>
              s.packages.every((p) => p.status === "pending"),
            ).length;
            const inTransitCount = sessions.filter((s) =>
              s.packages.some(
                (p) => p.status === "shipped" || p.status === "paid",
              ),
            ).length;
            const completedCount = sessions.filter((s) =>
              s.packages.every(
                (p) => p.status === "delivered" || p.status === "completed",
              ),
            ).length;
            const refundedCount = sessions.filter((s) => s.hasRefund).length;
            const allCount = sessions.length;

            const filteredSessions =
              statusTab === "all"
                ? sessions
                : statusTab === "refunded"
                  ? sessions.filter((s) => s.hasRefund)
                  : statusTab === "in_transit"
                    ? sessions.filter((s) =>
                        s.packages.some(
                          (p) => p.status === "shipped" || p.status === "paid",
                        ),
                      )
                    : statusTab === "pending"
                      ? sessions.filter((s) =>
                          s.packages.every((p) => p.status === "pending"),
                        )
                      : sessions.filter((s) =>
                          s.packages.every(
                            (p) =>
                              p.status === "delivered" ||
                              p.status === "completed",
                          ),
                        );

            return (
              <>
                <Tabs value={statusTab} onValueChange={setStatusTab}>
                  <TabsList className="mb-6 flex-wrap h-auto gap-1">
                    <TabsTrigger value="pending">
                      Pendientes
                      {pendingCount > 0 && (
                        <span
                          className={`ml-1.5 inline-flex items-center justify-center min-w-[18px] h-4.5 text-[10px] font-extrabold px-1.5 rounded-full ${
                            statusTab === "pending"
                              ? "bg-amber-500 text-white"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {pendingCount}
                        </span>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="in_transit">
                      En Proceso
                      {inTransitCount > 0 && (
                        <span
                          className={`ml-1.5 inline-flex items-center justify-center min-w-[18px] h-4.5 text-[10px] font-extrabold px-1.5 rounded-full ${
                            statusTab === "in_transit"
                              ? "bg-blue-500 text-white"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {inTransitCount}
                        </span>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="completed">
                      Completados
                      {completedCount > 0 && (
                        <span
                          className={`ml-1.5 inline-flex items-center justify-center min-w-[18px] h-4.5 text-[10px] font-extrabold px-1.5 rounded-full ${
                            statusTab === "completed"
                              ? "bg-emerald-500 text-white"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {completedCount}
                        </span>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="refunded">
                      Reembolsados
                      {refundedCount > 0 && (
                        <span
                          className={`ml-1.5 inline-flex items-center justify-center min-w-[18px] h-4.5 text-[10px] font-extrabold px-1.5 rounded-full ${
                            statusTab === "refunded"
                              ? "bg-red-500 text-white"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {refundedCount}
                        </span>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="all">
                      Todos
                      {allCount > 0 && (
                        <span
                          className={`ml-1.5 inline-flex items-center justify-center min-w-[18px] h-4.5 text-[10px] font-extrabold px-1.5 rounded-full ${
                            statusTab === "all"
                              ? "bg-[#f25c05] text-white"
                              : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          {allCount}
                        </span>
                      )}
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                {/* Lista Resumida de Compras */}
                {filteredSessions.length === 0 ? (
                  <div className="bg-white rounded-3xl border border-[#e2e8f0] p-12 text-center shadow-sm">
                    <Package className="w-10 h-10 text-[#cbd5e1] mx-auto mb-3" />
                    <p className="text-sm font-bold text-[#112237]">
                      No hay compras en esta categoría
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredSessions.map((session) => {
                      // Obtener todos los productos de la compra para la miniatura
                      const allProducts = session.packages.flatMap(
                        (p) => p.items,
                      );
                      const previewProducts = allProducts.slice(0, 4);
                      const extraCount =
                        allProducts.length - previewProducts.length;

                      // Evaluar estado general de la compra
                      const allDelivered = session.packages.every(
                        (p) =>
                          p.status === "delivered" || p.status === "completed",
                      );
                      const anyShipped = session.packages.some(
                        (p) => p.status === "shipped" || p.status === "paid",
                      );

                      const generalStatusLabel = allDelivered
                        ? "Entregado"
                        : anyShipped
                          ? "En Camino"
                          : "Pendiente de Despacho";

                      const generalStatusStyle = allDelivered
                        ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                        : anyShipped
                          ? "bg-blue-100 text-blue-800 border-blue-200"
                          : "bg-amber-100 text-amber-800 border-amber-200";

                      return (
                        <div
                          key={session.orderCode}
                          className="bg-white rounded-3xl border border-[#e2e8f0] p-6 shadow-sm space-y-4 hover:border-[#cbd5e1] transition-all group"
                        >
                          {/* Cabecera Tarjeta Estilo eBay */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#f1f5f9]">
                            <div className="flex flex-wrap items-center gap-3">
                              <span className="text-xs font-black text-white bg-[#112237] px-3.5 py-1.5 rounded-xl tracking-wider">
                                ORDEN #{session.orderCode}
                              </span>
                              <div className="flex items-center gap-1.5 text-xs text-[#475569]">
                                <Calendar className="w-3.5 h-3.5 text-[#f25c05]" />
                                <span>
                                  Comprado el{" "}
                                  {formatFullDate(session.createdAt)}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <span
                                className={`px-3 py-1 rounded-full text-[11px] font-extrabold uppercase border ${generalStatusStyle}`}
                              >
                                {generalStatusLabel}
                              </span>
                              {session.hasRefund && (
                                <span className="px-3 py-1 rounded-full text-[11px] font-extrabold uppercase border border-red-200 bg-red-50 text-red-700 flex items-center gap-1">
                                  <ShieldAlert className="w-3 h-3" />
                                  {session.refundType === "partial"
                                    ? "Parcial"
                                    : "Reembolsado"}
                                </span>
                              )}
                              <span className="text-sm font-black text-[#f25c05]">
                                S/ {session.totalAmount.toFixed(2)}
                              </span>
                            </div>
                          </div>

                          {/* Cuerpo Resumido: Miniaturas de Productos + Resumen de Despachos */}
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-1">
                            {/* Fila de Miniaturas de Productos */}
                            <div className="flex items-center gap-3 overflow-x-auto pb-1 min-w-0">
                              {previewProducts.map((item, idx) => (
                                <div
                                  key={`${item.id}_${idx}`}
                                  className="flex items-center gap-2.5 bg-[#f8fafc] border border-[#e2e8f0] p-2 rounded-2xl shrink-0 max-w-[220px]"
                                >
                                  <div className="relative w-12 h-12 bg-white rounded-xl border border-[#e2e8f0] overflow-hidden shrink-0 flex items-center justify-center">
                                    {item.image ? (
                                      <Image
                                        src={item.image}
                                        alt={item.title}
                                        fill
                                        sizes="48px"
                                        className="object-cover"
                                        unoptimized
                                      />
                                    ) : (
                                      <Package className="w-5 h-5 text-[#cbd5e1]" />
                                    )}
                                  </div>
                                  <div className="min-w-0 pr-1">
                                    <p className="text-xs font-bold text-[#112237] truncate">
                                      {item.title}
                                    </p>
                                    <p className="text-[11px] font-extrabold text-[#f25c05]">
                                      S/ {item.price.toFixed(2)}
                                    </p>
                                  </div>
                                </div>
                              ))}

                              {extraCount > 0 && (
                                <div className="bg-orange-50 border border-orange-200 text-[#f25c05] font-extrabold text-xs px-3 py-4 rounded-2xl shrink-0">
                                  +{extraCount} más
                                </div>
                              )}
                            </div>

                            {/* Resumen de Despachos y Botón de Acción Principal */}
                            <div className="flex items-center justify-between md:justify-end gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-[#f1f5f9] shrink-0">
                              <span className="text-xs text-[#64748b] font-semibold flex items-center gap-1">
                                <Truck className="w-3.5 h-3.5 text-[#f25c05]" />
                                <span>
                                  {session.packages.length}{" "}
                                  {session.packages.length === 1
                                    ? "despacho"
                                    : "despachos"}
                                </span>
                              </span>

                              <Link href={`/user/orders/${session.orderCode}`}>
                                <Button
                                  size="sm"
                                  className="bg-[#f25c05] hover:bg-[#d94d04] text-white text-xs font-extrabold px-5 rounded-xl shadow-xs flex items-center gap-1 group-hover:translate-x-0.5 transition-all"
                                >
                                  <span>Ver detalle del pedido</span>
                                  <ChevronRight className="w-4 h-4" />
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            );
          })()}

        {!loading && sessions.length === 0 && (
          <div className="bg-white rounded-3xl border border-[#e2e8f0] p-12 text-center shadow-sm">
            <Package className="w-12 h-12 text-[#cbd5e1] mx-auto mb-3" />
            <h2 className="text-base font-bold text-[#112237]">
              Aún no has realizado ninguna compra
            </h2>
            <p className="text-xs text-[#64748b] mt-1 mb-6">
              Arma tu propio paquete con productos de múltiples proveedores y
              realiza un solo pago contra entrega.
            </p>
            <Link
              href="/search"
              className="inline-flex items-center gap-2 bg-[#f25c05] hover:bg-[#d94d04] text-white text-xs font-bold px-6 py-3 rounded-xl shadow-md transition-all"
            >
              Explorar Catálogo de Productos
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
