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

interface SellerPackageItem {
  id: string;
  productId: string;
  title: string;
  price: number;
  quantity: number;
  subtotal: number;
  image: string | null;
  status: string;
}

interface SellerPackage {
  packageId: string;
  companyId: string;
  companyName: string;
  trackingNumber: string | null;
  courier: string | null;
  trackingUrl: string | null;
  carrierPhone: string | null;
  estimatedDelivery: string | null;
  status: string;
  createdAt: string;
  buyerName: string;
  buyerPhone: string | null;
  buyerEmail: string | null;
  buyerDocumentType: string | null;
  buyerDocumentNumber: string | null;
  destinationAddress: string | null;
  destinationDepartment: string | null;
  destinationProvince: string | null;
  destinationDistrict: string | null;
  destinationReference: string | null;
  paymentMethod: string;
  cardBrand: string | null;
  cardLast4: string | null;
  docType: string | null;
  identityNumber: string | null;
  subtotal: number;
  platformCommission: number;
  netEarnings: number;
  items: SellerPackageItem[];
  hasPendingRefund: boolean;
  pendingRefundType: string | null;
}

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

  const [packages, setPackages] = useState<SellerPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusTab, setStatusTab] = useState("pending");
  const hasLoadedOnce = useRef(false);

  // Estado del modal de despacho
  const [selectedPackageForDispatch, setSelectedPackageForDispatch] =
    useState<SellerPackage | null>(null);

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
        : `/api/seller/orders?company_id=personal`;

      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al cargar las ventas.");
      }
      setPackages(data.packages || []);
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
    if (!user || packages.length === 0) return;
    const interval = setInterval(() => {
      fetchOrders();
    }, 60_000);
    return () => clearInterval(interval);
  }, [user, packages.length, fetchOrders]);

  const filteredPackages = packages.filter((pkg) => {
    if (statusTab === "all") return true;
    if (statusTab === "pending") return pkg.status === "pending";
    if (statusTab === "shipped")
      return pkg.status === "shipped" || pkg.status === "paid";
    if (statusTab === "completed")
      return pkg.status === "delivered" || pkg.status === "completed";
    if (statusTab === "refund") return pkg.hasPendingRefund;
    return true;
  });

  const pendingCount = packages.filter((p) => p.status === "pending").length;
  const shippedCount = packages.filter(
    (p) => p.status === "shipped" || p.status === "paid",
  ).length;
  const completedCount = packages.filter(
    (p) => p.status === "delivered" || p.status === "completed",
  ).length;
  const refundCount = packages.filter((p) => p.hasPendingRefund).length;
  const totalNetEarnings = packages.reduce(
    (acc, p) => acc + (p.netEarnings || 0),
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

            <div className="bg-white rounded-2xl p-5 border border-[#e2e8f0] shadow-sm">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="p-2.5 bg-orange-500/10 rounded-xl">
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

        {/* Pestañas de estado */}
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
            <TabsTrigger value="shipped">
              En proceso
              {shippedCount > 0 && (
                <span
                  className={`ml-1.5 inline-flex items-center justify-center min-w-[18px] h-4.5 text-[10px] font-extrabold px-1.5 rounded-full ${
                    statusTab === "shipped"
                      ? "bg-blue-500 text-white"
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
                      ? "bg-emerald-500 text-white"
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
              {packages.length > 0 && (
                <span
                  className={`ml-1.5 inline-flex items-center justify-center min-w-[18px] h-4.5 text-[10px] font-extrabold px-1.5 rounded-full ${
                    statusTab === "all"
                      ? "bg-[#f25c05] text-white"
                      : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {packages.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {filteredPackages.length > 0 ? (
            <div className="space-y-4">
              {[...filteredPackages]
                .sort((a, b) => {
                  if (a.status === "pending" && b.status !== "pending")
                    return -1;
                  if (a.status !== "pending" && b.status === "pending")
                    return 1;
                  return 0;
                })
                .map((pkg) => {
                  const isDelivered =
                    pkg.status === "delivered" || pkg.status === "completed";
                  const isShipped =
                    pkg.status === "shipped" || pkg.status === "paid";
                  const isPending = pkg.status === "pending";

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
                      key={pkg.packageId}
                      className={`bg-white rounded-3xl border p-6 shadow-sm transition-all space-y-4 ${
                        isPending
                          ? "border-amber-300 hover:border-amber-400"
                          : "border-[#e2e8f0] hover:border-[#cbd5e1]"
                      }`}
                    >
                      {/* Fila Superior: Identificadores y Estado */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#f1f5f9]">
                        <div className="flex flex-wrap items-center gap-2.5">
                          {pkg.trackingNumber ? (
                            <span className="text-xs font-extrabold text-[#f25c05] bg-orange-50 border border-orange-200 px-3 py-1 rounded-xl flex items-center gap-1.5">
                              <Truck className="w-3.5 h-3.5" />
                              <span>Tracking Id: {pkg.trackingNumber}</span>
                            </span>
                          ) : (
                            <span className="text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1 rounded-xl flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5" />
                              <span>
                                Paquete {pkg.companyName} #
                                {pkg.packageId.slice(0, 8)} (Despacho Pendiente)
                              </span>
                            </span>
                          )}

                          <span className="text-xs font-semibold text-[#112237] bg-slate-100 px-3 py-1 rounded-xl flex items-center gap-1.5">
                            <UserIcon className="w-3.5 h-3.5 text-[#64748b]" />
                            <span>Venta a: {pkg.buyerName}</span>
                          </span>

                          <span className="text-xs text-[#64748b] flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-[#f25c05]" />
                            <span>{formatFullDate(pkg.createdAt)}</span>
                          </span>
                        </div>

                        <span
                          className={`px-3.5 py-1 rounded-full text-[11px] font-extrabold uppercase border ${badgeStyle}`}
                        >
                          {badgeLabel}
                        </span>

                        {pkg.hasPendingRefund && (
                          <Link
                            href={`/user/dashboard/orders/${encodeURIComponent(pkg.packageId)}`}
                            className="px-3 py-1 rounded-full text-[11px] font-extrabold uppercase border border-red-200 bg-red-50 text-red-700 flex items-center gap-1.5 hover:bg-red-100 transition-colors"
                          >
                            <ShieldAlert className="w-3 h-3" />
                            Reembolso{" "}
                            {pkg.pendingRefundType === "partial"
                              ? "Parcial"
                              : "Total"}
                          </Link>
                        )}
                      </div>

                      {/* Previsualización Compacta de Productos */}
                      <div className="flex items-center gap-3 overflow-x-auto py-1">
                        {pkg.items.map((item) => (
                          <div
                            key={item.id}
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
                            S/ {formatMoney(pkg.netEarnings)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap justify-end">
                          {(isPending || isShipped) && (
                            <Button
                              size="sm"
                              onClick={() => setSelectedPackageForDispatch(pkg)}
                              disabled={isUpdating}
                              className="bg-[#f25c05] hover:bg-[#d94d04] text-white font-extrabold text-xs px-4 py-2 rounded-xl shadow-sm"
                            >
                              <Truck className="w-4 h-4 mr-1.5" />
                              {pkg.trackingNumber
                                ? "Editar Despacho"
                                : "Confirmar Despacho"}
                            </Button>
                          )}

                          {isDelivered && (
                            <Link href="/user/dashboard/payouts">
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs font-extrabold border-emerald-300 text-emerald-700 hover:bg-emerald-50 rounded-xl"
                              >
                                <Wallet className="w-3.5 h-3.5 mr-1" />
                                Ver pago en Mis Finanzas
                              </Button>
                            </Link>
                          )}

                          <Link
                            href={`/user/dashboard/orders/${encodeURIComponent(pkg.packageId)}`}
                          >
                            <Button
                              size="sm"
                              variant="secondary"
                              className="bg-slate-100 hover:bg-slate-200 text-[#112237] text-xs font-extrabold px-4 py-2 rounded-xl"
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
                No tienes ventas en esta sección
              </h2>
              <p className="text-xs text-[#64748b]">
                Las compras recibidas aparecerán aquí para que ingreses la
                información de despacho.
              </p>
            </div>
          )}
        </Tabs>
      </main>

      {/* Modal Reutilizable de Despacho */}
      {selectedPackageForDispatch && (
        <DispatchModal
          isOpen={!!selectedPackageForDispatch}
          onClose={() => setSelectedPackageForDispatch(null)}
          packageId={selectedPackageForDispatch.packageId}
          currentCarrierName={selectedPackageForDispatch.courier}
          currentTrackingNumber={selectedPackageForDispatch.trackingNumber}
          currentEstimatedDelivery={
            selectedPackageForDispatch.estimatedDelivery
          }
          currentCarrierPhone={selectedPackageForDispatch.carrierPhone}
          currentTrackingUrl={selectedPackageForDispatch.trackingUrl}
          onSuccess={() => fetchOrders()}
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
