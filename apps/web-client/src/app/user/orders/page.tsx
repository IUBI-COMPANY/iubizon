"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle,
  Clock,
  ExternalLink,
  Loader2,
  Package,
  ShoppingBag,
  Truck,
} from "lucide-react";
import Skeleton from "react-loading-skeleton";
import { Navbar } from "@/components/features/layout/Navbar";
import { Footer } from "@/components/features/layout/Footer";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";

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
  trackingNumber: string | null;
  carrierName: string | null;
  trackingUrl: string | null;
  estimatedDelivery: string | null;
  status: string;
  paymentMethod: string;
  subtotal: number;
  taxAmount: number;
  shippingCost: number;
  totalAmount: number;
  destinationAddress: string | null;
  courierInfo: string | null;
  sellerName: string | null;
  orderIds: string[];
  items: PackageItem[];
}

interface PurchaseOrderSession {
  orderCode: string;
  createdAt: string;
  subtotal: number;
  taxAmount: number;
  shippingCost: number;
  totalAmount: number;
  totalItems: number;
  destinationAddress: string | null;
  packages: TrackingPackage[];
}

function formatDate(isoString: string | null) {
  if (!isoString) return null;
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

export default function UserOrdersPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [sessions, setSessions] = useState<PurchaseOrderSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmingPackageKey, setConfirmingPackageKey] = useState<string | null>(null);

  const fetchUserOrders = useCallback(async () => {
    try {
      setLoading(true);
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
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchUserOrders();
    }
  }, [user, fetchUserOrders]);

  const handleConfirmReceipt = async (pkg: TrackingPackage) => {
    if (!confirm("¿Confirmas que has recibido el paquete a satisfacción?")) return;

    const pkgKey = pkg.trackingNumber || pkg.orderIds[0];
    setConfirmingPackageKey(pkgKey);

    try {
      const res = await fetch("/api/user/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderIds: pkg.orderIds }),
      });

      if (!res.ok) {
        throw new Error("Error al confirmar recepción");
      }

      await fetchUserOrders();
    } catch (err) {
      console.error("Error al confirmar recepción:", err);
    } finally {
      setConfirmingPackageKey(null);
    }
  };

  if (authLoading || (loading && !error)) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f8fafc]">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton width={200} height={28} />
            <Skeleton width={120} height={36} borderRadius={12} />
          </div>
          {[1, 2].map((i) => (
            <div
              key={i}
              className="bg-white rounded-3xl border border-[#e2e8f0] p-6 space-y-4 shadow-sm"
            >
              <div className="flex justify-between items-center pb-3 border-b border-[#f1f5f9]">
                <Skeleton width={150} height={22} borderRadius={8} />
                <Skeleton width={100} height={24} borderRadius={20} />
              </div>
              <Skeleton height={140} borderRadius={20} />
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
              Historial y seguimiento de entrega de tus paquetes de compra realizados en iubizon.
            </p>
          </div>

          <span className="text-xs font-bold text-[#112237] bg-white px-3.5 py-2 rounded-xl border border-[#e2e8f0] shadow-sm">
            {sessions.length} {sessions.length === 1 ? "compra realizada" : "compras realizadas"}
          </span>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 text-xs font-semibold rounded-2xl">
            {error}
          </div>
        )}

        {/* Lista de Órdenes de Compra */}
        {sessions.length === 0 ? (
          <div className="bg-white rounded-3xl border border-[#e2e8f0] p-12 text-center shadow-sm">
            <Package className="w-12 h-12 text-[#cbd5e1] mx-auto mb-3" />
            <h2 className="text-base font-bold text-[#112237]">
              Aún no has realizado ninguna compra
            </h2>
            <p className="text-xs text-[#64748b] mt-1 mb-6">
              Arma tu propio paquete con productos de múltiples proveedores y realiza un solo pago contra entrega.
            </p>
            <Link
              href="/search"
              className="inline-flex items-center gap-2 bg-[#f25c05] hover:bg-[#d94d04] text-white text-xs font-bold px-6 py-3 rounded-xl shadow-md transition-all"
            >
              Explorar Catálogo de Productos
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {sessions.map((session) => (
              <div
                key={session.orderCode}
                className="bg-white rounded-3xl border border-[#e2e8f0] p-6 shadow-sm space-y-6"
              >
                {/* Cabecera Principal de la Orden de Compra */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#e2e8f0]">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-xs font-black text-white bg-[#112237] px-3.5 py-1.5 rounded-xl tracking-wider shadow-xs">
                      ORDEN #{session.orderCode}
                    </span>
                    <div className="flex items-center gap-1.5 text-xs text-[#475569]">
                      <Calendar className="w-3.5 h-3.5 text-[#f25c05]" />
                      <span>
                        <strong className="text-[#112237]">Fecha de compra:</strong>{" "}
                        {formatFullDate(session.createdAt)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-[#112237] bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl">
                      {session.packages.length}{" "}
                      {session.packages.length === 1
                        ? "paquete / despacho"
                        : "paquetes / despachos"}
                    </span>
                    <span className="text-xs font-semibold text-[#f25c05] bg-orange-50 border border-orange-200 px-3 py-1.5 rounded-xl">
                      Pago Contra Entrega
                    </span>
                  </div>
                </div>

                {/* Sub-cards de Paquetes por Vendedor / Agencia de Transporte */}
                <div className="space-y-5">
                  {session.packages.map((pkg, idx) => {
                    const isConfirming =
                      confirmingPackageKey === (pkg.trackingNumber || pkg.orderIds[0]);

                    return (
                      <div
                        key={pkg.trackingNumber || `pkg_${idx}`}
                        className="border border-[#e2e8f0] bg-white rounded-2xl p-5 space-y-4 hover:border-[#cbd5e1] transition-all"
                      >
                        {/* Cabecera del Sub-Paquete con Tracking ID y Agencia */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#f1f5f9]">
                          <div className="flex items-center gap-2 flex-wrap">
                            {pkg.trackingNumber ? (
                              <span className="text-xs font-extrabold text-[#f25c05] bg-orange-50 border border-orange-200 px-3 py-1 rounded-xl flex items-center gap-1">
                                <Truck className="w-3.5 h-3.5" />
                                <span>Tracking Id: {pkg.trackingNumber}</span>
                              </span>
                            ) : (
                              <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-xl flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                <span>El vendedor está preparando tu paquete</span>
                              </span>
                            )}

                            <span className="text-xs font-bold text-[#112237] bg-slate-100 px-2.5 py-1 rounded-xl">
                              {pkg.items.length}{" "}
                              {pkg.items.length === 1
                                ? "producto en paquete"
                                : "productos en paquete"}
                            </span>

                            {pkg.sellerName && (
                              <span className="text-xs text-[#64748b] flex items-center gap-1 font-semibold">
                                <Building2 className="w-3 h-3 text-[#f25c05]" />
                                <span>{pkg.sellerName}</span>
                              </span>
                            )}
                          </div>

                          <span
                            className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                              pkg.status === "delivered" || pkg.status === "completed"
                                ? "bg-emerald-100 text-emerald-800"
                                : pkg.status === "shipped" || pkg.status === "paid"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {pkg.status === "delivered" || pkg.status === "completed"
                              ? "Entregado"
                              : pkg.status === "shipped" || pkg.status === "paid"
                                ? "En Camino"
                                : "Pendiente de Despacho"}
                          </span>
                        </div>

                        {/* Datos de Transporte / Rastreo si fue despachado */}
                        {pkg.trackingNumber && (
                          <div className="bg-[#f8fafc] rounded-xl p-3 border border-[#e2e8f0] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                            <div className="space-y-0.5">
                              <p className="text-[#334155]">
                                <strong className="text-[#112237]">Agencia de Transporte:</strong>{" "}
                                {pkg.carrierName || "Agencia de Envío"}
                              </p>
                              {pkg.estimatedDelivery && (
                                <p className="text-[#334155]">
                                  <strong className="text-[#112237]">Llegada Estimada:</strong>{" "}
                                  {formatDate(pkg.estimatedDelivery)}
                                </p>
                              )}
                            </div>

                            {pkg.trackingUrl && (
                              <a
                                href={pkg.trackingUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 bg-[#f25c05] hover:bg-[#d94d04] text-white text-xs font-extrabold px-4 py-2 rounded-xl transition-all shadow-xs shrink-0"
                              >
                                <span>Rastrear Envío</span>
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                        )}

                        {/* Lista de Productos dentro de este Paquete */}
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
                                className="text-xs font-semibold text-[#f25c05] hover:underline shrink-0 flex items-center gap-0.5"
                              >
                                <span>Ver producto</span>
                              </Link>
                            </div>
                          ))}
                        </div>

                        {/* Acción para el Comprador: Confirmar Recepción */}
                        <div className="flex items-center justify-between gap-3 pt-2 border-t border-[#f1f5f9]">
                          <span className="text-[11px] text-[#64748b]">
                            {pkg.status === "delivered" || pkg.status === "completed"
                              ? "Paquete recibido a satisfacción."
                              : pkg.status === "shipped" || pkg.status === "paid"
                                ? "Presiona al recibir tu paquete para dar por completada la entrega."
                                : "Tu paquete será despachado por el vendedor a la brevedad."}
                          </span>

                          {(pkg.status === "shipped" || pkg.status === "paid") && (
                            <Button
                              size="sm"
                              onClick={() => handleConfirmReceipt(pkg)}
                              disabled={isConfirming}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold px-5 rounded-xl shadow-xs shrink-0"
                            >
                              {isConfirming ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                              ) : (
                                <CheckCircle className="w-4 h-4 mr-1.5" />
                              )}
                              Confirmar Recepción del Paquete
                            </Button>
                          )}

                          {(pkg.status === "delivered" || pkg.status === "completed") && (
                            <span className="inline-flex items-center gap-1 text-xs font-extrabold text-emerald-700 bg-emerald-50 px-3.5 py-1.5 rounded-xl border border-emerald-200 shrink-0">
                              <CheckCircle className="w-4 h-4" />
                              Entrega Confirmada
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Resumen Único de Importes de la Compra Global */}
                <div className="bg-[#f8fafc] rounded-2xl p-5 border border-[#e2e8f0] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1 text-xs">
                    <p className="text-[#334155]">
                      <strong className="text-[#112237]">Subtotal (sin IGV):</strong> S/ {session.subtotal.toFixed(2)}
                    </p>
                    <p className="text-[#334155]">
                      <strong className="text-[#112237]">IGV (18%):</strong> S/ {session.taxAmount.toFixed(2)}
                    </p>
                    <p className="text-[#334155]">
                      <strong className="text-[#112237]">Envío Total de la Compra:</strong> S/ {session.shippingCost.toFixed(2)}
                    </p>
                    {session.destinationAddress && (
                      <p className="text-[#64748b] text-[11px] pt-1">
                        <strong className="text-[#112237]">Entrega:</strong> {session.destinationAddress}
                      </p>
                    )}
                  </div>

                  <div className="text-right w-full sm:w-auto border-t sm:border-t-0 pt-2 sm:pt-0 border-[#e2e8f0]">
                    <span className="text-[11px] text-[#64748b] font-semibold block">
                      Pago Único Contra Entrega:
                    </span>
                    <span className="text-2xl font-black text-[#f25c05]">
                      S/ {session.totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
