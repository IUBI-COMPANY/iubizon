"use client";

import { useCallback, useEffect, useState, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle,
  Clock,
  ExternalLink,
  Loader2,
  MapPin,
  Package,
  Receipt,
  ShieldCheck,
  ShoppingBag,
  Truck,
} from "lucide-react";
import Skeleton from "react-loading-skeleton";
import { Navbar } from "@/components/features/layout/Navbar";
import { Footer } from "@/components/features/layout/Footer";
import { Button } from "@/components/ui/Button";
import { WarrantyModal } from "@/components/features/orders/WarrantyModal";
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

interface PaymentDetails {
  provider: string;
  cardBrand: string | null;
  cardLast4: string | null;
  authorizationCode: string | null;
  docType: string | null;
  identityNumber: string | null;
  legalName: string | null;
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
  paymentDetails: PaymentDetails | null;
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

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderCode: string }>;
}) {
  const resolvedParams = use(params);
  const orderCode = resolvedParams.orderCode;

  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [session, setSession] = useState<PurchaseOrderSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmingPackageKey, setConfirmingPackageKey] = useState<
    string | null
  >(null);
  const [warrantyModalData, setWarrantyModalData] = useState<{
    isOpen: boolean;
    sellerName?: string | null;
    productTitle?: string;
  }>({
    isOpen: false,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/auth/login?redirect=/user/orders/${orderCode}`);
    }
  }, [user, authLoading, router, orderCode]);

  const fetchOrderDetail = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(
        `/api/user/orders?code=${encodeURIComponent(orderCode)}`,
      );
      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error || "Error al obtener el detalle del pedido.",
        );
      }

      if (data.session) {
        setSession(data.session);
      } else if (Array.isArray(data.sessions) && data.sessions.length > 0) {
        setSession(data.sessions[0]);
      } else {
        setError("No se encontró la orden especificada.");
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Error al cargar la orden.",
      );
    } finally {
      setLoading(false);
    }
  }, [orderCode]);

  useEffect(() => {
    if (user) {
      fetchOrderDetail();
    }
  }, [user, fetchOrderDetail]);

  const handleConfirmReceipt = async (pkg: TrackingPackage) => {
    if (!confirm("¿Confirmas que has recibido este paquete a satisfacción?"))
      return;

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

      await fetchOrderDetail();
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
          <Skeleton width={180} height={24} />
          <Skeleton height={200} borderRadius={24} />
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f8fafc]">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-16 max-w-xl text-center">
          <div className="bg-white rounded-3xl p-8 border border-[#e2e8f0] shadow-sm space-y-4">
            <Package className="w-12 h-12 text-[#cbd5e1] mx-auto" />
            <h1 className="text-lg font-bold text-[#112237]">
              {error || "Orden no encontrada"}
            </h1>
            <p className="text-xs text-[#64748b]">
              No pudimos encontrar la orden solicitada. Verifica el código de
              pedido.
            </p>
            <Link href="/user/orders">
              <Button className="bg-[#f25c05] text-white text-xs font-bold px-6 py-2.5 rounded-xl">
                Volver a Mis Compras
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Evaluar estado general de la compra
  const allDelivered = session.packages.every(
    (p) => p.status === "delivered" || p.status === "completed",
  );
  const anyShipped = session.packages.some(
    (p) => p.status === "shipped" || p.status === "paid",
  );

  const generalStatusLabel = allDelivered
    ? "Completado / Entregado"
    : anyShipped
      ? "En Camino"
      : "Pendiente de Despacho";

  const generalStatusStyle = allDelivered
    ? "bg-emerald-100 text-emerald-800 border-emerald-200"
    : anyShipped
      ? "bg-blue-100 text-blue-800 border-blue-200"
      : "bg-amber-100 text-amber-800 border-amber-200";

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
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
        <div className="bg-white rounded-3xl border border-[#e2e8f0] p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#f1f5f9] pb-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h1 className="text-2xl font-black text-[#112237]">
                  ORDEN #{session.orderCode}
                </h1>
                <span
                  className={`px-3 py-1 rounded-full text-[11px] font-extrabold uppercase border ${generalStatusStyle}`}
                >
                  {generalStatusLabel}
                </span>
              </div>
              <p className="text-xs text-[#64748b] flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#f25c05]" />
                <span>Realizada el {formatFullDate(session.createdAt)}</span>
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-[#112237] bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl">
                {session.totalItems}{" "}
                {session.totalItems === 1 ? "producto" : "productos"} en total
              </span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5" />
                {session.paymentDetails?.cardBrand
                  ? `Pago Tarjeta ${session.paymentDetails.cardBrand}`
                  : "Pago con Tarjeta (Niubiz)"}
              </span>
            </div>
          </div>

          {/* Dirección de Entrega Destacada */}
          {session.destinationAddress && (
            <div className="bg-[#f8fafc] rounded-2xl p-4 border border-[#e2e8f0] flex items-start gap-2 text-xs">
              <MapPin className="w-4 h-4 text-[#f25c05] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#112237] block font-bold">
                  Dirección de Entrega Asignada:
                </strong>
                <span className="text-[#334155]">
                  {session.destinationAddress}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Sección de Paquetes / Despachos por Proveedor */}
        <div className="space-y-6">
          <h2 className="text-lg font-extrabold text-[#112237] flex items-center gap-2">
            <Truck className="w-5 h-5 text-[#f25c05]" />
            <span>
              Despachos & Seguimiento de Paquetes ({session.packages.length})
            </span>
          </h2>

          {session.packages.map((pkg, idx) => {
            const isConfirming =
              confirmingPackageKey === (pkg.trackingNumber || pkg.orderIds[0]);

            return (
              <div
                key={pkg.trackingNumber || `pkg_${idx}`}
                className="bg-white rounded-3xl border border-[#e2e8f0] p-6 shadow-sm space-y-5"
              >
                {/* Cabecera del Paquete */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#f1f5f9]">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    {pkg.trackingNumber ? (
                      <span className="text-xs font-extrabold text-[#f25c05] bg-orange-50 border border-orange-200 px-3.5 py-1.5 rounded-xl flex items-center gap-1.5">
                        <Truck className="w-4 h-4" />
                        <span>Tracking Id: {pkg.trackingNumber}</span>
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3.5 py-1.5 rounded-xl flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        <span>El vendedor está preparando tu paquete</span>
                      </span>
                    )}

                    {pkg.sellerName && (
                      <span className="text-xs font-bold text-[#112237] bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-[#f25c05]" />
                        <span>Empresa: {pkg.sellerName}</span>
                      </span>
                    )}
                  </div>

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
                        : "Pendiente de Despacho"}
                  </span>
                </div>

                {/* Info de Seguimiento de la Agencia (Si fue despachado) */}
                {pkg.trackingNumber && (
                  <div className="bg-[#f8fafc] rounded-2xl p-4 border border-[#e2e8f0] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                    <div className="space-y-1">
                      <p className="text-[#334155]">
                        <strong className="text-[#112237]">
                          Agencia de Transporte:
                        </strong>{" "}
                        {pkg.carrierName || "Agencia de Envío"}
                      </p>
                      {pkg.estimatedDelivery && (
                        <p className="text-[#334155]">
                          <strong className="text-[#112237]">
                            Llegada Estimada:
                          </strong>{" "}
                          {formatDate(pkg.estimatedDelivery)}
                        </p>
                      )}
                    </div>

                    {pkg.trackingUrl && (
                      <a
                        href={pkg.trackingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 bg-[#f25c05] hover:bg-[#d94d04] text-white text-xs font-extrabold px-4 py-2.5 rounded-xl transition-all shadow-xs shrink-0"
                      >
                        <span>Rastrear en Agencia</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                )}

                {/* Productos de este paquete */}
                <div className="divide-y divide-[#f1f5f9]">
                  {pkg.items.map((item) => (
                    <div
                      key={item.id}
                      className="py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="relative w-16 h-16 bg-[#f8fafc] rounded-2xl border border-[#e2e8f0] overflow-hidden shrink-0 flex items-center justify-center">
                          {item.image ? (
                            <Image
                              src={item.image}
                              alt={item.title}
                              fill
                              sizes="64px"
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
                          <p className="text-xs font-extrabold text-[#f25c05] mt-1">
                            S/ {item.price.toFixed(2)}
                          </p>
                        </div>
                      </div>

                      <Link
                        href={`/products/${item.productId}`}
                        className="text-xs font-semibold text-[#f25c05] hover:underline shrink-0"
                      >
                        Ver producto ➔
                      </Link>
                    </div>
                  ))}
                </div>

                {/* Confirmación del Comprador y Garantía */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#f1f5f9]">
                  <span className="text-[11px] text-[#64748b]">
                    {pkg.status === "delivered" || pkg.status === "completed"
                      ? "Paquete recibido a satisfacción."
                      : pkg.status === "shipped" || pkg.status === "paid"
                        ? "Presiona el botón cuando recibas el paquete en tu domicilio."
                        : "Tu paquete será despachado por el vendedor a la brevedad."}
                  </span>

                  <div className="flex items-center gap-2 flex-wrap">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setWarrantyModalData({
                          isOpen: true,
                          sellerName: pkg.sellerName,
                          productTitle: pkg.items[0]?.title,
                        })
                      }
                      className="border-[#f25c05]/30 hover:border-[#f25c05] bg-orange-50/50 hover:bg-orange-50 text-[#f25c05] text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 shrink-0"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Garantía & Cobertura</span>
                    </Button>

                    {(pkg.status === "shipped" || pkg.status === "paid") && (
                      <Button
                        size="sm"
                        onClick={() => handleConfirmReceipt(pkg)}
                        disabled={isConfirming}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold px-5 py-2.5 rounded-xl shadow-xs shrink-0"
                      >
                        {isConfirming ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                        ) : (
                          <CheckCircle className="w-4 h-4 mr-1.5" />
                        )}
                        Confirmar Recepción del Paquete
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
        <div className="bg-white rounded-3xl border border-[#e2e8f0] p-6 shadow-sm space-y-4">
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
      </main>

      <WarrantyModal
        isOpen={warrantyModalData.isOpen}
        onClose={() => setWarrantyModalData({ isOpen: false })}
        orderCode={session.orderCode}
        createdAt={session.createdAt}
        sellerName={warrantyModalData.sellerName}
        productTitle={warrantyModalData.productTitle}
      />

      <Footer />
    </div>
  );
}
