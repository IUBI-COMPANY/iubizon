"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/hooks";
import { Navbar } from "@/components/features/layout/Navbar";
import { Footer } from "@/components/features/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  Loader2,
  MapPin,
  Package,
  Phone,
  ShoppingCart,
  Truck,
  User as UserIcon,
  Wallet,
  XCircle,
} from "lucide-react";

interface SellerPackageItem {
  id: string;
  productId: string;
  title: string;
  price: number;
  image: string | null;
  status: string;
}

interface SellerPackage {
  trackingNumber: string;
  createdAt: string;
  status: string;
  buyerName: string;
  buyerPhone: string | null;
  buyerEmail: string | null;
  destinationAddress: string | null;
  courierInfo: string | null;
  paymentMethod: string;
  subtotal: number;
  platformCommission?: number;
  netEarnings?: number;
  orderIds: string[];
  items: SellerPackageItem[];
}

function formatDate(isoString: string) {
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
  const router = useRouter();

  const [packages, setPackages] = useState<SellerPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusTab, setStatusTab] = useState("all");
  const [updatingGroup, setUpdatingGroup] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login?redirect=/user/dashboard/orders");
    }
  }, [user, authLoading, router]);

  const fetchSellerOrders = useCallback(async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const res = await fetch("/api/seller/orders");
      const data = await res.json();
      if (res.ok && Array.isArray(data.packages)) {
        setPackages(data.packages);
      }
    } catch (err) {
      console.error("Error al cargar ventas del vendedor:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchSellerOrders();
    }
  }, [user, fetchSellerOrders]);

  const updatePackageStatus = async (pkg: SellerPackage, newStatus: string) => {
    setUpdatingGroup(pkg.trackingNumber);
    try {
      const res = await fetch("/api/seller/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderIds: pkg.orderIds,
          trackingNumber: pkg.trackingNumber,
          newStatus,
        }),
      });

      if (!res.ok) {
        throw new Error("Error al actualizar estado");
      }

      await fetchSellerOrders();
    } catch (err) {
      console.error("Error updating package status:", err);
    } finally {
      setUpdatingGroup(null);
    }
  };

  const filteredPackages = packages.filter((pkg) => {
    if (statusTab === "all") return true;
    if (statusTab === "pending") return pkg.status === "pending";
    if (statusTab === "in_progress")
      return ["paid", "shipped"].includes(pkg.status);
    if (statusTab === "completed")
      return ["delivered", "completed", "cancelled"].includes(pkg.status);
    return true;
  });

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <Loader2 className="w-8 h-8 animate-spin text-[#f25c05]" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      <Navbar />

      <div className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
        {/* Cabecera */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/user/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[#112237]">
              Gestión de Pedidos & Ventas
            </h1>
            <p className="text-xs text-[#64748b]">
              Administra los despachos asignados y consulta el monto neto a recibir por iubizon.
            </p>
          </div>
        </div>

        {/* Pestañas de Filtrado */}
        <Tabs value={statusTab} onValueChange={setStatusTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="pending">Pendientes</TabsTrigger>
            <TabsTrigger value="in_progress">En proceso</TabsTrigger>
            <TabsTrigger value="completed">Completados</TabsTrigger>
          </TabsList>

          {filteredPackages.length > 0 ? (
            <div className="space-y-6">
              {filteredPackages.map((pkg) => {
                const isUpdating = updatingGroup === pkg.trackingNumber;

                // Cálculos financieros defensivos
                const subtotal = pkg.subtotal ?? 0;
                const platformCommission =
                  pkg.platformCommission ?? subtotal * 0.1;
                const netEarnings = pkg.netEarnings ?? subtotal - platformCommission;

                return (
                  <div
                    key={pkg.trackingNumber}
                    className="bg-white rounded-3xl border border-[#e2e8f0] p-6 shadow-sm space-y-5 hover:border-[#cbd5e1] transition-all"
                  >
                    {/* Cabecera del Paquete / Venta Agrupada */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#e2e8f0]">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="text-xs font-extrabold text-[#f25c05] bg-orange-50 border border-orange-200 px-3 py-1.5 rounded-xl">
                          Tracking Id: {pkg.trackingNumber}
                        </span>
                        <span className="text-xs font-bold text-[#112237] bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                          <UserIcon className="w-3.5 h-3.5 text-[#64748b]" />
                          <span>Venta a: {pkg.buyerName}</span>
                        </span>
                        <div className="flex items-center gap-1 text-xs text-[#64748b] ml-1">
                          <Calendar className="w-3.5 h-3.5 text-[#f25c05]" />
                          <span>{formatDate(pkg.createdAt)}</span>
                        </div>
                      </div>

                      <span
                        className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                          pkg.status === "delivered" || pkg.status === "completed"
                            ? "bg-emerald-100 text-emerald-800"
                            : pkg.status === "shipped" || pkg.status === "paid"
                              ? "bg-blue-100 text-blue-800"
                              : pkg.status === "cancelled"
                                ? "bg-red-100 text-red-800"
                                : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {pkg.status === "delivered" || pkg.status === "completed"
                          ? "Entregado"
                          : pkg.status === "shipped" || pkg.status === "paid"
                            ? "En Camino"
                            : pkg.status === "cancelled"
                              ? "Cancelado"
                              : "Pendiente de Despacho"}
                      </span>
                    </div>

                    {/* Lista de Productos agrupados en esta venta */}
                    <div className="divide-y divide-[#f1f5f9]">
                      {pkg.items.map((item) => (
                        <div
                          key={item.id}
                          className="py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            <div className="relative w-14 h-14 bg-[#f8fafc] rounded-2xl border border-[#e2e8f0] overflow-hidden shrink-0 flex items-center justify-center">
                              {item.image ? (
                                <Image
                                  src={item.image}
                                  alt={item.title}
                                  fill
                                  className="object-cover"
                                  unoptimized
                                />
                              ) : (
                                <Package className="w-6 h-6 text-[#cbd5e1]" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <Link
                                href={`/products/${item.productId}`}
                                className="font-bold text-sm text-[#112237] hover:text-[#f25c05] transition-colors line-clamp-1"
                              >
                                {item.title}
                              </Link>
                              <p className="text-xs font-extrabold text-[#f25c05] mt-0.5">
                                S/ {item.price.toFixed(2)}
                              </p>
                            </div>
                          </div>

                          <Link
                            href={`/products/${item.productId}`}
                            className="text-xs font-semibold text-[#64748b] hover:text-[#112237] hover:underline shrink-0"
                          >
                            Ver producto
                          </Link>
                        </div>
                      ))}
                    </div>

                    {/* Sección Relevante para el Vendedor: Datos de Despacho + Pago Neto por iubizon */}
                    <div className="bg-[#f8fafc] rounded-2xl p-5 border border-[#e2e8f0] grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      {/* Lado Izquierdo: Datos de Contacto & Entrega Destacados */}
                      <div className="space-y-3">
                        <p className="font-extrabold text-[#112237] border-b border-[#e2e8f0] pb-2 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                          <MapPin className="w-4 h-4 text-[#f25c05]" />
                          <span>Datos de Despacho & Destino</span>
                        </p>

                        <div className="space-y-2 text-xs">
                          <p className="text-[#334155]">
                            <strong className="text-[#112237]">Destinatario:</strong>{" "}
                            {pkg.buyerName}
                          </p>
                          {pkg.destinationAddress && (
                            <p className="text-[#334155] flex items-start gap-1">
                              <MapPin className="w-3.5 h-3.5 text-[#64748b] shrink-0 mt-0.5" />
                              <span>
                                <strong className="text-[#112237]">Dirección de Envío:</strong>{" "}
                                {pkg.destinationAddress}
                              </span>
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Lado Derecho: Ganancia Neto del Vendedor pagada por iubizon */}
                      <div className="space-y-2 border-t md:border-t-0 pt-3 md:pt-0 border-[#e2e8f0] flex flex-col justify-between">
                        <div className="space-y-1">
                          <p className="font-extrabold text-[#112237] border-b border-[#e2e8f0] pb-2 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                            <Wallet className="w-4 h-4 text-[#f25c05]" />
                            <span>Pago de iubizon al Vendedor</span>
                          </p>
                          <p className="text-[#334155]">
                            <strong className="text-[#112237]">Valor de Productos:</strong> S/ {subtotal.toFixed(2)}
                          </p>
                          <p className="text-[#64748b]">
                            <strong className="text-[#112237]">Comisión iubizon (10%):</strong> - S/ {platformCommission.toFixed(2)}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-[#e2e8f0] flex items-center justify-between">
                          <span className="text-[11px] text-[#475569] font-bold">
                            Monto Neto a Recibir por iubizon:
                          </span>
                          <span className="text-xl font-black text-emerald-600">
                            S/ {netEarnings.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Botones de Acción para el Vendedor */}
                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-[#f1f5f9]">
                      {pkg.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => updatePackageStatus(pkg, "shipped")}
                            disabled={isUpdating}
                            className="bg-[#f25c05] hover:bg-[#d94d04] text-white text-xs font-extrabold px-5 rounded-xl shadow-xs"
                          >
                            {isUpdating ? (
                              <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                            ) : (
                              <CheckCircle className="w-4 h-4 mr-1.5" />
                            )}
                            Confirmar Despacho
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => updatePackageStatus(pkg, "cancelled")}
                            disabled={isUpdating}
                            className="text-xs font-bold px-4 rounded-xl"
                          >
                            <XCircle className="w-4 h-4 mr-1.5" />
                            Cancelar
                          </Button>
                        </>
                      )}

                      {(pkg.status === "shipped" || pkg.status === "paid") && (
                        <Button
                          size="sm"
                          onClick={() => updatePackageStatus(pkg, "delivered")}
                          disabled={isUpdating}
                          className="bg-[#f25c05] hover:bg-[#d94d04] text-white text-xs font-extrabold px-5 rounded-xl"
                        >
                          {isUpdating ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                          ) : (
                            <Truck className="w-4 h-4 mr-1.5" />
                          )}
                          Marcar como Entregado
                        </Button>
                      )}

                      {(pkg.status === "delivered" || pkg.status === "completed") && (
                        <div className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-700 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-200">
                          <CheckCircle className="w-4 h-4" />
                          <span>Despacho Completado</span>
                        </div>
                      )}

                      {pkg.status === "cancelled" && (
                        <div className="flex items-center gap-1.5 text-xs font-bold text-red-700 bg-red-50 px-4 py-2 rounded-xl border border-red-200">
                          <XCircle className="w-4 h-4" />
                          <span>Despacho Cancelado</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-3xl border border-[#e2e8f0] shadow-sm">
              <ShoppingCart className="w-12 h-12 text-[#cbd5e1] mx-auto mb-3" />
              <h2 className="text-base font-bold text-[#112237] mb-1">
                No tienes registros en esta sección
              </h2>
              <p className="text-xs text-[#64748b] mb-6">
                Las ventas de tus productos aparecerán aquí.
              </p>
              <Link href="/search">
                <Button className="bg-[#f25c05] hover:bg-[#d94d04] text-white text-xs font-bold px-6 py-2.5 rounded-xl">
                  Explorar catálogo
                </Button>
              </Link>
            </div>
          )}
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}

export default function OrdersPage() {
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
