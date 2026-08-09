"use client";

import { useEffect, useState } from "react";
import { IconRefresh, IconCreditCard, IconWallet, IconCheck, IconClock, IconX } from "@tabler/icons-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConfirmModal } from "@/components/ui/confirm-modal";

function formatMoney(v: unknown): string {
  const n = Number(v);
  return isNaN(n) ? "0.00" : n.toLocaleString("es-PE", { minimumFractionDigits: 2 });
}

const TX_STATUS: Record<string, { label: string; color: string }> = {
  pending:     { label: "Pendiente", color: "bg-amber-100 text-amber-800" },
  authorized:  { label: "Autorizado", color: "bg-blue-100 text-blue-800" },
  denied:      { label: "Denegado", color: "bg-red-100 text-red-800" },
  failed:      { label: "Fallido", color: "bg-red-100 text-red-800" },
  refunded:    { label: "Reembolsado", color: "bg-purple-100 text-purple-800" },
};

const PAYOUT_STATUS: Record<string, { label: string; color: string }> = {
  pending:    { label: "Pendiente", color: "bg-amber-100 text-amber-800" },
  processing: { label: "Procesando", color: "bg-blue-100 text-blue-800" },
  paid:       { label: "Pagado", color: "bg-emerald-100 text-emerald-800" },
  cancelled:  { label: "Cancelado", color: "bg-red-100 text-red-800" },
};

export default function PagosPage() {
  const [tab, setTab] = useState("transactions");
  const [transactions, setTransactions] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState<{ id: string; status: string } | null>(null);

  const fetchData = async () => {
    setLoading(true);
    const [txRes, pRes] = await Promise.all([
      fetch("/api/payments?type=transactions"),
      fetch("/api/payments?type=payouts"),
    ]);
    const tx = await txRes.json();
    const p = await pRes.json();
    setTransactions(tx.transactions || []);
    setPayouts(p.payouts || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const markPayoutPaid = async () => {
    if (!confirm) return;
    await fetch("/api/payments", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: confirm.id, status: confirm.status }) });
    setConfirm(null);
    fetchData();
  };

  const totalAuthorized = transactions.filter(t => t.status === "authorized").reduce((s: number, t: any) => s + Number(t.amount), 0);
  const pendingPayouts = payouts.filter(p => p.status === "pending").reduce((s: number, p: any) => s + Number(p.net_amount), 0);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pagos</h1>
          <p className="text-muted-foreground text-sm">Transacciones y liquidaciones</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchData}><IconRefresh className="w-4 h-4 mr-1" />Actualizar</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground"><IconCreditCard className="w-4 h-4" />Total autorizado</div>
            <p className="text-2xl font-bold">S/ {formatMoney(totalAuthorized)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground"><IconWallet className="w-4 h-4" />Pendiente de pago a vendedores</div>
            <p className="text-2xl font-bold">S/ {formatMoney(pendingPayouts)}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="transactions"><IconCreditCard className="w-3.5 h-3.5 mr-1" />Transacciones ({transactions.length})</TabsTrigger>
          <TabsTrigger value="payouts"><IconWallet className="w-3.5 h-3.5 mr-1" />Liquidaciones ({payouts.length})</TabsTrigger>
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="flex justify-center py-12"><IconRefresh className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : tab === "transactions" ? (
        <div className="space-y-2">
          {transactions.map((tx: any) => {
            const s = TX_STATUS[tx.status] || { label: tx.status, color: "bg-muted" };
            return (
              <Card key={tx.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <Badge className={`font-mono text-xs ${s.color}`}>{tx.purchase_number}</Badge>
                  <div>
                    <p className="text-sm font-medium">S/ {formatMoney(tx.amount)}</p>
                    <p className="text-xs text-muted-foreground">
                      {tx.card_brand && `${tx.card_brand} ****${tx.card_last4} · `}
                      {tx.transaction_type} · {tx.orders?.[0]?.order_code && `Orden #${tx.orders[0].order_code}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge className={s.color}>{s.label}</Badge>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="space-y-2">
          {payouts.map((p: any) => {
            const s = PAYOUT_STATUS[p.status] || { label: p.status, color: "bg-muted" };
            return (
              <Card key={p.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge className={`font-mono text-xs ${s.color}`}>{s.label}</Badge>
                    <span className="text-sm font-medium">{p.company?.name || "Empresa"}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Subtotal: S/ {formatMoney(p.subtotal)} · Comisión: S/ {formatMoney(p.commission)} · Neto: S/ {formatMoney(p.net_amount)}
                    {p.paid_at && ` · Pagado: ${new Date(p.paid_at).toLocaleDateString("es-PE")}`}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {p.status === "pending" && (
                    <Button size="sm" variant="outline" className="h-7 text-xs"
                      onClick={() => setConfirm({ id: p.id, status: "paid" })}>
                      <IconCheck className="w-3 h-3 mr-1" />Marcar Pagado
                    </Button>
                  )}
                  <span className="text-sm font-bold">Neto: S/ {formatMoney(p.net_amount)}</span>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <ConfirmModal
        open={!!confirm}
        onOpenChange={() => setConfirm(null)}
        title="Confirmar pago a vendedor"
        description="¿Confirmas que ya se realizó la transferencia al vendedor? Esta acción marcará la liquidación como pagada."
        confirmLabel="Sí, marcar como pagado"
        onConfirm={markPayoutPaid}
      />
    </div>
  );
}
