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
import {
  ArrowLeft,
  Calendar,
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

interface SellerPackageItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  subtotal: number;
  image: string | null;
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
  subtotal: number;
  platformCommission: number;
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
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-[#112237] bg-slate-100 border border-slate-200 px-3 py-1 rounded-xl">
                  Paquete {pkg.companyName || `#${pkg.packageId.slice(0, 8)}`}
                </span>
                {pkg.trackingNumber && (
                  <span className="text-xs font-black text-[#f25c05] bg-orange-50 border border-orange-200 px-3 py-1 rounded-xl flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5" />
                    <span>Tracking Id: {pkg.trackingNumber}</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-[#64748b] mt-2 flex items-center gap-1.5">
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

          {/* Datos de Despacho & Destino */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-[#f8fafc] rounded-2xl p-4 border border-[#e2e8f0] space-y-2">
              <p className="font-extrabold text-[#112237] flex items-center gap-1.5 text-xs">
                <MapPin className="w-4 h-4 text-[#f25c05]" />
                <span>Datos de Destino del Comprador</span>
              </p>
              <div className="space-y-1 text-[#334155]">
                <p>
                  <strong>Destinatario:</strong> {pkg.buyerName}
                </p>
                {pkg.buyerPhone && (
                  <p className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-emerald-700" />
                    <strong>Teléfono:</strong> {pkg.buyerPhone}
                  </p>
                )}
                {pkg.buyerEmail && (
                  <p className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-blue-700" />
                    <strong>Email:</strong> {pkg.buyerEmail}
                  </p>
                )}
                {pkg.buyerDocumentType || pkg.buyerDocumentNumber ? (
                  <p>
                    <strong>Documento:</strong>{" "}
                    {`${(pkg.buyerDocumentType || "").toUpperCase()} ${pkg.buyerDocumentNumber || ""}`.trim()}
                  </p>
                ) : (
                  <p>
                    <strong>Documento:</strong>{" "}
                    <span className="text-[#94a3b8] italic">No registrado</span>
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
                  <strong>Dirección de Envío:</strong>{" "}
                  {pkg.destinationAddress || "Por coordinar con comprador"}
                </p>
                {pkg.destinationReference && (
                  <p className="leading-relaxed">
                    <strong>Referencia:</strong> {pkg.destinationReference}
                  </p>
                )}
              </div>
            </div>

            <div className="bg-[#f8fafc] rounded-2xl p-4 border border-[#e2e8f0] space-y-2">
              <div className="flex items-center justify-between">
                <p className="font-extrabold text-[#112237] flex items-center gap-1.5 text-xs">
                  <Truck className="w-4 h-4 text-[#f25c05]" />
                  <span>Información de Agencia & Seguimiento</span>
                </p>
                {(isPending || isShipped) && (
                  <button
                    type="button"
                    onClick={() => setIsDispatchModalOpen(true)}
                    className="text-[11px] font-bold text-[#f25c05] hover:underline"
                  >
                    Editar
                  </button>
                )}
              </div>
              <div className="space-y-1 text-[#334155]">
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
          </div>
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
                      item.subtotal ?? item.price * (item.quantity || 1),
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
            <span>Desglose de Retribución por iubizon</span>
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
                Comisión iubizon (
                {commissionRate > 0 ? `${commissionRate * 100}%` : "9%"}):
              </span>
              <span className="font-semibold text-red-600">
                - S/ {formatMoney(pkg.platformCommission)}
              </span>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div>
                <span className="text-xs font-black text-[#112237]">
                  Monto Neto a Recibir por iubizon:
                </span>
                <p className="text-[10px] text-[#64748b]">
                  Depositado después de pasar los 7 días de seguro del
                  comprador.
                </p>
              </div>
              <span className="text-2xl font-black text-emerald-600">
                S/ {formatMoney(pkg.netEarnings)}
              </span>
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
