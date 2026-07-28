"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Building2,
  Clock,
  Loader2,
  MapPin,
  Package,
  ShoppingBag,
  Truck,
} from "lucide-react";
import Skeleton from "react-loading-skeleton";
import { Navbar } from "@/components/features/layout/Navbar";
import { Footer } from "@/components/features/layout/Footer";
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

interface PurchasePackage {
  orderCode: string;
  createdAt: string;
  status: string;
  paymentMethod: string;
  subtotal: number;
  shippingCost: number;
  totalAmount: number;
  items: PackageItem[];
  shipping: {
    destinationAddress: string | null;
    courierInfo: string | null;
    trackingNumber: string | null;
    status: string;
  } | null;
}

export default function UserOrdersPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [packages, setPackages] = useState<PurchasePackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/user/orders");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al obtener las compras.");
      }

      if (Array.isArray(data.packages)) {
        setPackages(data.packages);
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
                <Skeleton width={120} height={20} borderRadius={8} />
                <Skeleton width={100} height={24} borderRadius={20} />
              </div>
              <div className="flex items-center gap-4">
                <Skeleton width={64} height={64} borderRadius={16} />
                <div className="space-y-2 flex-1">
                  <Skeleton width={220} height={16} />
                  <Skeleton width={120} height={14} />
                </div>
              </div>
              <div className="pt-2">
                <Skeleton height={50} borderRadius={16} />
              </div>
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
              className="inline-flex items-center gap-1.5 text-xs text-[#64748b] hover:text-[#112237] font-semibold mb-2"
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
            {packages.length} {packages.length === 1 ? "compra realizada" : "compras realizadas"}
          </span>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 text-xs font-semibold rounded-2xl">
            {error}
          </div>
        )}

        {/* Lista de Paquetes de Compra */}
        {packages.length === 0 ? (
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
          <div className="space-y-6">
            {packages.map((pkg) => (
              <div
                key={pkg.orderCode}
                className="bg-white rounded-3xl border border-[#e2e8f0] p-6 shadow-sm space-y-5"
              >
                {/* Cabecera del Paquete de Compra */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#f1f5f9]">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-[#f25c05] bg-orange-50 px-3 py-1 rounded-xl">
                      #{pkg.orderCode}
                    </span>
                    <span className="text-xs font-bold text-[#112237] bg-slate-100 px-2.5 py-1 rounded-xl">
                      {pkg.items.length} {pkg.items.length === 1 ? "producto en paquete" : "productos en paquete"}
                    </span>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                      pkg.status === "delivered"
                        ? "bg-emerald-100 text-emerald-800"
                        : pkg.status === "shipped"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {pkg.status === "delivered"
                      ? "Entregado"
                      : pkg.status === "shipped"
                        ? "En Camino"
                        : "Pendiente de Despacho"}
                  </span>
                </div>

                {/* Lista de Productos del Paquete */}
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
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs font-extrabold text-[#f25c05]">
                              S/ {item.price.toFixed(2)}
                            </span>
                            {item.company && (
                              <Link
                                href={`/companies/${item.company.slug || item.company.id}`}
                                className="text-[11px] text-[#64748b] hover:underline flex items-center gap-1 font-semibold"
                              >
                                <Building2 className="w-3 h-3 text-[#f25c05]" />
                                <span>{item.company.name}</span>
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>

                      <Link
                        href={`/products/${item.productId}`}
                        className="text-xs font-semibold text-[#f25c05] hover:underline shrink-0"
                      >
                        Ver detalle ➔
                      </Link>
                    </div>
                  ))}
                </div>

                {/* Resumen de Importes del Paquete Unificado */}
                <div className="bg-[#f8fafc] rounded-2xl p-4 border border-[#e2e8f0] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1 text-xs">
                    <p className="text-[#334155]">
                      <strong className="text-[#112237]">Subtotal (sin IGV):</strong> S/ {pkg.subtotal.toFixed(2)}
                    </p>
                    <p className="text-[#334155]">
                      <strong className="text-[#112237]">IGV (18%):</strong> S/ {(pkg.subtotal * 0.18).toFixed(2)}
                    </p>
                    <p className="text-[#334155]">
                      <strong className="text-[#112237]">Envío de Paquete:</strong> S/ {pkg.shippingCost.toFixed(2)}
                    </p>
                    {pkg.shipping?.destinationAddress && (
                      <p className="text-[#64748b] text-[11px] pt-1">
                        <strong className="text-[#112237]">Entrega:</strong> {pkg.shipping.destinationAddress}
                      </p>
                    )}
                  </div>

                  <div className="text-right w-full sm:w-auto border-t sm:border-t-0 pt-2 sm:pt-0 border-[#e2e8f0]">
                    <span className="text-[11px] text-[#64748b] font-semibold block">
                      Pago Único Contra Entrega:
                    </span>
                    <span className="text-xl font-black text-[#f25c05]">
                      S/ {pkg.totalAmount.toFixed(2)}
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
