"use client";

import {use, useCallback, useEffect, useState} from "react";
import Link from "next/link";
import Image from "next/image";
import {useRouter} from "next/navigation";
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
  MapPin,
  Package,
  Receipt,
  ShieldCheck,
  Truck,
} from "lucide-react";
import Skeleton from "react-loading-skeleton";
import {Navbar} from "@/components/features/layout/Navbar";
import {Footer} from "@/components/features/layout/Footer";
import {Button} from "@/components/ui/Button";
import {ConfirmModal} from "@/components/ui/ConfirmModal";
import {WarrantyModal} from "@/components/features/orders/WarrantyModal";
import {RefundStatus} from "@/components/features/orders/RefundStatus";
import {BuyerDeliveryTimeline} from "@/components/features/orders/BuyerDeliveryTimeline";
import {useAuth} from "@/hooks/useAuth";

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
  destinationAddress: string | null;
  paymentDetails: PaymentDetails | null;
  packages: TrackingPackage[];
  hasRefund: boolean;
  refundStatus: string | null;
  refundType: string | null;
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
  const [confirmingPackageKey, setConfirmingPackageKey] = useState<string | null>(null);
  const [copiedTracking, setCopiedTracking] = useState<string | null>(null);

  const [warrantyModalData, setWarrantyModalData] = useState<{
    isOpen: boolean;
  }>({
    isOpen: false,
  });
  const [refundTrigger, setRefundTrigger] = useState(0);
  const [packageToConfirm, setPackageToConfirm] = useState<TrackingPackage | null>(
    null,
  );

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
      const res = await fetch(`/api/user/orders?code=${orderCode}`);
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
        <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl space-y-6">
          <Skeleton height={20} width={120} />
          <Skeleton height={140} borderRadius={24} />
          <Skeleton height={220} borderRadius={24} />
          <Skeleton height={220} borderRadius={24} />
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

  let generalStatusLabel = "Pendiente de Despacho";
  let generalStatusStyle = "bg-amber-100 text-amber-800 border-amber-200";

  if (allDelivered) {
    generalStatusLabel = "Entregada";
    generalStatusStyle = "bg-emerald-100 text-emerald-800 border-emerald-200";
  } else if (anyDelivered) {
    generalStatusLabel = "Parcialmente Entregada";
    generalStatusStyle = "bg-blue-100 text-blue-800 border-blue-200";
  } else if (anyShipped) {
    generalStatusLabel = "En Camino";
    generalStatusStyle = "bg-blue-100 text-blue-800 border-blue-200";
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-between font-sans antialiased text-[#112237]">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl space-y-6">
        {/* Botón de Retorno a Lista de Compras */}
        <div>
          <Link
            href="/user/orders"
            className="inline-flex items-center gap-1.5 text-xs text-[#64748b] hover:text-[#112237] font-semibold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a Mis Compras</span>
          </Link>
        </div>

        {/* Cabecera Principal del Detalle de la Orden */}
        <div className="bg-white rounded-3xl border border-[#e2e8f0] p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#f1f5f9] pb-4">
            <div>
              <div className="flex items-center gap-2.5 flex-wrap mb-1">
                <h1 className="text-2xl font-black text-[#112237] tracking-tight">
                  ORDEN #{session.orderCode}
                </h1>
                <span
                  className={`px-3 py-1 rounded-full text-[11px] font-extrabold uppercase border ${generalStatusStyle}`}
                >
                  {generalStatusLabel}
                </span>
                {session.hasRefund && (
                  <span className="px-3 py-1 rounded-full text-[11px] font-extrabold uppercase border border-red-200 bg-red-50 text-red-700 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {session.refundType === "partial"
                      ? "Reembolso Parcial"
                      : "Reembolsado"}
                  </span>
                )}
              </div>
              <p className="text-xs text-[#64748b] flex items-center gap-1.5 font-medium">
                <Calendar className="w-3.5 h-3.5 text-[#f25c05]" />
                <span>Realizada el {formatFullDate(session.createdAt)}</span>
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-[#112237] bg-slate-100 border border-slate-200 px-3.5 py-1.5 rounded-xl">
                {session.totalItems}{" "}
                {session.totalItems === 1 ? "producto" : "productos"} en total
              </span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-xl flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5" />
                {session.paymentDetails?.cardBrand
                  ? `Tarjeta ${session.paymentDetails.cardBrand}`
                  : "Tarjeta (Niubiz)"}
              </span>
            </div>
          </div>

          {/* Dirección de Entrega Destacada */}
          {session.destinationAddress && (
            <div className="bg-[#f8fafc] rounded-2xl p-3.5 border border-[#e2e8f0] flex items-start gap-2.5 text-xs">
              <MapPin className="w-4 h-4 text-[#f25c05] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#112237] block font-bold">
                  Dirección de Entrega:
                </strong>
                <span className="text-[#475569] font-medium">
                  {session.destinationAddress}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Sección de Paquetes / Despachos por Proveedor */}
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-[#112237] flex items-center gap-2">
              <Truck className="w-5 h-5 text-[#f25c05]" />
              <span>
                Despachos y Paquetes ({session.packages.length})
              </span>
            </h2>
          </div>

          {session.packages.map((pkg, idx) => {
            const isConfirming =
              confirmingPackageKey === (pkg.trackingNumber || pkg.packageId);

            return (
              <div
                key={pkg.trackingNumber || `pkg_${idx}`}
                className="bg-white rounded-3xl border border-[#e2e8f0] p-5 sm:p-6 shadow-xs space-y-4"
              >
                {/* 1. Cabecera del Paquete: Tienda + Contador + Badges */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#f1f5f9]">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-7 h-7 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-[#f25c05] font-black text-xs shrink-0">
                      {idx + 1}
                    </span>
                    <div className="flex items-center gap-2 flex-wrap text-xs">
                      <span className="font-bold text-[#64748b]">
                        Paquete {idx + 1} de {session.packages.length}
                      </span>
                      {pkg.companyName && (
                        <>
                          <span className="text-slate-300">•</span>
                          <span className="font-extrabold text-[#112237] flex items-center gap-1">
                            <Building2 className="w-3.5 h-3.5 text-[#f25c05]" />
                            {pkg.companyName}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Badge Tipo de Envío */}
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        pkg.deliveryType === "complete"
                          ? "bg-slate-900 text-white border-slate-800"
                          : "bg-orange-50 text-[#f25c05] border-orange-200"
                      }`}
                    >
                      {pkg.deliveryType === "complete"
                        ? "Consolidado iubizon"
                        : "Envío Directo"}
                    </span>

                    {/* Badge Estado del Paquete */}
                    <span
                      className={`px-3 py-1 rounded-full text-[11px] font-extrabold uppercase border ${
                        pkg.status === "delivered" || pkg.status === "completed"
                          ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                          : pkg.status === "shipped" || pkg.status === "paid"
                            ? "bg-blue-100 text-blue-800 border-blue-200"
                            : "bg-amber-100 text-amber-800 border-amber-200"
                      }`}
                    >
                      {pkg.status === "delivered" || pkg.status === "completed"
                        ? "Entregado"
                        : pkg.status === "shipped" || pkg.status === "paid"
                          ? "En Camino"
                          : "En Preparación"}
                    </span>
                  </div>
                </div>

                {/* 2. Barra Unificada de Transporte & Tracking (ÚNICO Bloque Consolidado) */}
                {pkg.trackingNumber ? (
                  <div className="bg-[#f8fafc] rounded-2xl p-4 border border-[#e2e8f0] flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
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
                            onClick={() => handleCopyTracking(pkg.trackingNumber!)}
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
                          {formatDate(pkg.estimatedDelivery) || "Por confirmar"}
                        </span>
                      </div>
                    </div>

                    {pkg.trackingUrl && (
                      <a
                        href={pkg.trackingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 bg-[#f25c05] hover:bg-[#d94d04] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-xs shrink-0 self-start md:self-center cursor-pointer"
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
                      El vendedor está preparando tus productos para el despacho. Tan pronto sea enviado, verás aquí la empresa de transporte y número de seguimiento.
                    </span>
                  </div>
                )}

                {/* 3. Stepper de Progreso */}
                <BuyerDeliveryTimeline pkg={pkg} />

                {/* 4. Lista de Productos de este Paquete */}
                <div className="bg-[#f8fafc]/60 rounded-2xl p-4 border border-[#e2e8f0] space-y-2.5">
                  <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider block">
                    {pkg.items.length === 1
                      ? "Producto en este paquete"
                      : `Productos en este paquete (${pkg.items.length})`}
                  </span>
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
                            <p className="text-[11px] text-[#64748b] mt-0.5">
                              Cant: <strong className="text-[#112237]">{item.quantity}</strong> · <span className="font-extrabold text-[#f25c05]">S/ {item.price.toFixed(2)}</span>
                            </p>
                          </div>
                        </div>

                        <Link
                          href={`/products/${item.productId}`}
                          className="text-[11px] font-bold text-[#f25c05] hover:underline shrink-0"
                        >
                          Ver producto ➔
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 5. Barra Inferior de Acciones */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                  <span className="text-[11px] text-[#64748b]">
                    {pkg.status === "delivered" || pkg.status === "completed"
                      ? "Paquete recibido a entera satisfacción."
                      : pkg.status === "shipped" || pkg.status === "paid"
                        ? "Presiona el botón cuando recibas el paquete en tu domicilio."
                        : "Tu paquete será despachado por el vendedor a la brevedad."}
                  </span>

                  <div className="flex items-center gap-2 flex-wrap">
                    {(pkg.status === "delivered" ||
                      pkg.status === "completed") && (
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

                    {(pkg.status === "shipped" || pkg.status === "paid") && (
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

                    {(pkg.status === "delivered" ||
                      pkg.status === "completed") && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-emerald-700 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-200 shrink-0">
                        <CheckCircle className="w-4 h-4" />
                        Entrega Confirmada
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Resumen Financiero Total de la Compra */}
        <div className="bg-white rounded-3xl border border-[#e2e8f0] p-6 shadow-xs space-y-4">
          <h2 className="text-base font-extrabold text-[#112237] flex items-center gap-2 border-b border-[#f1f5f9] pb-3">
            <Receipt className="w-5 h-5 text-[#f25c05]" />
            <span>Resumen Global de Pago (Pago Único)</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="space-y-2 text-[#334155]">
              <p className="flex justify-between border-b border-slate-100 pb-1.5">
                <span>Subtotal de Productos:</span>
                <strong className="text-[#112237]">
                  S/ {session.subtotal.toFixed(2)}
                </strong>
              </p>
              <p className="flex justify-between border-b border-slate-100 pb-1.5">
                <span>Envío Total de la Compra:</span>
                <strong className="text-emerald-600 font-extrabold">
                  {session.shippingCost === 0
                    ? "GRATIS (Promoción)"
                    : `S/ ${session.shippingCost.toFixed(2)}`}
                </strong>
              </p>
              <p className="flex justify-between border-b border-slate-100 pb-1.5">
                <span>Método de Pago:</span>
                <strong className="text-[#112237]">
                  {session.paymentDetails?.cardBrand
                    ? `Tarjeta ${session.paymentDetails.cardBrand} ${session.paymentDetails.cardLast4 ? `(**** ${session.paymentDetails.cardLast4})` : ""}`
                    : "Tarjeta de Crédito / Débito (Niubiz)"}
                </strong>
              </p>
              {session.paymentDetails?.authorizationCode && (
                <p className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span>Cód. de Autorización:</span>
                  <strong className="text-[#112237] font-mono">
                    {session.paymentDetails.authorizationCode}
                  </strong>
                </p>
              )}
              {session.paymentDetails?.docType && (
                <p className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span>Comprobante Emitido:</span>
                  <strong className="text-[#112237]">
                    {session.paymentDetails.docType.toUpperCase()}{" "}
                    {session.paymentDetails.identityNumber
                      ? `(${session.paymentDetails.identityNumber})`
                      : ""}
                  </strong>
                </p>
              )}
            </div>

            <div className="bg-[#f8fafc] rounded-2xl p-4 border border-[#e2e8f0] flex flex-col justify-center items-end text-right">
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

        {session.orderId && allDelivered && (
          <RefundStatus orderId={session.orderId} refetchKey={refundTrigger} />
        )}
      </main>

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
                ¿Confirmas que has recibido todos los productos de este paquete a entera satisfacción en tu domicilio?
              </p>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-[11px] text-slate-700 space-y-1">
                <p>
                  <strong className="text-[#112237]">Vendedor:</strong>{" "}
                  {packageToConfirm.companyName || "Tienda Oficial"}
                </p>
                {packageToConfirm.trackingNumber && (
                  <p>
                    <strong className="text-[#112237]">N° de Seguimiento:</strong>{" "}
                    <span className="font-mono">{packageToConfirm.trackingNumber}</span>
                  </p>
                )}
                {packageToConfirm.items && packageToConfirm.items.length > 0 && (
                  <p className="text-slate-500 pt-0.5">
                    Contiene {packageToConfirm.items.length}{" "}
                    {packageToConfirm.items.length === 1 ? "producto" : "productos"}.
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
          .filter((pkg) => pkg.status === "delivered" || pkg.status === "completed")
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
