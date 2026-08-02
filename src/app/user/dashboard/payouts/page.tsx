"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks";
import { Navbar } from "@/components/features/layout/Navbar";
import { Footer } from "@/components/features/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  DollarSign,
  FileText,
  Loader2,
  Receipt,
  Truck,
  Wallet,
} from "lucide-react";

interface SellerPayoutItem {
  id: string;
  trackingNumber: string | null;
  orderCode: string | null;
  subtotal: number;
  commission: number;
  netAmount: number;
  status: string;
  paidAt: string | null;
  paymentMethod: string | null;
  referenceCode: string | null;
  notes: string | null;
  createdAt: string;
}

interface PayoutKPIs {
  pendingTotal: number;
  paidTotal: number;
  accumulatedTotal: number;
  totalCount: number;
}

function formatDate(isoString: string | null) {
  if (!isoString) return "Pendiente";
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

function PayoutsContent() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [payouts, setPayouts] = useState<SellerPayoutItem[]>([]);
  const [kpis, setKpis] = useState<PayoutKPIs>({
    pendingTotal: 0,
    paidTotal: 0,
    accumulatedTotal: 0,
    totalCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [statusTab, setStatusTab] = useState("all");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login?redirect=/user/dashboard/payouts");
    }
  }, [user, authLoading, router]);

  const fetchPayouts = useCallback(async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const res = await fetch("/api/seller/payouts");
      const data = await res.json();
      if (res.ok) {
        setPayouts(data.payouts || []);
        if (data.kpis) setKpis(data.kpis);
      }
    } catch (err) {
      console.error("Error al cargar retribuciones:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchPayouts();
    }
  }, [user, fetchPayouts]);

  const filteredPayouts = payouts.filter((p) => {
    if (statusTab === "all") return true;
    if (statusTab === "pending") return p.status === "pending";
    if (statusTab === "processing") return p.status === "processing";
    if (statusTab === "paid") return p.status === "paid";
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

      <div className="flex-1 container mx-auto px-4 py-8 max-w-5xl space-y-6">
        {/* Cabecera de Finanzas */}
        <div className="flex items-center gap-4">
          <Link href="/user/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-black text-[#112237] flex items-center gap-2">
              <Wallet className="w-6 h-6 text-[#f25c05]" />
              <span>Mis Pagos & Finanzas</span>
            </h1>
            <p className="text-xs text-[#64748b] mt-0.5">
              Estado de las retribuciones y transferencias que iubizon debe realizar por tus entregas completadas.
            </p>
          </div>
        </div>

        {/* Tarjetas de Resumen KPI */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Por Cobrar / Pendiente */}
          <div className="bg-white rounded-3xl border border-[#e2e8f0] p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#64748b]">
                Por Cobrar (Pendiente de Abono)
              </span>
              <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-black text-[#112237]">
              S/ {kpis.pendingTotal.toFixed(2)}
            </p>
            <p className="text-[11px] text-[#64748b]">
              Entregas completadas a la espera de transferencia por iubizon.
            </p>
          </div>

          {/* Pagado / Liquidado */}
          <div className="bg-white rounded-3xl border border-[#e2e8f0] p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#64748b]">
                Total Transferido / Abonado
              </span>
              <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-black text-emerald-600">
              S/ {kpis.paidTotal.toFixed(2)}
            </p>
            <p className="text-[11px] text-[#64748b]">
              Monto que iubizon ya depositó en tu cuenta bancaria / Yape.
            </p>
          </div>

          {/* Acumulado Histórico */}
          <div className="bg-white rounded-3xl border border-[#e2e8f0] p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#64748b]">
                Total Acumulado Neto
              </span>
              <div className="w-9 h-9 rounded-2xl bg-orange-50 text-[#f25c05] flex items-center justify-center">
                <Wallet className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-black text-[#112237]">
              S/ {kpis.accumulatedTotal.toFixed(2)}
            </p>
            <p className="text-[11px] text-[#64748b]">
              Suma total de retribuciones netas generadas en la plataforma.
            </p>
          </div>
        </div>

        {/* Pestañas de Filtrado */}
        <Tabs value={statusTab} onValueChange={setStatusTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="all">Todos ({payouts.length})</TabsTrigger>
            <TabsTrigger value="pending">Pendientes de Pago</TabsTrigger>
            <TabsTrigger value="processing">En Proceso</TabsTrigger>
            <TabsTrigger value="paid">Pagados / Abonados</TabsTrigger>
          </TabsList>

          {filteredPayouts.length > 0 ? (
            <div className="space-y-4">
              {filteredPayouts.map((p) => {
                const isPaid = p.status === "paid";
                const isProcessing = p.status === "processing";

                const badgeLabel = isPaid
                  ? "Abonado / Transferido"
                  : isProcessing
                    ? "En Proceso de Depósito"
                    : "Pendiente de Pago por iubizon";

                const badgeStyle = isPaid
                  ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                  : isProcessing
                    ? "bg-blue-100 text-blue-800 border-blue-200"
                    : "bg-amber-100 text-amber-800 border-amber-200";

                return (
                  <div
                    key={p.id}
                    className="bg-white rounded-3xl border border-[#e2e8f0] p-6 shadow-sm space-y-4 hover:border-[#cbd5e1] transition-all"
                  >
                    {/* Cabecera de la Retribución */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#f1f5f9]">
                      <div className="flex flex-wrap items-center gap-2.5">
                        {p.trackingNumber ? (
                          <span className="text-xs font-extrabold text-[#f25c05] bg-orange-50 border border-orange-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                            <Truck className="w-3.5 h-3.5" />
                            <span>Tracking Id: {p.trackingNumber}</span>
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-[#112237] bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                            <Receipt className="w-3.5 h-3.5 text-[#64748b]" />
                            <span>Orden #{p.orderCode || "VENTA"}</span>
                          </span>
                        )}

                        <div className="flex items-center gap-1 text-xs text-[#64748b]">
                          <Calendar className="w-3.5 h-3.5 text-[#f25c05]" />
                          <span>Entrega completada el {formatFullDate(p.createdAt)}</span>
                        </div>
                      </div>

                      <span
                        className={`px-3.5 py-1 rounded-full text-[11px] font-extrabold uppercase border ${badgeStyle}`}
                      >
                        {badgeLabel}
                      </span>
                    </div>

                    {/* Desglose de Importes Financieros */}
                    <div className="bg-[#f8fafc] rounded-2xl p-5 border border-[#e2e8f0] grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="space-y-2 text-[#334155]">
                        <p className="flex justify-between border-b border-slate-200/60 pb-1.5">
                          <strong className="text-[#112237]">Valor Bruto de Productos:</strong>
                          <span>S/ {p.subtotal.toFixed(2)}</span>
                        </p>
                        <p className="flex justify-between border-b border-slate-200/60 pb-1.5 text-[#64748b]">
                          <strong className="text-[#112237]">Comisión iubizon (10%):</strong>
                          <span>- S/ {p.commission.toFixed(2)}</span>
                        </p>
                        <p className="text-[11px] text-[#64748b] pt-0.5">
                          iubizon transfiere directamente el saldo neto a tu cuenta tras la entrega al cliente.
                        </p>
                      </div>

                      <div className="flex flex-col justify-between space-y-3 border-t md:border-t-0 pt-3 md:pt-0 border-[#e2e8f0]">
                        <div className="flex items-center justify-between bg-white rounded-xl p-3 border border-[#e2e8f0]">
                          <span className="text-xs font-extrabold text-[#112237]">
                            Monto Neto a Recibir:
                          </span>
                          <span className="text-2xl font-black text-emerald-600">
                            S/ {p.netAmount.toFixed(2)}
                          </span>
                        </div>

                        {/* Datos de Transferencia / Voucher si está pagado */}
                        {isPaid && (
                          <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-200 text-emerald-900 text-xs space-y-1">
                            <p className="font-bold flex items-center gap-1.5 text-[11px]">
                              <CreditCard className="w-3.5 h-3.5 text-emerald-700" />
                              <span>Detalle del Abono por iubizon:</span>
                            </p>
                            {p.paymentMethod && (
                              <p>
                                <strong>Método:</strong> {p.paymentMethod}
                              </p>
                            )}
                            {p.referenceCode && (
                              <p>
                                <strong>Nro. Operación / Voucher:</strong>{" "}
                                <span className="font-mono">{p.referenceCode}</span>
                              </p>
                            )}
                            {p.paidAt && (
                              <p className="text-[10px] text-emerald-700">
                                Abonado el {formatDate(p.paidAt)}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-3xl border border-[#e2e8f0] shadow-sm">
              <FileText className="w-12 h-12 text-[#cbd5e1] mx-auto mb-3" />
              <h2 className="text-base font-bold text-[#112237] mb-1">
                No tienes registros de pago en esta sección
              </h2>
              <p className="text-xs text-[#64748b] mb-6">
                Cuando tus entregas sean marcadas como completadas, tus pagos pendientes aparecerán aquí.
              </p>
              <Link href="/user/dashboard/orders">
                <Button className="bg-[#f25c05] hover:bg-[#d94d04] text-white text-xs font-bold px-6 py-2.5 rounded-xl">
                  Ir a Gestión de Pedidos
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

export default function PayoutsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
          <Loader2 className="w-8 h-8 animate-spin text-[#f25c05]" />
        </div>
      }
    >
      <PayoutsContent />
    </Suspense>
  );
}
