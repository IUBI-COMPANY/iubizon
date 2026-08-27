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
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Loader2,
  Mail,
  MapPin,
  Package,
  Phone,
  Receipt,
  Truck,
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

function DeliveryTimelineCard({ pkg }: { pkg: SellerPackage }) {
  const [isDetailedOpen, setIsDetailedOpen] = useState(false);

  const isConsolidated = pkg.deliveryType === "complete";
  const isShipped =
    pkg.status === "shipped" ||
    pkg.status === "delivered" ||
    pkg.status === "completed";
  const isDelivered = pkg.status === "delivered" || pkg.status === "completed";

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
      {/* Columna Izquierda: Timeline de Destino de Despacho */}
      <div className="md:col-span-7 bg-[#f8fafc] rounded-2xl p-5 border border-[#e2e8f0] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
          <p className="font-extrabold text-[#112237] flex items-center gap-1.5 text-xs">
            <Truck className="w-4 h-4 text-[#f25c05]" />
            <span>Ruta y Destino de Despacho</span>
          </p>
          <span
            className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
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

        {/* Resumen Compacto de la Ruta (Default View) */}
        <div className="bg-white rounded-xl p-3 border border-[#e2e8f0] space-y-2.5">
          {/* Stepper Horizontal Compacto */}
          <div className="flex items-center justify-between text-[11px] font-bold">
            <div className="flex items-center gap-1 text-emerald-700">
              <Check className="w-3.5 h-3.5 bg-emerald-100 rounded-full p-0.5 shrink-0" />
              <span>Origen</span>
            </div>
            {isConsolidated && (
              <>
                <div className="h-0.5 flex-1 mx-2 bg-slate-200 rounded" />
                <div
                  className={`flex items-center gap-1 ${
                    isShipped
                      ? "text-emerald-700 font-bold"
                      : "text-[#f25c05] font-bold"
                  }`}
                >
                  {isShipped ? (
                    <Check className="w-3.5 h-3.5 bg-emerald-100 rounded-full p-0.5 shrink-0" />
                  ) : (
                    <Building2 className="w-3.5 h-3.5 shrink-0" />
                  )}
                  <span>Almacén iubizon</span>
                </div>
              </>
            )}
            <div className="h-0.5 flex-1 mx-2 bg-slate-200 rounded" />
            <div
              className={`flex items-center gap-1 ${
                isDelivered
                  ? "text-emerald-700 font-bold"
                  : isShipped
                    ? "text-[#f25c05] font-bold"
                    : "text-slate-400"
              }`}
            >
              {isDelivered ? (
                <Check className="w-3.5 h-3.5 bg-emerald-100 rounded-full p-0.5 shrink-0" />
              ) : (
                <MapPin className="w-3.5 h-3.5 shrink-0" />
              )}
              <span>Destino Cliente</span>
            </div>
          </div>

          {/* Banner de Estado Resumido */}
          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
            <p className="text-[11px] text-[#334155] font-medium flex-1">
              {isConsolidated ? (
                <span>
                  <strong>Destino Obligatorio de Tu Envío:</strong> Almacén
                  Central iubizon (Calle las acacias 181, Chorrillos)
                </span>
              ) : (
                <span>
                  <strong>Destino Final:</strong>{" "}
                  {pkg.destinationAddress || "Dirección del comprador"}
                </span>
              )}
            </p>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsDetailedOpen(!isDetailedOpen)}
              className="h-7 text-[11px] font-bold text-[#f25c05] hover:text-[#d94d04] hover:bg-orange-50 px-2.5 rounded-lg flex items-center gap-1 shrink-0"
            >
              <span>
                {isDetailedOpen ? "Ocultar detalles" : "Ver timeline detallado"}
              </span>
              {isDetailedOpen ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </Button>
          </div>
        </div>

        {/* Timeline Vertical Detallado (Desplegable) */}
        {isDetailedOpen && (
          <div className="relative pl-6 space-y-5 pt-2 before:absolute before:left-2.5 before:top-5 before:bottom-3 before:w-0.5 before:bg-slate-300">
            {/* NODO 1: Origen Vendedor */}
            <div className="relative">
              <div className="absolute -left-[29px] top-0 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center ring-4 ring-[#f8fafc] shadow-xs">
                <Check className="w-3.5 h-3.5" />
              </div>
              <div className="bg-white rounded-xl p-3 border border-[#e2e8f0] space-y-0.5 text-xs">
                <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded uppercase">
                  Origen (Tu Tienda)
                </span>
                <h4 className="font-bold text-[#112237] text-xs mt-1">
                  {pkg.companyName || "Tu Almacén / Tienda"}
                </h4>
                <p className="text-[11px] text-[#64748b]">
                  Producto preparado y listo para enviar.
                </p>
              </div>
            </div>

            {/* NODO 2 (SOLO CONSOLIDADO): Almacén Central IUBIZON */}
            {isConsolidated && (
              <div className="relative">
                <div
                  className={`absolute -left-[29px] top-0 w-6 h-6 rounded-full flex items-center justify-center ring-4 ring-[#f8fafc] shadow-xs ${
                    isShipped
                      ? "bg-emerald-500 text-white"
                      : "bg-[#f25c05] text-white animate-pulse"
                  }`}
                >
                  {isShipped ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <Building2 className="w-3.5 h-3.5" />
                  )}
                </div>

                <div className="bg-orange-50/60 border border-orange-200 rounded-xl p-3.5 space-y-2">
                  <span className="text-[9px] font-black text-[#f25c05] bg-orange-100/80 border border-orange-200 px-2 py-0.5 rounded uppercase tracking-wider">
                    Destino Obligatorio de Tu Envío
                  </span>

                  <div>
                    <h4 className="text-xs font-black text-[#112237] flex flex-wrap items-center gap-1.5">
                      <span>IUBIZON COMPANY S.A.C.</span>
                      <span className="text-[#f25c05] font-bold text-[11px]">
                        (RUC: 20614600374)
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-600 font-medium flex items-start gap-1 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-[#f25c05] shrink-0 mt-0.5" />
                      <span>
                        Calle las acacias, Pje. los Jazmines 181, Chorrillos,
                        Lima, Lima
                      </span>
                    </p>
                    <p className="text-[11px] text-slate-600 flex items-center gap-1.5 mt-1">
                      <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>WhatsApp / Atención: +51 972 300 301</span>
                    </p>
                  </div>

                  <div className="pt-1.5 flex items-center justify-between border-t border-orange-200/60 text-[11px]">
                    <a
                      href="https://maps.app.goo.gl/fd4ujCZW7B7WQc5X9"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-bold text-[#f25c05] hover:underline"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Ver ubicación en Google Maps ↗</span>
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* NODO FINAL: Domicilio del Comprador */}
            {!isConsolidated || isShipped ? (
              <div className="relative">
                <div
                  className={`absolute -left-[29px] top-0 w-6 h-6 rounded-full flex items-center justify-center ring-4 ring-[#f8fafc] shadow-xs ${
                    isDelivered
                      ? "bg-emerald-500 text-white"
                      : isShipped
                        ? "bg-[#f25c05] text-white animate-pulse"
                        : "bg-slate-300 text-slate-600"
                  }`}
                >
                  {isDelivered ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : isShipped ? (
                    <Truck className="w-3.5 h-3.5" />
                  ) : (
                    <MapPin className="w-3.5 h-3.5" />
                  )}
                </div>

                <div className="bg-white rounded-xl p-3 border border-[#e2e8f0] space-y-1 text-xs">
                  <span className="text-[9px] font-extrabold text-[#64748b] bg-slate-100 border border-slate-200 px-2 py-0.5 rounded uppercase">
                    {isConsolidated
                      ? "Destino Final del Comprador (iubizon entregará aquí)"
                      : "Destino Final del Comprador"}
                  </span>

                  <div className="space-y-1 text-[#334155] pt-1">
                    <p>
                      <strong>Comprador:</strong> {pkg.buyerName}
                    </p>
                    {!isConsolidated && pkg.buyerPhone && (
                      <p className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-emerald-700" />
                        <strong>Teléfono:</strong> {pkg.buyerPhone}
                      </p>
                    )}
                    {!isConsolidated && pkg.buyerEmail && (
                      <p className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-blue-700" />
                        <strong>Email:</strong> {pkg.buyerEmail}
                      </p>
                    )}
                    {(pkg.destinationDistrict ||
                      pkg.destinationProvince ||
                      pkg.destinationDepartment) && (
                      <p>
                        <strong>Ubigeo:</strong>{" "}
                        {[
                          pkg.destinationDistrict,
                          pkg.destinationProvince,
                          pkg.destinationDepartment,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                    )}
                    <p className="leading-relaxed">
                      <strong>Dirección Comprador:</strong>{" "}
                      {cleanAddressForSeller(
                        pkg.destinationAddress,
                        isConsolidated,
                      )}
                    </p>
                    {!isConsolidated && pkg.destinationReference && (
                      <p className="leading-relaxed">
                        <strong>Referencia:</strong> {pkg.destinationReference}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative">
                <div className="absolute -left-[29px] top-0 w-6 h-6 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center ring-4 ring-[#f8fafc] shadow-xs">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <div className="bg-white rounded-xl p-3 border border-slate-200 space-y-1 text-xs">
                  <span className="text-[9px] font-extrabold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded uppercase">
                    Destino Final del Comprador
                  </span>
                  <p className="text-[11px] text-slate-500 font-medium pt-0.5">
                    Se activará una vez que despaches tu paquete al Almacén
                    Central iubizon.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Columna Derecha: Información de Agencia & Seguimiento */}
      <div className="md:col-span-5 bg-[#f8fafc] rounded-2xl p-5 border border-[#e2e8f0] space-y-3 text-xs flex flex-col justify-between">
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
            <p className="font-extrabold text-[#112237] flex items-center gap-1.5 text-xs">
              <Truck className="w-4 h-4 text-[#f25c05]" />
              <span>Agencia & Seguimiento</span>
            </p>
          </div>

          <div className="space-y-2 text-[#334155]">
            <p>
              <strong>Agencia de Transporte:</strong>{" "}
              {pkg.courier || "Pendiente de despacho"}
            </p>
            <p>
              <strong>Llegada Estimada:</strong>{" "}
              {formatDate(pkg.estimatedDelivery)}
            </p>
            {pkg.carrierPhone && (
              <p className="flex items-center gap-1 text-emerald-700 font-semibold">
                <Phone className="w-3.5 h-3.5" />
                <span>Teléfono Transportista: {pkg.carrierPhone}</span>
              </p>
            )}
            {pkg.trackingUrl && (
              <p className="pt-1">
                <a
                  href={pkg.trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-bold text-[#f25c05] hover:underline"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Rastrear en Agencia ➔</span>
                </a>
              </p>
            )}
          </div>
        </div>

        {isConsolidated && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-[11px] text-amber-900 leading-relaxed font-medium">
            💡 <strong>Nota para el Vendedor:</strong> En este tipo de envío,
            debes consignar como dirección de destino de la guía o courier los
            datos del <strong>Almacén Central iubizon</strong>.
          </div>
        )}
      </div>
    </div>
  );
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
  const hasLoadedOnce = useRef(false);

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
      const foundPkg = (data.packages as SellerPackage[]).find(
        (p) => p.packageId === decodedId || p.trackingNumber === decodedId,
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

  const isDelivered = pkg.status === "delivered" || pkg.status === "completed";
  const isShipped = pkg.status === "shipped" || pkg.status === "paid";
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
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl space-y-6">
        {/* Enlace de regreso */}
        <div className="flex items-center justify-between">
          <Link href="/user/dashboard/orders">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs font-bold text-[#64748b] hover:text-[#112237]"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              <span>Volver a Pedidos & Ventas</span>
            </Button>
          </Link>

          <span
            className={`px-4 py-1.5 rounded-full text-xs font-black border uppercase tracking-wide ${badgeStyle}`}
          >
            {badgeLabel}
          </span>
        </div>

        {/* Cabecera Principal de la Venta */}
        <div className="bg-white rounded-3xl border border-[#e2e8f0] p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
                <h1 className="text-xl md:text-2xl font-black text-[#112237] tracking-tight">
                  ORDEN #
                  {pkg.orderCode ||
                    pkg.orderId?.slice(0, 8) ||
                    pkg.packageId.slice(0, 8)}
                </h1>
                <span className="text-xs font-bold text-[#64748b] bg-slate-100 border border-slate-200 px-3 py-1 rounded-xl">
                  Paquete {pkg.companyName || `#${pkg.packageId.slice(0, 8)}`}
                </span>
                {pkg.trackingNumber && (
                  <span className="text-xs font-black text-[#f25c05] bg-orange-50 border border-orange-200 px-3 py-1 rounded-xl flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5" />
                    <span>Tracking Id: {pkg.trackingNumber}</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-[#64748b] mt-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#f25c05]" />
                <span>Venta realizada el {formatFullDate(pkg.createdAt)}</span>
              </p>
            </div>

            {(isPending || isShipped) && (
              <Button
                onClick={() => setIsDispatchModalOpen(true)}
                className="bg-[#f25c05] hover:bg-[#d94d04] text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-sm"
              >
                <Truck className="w-4 h-4 mr-1.5" />
                {pkg.trackingNumber ? "Editar Despacho" : "Confirmar Despacho"}
              </Button>
            )}

            {isDelivered && (
              <Link href="/user/dashboard/payouts">
                <Button
                  variant="outline"
                  className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 text-xs font-bold px-4 py-2 rounded-xl"
                >
                  <Wallet className="w-4 h-4 mr-1.5" />
                  Ver pago en Mis Finanzas ➔
                </Button>
              </Link>
            )}
          </div>

          {/* Flujo de Entrega con Timeline Vertical (Consolidado vs Directo) */}
          <DeliveryTimelineCard pkg={pkg} />
        </div>

        {/* Productos Vendidos */}
        <div className="bg-white rounded-3xl border border-[#e2e8f0] p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-extrabold text-[#112237] flex items-center gap-2">
            <Package className="w-4 h-4 text-[#f25c05]" />
            <span>Productos en este Paquete ({pkg.items.length})</span>
          </h2>

          <div className="divide-y divide-slate-100">
            {pkg.items.map((item) => (
              <div
                key={item.id}
                className="py-3 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 bg-slate-100 rounded-xl overflow-hidden relative shrink-0 border border-slate-200">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <Package className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[#112237] line-clamp-1">
                      {item.title}
                    </h3>
                    <p className="text-[11px] text-[#64748b]">
                      S/ {formatMoney(item.price)} x {item.quantity || 1} un.
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-black text-[#112237]">
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

        {/* Resumen Financiero del Vendedor */}
        <div className="bg-white rounded-3xl border border-[#e2e8f0] p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-extrabold text-[#112237] flex items-center gap-2">
            <Receipt className="w-4 h-4 text-[#f25c05]" />
            <span>Resumen de Liquidación de Venta</span>
          </h2>

          <div className="bg-[#f8fafc] rounded-2xl p-5 border border-[#e2e8f0] space-y-3 text-xs">
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-[#64748b] font-medium">
                Valor Total de Productos:
              </span>
              <span className="font-bold text-[#112237]">
                S/ {formatMoney(pkg.subtotal)}
              </span>
            </div>

            <div className="flex justify-between border-b border-slate-200 pb-2 text-[#64748b]">
              <span className="font-medium">
                Cargo por servicio de plataforma (
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

            <div className="flex items-center justify-between pt-1">
              <div>
                <span className="text-xs font-black text-[#112237]">
                  Monto Neto a Transferir:
                </span>
                <p className="text-[10px] text-[#64748b]">
                  Depositado al vendedor al cumplir los 7 días del seguro del
                  comprador.
                </p>
              </div>
              <span className="text-2xl font-black text-emerald-600">
                S/ {formatMoney(pkg.netEarnings)}
              </span>
            </div>
          </div>
        </div>

        <RefundStatus
          orderId={pkg.orderId || pkg.orderIds?.[0] || ""}
          isSeller
        />
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
