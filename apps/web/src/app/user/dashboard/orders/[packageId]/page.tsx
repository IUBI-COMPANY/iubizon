"use client";

import { Suspense, use, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/features/layout/Navbar";
import { Footer } from "@/components/features/layout/Footer";
import { Button } from "@/components/ui/Button";
import { DispatchModal } from "@/components/features/orders/DispatchModal";
import { RefundStatus } from "@/components/features/orders/RefundStatus";
import {
  ArrowLeft,
  Building2,
  Calendar,
  Check,
  CheckCircle,
  Clock,
  Copy,
  ExternalLink,
  Loader2,
  Mail,
  MapPin,
  Package,
  Phone,
  Receipt,
  Truck,
  User,
  Wallet,
} from "lucide-react";
import {
  formatCommissionRateLabel,
  normalizeCommissionRate,
} from "@/lib/utils/financials";
import { DeliveryType } from "@/components/features/cart/checkout-schema";

export interface SellerPackageItem {
  id: string;
  title: string;
  quantity: number;
  unitPrice: number;
  price?: number;
  subtotal: number;
  image?: string | null;
}

export interface SellerPackage {
  packageId: string;
  orderId?: string;
  orderCode: string;
  statusText: string;
  companyName: string | null;
  trackingNumber: string | null;
  courier: string | null;
  trackingUrl: string | null;
  carrierPhone: string | null;
  estimatedDelivery: string | null;
  status: string;
  createdAt: string;
  deliveryType?: DeliveryType | string | null;
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
  subtotal: number;
  platformCommission: number;
  commissionRate?: number;
  netEarnings: number;
  orderIds: string[];
  items: SellerPackageItem[];
}

function formatMoney(value: number | string | undefined | null): string {
  const num = typeof value === "number" ? value : Number(value || 0);
  return (isNaN(num) ? 0 : num).toFixed(2);
}

function formatDate(isoString: string | null) {
  if (!isoString) return "No asignada";
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

function cleanAddressForSeller(
  address?: string | null,
  isConsolidated?: boolean,
): string {
  if (!address) return "Por coordinar con comprador";
  if (isConsolidated) {
    return address.replace(/\s*\(Tel:\s*[^)]+\)/gi, "").trim();
  }
  return address.trim();
}

function SellerOrderDetailContent({ packageId }: { packageId: string }) {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [pkg, setPkg] = useState<SellerPackage | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [commissionRate, setCommissionRate] = useState<number>(0);
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [copiedTracking, setCopiedTracking] = useState<string | null>(null);
  const hasLoadedOnce = useRef(false);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTracking(key);
    setTimeout(() => {
      setCopiedTracking(null);
    }, 2000);
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/auth/login?redirect=/user/dashboard/orders/${packageId}`);
    }
  }, [user, authLoading, router, packageId]);

  const fetchPackageDetail = useCallback(async () => {
    if (!user) return;
    try {
      if (hasLoadedOnce.current) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      const res = await fetch("/api/seller/orders");
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al cargar la venta");
      }

      if (data.commission?.baseRate) {
        setCommissionRate(data.commission.baseRate);
      }

      const decodedId = decodeURIComponent(packageId);
      const packagesList = Array.isArray(data.packages)
        ? (data.packages as SellerPackage[])
        : [];
      const foundPkg = packagesList.find(
        (p) =>
          p.packageId === decodedId ||
          p.trackingNumber === decodedId ||
          p.orderCode === decodedId,
      );

      if (!foundPkg) {
        setError("No se encontró la venta o despacho especificado.");
      } else {
        setPkg(foundPkg);
        hasLoadedOnce.current = true;
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar la venta.",
      );
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [user, packageId]);

  useEffect(() => {
    if (user) {
      fetchPackageDetail();
    }
  }, [user, fetchPackageDetail]);

  if (authLoading || (loading && !isRefreshing)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <Loader2 className="w-8 h-8 animate-spin text-[#f25c05]" />
      </div>
    );
  }

  if (error || !pkg) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f8fafc]">
        <Navbar />
        <div className="flex-1 container mx-auto px-4 py-12 max-w-3xl text-center space-y-4">
          <p className="text-sm font-semibold text-red-600">
            {error || "Venta no encontrada"}
          </p>
          <Link href="/user/dashboard/orders">
            <Button className="bg-[#f25c05] text-white font-bold px-6 py-2 rounded-xl text-xs">
              Volver a Gestión de Pedidos
            </Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const isConsolidated = pkg.deliveryType === "complete";
  const isDelivered = pkg.status === "delivered" || pkg.status === "completed";
  const isShipped =
    pkg.status === "shipped" ||
    pkg.status === "delivered" ||
    pkg.status === "completed";
  const isPending = pkg.status === "pending" || pkg.status === "paid";

  const badgeStyle = isDelivered
    ? "bg-emerald-100 text-emerald-800 border-emerald-200"
    : pkg.status === "shipped"
      ? "bg-blue-100 text-blue-800 border-blue-200"
      : "bg-amber-100 text-amber-800 border-amber-200";

  const badgeLabel = isDelivered
    ? "ENTREGADO"
    : pkg.status === "shipped"
      ? "EN CAMINO"
      : "PENDIENTE DE DESPACHO";

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] font-sans antialiased text-[#112237]">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl space-y-6">
        {/* Barra Superior de Navegación y Acciones */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <Link href="/user/dashboard/orders">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs font-bold text-[#64748b] hover:text-[#112237] px-0 -ml-2"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              <span>Volver a Pedidos & Ventas</span>
            </Button>
          </Link>

          <div className="flex items-center gap-2.5 flex-wrap">
            <span
              className={`px-3.5 py-1 rounded-full text-xs font-black border uppercase tracking-wide ${badgeStyle}`}
            >
              {badgeLabel}
            </span>

            {isPending && (
              <Button
                onClick={() => setIsDispatchModalOpen(true)}
                className="bg-[#f25c05] hover:bg-[#d94d04] text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <Truck className="w-4 h-4 mr-1.5" />
                <span>Confirmar Despacho</span>
              </Button>
            )}

            {pkg.status === "shipped" && (
              <Button
                onClick={() => setIsDispatchModalOpen(true)}
                variant="outline"
                className="border-blue-300 text-blue-700 hover:bg-blue-50 font-bold text-xs px-4 py-2 rounded-xl cursor-pointer"
              >
                <Truck className="w-4 h-4 mr-1.5" />
                <span>Editar Despacho</span>
              </Button>
            )}

            {isDelivered && (
              <Link href="/user/dashboard/payouts">
                <Button
                  variant="outline"
                  className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 text-xs font-bold px-4 py-2 rounded-xl"
                >
                  <Wallet className="w-4 h-4 mr-1.5" />
                  <span>Ver Liquidación en Mis Finanzas ➔</span>
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Cabecera Principal de la Venta */}
        <div className="bg-white rounded-3xl border border-[#e2e8f0] p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2.5 mb-1">
                <h1 className="text-2xl font-black text-[#112237] tracking-tight">
                  ORDEN #{pkg.orderCode || pkg.packageId.slice(0, 8)}
                </h1>
                <span className="text-xs font-bold text-[#64748b] bg-slate-100 border border-slate-200 px-3 py-1 rounded-xl">
                  Paquete: {pkg.companyName || `#${pkg.packageId.slice(0, 8)}`}
                </span>
                <span
                  className={`px-3 py-1 rounded-xl text-xs font-bold border ${
                    isConsolidated
                      ? "bg-slate-900 text-white border-slate-800"
                      : "bg-orange-50 text-[#f25c05] border-orange-200"
                  }`}
                >
                  {isConsolidated
                    ? "Envío Consolidado por iubizon"
                    : "Envío Directo del Proveedor"}
                </span>
              </div>
              <p className="text-xs text-[#64748b] flex items-center gap-1.5 font-medium">
                <Calendar className="w-3.5 h-3.5 text-[#f25c05]" />
                <span>Venta realizada el {formatFullDate(pkg.createdAt)}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Layout en 2 Columnas: Centro de Comando de Despacho */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Columna Principal Izquierda (7 de 12): Ruta + Tracking + Lista de Empaque */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1. Ruta de Despacho (Stepper Visual) */}
            <div className="bg-white rounded-3xl border border-[#e2e8f0] p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-3">
                <h2 className="text-sm font-extrabold text-[#112237] flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#f25c05]" />
                  <span>Ruta y Progreso del Envío</span>
                </h2>
                <span className="text-[11px] font-semibold text-[#64748b]">
                  {isConsolidated
                    ? "Ruta en 3 pasos"
                    : "Ruta directa en 2 pasos"}
                </span>
              </div>

              {/* Stepper Horizontal Limpio */}
              <div className="bg-[#f8fafc] rounded-2xl p-4 border border-[#e2e8f0] space-y-3">
                <div className="flex items-center justify-between text-xs font-bold">
                  <div className="flex items-center gap-1.5 text-emerald-700">
                    <Check className="w-4 h-4 bg-emerald-100 rounded-full p-0.5 shrink-0" />
                    <span>Tu Almacén (Origen)</span>
                  </div>

                  {isConsolidated && (
                    <>
                      <div className="h-0.5 flex-1 mx-2 bg-slate-200 rounded" />
                      <div
                        className={`flex items-center gap-1.5 ${
                          isShipped
                            ? "text-emerald-700 font-bold"
                            : "text-[#f25c05] font-bold"
                        }`}
                      >
                        {isShipped ? (
                          <Check className="w-4 h-4 bg-emerald-100 rounded-full p-0.5 shrink-0" />
                        ) : (
                          <Building2 className="w-4 h-4 shrink-0" />
                        )}
                        <span>Almacén iubizon</span>
                      </div>
                    </>
                  )}

                  <div className="h-0.5 flex-1 mx-2 bg-slate-200 rounded" />
                  <div
                    className={`flex items-center gap-1.5 ${
                      isDelivered
                        ? "text-emerald-700 font-bold"
                        : isShipped
                          ? "text-[#f25c05] font-bold"
                          : "text-slate-400"
                    }`}
                  >
                    {isDelivered ? (
                      <Check className="w-4 h-4 bg-emerald-100 rounded-full p-0.5 shrink-0" />
                    ) : (
                      <MapPin className="w-4 h-4 shrink-0" />
                    )}
                    <span>Destino Cliente</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/60 text-xs text-[#475569]">
                  {isDelivered ? (
                    <p className="flex items-center gap-1.5 text-emerald-700 font-bold">
                      <CheckCircle className="w-4 h-4 shrink-0" />
                      <span>
                        El comprador confirmó la recepción conforme de los
                        productos.
                      </span>
                    </p>
                  ) : isShipped ? (
                    <p className="text-[#334155]">
                      <strong>Estado:</strong> Paquete despachado y en tránsito
                      hacia{" "}
                      {isConsolidated
                        ? "el Almacén Central iubizon"
                        : "el domicilio del cliente"}
                      .
                    </p>
                  ) : (
                    <p className="text-amber-800 font-medium">
                      ⚠️ <strong>Acción Requerida:</strong> Prepara los
                      productos y confirma los datos del transportista.
                    </p>
                  )}
                </div>
              </div>

              {/* 2. Barra de Transporte & Tracking */}
              {pkg.trackingNumber ? (
                <div className="bg-[#f8fafc] rounded-2xl p-4 border border-[#e2e8f0] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
                    <div>
                      <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider block">
                        Transporte / Courier
                      </span>
                      <span className="font-extrabold text-[#112237] mt-0.5 block text-xs">
                        {pkg.courier || "Movilidad Propia"}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider block">
                        N° de Guía / Tracking
                      </span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="font-mono font-bold text-[#112237] bg-white border border-slate-200 px-2 py-0.5 rounded-lg text-[11px] select-all">
                          {pkg.trackingNumber}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            handleCopy(pkg.trackingNumber!, "tracking")
                          }
                          title="Copiar N° de Guía"
                          className="p-1 text-slate-400 hover:text-[#f25c05] transition-colors rounded hover:bg-slate-200/60 cursor-pointer"
                        >
                          {copiedTracking === "tracking" ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider block">
                        Llegada Estimada
                      </span>
                      <span className="font-semibold text-[#112237] mt-0.5 block">
                        {formatDate(pkg.estimatedDelivery)}
                      </span>
                    </div>
                  </div>

                  {pkg.trackingUrl && (
                    <a
                      href={pkg.trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 bg-[#f25c05] hover:bg-[#d94d04] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-xs shrink-0 cursor-pointer"
                    >
                      <span>Rastrear en Agencia</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              ) : (
                <div className="bg-amber-50/80 rounded-2xl p-4 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 text-amber-900">
                    <Clock className="w-5 h-5 text-amber-600 shrink-0" />
                    <span>
                      Aún no has registrado la guía de remisión o transportista
                      para este pedido.
                    </span>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => setIsDispatchModalOpen(true)}
                    className="bg-[#f25c05] hover:bg-[#d94d04] text-white font-extrabold text-xs px-4 py-2 rounded-xl shrink-0 cursor-pointer"
                  >
                    <Truck className="w-3.5 h-3.5 mr-1" />
                    Registrar Guía
                  </Button>
                </div>
              )}
            </div>

            {/* 3. Lista de Empaque: Productos a Despachar */}
            <div className="bg-white rounded-3xl border border-[#e2e8f0] p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-3">
                <h2 className="text-sm font-extrabold text-[#112237] flex items-center gap-2">
                  <Package className="w-4 h-4 text-[#f25c05]" />
                  <span>
                    Lista de Empaque ({pkg.items.length}{" "}
                    {pkg.items.length === 1 ? "ítem" : "ítems"})
                  </span>
                </h2>
                <span className="text-xs font-bold text-[#64748b]">
                  Total Unidades:{" "}
                  {pkg.items.reduce((acc, i) => acc + (i.quantity || 1), 0)}
                </span>
              </div>

              <div className="divide-y divide-[#f1f5f9]">
                {pkg.items.map((item) => (
                  <div
                    key={item.id}
                    className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-14 h-14 bg-slate-50 rounded-2xl overflow-hidden relative shrink-0 border border-[#e2e8f0] flex items-center justify-center">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.title}
                            fill
                            sizes="56px"
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <Package className="w-6 h-6 text-[#cbd5e1]" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-xs font-bold text-[#112237] line-clamp-2 leading-snug">
                          {item.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-[#64748b]">
                          <span className="font-extrabold text-[#112237] bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
                            x{item.quantity || 1} un.
                          </span>
                          <span>·</span>
                          <span>
                            S/ {formatMoney(item.price || item.unitPrice)} c/u
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-black text-[#112237] block">
                        S/{" "}
                        {formatMoney(
                          item.subtotal ??
                            (item.price || item.unitPrice || 0) *
                              (item.quantity || 1),
                        )}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reembolsos asociados (si aplica) */}
            <RefundStatus
              orderId={pkg.orderId || pkg.orderIds?.[0] || ""}
              isSeller
            />
          </div>

          {/* Columna Lateral Derecha (5 de 12): Destino & Contacto + Liquidación Financiera */}
          <div className="lg:col-span-5 space-y-6">
            {/* 1. Tarjeta de Destino & Contacto (Visible de inmediato) */}
            <div className="bg-white rounded-3xl border border-[#e2e8f0] p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-3">
                <h2 className="text-sm font-extrabold text-[#112237] flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#f25c05]" />
                  <span>Destino de Envío</span>
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748b] bg-slate-100 px-2 py-0.5 rounded-md">
                  {isConsolidated ? "Almacén iubizon" : "Directo a Cliente"}
                </span>
              </div>

              {isConsolidated ? (
                /* Destino Obligatorio para Consolidado: Almacén Chorrillos */
                <div className="bg-orange-50/70 border border-orange-200 rounded-2xl p-4 space-y-3 text-xs">
                  <div>
                    <span className="text-[9px] font-black text-[#f25c05] bg-orange-100 border border-orange-200 px-2 py-0.5 rounded uppercase tracking-wider">
                      Destino Obligatorio de Tu Guía
                    </span>
                    <h3 className="font-black text-xs text-[#112237] mt-1.5">
                      IUBIZON COMPANY S.A.C.
                    </h3>
                    <p className="text-[11px] text-[#64748b]">
                      RUC: 20614600374
                    </p>
                  </div>

                  <div className="space-y-1 text-slate-700 text-[11px]">
                    <p className="flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#f25c05] shrink-0 mt-0.5" />
                      <span>
                        Calle las acacias, Pje. los Jazmines 181, Chorrillos,
                        Lima, Lima
                      </span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Recepción / Coordinación: +51 972 300 301</span>
                    </p>
                  </div>

                  <div className="pt-2 border-t border-orange-200/80 flex items-center justify-between text-[11px]">
                    <a
                      href="https://maps.app.goo.gl/fd4ujCZW7B7WQc5X9"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-bold text-[#f25c05] hover:underline"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Ver en Google Maps ↗</span>
                    </a>
                  </div>

                  <div className="bg-white/80 rounded-xl p-2.5 border border-orange-200/60 text-[10px] text-slate-600 leading-relaxed">
                    💡 <strong>Nota:</strong> En este tipo de envío consolidado,
                    iubizon recibe tu paquete en almacén y lo unifica con los
                    otros productos del comprador para la entrega final.
                  </div>
                </div>
              ) : (
                /* Destino Directo: Domicilio del Comprador */
                <div className="space-y-3.5 text-xs text-[#334155]">
                  <div className="bg-[#f8fafc] rounded-2xl p-4 border border-[#e2e8f0] space-y-2.5">
                    <div>
                      <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider block">
                        Destinatario / Comprador
                      </span>
                      <p className="font-extrabold text-[#112237] text-xs mt-0.5 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-[#f25c05]" />
                        <span>{pkg.buyerName}</span>
                      </p>
                    </div>

                    {pkg.buyerPhone && (
                      <div>
                        <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider block">
                          Teléfono de Contacto
                        </span>
                        <a
                          href={`tel:${pkg.buyerPhone}`}
                          className="font-bold text-emerald-700 hover:underline flex items-center gap-1.5 mt-0.5"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>{pkg.buyerPhone}</span>
                        </a>
                      </div>
                    )}

                    {pkg.buyerEmail && (
                      <div>
                        <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider block">
                          Correo Electrónico
                        </span>
                        <p className="font-medium text-slate-600 flex items-center gap-1.5 mt-0.5 truncate">
                          <Mail className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span className="truncate">{pkg.buyerEmail}</span>
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="bg-[#f8fafc] rounded-2xl p-4 border border-[#e2e8f0] space-y-2.5">
                    <div>
                      <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider block">
                        Dirección de Entrega
                      </span>
                      <p className="font-bold text-[#112237] mt-0.5 leading-relaxed">
                        {cleanAddressForSeller(pkg.destinationAddress, false)}
                      </p>
                    </div>

                    {(pkg.destinationDistrict ||
                      pkg.destinationProvince ||
                      pkg.destinationDepartment) && (
                      <div>
                        <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider block">
                          Ubicación / Ubigeo
                        </span>
                        <p className="font-semibold text-slate-700 mt-0.5">
                          {[
                            pkg.destinationDistrict,
                            pkg.destinationProvince,
                            pkg.destinationDepartment,
                          ]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                      </div>
                    )}

                    {pkg.destinationReference && (
                      <div>
                        <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider block">
                          Referencia de Entrega
                        </span>
                        <p className="font-medium text-slate-600 mt-0.5 bg-white p-2 rounded-lg border border-slate-200">
                          {pkg.destinationReference}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 2. Tarjeta de Liquidación Financiera */}
            <div className="bg-white rounded-3xl border border-[#e2e8f0] p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-3">
                <h2 className="text-sm font-extrabold text-[#112237] flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-[#f25c05]" />
                  <span>Liquidación de la Venta</span>
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  Seller Payout
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-[#64748b] font-medium">
                    Valor Total Productos:
                  </span>
                  <span className="font-bold text-[#112237]">
                    S/ {formatMoney(pkg.subtotal)}
                  </span>
                </div>

                <div className="flex justify-between border-b border-slate-100 pb-2 text-[#64748b]">
                  <span className="font-medium">
                    Comisión iubizon (
                    {formatCommissionRateLabel(
                      normalizeCommissionRate(
                        typeof pkg.commissionRate === "number"
                          ? pkg.commissionRate
                          : commissionRate,
                      ) ?? 0,
                    )}
                    ):
                  </span>
                  <span className="font-semibold text-red-600">
                    - S/ {formatMoney(pkg.platformCommission)}
                  </span>
                </div>

                <div className="bg-emerald-50/60 rounded-2xl p-4 border border-emerald-200/80 space-y-1">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                    Monto Neto a Transferir
                  </span>
                  <span className="text-2xl font-black text-emerald-700 block">
                    S/ {formatMoney(pkg.netEarnings)}
                  </span>
                  <p className="text-[10px] text-emerald-900/80 font-medium pt-1">
                    ✓ Disponible para transferencia al cumplirse los 7 días del
                    seguro de protección del comprador.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modal de Despacho Reutilizable */}
      {isDispatchModalOpen && (
        <DispatchModal
          isOpen={isDispatchModalOpen}
          onClose={() => setIsDispatchModalOpen(false)}
          packageId={pkg.packageId}
          currentCarrierName={pkg.courier}
          currentTrackingNumber={pkg.trackingNumber}
          currentEstimatedDelivery={pkg.estimatedDelivery}
          currentCarrierPhone={pkg.carrierPhone}
          currentTrackingUrl={pkg.trackingUrl}
          onSuccess={() => fetchPackageDetail()}
        />
      )}

      <Footer />
    </div>
  );
}

export default function SellerOrderDetailPage({
  params,
}: {
  params: Promise<{ packageId: string }>;
}) {
  const resolvedParams = use(params);
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
          <Loader2 className="w-8 h-8 animate-spin text-[#f25c05]" />
        </div>
      }
    >
      <SellerOrderDetailContent packageId={resolvedParams.packageId} />
    </Suspense>
  );
}
