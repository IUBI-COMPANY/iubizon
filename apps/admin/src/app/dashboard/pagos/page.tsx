"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  IconSearch,
  IconRefresh,
  IconCreditCard,
  IconWallet,
  IconCheck,
  IconClock,
  IconLoader2,
  IconTruck,
  IconX,
  IconCalendar,
  IconChevronDown,
  IconChevronUp,
  IconNotes,
} from "@tabler/icons-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { useAuth } from "@/hooks/useAuth";

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; icon: typeof IconClock }
> = {
  pending: {
    label: "Pendiente de Pago",
    color: "bg-amber-100 text-amber-800 border-amber-200",
    icon: IconClock,
  },
  processing: {
    label: "En Proceso",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: IconTruck,
  },
  paid: {
    label: "Abonado / Transferido",
    color: "bg-emerald-100 text-emerald-800 border-emerald-200",
    icon: IconCheck,
  },
  cancelled: {
    label: "Cancelado",
    color: "bg-red-100 text-red-800 border-red-200",
    icon: IconX,
  },
};

function formatMoney(v: unknown): string {
  const n = Number(v);
  return isNaN(n)
    ? "0.00"
    : n.toLocaleString("es-PE", { minimumFractionDigits: 2 });
}

function formatFullDate(iso: string | null) {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function PagosPage() {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("payouts");
  const [statusFilter, setStatusFilter] = useState("");
  const [companySearch, setCompanySearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<{
    id: string;
    companyName: string;
    netAmount: number;
  } | null>(null);
  const [payoutMethod, setPayoutMethod] = useState("");
  const [payoutRef, setPayoutRef] = useState("");
  const [payoutNotes, setPayoutNotes] = useState("");
  const [payoutError, setPayoutError] = useState("");
  const [payingId, setPayingId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [pRes, txRes] = await Promise.all([
      fetch(
        `/api/payments?type=payouts&status=${statusFilter}&company=${companySearch}`,
      ),
      fetch("/api/payments?type=transactions"),
    ]);
    const p = await pRes.json();
    const tx = await txRes.json();
    setPayouts(p.payouts || []);
    setSummary(p.summary || {});
    setTransactions(tx.transactions || []);
    setLoading(false);
  }, [statusFilter, companySearch]);

  useEffect(() => {
    fetchData();
  }, [statusFilter, fetchData]);

  const markAsPaid = async (method: string) => {
    if (!confirm) return;

    const proofUrl = method === "manual" ? await uploadProof() : null;
    if (method === "manual" && !proofUrl) {
      setPayoutError("El comprobante es obligatorio para pagos manuales");
      setConfirm(null);
      return;
    }

    setPayingId(confirm.id);
    try {
      await fetch("/api/payments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: confirm.id,
          status: "paid",
          payment_method: method,
          reference_code: payoutRef.trim() || null,
          notes: payoutNotes.trim() || null,
          payment_proof: proofUrl,
          updated_by: user?.id || null,
        }),
      });
      setConfirm(null);
      setPayoutMethod("");
      setPayoutRef("");
      setPayoutNotes("");
      fetchData();
    } catch {
      // handled by API response
    } finally {
      setPayingId(null);
    }
  };

  const markAsProcessing = async (id: string) => {
    await fetch("/api/payments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "processing", updated_by: user?.id || null }),
    });
    fetchData();
  };

  const uploadProof = async (): Promise<string | null> => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return null;
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload/payment-proof", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    return data.url || null;
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pagos</h1>
          <p className="text-muted-foreground text-sm">
            Gestión de liquidaciones a proveedores
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchData}>
          <IconRefresh className="w-4 h-4 mr-1" />
          Actualizar
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <IconClock className="w-4 h-4 text-amber-600" />
              Pendiente de pagar
            </div>
            <p className="text-2xl font-bold text-amber-600">
              S/ {formatMoney(summary.totalPending)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {summary.pendingCount || 0} liquidaciones pendientes
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <IconCheck className="w-4 h-4 text-emerald-600" />
              Total abonado
            </div>
            <p className="text-2xl font-bold text-emerald-600">
              S/ {formatMoney(summary.totalPaid)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {summary.paidCount || 0} transferencias realizadas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs y filtros */}
      <div className="flex gap-2 flex-wrap items-center justify-between">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="payouts">
              <IconWallet className="w-3.5 h-3.5 mr-1" />
              Liquidaciones ({payouts.length})
            </TabsTrigger>
            <TabsTrigger value="transactions">
              <IconCreditCard className="w-3.5 h-3.5 mr-1" />
              Transacciones ({transactions.length})
            </TabsTrigger>
          </TabsList>
        </Tabs>
        {tab === "payouts" && (
          <div className="flex gap-2 items-center">
            <Input
              placeholder="Buscar empresa..."
              value={companySearch}
              onChange={(e) => setCompanySearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchData()}
              className="max-w-[180px] h-8 text-xs"
            />
            <Button
              variant="outline"
              size="sm"
              className="h-8"
              onClick={fetchData}
            >
              <IconSearch className="w-3.5 h-3.5" />
            </Button>
          </div>
        )}
      </div>

      {tab === "payouts" ? (
        <>
          <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v)}>
            <TabsList className="w-full justify-start overflow-x-auto">
              <TabsTrigger value="">Todas ({payouts.length})</TabsTrigger>
              <TabsTrigger value="pending">Pendientes</TabsTrigger>
              <TabsTrigger value="processing">En Proceso</TabsTrigger>
              <TabsTrigger value="paid">Pagados</TabsTrigger>
            </TabsList>
          </Tabs>

          {loading ? (
            <div className="flex justify-center py-12">
              <IconRefresh className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : payouts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No hay liquidaciones con este filtro
            </div>
          ) : (
            <div className="space-y-3">
              {payouts.map((p: any) => {
                const sc = STATUS_CONFIG[p.status] || STATUS_CONFIG.pending;
                const isExpanded = expandedId === p.id;

                return (
                  <Card key={p.id} className="overflow-hidden">
                    <div
                      className="p-4 flex flex-col sm:flex-row sm:items-center gap-3 cursor-pointer"
                      onClick={() => setExpandedId(isExpanded ? null : p.id)}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div
                          className={`p-2 rounded-lg ${p.status === "pending" ? "bg-amber-50" : p.status === "paid" ? "bg-emerald-50" : "bg-blue-50"}`}
                        >
                          <sc.icon
                            className={`w-4 h-4 ${p.status === "pending" ? "text-amber-600" : p.status === "paid" ? "text-emerald-600" : "text-blue-600"}`}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold">
                              {p.company?.name || "Empresa"}
                            </span>
                            <Badge className={sc.color}>
                              <sc.icon className="w-3 h-3 mr-1" />
                              {sc.label}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-sm font-bold">
                              S/ {formatMoney(p.net_amount)}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              · Bruto S/ {formatMoney(p.subtotal)} · Comisión S/{" "}
                              {formatMoney(p.commission)}
                            </span>
                          </div>
                          </div>

                          {p.company?.payout_card && (
                            <div>
                              <p className="font-semibold text-muted-foreground uppercase mb-1">
                                Tarjeta P2P
                              </p>
                              {(() => {
                                try {
                                  const c = typeof p.company.payout_card === "string"
                                    ? JSON.parse(p.company.payout_card)
                                    : p.company.payout_card;
                                  return (
                                    <p className="font-medium">
                                      {c.cardNumber
                                        ? `****${c.cardNumber.slice(-4)}`
                                        : c.alias || "Sin datos"}
                                      {c.expirationMonth && ` · ${c.expirationMonth}/${c.expirationYear}`}
                                    </p>
                                  );
                                } catch {
                                  return <p className="font-medium">Ver detalles</p>;
                                }
                              })()}
                            </div>
                          )}
                        </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {p.status === "pending" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsProcessing(p.id);
                            }}
                          >
                            <IconTruck className="w-3 h-3 mr-1" />
                            En Proceso
                          </Button>
                        )}
                        {p.status === "processing" && (
                          <Button
                            size="sm"
                            className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirm({
                                id: p.id,
                                companyName: p.company?.name || "Empresa",
                                netAmount: p.net_amount,
                              });
                            }}
                          >
                            <IconCheck className="w-3 h-3 mr-1" />
                            Marcar Pagado
                          </Button>
                        )}
                        {isExpanded ? (
                          <IconChevronUp className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <IconChevronDown className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>

                    {isExpanded && (
                      <CardContent className="border-t bg-muted/30 px-4 py-3 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div>
                            <p className="font-semibold text-muted-foreground uppercase mb-1">
                              Empresa
                            </p>
                            <p className="font-medium">{p.company?.name}</p>
                            <p className="text-muted-foreground">
                              {p.company?.email}
                            </p>
                          </div>
                          <div>
                            <p className="font-semibold text-muted-foreground uppercase mb-1">
                              Datos bancarios
                            </p>
                            {p.company?.bank_account ? (
                              <div>
                                {(() => {
                                  try {
                                    const b = JSON.parse(
                                      p.company.bank_account,
                                    );
                                    return (
                                      <p className="font-medium">
                                        {b.bank_name} — Nº {b.account_number} (
                                        {b.account_type})
                                      </p>
                                    );
                                  } catch {
                                    return (
                                      <p className="font-medium">
                                        Ver detalles
                                      </p>
                                    );
                                  }
                                })()}
                              </div>
                            ) : (
                              <p className="text-muted-foreground italic">
                                Sin datos bancarios registrados
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="bg-background rounded-lg p-3 space-y-1.5">
                          <div className="flex justify-between text-sm">
                            <span>Subtotal productos</span>
                            <span>S/ {formatMoney(p.subtotal)}</span>
                          </div>
                          <div className="flex justify-between text-sm text-destructive">
                            <span>Comisión iubizon</span>
                            <span>- S/ {formatMoney(p.commission)}</span>
                          </div>
                          <div className="flex justify-between text-sm font-bold pt-1.5 border-t">
                            <span>Neto a transferir</span>
                            <span className="text-emerald-600">
                              S/ {formatMoney(p.net_amount)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <IconCalendar className="w-3.5 h-3.5" />
                          <span>
                            Registrado: {formatFullDate(p.created_at)}
                          {p.updated_by_name && (
                            <span className="ml-2">
                              · Por: {p.updated_by_name}
                            </span>
                          )}
                          </span>
                          {p.paid_at && (
                            <span className="ml-2">
                              · Pagado: {formatFullDate(p.paid_at)}
                            </span>
                          )}
                        </div>

                        {(p.payment_method || p.reference_code) && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <IconNotes className="w-3.5 h-3.5" />
                            <span>
                              {p.payment_method && `${p.payment_method}`}
                              {p.payment_method && p.reference_code && " · "}
                              {p.reference_code && `Ref: ${p.reference_code}`}
                            </span>
                          </div>
                        )}

                        {p.notes && (
                          <div className="flex items-start gap-2 text-xs text-muted-foreground">
                            <IconNotes className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                            <span>{p.notes}</span>
                          </div>
                        )}

                        {p.payment_proof && (
                          <button
                            onClick={() => {
                              const w = window.open("", "_blank", "width=800,height=600");
                              if (w) {
                                w.document.write(`<img src="${p.payment_proof}" style="max-width:100%;max-height:100vh;" />`);
                                w.document.title = "Comprobante de pago";
                              }
                            }}
                            className="text-xs text-blue-600 hover:underline text-left"
                          >
                            📎 Ver comprobante
                          </button>
                        )}

                        {p.status === "pending" && (
                          <div className="flex gap-2 pt-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs"
                              onClick={() => markAsProcessing(p.id)}
                            >
                              <IconTruck className="w-3 h-3 mr-1" />
                              En Proceso
                            </Button>
                          </div>
                        )}
                        {p.status === "processing" && (
                          <div className="space-y-2 pt-2">
                            <div className="flex gap-2">
                              <Input
                                className="h-7 text-xs flex-1"
                                placeholder="N° referencia / operación"
                                value={payoutRef}
                                onChange={(e) => setPayoutRef(e.target.value)}
                              />
                              <Input
                                className="h-7 text-xs flex-1"
                                placeholder="Notas (opcional)..."
                                value={payoutNotes}
                                onChange={(e) => setPayoutNotes(e.target.value)}
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[11px] font-semibold text-muted-foreground block">
                                📎 Comprobante de pago *
                              </label>
                              <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*,.pdf"
                                className="text-xs text-foreground file:mr-2 file:py-1 file:px-3 file:text-xs file:font-semibold file:border-0 file:rounded-md file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                              />
                              <p className="text-[10px] text-muted-foreground">Obligatorio para pagos manuales</p>
                            </div>
                            {payoutError && (
                              <p className="text-xs text-red-500 font-medium">{payoutError}</p>
                            )}
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                className="h-7 text-xs bg-violet-600 hover:bg-violet-700 flex-1"
                                onClick={() => {
                                  setPayoutError("");
                                  setPayoutMethod("niubiz");
                                  setConfirm({
                                    id: p.id,
                                    companyName: p.company?.name || "Empresa",
                                    netAmount: p.net_amount,
                                  });
                                }}
                                disabled={!!payingId}
                              >
                                {payingId === p.id ? (
                                  <IconLoader2 className="w-3 h-3 mr-1 animate-spin" />
                                ) : (
                                  <IconCheck className="w-3 h-3 mr-1" />
                                )}
                                {payingId === p.id ? "Procesando..." : "Pagar vía Niubiz"}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs flex-1"
                                disabled={!!payingId}
                                onClick={() => {
                                  setPayoutError("");
                                  setPayoutMethod("manual");
                                  setConfirm({
                                    id: p.id,
                                    companyName: p.company?.name || "Empresa",
                                    netAmount: p.net_amount,
                                  });
                                }}
                              >
                                {payingId === p.id ? (
                                  <IconLoader2 className="w-3 h-3 mr-1 animate-spin" />
                                ) : (
                                  <IconCheck className="w-3 h-3 mr-1" />
                                )}
                                {payingId === p.id ? "Procesando..." : "Marcar Pagado Manual"}
                              </Button>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </>
      ) : (
        <div className="space-y-2">
          {transactions.map((tx: any) => {
            const sx =
              tx.status === "authorized"
                ? { label: "Autorizado", color: "bg-blue-100 text-blue-800" }
                : tx.status === "denied"
                  ? { label: "Denegado", color: "bg-red-100 text-red-800" }
                  : tx.status === "refunded"
                    ? {
                        label: "Reembolsado",
                        color: "bg-purple-100 text-purple-800",
                      }
                    : { label: tx.status, color: "bg-muted" };
            return (
              <Card
                key={tx.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Badge className={`font-mono text-xs ${sx.color}`}>
                    {tx.purchase_number}
                  </Badge>
                  <div>
                    <p className="text-sm font-medium">
                      S/ {formatMoney(tx.amount)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {tx.card_brand &&
                        `${tx.card_brand} ****${tx.card_last4} · `}
                      {tx.orders?.[0]?.order_code &&
                        `Orden #${tx.orders[0].order_code}`}
                    </p>
                  </div>
                </div>
                <Badge className={sx.color}>{sx.label}</Badge>
              </Card>
            );
          })}
        </div>
      )}

      <ConfirmModal
        open={!!confirm}
        onOpenChange={() => setConfirm(null)}
        title="Confirmar pago a proveedor"
        description={`¿Confirmas que ya realizaste la transferencia de S/ ${confirm ? formatMoney(confirm.netAmount) : "0"} a ${confirm?.companyName}?`}
        confirmLabel={`Sí, pagar${payoutMethod === "niubiz" ? " vía Niubiz" : " manualmente"}`}
        onConfirm={() => markAsPaid(payoutMethod)}
      />
    </div>
  );
}
