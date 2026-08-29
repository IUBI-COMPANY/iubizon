"use client";

import { Suspense, use, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { useCompany } from "@/context/CompanyContext";
import { useRealtimeOrders } from "@/hooks/useRealtimeOrders";
import { Navbar } from "@/components/features/layout/Navbar";
import { Footer } from "@/components/features/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { DispatchModal } from "@/components/features/orders/DispatchModal";
import {
  PackageDetailModal,
  PackageDetailData,
} from "@/components/features/orders/PackageDetailModal";
import { RefundStatus } from "@/components/features/orders/RefundStatus";
import { BuyerDeliveryTimeline } from "@/components/features/orders/BuyerDeliveryTimeline";
import {
  ArrowLeft,
  Calendar,
  Check,
  CheckCircle,
  Clock,
  Copy,
  ExternalLink,
  Eye,
  Loader2,
  Mail,
  MapPin,
  Package,
  Pencil,
  Phone,
  Printer,
  Receipt,
  ShieldAlert,
  Truck,
  User,
  Wallet,
} from "lucide-react";
import {
  ShippingLabelModal,
  ShippingLabelData,
} from "@/components/features/orders/ShippingLabelModal";
import {
  EditSingleShipmentModal,
  EditSingleShipmentData,
} from "@/components/features/orders/EditSingleShipmentModal";
import {
  formatCommissionRateLabel,
  normalizeCommissionRate,
} from "@/lib/utils/financials";
import { formatTrackingId } from "@/lib/utils/tracking";
import {
  SellerOrder,
  SellerOrderShipment,
} from "@/app/api/seller/orders/route";

function formatMoney(value: number | string | undefined | null): string {
  const num = typeof value === "number" ? value : Number(value || 0);
  return (isNaN(num) ? 0 : num).toFixed(2);
}

function formatDate(isoString: string | null | undefined) {
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
  const { activeCompany, isLoadingCompanies } = useCompany();
  const router = useRouter();

  const [order, setOrder] = useState<SellerOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [commissionRate, setCommissionRate] = useState<number>(0);
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [selectedShipmentForModal, setSelectedShipmentForModal] =
    useState<PackageDetailData | null>(null);
  const [shippingLabelToPrint, setShippingLabelToPrint] =
    useState<ShippingLabelData | null>(null);
  const [shipmentToEdit, setShipmentToEdit] =
    useState<EditSingleShipmentData | null>(null);
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

      const decodedId = decodeURIComponent(packageId).trim();
      const cleanParam = decodedId.replace(/^#/, "");
      const ordersList = Array.isArray(data.orders)
        ? (data.orders as SellerOrder[])
        : [];

      const foundOrder = ordersList.find(
        (o) =>
          o.orderId === decodedId ||
          o.orderCode === decodedId ||
          o.orderCode.replace(/^#/, "") === cleanParam ||
          o.packages.some(
            (p) =>
              p.packageId === decodedId ||
              p.trackingId === decodedId ||
              p.trackingNumber === decodedId ||
              p.trackingId?.replace(/^#/, "") === cleanParam,
          ),
      );

      if (!foundOrder) {
        setError("No se encontró la venta o despacho especificado.");
      } else {
        setOrder(foundOrder);
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

  useRealtimeOrders({
    companyId: activeCompany?.id,
    onUpdate: fetchPackageDetail,
  });

  useEffect(() => {
    if (user && !isLoadingCompanies) {
      fetchPackageDetail();
    }
  }, [user, isLoadingCompanies, activeCompany?.id, fetchPackageDetail]);

  if (authLoading || (loading && !isRefreshing)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <Loader2 className="w-8 h-8 animate-spin text-[#f25c05]" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f8fafc]">
        <Navbar />
        <div className="flex-1 container mx-auto px-4 py-12 max-w-3xl text-center space-y-4">
          <p className="text-sm font-semibold text-red-600">
            {error || "Venta no encontrada"}
          </p>
          <Link href="/user/dashboard/orders">
            <Button className="bg-[#f25c05] text-white font-bold px-6 py-2 rounded-xl text-xs cursor-pointer">
              Volver a Gestión de Pedidos
            </Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const isDelivered =
    order.status === "delivered" || order.status === "completed";
  const isShipped = order.status === "shipped";
  const isPending = order.status === "pending";

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
    <div className="min-h-screen flex flex-col bg-[#f8fafc] font-sans antialiased text-[#112237]">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl space-y-6">
        {/* Barra Superior de Navegación y Acciones */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <Link href="/user/dashboard/orders">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs font-bold text-[#64748b] hover:text-[#112237] px-0 -ml-2 cursor-pointer"
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
                <span>Despachar Pedido</span>
              </Button>
            )}

            {isDelivered && (
              <Link href="/user/dashboard/payouts">
                <Button
                  variant="outline"
                  className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 text-xs font-bold px-4 py-2 rounded-xl cursor-pointer"
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
                  ORDEN #{order.orderCode}
                </h1>
                <span className="text-xs font-bold text-[#64748b] bg-slate-100 border border-slate-200 px-3 py-1 rounded-xl">
                  Tienda: {order.companyName}
                </span>
                <span className="text-xs font-bold text-slate-600 bg-slate-100 border border-slate-200 px-3 py-1 rounded-xl flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#64748b]" />
                  <span>Cliente: {order.buyerName}</span>
                </span>
              </div>
              <p className="text-xs text-[#64748b] flex items-center gap-1.5 font-medium mt-1">
                <Calendar className="w-3.5 h-3.5 text-[#f25c05]" />
                <span>
                  Venta realizada el {formatFullDate(order.createdAt)}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Layout en 2 Columnas: Centro de Comando de Despacho */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Columna Principal Izquierda (7 de 12): Productos Comprados + Envíos/Guías */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1. Lista de Productos Comprados en esta Venta (Estilo eBay Item Info) */}
            <div className="bg-white rounded-3xl border border-[#e2e8f0] p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-3">
                <h2 className="text-sm font-extrabold text-[#112237] flex items-center gap-2">
                  <Package className="w-4 h-4 text-[#f25c05]" />
                  <span>
                    {order.items.length === 1
                      ? "Producto en esta Orden"
                      : `Productos en esta Orden (${order.items.length})`}
                  </span>
                </h2>
                <span className="text-xs font-bold text-[#64748b]">
                  Total: {order.totalItems} unidades
                </span>
              </div>

              <div className="divide-y divide-[#e2e8f0]/80">
                {order.items.map((item) => (
                  <div
                    key={item.id || item.productId}
                    className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="relative w-14 h-14 bg-white rounded-xl border border-[#e2e8f0] overflow-hidden shrink-0 flex items-center justify-center">
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
                        <Link
                          href={`/products/${item.productId}`}
                          className="font-bold text-sm text-[#112237] hover:text-[#f25c05] transition-colors line-clamp-1"
                        >
                          {item.title}
                        </Link>
                        <div className="flex items-center gap-2 mt-1 text-xs text-[#64748b]">
                          <span className="font-extrabold text-[#112237] bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-lg">
                            x{item.quantity} un.
                          </span>
                          <span>·</span>
                          <span>S/ {item.price.toFixed(2)} c/u</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-sm font-black text-[#112237] block">
                        S/ {item.subtotal.toFixed(2)}
                      </span>
                      <Link
                        href={`/products/${item.productId}`}
                        className="text-[11px] font-bold text-[#f25c05] hover:underline inline-block mt-0.5"
                      >
                        Ver publicación ➔
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Sección de Envíos y Guías de Despacho (Estilo eBay Delivery Info) */}
            <div className="bg-white rounded-3xl border border-[#e2e8f0] p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-3">
                <h2 className="text-sm font-extrabold text-[#112237] flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#f25c05]" />
                  <span>
                    Envíos y Guías de Despacho ({order.packages.length})
                  </span>
                </h2>
              </div>

              {isPending ? (
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
              ) : (
                <div className="space-y-4">
                  {order.packages.map((pkg, idx) => {
                    const isPkgDelivered =
                      pkg.status === "delivered" || pkg.status === "completed";
                    const isPkgShipped =
                      pkg.status === "shipped" || isPkgDelivered;

                    const bultoUnits = pkg.items.reduce(
                      (acc, i) => acc + (i.quantity || 1),
                      0,
                    );

                    return (
                      <div
                        key={pkg.packageId}
                        className="bg-[#f8fafc] rounded-2xl p-4 border border-[#e2e8f0] space-y-3.5"
                      >
                        {/* Cabecera del Bulto */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-[#112237]">
                              {pkg.totalPackages && pkg.totalPackages > 1
                                ? `Envío (${pkg.packageNumber || idx + 1} de ${pkg.totalPackages})`
                                : "Guía de Envío"}
                            </span>
                            <span className="text-[11px] font-bold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                              {bultoUnits}{" "}
                              {bultoUnits === 1 ? "unidad" : "unidades"}
                            </span>
                          </div>

                          <Badge
                            variant={
                              isPkgDelivered
                                ? "success"
                                : isPkgShipped
                                  ? "pro"
                                  : "warning"
                            }
                            className="font-bold text-[10px] px-2.5 py-0.5 uppercase"
                          >
                            {isPkgDelivered
                              ? "Entregado"
                              : isPkgShipped
                                ? "En camino"
                                : "En preparación"}
                          </Badge>
                        </div>

                        {/* 1. Timeline Stepper en el Card */}
                        <div className="bg-white rounded-xl p-3 border border-slate-200/80">
                          <BuyerDeliveryTimeline
                            pkg={{
                              packageId: pkg.packageId,
                              packageNumber: pkg.packageNumber,
                              totalPackages: pkg.totalPackages,
                              companyName: order.companyName,
                              trackingNumber: pkg.trackingNumber,
                              courier: pkg.courier,
                              trackingUrl: pkg.trackingUrl,
                              estimatedDelivery: pkg.estimatedDelivery,
                              deliveredAt: pkg.deliveredAt,
                              createdAt: pkg.createdAt,
                              status: pkg.status,
                            }}
                            orderCreatedAt={pkg.createdAt || undefined}
                            orderDeliveredAt={pkg.deliveredAt}
                          />
                        </div>

                        {/* 2. Productos asignados a este bulto */}
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider block">
                            Productos en este bulto:
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {pkg.items.map((item) => (
                              <div
                                key={item.id}
                                className="bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#112237] flex items-center gap-2"
                              >
                                <span>{item.title}</span>
                                <span className="font-extrabold text-[#f25c05] bg-orange-50 px-1.5 py-0.5 rounded-md text-[11px]">
                                  x{item.quantity} un.
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* 3. Barra Inferior con botón para abrir popup completo e imprimir rótulo */}
                        <div className="pt-2.5 border-t border-slate-200/60 flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="font-mono font-bold text-[11px] text-[#f25c05] bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-md">
                              {pkg.trackingId ||
                                `IBZ-${order.orderCode}-${String(pkg.packageNumber || idx + 1).padStart(2, "0")}`}
                            </span>
                            <span className="text-[11px] text-[#64748b] truncate hidden sm:inline">
                              · {pkg.courier || "Transporte registrado"}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {!isPkgDelivered && (
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  setShipmentToEdit({
                                    packageId: pkg.packageId,
                                    packageNumber: pkg.packageNumber || idx + 1,
                                    totalPackages:
                                      pkg.totalPackages ||
                                      order.packages.length,
                                    orderCode: order.orderCode,
                                    trackingId:
                                      pkg.trackingId ||
                                      formatTrackingId(
                                        order.orderCode,
                                        pkg.packageNumber || idx + 1,
                                      ),
                                    courier: pkg.courier,
                                    trackingNumber: pkg.trackingNumber,
                                    trackingUrl: pkg.trackingUrl,
                                    carrierPhone: pkg.carrierPhone,
                                    estimatedDelivery: pkg.estimatedDelivery,
                                    status: pkg.status,
                                    items: pkg.items.map((it) => ({
                                      id: it.id,
                                      productId: it.productId,
                                      title: it.title,
                                      quantity: it.quantity,
                                      image: it.image,
                                    })),
                                  })
                                }
                                className="bg-white hover:bg-slate-100 text-[#112237] border border-slate-200 text-xs font-bold h-8 px-2.5 rounded-xl cursor-pointer flex items-center gap-1.5 shadow-2xs"
                                title="Editar Guía de Despacho"
                              >
                                <Pencil className="w-3.5 h-3.5 text-[#f25c05]" />
                                <span>Editar</span>
                              </Button>
                            )}

                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                setShippingLabelToPrint({
                                  orderCode: order.orderCode,
                                  packageNumber: pkg.packageNumber || idx + 1,
                                  totalPackages:
                                    pkg.totalPackages || order.packages.length,
                                  trackingId:
                                    pkg.trackingId ||
                                    formatTrackingId(
                                      order.orderCode,
                                      pkg.packageNumber || idx + 1,
                                    ),
                                  courier: pkg.courier,
                                  carrierTrackingNumber: pkg.trackingNumber,
                                  carrierPhone: pkg.carrierPhone,
                                  createdAt: pkg.createdAt,
                                  estimatedDelivery: pkg.estimatedDelivery,
                                  companyName: order.companyName,
                                  companyLegalName: order.companyLegalName,
                                  companyTaxId: order.companyTaxId,
                                  companyPhone: order.companyPhone,
                                  companyLocation: order.companyLocation,
                                  buyerName: order.buyerName,
                                  buyerDocumentType: order.buyerDocumentType,
                                  buyerDocumentNumber:
                                    order.buyerDocumentNumber,
                                  buyerPhone: order.buyerPhone,
                                  destinationAddress: order.destinationAddress,
                                  destinationDistrict:
                                    order.destinationDistrict,
                                  destinationProvince:
                                    order.destinationProvince,
                                  destinationDepartment:
                                    order.destinationDepartment,
                                  destinationReference:
                                    order.destinationReference,
                                  items: pkg.items.map((it) => ({
                                    id: it.id,
                                    title: it.title,
                                    quantity: it.quantity,
                                  })),
                                })
                              }
                              className="bg-white hover:bg-slate-100 text-[#112237] border border-slate-200 text-xs font-bold h-8 px-2.5 rounded-xl cursor-pointer flex items-center gap-1.5 shadow-2xs"
                              title="Imprimir Rótulo de Envío (Formato Shalom / Olva)"
                            >
                              <Printer className="w-3.5 h-3.5 text-[#f25c05]" />
                              <span>Rótulo</span>
                            </Button>

                            <Button
                              type="button"
                              size="sm"
                              variant="secondary"
                              onClick={() =>
                                setSelectedShipmentForModal({
                                  packageId: pkg.packageId,
                                  packageNumber: pkg.packageNumber,
                                  totalPackages: pkg.totalPackages,
                                  trackingId: pkg.trackingId,
                                  orderCode: order.orderCode,
                                  companyName: order.companyName,
                                  companyLegalName: order.companyLegalName,
                                  companyTaxId: order.companyTaxId,
                                  companyPhone: order.companyPhone,
                                  companyLocation: order.companyLocation,
                                  buyerName: order.buyerName,
                                  buyerDocumentType: order.buyerDocumentType,
                                  buyerDocumentNumber:
                                    order.buyerDocumentNumber,
                                  buyerPhone: order.buyerPhone,
                                  destinationAddress: order.destinationAddress,
                                  destinationDistrict:
                                    order.destinationDistrict,
                                  destinationProvince:
                                    order.destinationProvince,
                                  destinationDepartment:
                                    order.destinationDepartment,
                                  destinationReference:
                                    order.destinationReference,
                                  status: pkg.status,
                                  courier: pkg.courier,
                                  trackingNumber: pkg.trackingNumber,
                                  trackingUrl: pkg.trackingUrl,
                                  carrierPhone: pkg.carrierPhone,
                                  estimatedDelivery: pkg.estimatedDelivery,
                                  deliveredAt: pkg.deliveredAt,
                                  createdAt: pkg.createdAt,
                                  items: pkg.items.map((it) => ({
                                    id: it.id,
                                    productId: it.productId,
                                    title: it.title,
                                    price: it.price,
                                    quantity: it.quantity,
                                    subtotal: it.subtotal,
                                    image: it.image,
                                  })),
                                })
                              }
                              className="bg-white hover:bg-slate-100 text-[#112237] border border-slate-200 text-xs font-bold h-8 px-3.5 rounded-xl cursor-pointer flex items-center gap-1.5 shadow-2xs"
                            >
                              <Eye className="w-3.5 h-3.5 text-[#f25c05]" />
                              <span>Ver Detalle</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Reclamos y Reembolsos si existen */}
            {order.orderId && isDelivered && (
              <RefundStatus orderId={order.orderId} />
            )}
          </div>

          {/* Columna Lateral Derecha (5 de 12): Destino de Envío + Liquidación Financiera */}
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
                      <span>{order.buyerName || "Comprador"}</span>
                    </p>
                  </div>

                  {order.buyerPhone && (
                    <div>
                      <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider block">
                        Teléfono de Contacto
                      </span>
                      <a
                        href={`tel:${order.buyerPhone}`}
                        className="font-bold text-emerald-700 hover:underline flex items-center gap-1.5 mt-0.5"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>{order.buyerPhone}</span>
                      </a>
                    </div>
                  )}

                  {order.buyerEmail && (
                    <div>
                      <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider block">
                        Correo Electrónico
                      </span>
                      <p className="font-medium text-slate-600 flex items-center gap-1.5 mt-0.5 truncate">
                        <Mail className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span className="truncate">{order.buyerEmail}</span>
                      </p>
                    </div>
                  )}
                </div>

                <div className="bg-[#f8fafc] rounded-2xl p-4 border border-[#e2e8f0] space-y-2.5">
                  <div>
                    <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider block">
                      Dirección de Entrega
                    </span>
                    <p className="font-bold text-[#112237] text-xs mt-0.5">
                      {order.destinationAddress ||
                        "Por coordinar con el comprador"}
                    </p>
                  </div>

                  {(order.destinationDistrict ||
                    order.destinationProvince ||
                    order.destinationDepartment) && (
                    <div>
                      <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider block">
                        Ubicación
                      </span>
                      <p className="font-medium text-slate-600 mt-0.5">
                        {[
                          order.destinationDistrict,
                          order.destinationProvince,
                          order.destinationDepartment,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                    </div>
                  )}

                  {order.destinationReference && (
                    <div>
                      <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider block">
                        Referencia
                      </span>
                      <p className="font-medium text-slate-600 mt-0.5 bg-white p-2 rounded-lg border border-slate-200">
                        {order.destinationReference}
                      </p>
                    </div>
                  )}
                </div>
              </div>
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
                    S/ {formatMoney(order.subtotal)}
                  </span>
                </div>

                <div className="flex justify-between border-b border-slate-100 pb-2 text-[#64748b]">
                  <span className="font-medium">
                    Comisión iubizon (
                    {formatCommissionRateLabel(
                      normalizeCommissionRate(
                        typeof order.commissionRate === "number"
                          ? order.commissionRate
                          : commissionRate,
                      ) ?? 0,
                    )}
                    ):
                  </span>
                  <span className="font-semibold text-red-600">
                    - S/ {formatMoney(order.platformCommission)}
                  </span>
                </div>

                <div className="bg-emerald-50/60 rounded-2xl p-4 border border-emerald-200/80 space-y-1">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                    Monto Neto a Transferir
                  </span>
                  <span className="text-2xl font-black text-emerald-700 block">
                    S/ {formatMoney(order.netEarnings)}
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

      {/* Modal de Detalle de Guía Individual */}
      <PackageDetailModal
        isOpen={Boolean(selectedShipmentForModal)}
        onClose={() => setSelectedShipmentForModal(null)}
        pkg={selectedShipmentForModal}
        onEditSuccess={() => fetchPackageDetail()}
      />

      {/* Modal de Impresión Directa de Rótulo de Envío */}
      <ShippingLabelModal
        isOpen={Boolean(shippingLabelToPrint)}
        onClose={() => setShippingLabelToPrint(null)}
        data={shippingLabelToPrint}
      />

      {/* Modal para Editar Guía Individual Directamente */}
      <EditSingleShipmentModal
        isOpen={Boolean(shipmentToEdit)}
        onClose={() => setShipmentToEdit(null)}
        shipment={shipmentToEdit}
        onSuccess={() => {
          setShipmentToEdit(null);
          fetchPackageDetail();
        }}
      />

      {/* Modal de Despacho Reutilizable */}
      {isDispatchModalOpen && (
        <DispatchModal
          isOpen={isDispatchModalOpen}
          onClose={() => setIsDispatchModalOpen(false)}
          packageId={order.packages[0]?.packageId || order.orderId}
          items={order.items}
          initialShipments={order.packages}
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
  const { packageId } = use(params);

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
          <Loader2 className="w-8 h-8 animate-spin text-[#f25c05]" />
        </div>
      }
    >
      <SellerOrderDetailContent packageId={packageId} />
    </Suspense>
  );
}
