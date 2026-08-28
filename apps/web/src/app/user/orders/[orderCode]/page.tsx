"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
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
  ShieldCheck,
  User,
} from "lucide-react";
import Skeleton from "react-loading-skeleton";
import { Navbar } from "@/components/features/layout/Navbar";
import { Footer } from "@/components/features/layout/Footer";
import { Button } from "@/components/ui/Button";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { WarrantyModal } from "@/components/features/orders/WarrantyModal";
import { RefundStatus } from "@/components/features/orders/RefundStatus";
import { BuyerDeliveryTimeline } from "@/components/features/orders/BuyerDeliveryTimeline";
import { useAuth } from "@/hooks/useAuth";

interface PackageItem {
  id: string;
  productId: string;
  title: string;
  price: number;
  quantity: number;
  subtotal: number;
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
  companyName: string | null;
  trackingNumber: string | null;
  courier: string | null;
  trackingUrl: string | null;
  estimatedDelivery: string | null;
  deliveryType?: string | null;
  status: string;
  paymentMethod: string;
  cardBrand: string | null;
  cardLast4: string | null;
  subtotal: number;
  netEarnings: number;
  items: PackageItem[];
}

interface PaymentDetails {
  provider: string;
  cardBrand: string | null;
  cardLast4: string | null;
  authorizationCode: string | null;
  docType: string | null;
  identityNumber: string | null;
  legalName: string | null;
}

interface BuyerOrderSession {
  orderId: string;
  orderCode: string;
  createdAt: string;
  deliveredAt: string | null;
  subtotal: number;
  taxAmount: number;
  shippingCost: number;
  totalAmount: number;
  totalItems: number;
  shippingName?: string | null;
  shippingPhone?: string | null;
  shippingEmail?: string | null;
  shippingAddress?: string | null;
  shippingDepartment?: string | null;
  shippingProvince?: string | null;
  shippingDistrict?: string | null;
  destinationAddress: string | null;
  paymentDetails: PaymentDetails | null;
  packages: TrackingPackage[];
  hasRefund: boolean;
  refundStatus: string | null;
  refundType: string | null;
}

function formatDate(isoString: string | null) {
  if (!isoString) return "Por confirmar";
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
    }).format(d);
  } catch {
    return isoString;
  }
}

interface PageProps {
  params: Promise<{
    orderCode: string;
  }>;
}

export default function OrderDetailPage({ params }: PageProps) {
  const { orderCode } = use(params);
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const userId = user?.id;

  const [session, setSession] = useState<BuyerOrderSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmingPackageKey, setConfirmingPackageKey] = useState<
    string | null
  >(null);
  const [copiedTracking, setCopiedTracking] = useState<string | null>(null);

  const [warrantyModalData, setWarrantyModalData] = useState<{
    isOpen: boolean;
  }>({
    isOpen: false,
  });
  const [refundTrigger, setRefundTrigger] = useState(0);
  const [packageToConfirm, setPackageToConfirm] =
    useState<TrackingPackage | null>(null);

  const handleCopyTracking = (tracking: string) => {
    navigator.clipboard.writeText(tracking);
    setCopiedTracking(tracking);
    setTimeout(() => {
      setCopiedTracking(null);
    }, 2000);
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/auth/login?redirect=/user/orders/${orderCode}`);
    }
  }, [authLoading, user, router, orderCode]);

  const fetchOrderDetail = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const cleanCode = decodeURIComponent(orderCode).replace(/^#/, "").trim();
      const res = await fetch(
        `/api/user/orders?code=${encodeURIComponent(cleanCode)}`,
      );
      if (!res.ok) {
        if (res.status === 404) {
          setError("No se encontró la orden especificada.");
          return;
        }
        throw new Error("Error al consultar el detalle de la compra");
      }
      const data = await res.json();
      if (data.session) {
        setSession(data.session);
      } else if (Array.isArray(data.sessions) && data.sessions.length > 0) {
        setSession(data.sessions[0]);
      } else {
        setError("No se encontró la orden especificada.");
      }
    } catch (err: unknown) {
      console.error("Error al cargar orden:", err);
      setError("No se pudo cargar la información de la orden.");
    } finally {
      setLoading(false);
    }
  }, [orderCode]);

  useEffect(() => {
    if (userId) {
      fetchOrderDetail();
    }
  }, [userId, fetchOrderDetail]);

  const handleConfirmReceipt = async (pkg: TrackingPackage) => {
    const pkgKey = pkg.trackingNumber || pkg.packageId;
    setConfirmingPackageKey(pkgKey);

    try {
      const res = await fetch("/api/user/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageIds: [pkg.packageId] }),
      });

      if (!res.ok) {
        throw new Error("Error al confirmar recepción");
      }

      await fetchOrderDetail();
    } catch (err) {
      console.error("Error al confirmar recepción:", err);
    } finally {
      setConfirmingPackageKey(null);
      setPackageToConfirm(null);
    }
  };

  if (authLoading || (loading && !session)) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-between font-sans">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl space-y-6">
          <Skeleton height={20} width={140} />
          <Skeleton height={120} borderRadius={24} />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 space-y-6">
              <Skeleton height={240} borderRadius={24} />
              <Skeleton height={200} borderRadius={24} />
            </div>
            <div className="lg:col-span-5 space-y-6">
              <Skeleton height={200} borderRadius={24} />
              <Skeleton height={240} borderRadius={24} />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-between font-sans">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-16 max-w-lg text-center space-y-4">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-2">
            <Package className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold text-[#112237]">
            {error || "Orden no encontrada"}
          </h1>
          <p className="text-xs text-[#64748b]">
            No pudimos recuperar la información de este pedido. Por favor,
            verifica el código o regresa a tus compras.
          </p>
          <div className="pt-4">
            <Link
              href="/user/orders"
              className="inline-flex items-center gap-2 bg-[#f25c05] hover:bg-[#d94d04] text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-colors shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Ir a Mis Compras</span>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const allDelivered = session.packages.every(
    (p) => p.status === "delivered" || p.status === "completed",
  );
  const anyDelivered = session.packages.some(
    (p) => p.status === "delivered" || p.status === "completed",
  );
  const anyShipped = session.packages.some(
    (p) => p.status === "shipped" || p.status === "paid",
  );

  let generalStatusLabel = "PENDIENTE DE DESPACHO";
  let generalStatusStyle = "bg-amber-100 text-amber-800 border-amber-200";

  if (allDelivered) {
    generalStatusLabel = "ENTREGADO";
    generalStatusStyle = "bg-emerald-100 text-emerald-800 border-emerald-200";
  } else if (anyDelivered) {
    generalStatusLabel = "PARCIALMENTE ENTREGADO";
    generalStatusStyle = "bg-blue-100 text-blue-800 border-blue-200";
  } else if (anyShipped) {
    generalStatusLabel = "EN CAMINO";
    generalStatusStyle = "bg-blue-100 text-blue-800 border-blue-200";
  }

  const isAnyConsolidated = session.packages.some(
    (p) => p.deliveryType === "complete",
  );

  const isSinglePackage = session.packages.length === 1;

  const destinationAddress =
    session.destinationAddress ||
    session.shippingAddress ||
    "Dirección acordada";

  const ubigeoText = [
    session.shippingDistrict,
    session.shippingProvince,
    session.shippingDepartment,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-between font-sans antialiased text-[#112237]">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl space-y-6">
        {/* Barra Superior de Retorno y Badges */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <Link href="/user/orders">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs font-bold text-[#64748b] hover:text-[#112237] px-0 -ml-2"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              <span>Volver a Mis Compras</span>
            </Button>
          </Link>

          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`px-3.5 py-1 rounded-full text-xs font-black border uppercase tracking-wide ${generalStatusStyle}`}
            >
              {generalStatusLabel}
            </span>
            {session.hasRefund && (
              <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase border border-red-200 bg-red-50 text-red-700 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                {session.refundType === "partial"
                  ? "Reembolso Parcial"
                  : "Reembolsado"}
              </span>
            )}
          </div>
        </div>

        {/* Cabecera Principal del Detalle de la Orden */}
        <div className="bg-white rounded-3xl border border-[#e2e8f0] p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5 flex-wrap mb-1">
                <h1 className="text-2xl font-black text-[#112237] tracking-tight">
                  ORDEN #{session.orderCode}
                </h1>
                <span className="text-xs font-bold text-[#64748b] bg-slate-100 border border-slate-200 px-3 py-1 rounded-xl">
                  {session.totalItems}{" "}
                  {session.totalItems === 1 ? "producto" : "productos"} en total
                </span>
                <span
                  className={`px-3 py-1 rounded-xl text-xs font-bold border ${
                    isAnyConsolidated
                      ? "bg-slate-900 text-white border-slate-800"
                      : "bg-orange-50 text-[#f25c05] border-orange-200"
                  }`}
                >
                  {isAnyConsolidated
                    ? "Envío Consolidado por iubizon"
                    : "Envío Directo del Proveedor"}
                </span>
              </div>
              <p className="text-xs text-[#64748b] flex items-center gap-1.5 font-medium">
                <Calendar className="w-3.5 h-3.5 text-[#f25c05]" />
                <span>
                  Compra realizada el {formatFullDate(session.createdAt)}
                </span>
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-xl flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5" />
                {session.paymentDetails?.cardBrand
                  ? `Tarjeta ${session.paymentDetails.cardBrand}`
                  : "Tarjeta (Niubiz)"}
              </span>
            </div>
          </div>
        </div>

        {/* Layout en 2 Columnas: Centro de Control de Compra */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Columna Principal Izquierda (7 de 12): Despacho de Paquetes y Lista de Productos */}
          <div className="lg:col-span-7 space-y-6">
            {session.packages.map((pkg, idx) => {
              const isPkgDelivered =
                pkg.status === "delivered" || pkg.status === "completed";
              const isPkgShipped =
                pkg.status === "shipped" ||
                pkg.status === "delivered" ||
                pkg.status === "completed";
              const isConfirming =
                confirmingPackageKey === (pkg.trackingNumber || pkg.packageId);

              return (
                <div
                  key={pkg.trackingNumber || `pkg_${idx}`}
                  className="bg-white rounded-3xl border border-[#e2e8f0] p-6 shadow-xs space-y-5"
                >
                  {/* 1. Cabecera del Paquete (Limpia y sin redundancias) */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#f1f5f9]">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {!isSinglePackage && (
                        <span className="w-7 h-7 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-[#f25c05] font-black text-xs shrink-0">
                          {idx + 1}
                        </span>
                      )}
                      <div className="flex items-center gap-2 flex-wrap text-xs">
                        {!isSinglePackage && (
                          <span className="font-bold text-[#64748b]">
                            Paquete {idx + 1} de {session.packages.length}
                          </span>
                        )}
                        {pkg.companyName && (
                          <>
                            {!isSinglePackage && (
                              <span className="text-slate-300">•</span>
                            )}
                            <span className="font-extrabold text-[#112237] flex items-center gap-1.5">
                              <Building2 className="w-4 h-4 text-[#f25c05]" />
                              <span>Tienda: {pkg.companyName}</span>
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Mostrar badge individual solo si es una orden multi-paquete */}
                    {!isSinglePackage && (
                      <span
                        className={`px-3 py-0.5 rounded-full text-[11px] font-extrabold uppercase border ${
                          isPkgDelivered
                            ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                            : isPkgShipped
                              ? "bg-blue-100 text-blue-800 border-blue-200"
                              : "bg-amber-100 text-amber-800 border-amber-200"
                        }`}
                      >
                        {isPkgDelivered
                          ? "Entregado"
                          : isPkgShipped
                            ? "En Camino"
                            : "En Preparación"}
                      </span>
                    )}
                  </div>

                  {/* 2. Ruta y Progreso (Stepper horizontal limpio) */}
                  <BuyerDeliveryTimeline pkg={pkg} />

                  {/* 3. Barra Unificada de Transporte & Tracking */}
                  {pkg.trackingNumber ? (
                    <div className="bg-[#f8fafc] rounded-2xl p-4 border border-[#e2e8f0] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 flex-1">
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
                                handleCopyTracking(pkg.trackingNumber!)
                              }
                              title="Copiar N° de Guía"
                              className="p-1 text-slate-400 hover:text-[#f25c05] transition-colors rounded hover:bg-slate-200/60 cursor-pointer"
                            >
                              {copiedTracking === pkg.trackingNumber ? (
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
                          className="inline-flex items-center gap-1 text-xs font-bold text-[#f25c05] hover:text-[#d94d04] hover:underline transition-colors shrink-0 self-start sm:self-center cursor-pointer"
                        >
                          <span>Rastrear en Agencia</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  ) : (
                    <div className="bg-amber-50/80 rounded-2xl p-3.5 border border-amber-200/80 flex items-center gap-2.5 text-xs text-amber-800">
                      <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>
                        El vendedor está preparando tus productos para el
                        despacho. Tan pronto sea enviado, verás aquí los datos
                        de transporte.
                      </span>
                    </div>
                  )}

                  {/* 4. Lista de Productos de este Paquete */}
                  <div className="bg-[#f8fafc]/60 rounded-2xl p-4 border border-[#e2e8f0] space-y-2.5">
                    <div className="flex items-center justify-between pb-1">
                      <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider block">
                        {pkg.items.length === 1
                          ? "Producto en este paquete"
                          : `Productos en este paquete (${pkg.items.length})`}
                      </span>
                      <span className="text-xs font-bold text-[#64748b]">
                        Total Unidades:{" "}
                        {pkg.items.reduce(
                          (acc, i) => acc + (i.quantity || 1),
                          0,
                        )}
                      </span>
                    </div>

                    <div className="divide-y divide-[#e2e8f0]/80">
                      {pkg.items.map((item) => (
                        <div
                          key={item.id}
                          className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
                        >
                          <div className="flex items-center gap-3 min-w-0">
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
                            <div className="min-w-0">
                              <Link
                                href={`/products/${item.productId}`}
                                className="font-bold text-xs text-[#112237] hover:text-[#f25c05] transition-colors line-clamp-1"
                              >
                                {item.title}
                              </Link>
                              <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[#64748b]">
                                <span className="font-extrabold text-[#112237] bg-white border border-slate-200 px-1.5 py-0.2 rounded">
                                  x{item.quantity || 1} un.
                                </span>
                                <span>·</span>
                                <span>S/ {item.price.toFixed(2)} c/u</span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-xs font-black text-[#112237] block">
                              S/{" "}
                              {(item.price * (item.quantity || 1)).toFixed(2)}
                            </span>
                            <Link
                              href={`/products/${item.productId}`}
                              className="text-[10px] font-bold text-[#f25c05] hover:underline inline-block mt-0.5"
                            >
                              Ver producto ➔
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 5. Barra Inferior de Acciones */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-[#f1f5f9]">
                    <span className="text-[11px] text-[#64748b]">
                      {isPkgDelivered
                        ? "Paquete recibido a entera satisfacción."
                        : isPkgShipped
                          ? "Presiona el botón cuando recibas el paquete en tu domicilio."
                          : "Tu paquete será despachado por el vendedor a la brevedad."}
                    </span>

                    <div className="flex items-center gap-2 flex-wrap">
                      {isPkgDelivered && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setWarrantyModalData({ isOpen: true })}
                          className="border-[#f25c05]/30 hover:border-[#f25c05] bg-orange-50/50 hover:bg-orange-50 text-[#f25c05] text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 shrink-0 cursor-pointer"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          <span>Garantía & Cobertura</span>
                        </Button>
                      )}

                      {!isPkgDelivered &&
                        (pkg.status === "shipped" || pkg.status === "paid") && (
                          <Button
                            size="sm"
                            onClick={() => setPackageToConfirm(pkg)}
                            disabled={isConfirming}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold px-5 py-2.5 rounded-xl shadow-xs shrink-0 cursor-pointer"
                          >
                            {isConfirming ? (
                              <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                            ) : (
                              <CheckCircle className="w-4 h-4 mr-1.5" />
                            )}
                            Confirmar Recepción
                          </Button>
                        )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Reclamos y Reembolsos si existen */}
            {session.orderId && allDelivered && (
              <RefundStatus
                orderId={session.orderId}
                refetchKey={refundTrigger}
              />
            )}
          </div>

          {/* Columna Lateral Derecha (5 de 12): Destino de Envío + Resumen de Pago */}
          <div className="lg:col-span-5 space-y-6">
            {/* 1. Tarjeta de Destino de Envío */}
            <div className="bg-white rounded-3xl border border-[#e2e8f0] p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-3">
                <h2 className="text-sm font-extrabold text-[#112237] flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#f25c05]" />
                  <span>Destino de Envío</span>
                </h2>
              </div>

              <div className="space-y-3.5 text-xs text-[#334155]">
                <div className="bg-[#f8fafc] rounded-2xl p-4 border border-[#e2e8f0] space-y-2.5">
                  <div>
                    <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider block">
                      Destinatario / Comprador
                    </span>
                    <p className="font-extrabold text-[#112237] text-xs mt-0.5 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-[#f25c05]" />
                      <span>
                        {session.shippingName || user?.name || "Comprador"}
                      </span>
                    </p>
                  </div>

                  {session.shippingPhone && (
                    <div>
                      <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider block">
                        Teléfono de Contacto
                      </span>
                      <a
                        href={`tel:${session.shippingPhone}`}
                        className="font-bold text-emerald-700 hover:underline flex items-center gap-1.5 mt-0.5"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>{session.shippingPhone}</span>
                      </a>
                    </div>
                  )}

                  {(session.shippingEmail || user?.email) && (
                    <div>
                      <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider block">
                        Correo Electrónico
                      </span>
                      <p className="font-medium text-slate-600 flex items-center gap-1.5 mt-0.5 truncate">
                        <Mail className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span className="truncate">
                          {session.shippingEmail || user?.email}
                        </span>
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
                      {destinationAddress}
                    </p>
                  </div>

                  {ubigeoText && (
                    <div>
                      <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider block">
                        Ubicación / Ubigeo
                      </span>
                      <p className="font-semibold text-slate-700 mt-0.5">
                        {ubigeoText}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 2. Tarjeta de Resumen Global de Pago */}
            <div className="bg-white rounded-3xl border border-[#e2e8f0] p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-3">
                <h2 className="text-sm font-extrabold text-[#112237] flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-[#f25c05]" />
                  <span>Resumen Global de Pago</span>
                </h2>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-[#64748b] font-medium">
                    Subtotal de Productos:
                  </span>
                  <strong className="text-[#112237]">
                    S/ {session.subtotal.toFixed(2)}
                  </strong>
                </div>

                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-[#64748b] font-medium">
                    Envío Total:
                  </span>
                  <strong className="text-emerald-600 font-extrabold">
                    {session.shippingCost === 0
                      ? "GRATIS (Promoción)"
                      : `S/ ${session.shippingCost.toFixed(2)}`}
                  </strong>
                </div>

                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-[#64748b] font-medium">
                    Método de Pago:
                  </span>
                  <strong className="text-[#112237]">
                    {session.paymentDetails?.cardBrand
                      ? `Tarjeta ${session.paymentDetails.cardBrand} ${session.paymentDetails.cardLast4 ? `(**** ${session.paymentDetails.cardLast4})` : ""}`
                      : "Tarjeta (Niubiz)"}
                  </strong>
                </div>

                {session.paymentDetails?.authorizationCode && (
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-[#64748b] font-medium">
                      Cód. Autorización:
                    </span>
                    <strong className="text-[#112237] font-mono">
                      {session.paymentDetails.authorizationCode}
                    </strong>
                  </div>
                )}

                {session.paymentDetails?.docType && (
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-[#64748b] font-medium">
                      Comprobante Emitido:
                    </span>
                    <strong className="text-[#112237]">
                      {session.paymentDetails.docType.toUpperCase()}{" "}
                      {session.paymentDetails.identityNumber
                        ? `(${session.paymentDetails.identityNumber})`
                        : ""}
                    </strong>
                  </div>
                )}

                <div className="bg-[#f8fafc] rounded-2xl p-4 border border-[#e2e8f0] flex flex-col justify-center items-end text-right mt-3">
                  <span className="text-xs text-[#64748b] font-bold block mb-0.5">
                    Monto Total de la Compra:
                  </span>
                  <span className="text-3xl font-black text-[#f25c05]">
                    S/ {session.totalAmount.toFixed(2)}
                  </span>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg mt-2 inline-flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Pago Aprobado y Procesado
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modal de Confirmación de Recepción */}
      <ConfirmModal
        open={Boolean(packageToConfirm)}
        onOpenChange={(open) => {
          if (!open && !confirmingPackageKey) setPackageToConfirm(null);
        }}
        title="Confirmar Recepción del Paquete"
        description={
          packageToConfirm ? (
            <div className="space-y-2 text-xs">
              <p className="text-slate-600">
                ¿Confirmas que has recibido todos los productos de este paquete
                a entera satisfacción en tu domicilio?
              </p>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-[11px] text-slate-700 space-y-1">
                <p>
                  <strong className="text-[#112237]">Vendedor:</strong>{" "}
                  {packageToConfirm.companyName || "Tienda Oficial"}
                </p>
                {packageToConfirm.trackingNumber && (
                  <p>
                    <strong className="text-[#112237]">
                      N° de Seguimiento:
                    </strong>{" "}
                    <span className="font-mono">
                      {packageToConfirm.trackingNumber}
                    </span>
                  </p>
                )}
                {packageToConfirm.items &&
                  packageToConfirm.items.length > 0 && (
                    <p className="text-slate-500 pt-0.5">
                      Contiene {packageToConfirm.items.length}{" "}
                      {packageToConfirm.items.length === 1
                        ? "producto"
                        : "productos"}
                      .
                    </p>
                  )}
              </div>
            </div>
          ) : (
            ""
          )
        }
        confirmLabel="Sí, Confirmar Recepción"
        cancelLabel="Cancelar"
        variant="success"
        isLoading={Boolean(confirmingPackageKey)}
        onConfirm={async () => {
          if (packageToConfirm) {
            await handleConfirmReceipt(packageToConfirm);
          }
        }}
      />

      {/* Modal de Garantía y Reembolso */}
      <WarrantyModal
        isOpen={warrantyModalData.isOpen}
        onClose={() => setWarrantyModalData({ isOpen: false })}
        orderId={session.orderId}
        orderCode={session.orderCode}
        createdAt={session.createdAt}
        deliveredAt={session.deliveredAt}
        orderTotal={session.totalAmount}
        onRefundCreated={() => setRefundTrigger((prev) => prev + 1)}
        items={session.packages
          .filter(
            (pkg) => pkg.status === "delivered" || pkg.status === "completed",
          )
          .flatMap((pkg) =>
            pkg.items.map((item) => ({
              orderItemId: item.id,
              title: item.title,
              price: item.price,
              quantity: item.quantity,
              companyName: pkg.companyName || undefined,
            })),
          )}
      />

      <Footer />
    </div>
  );
}
