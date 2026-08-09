"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "Pendiente", variant: "secondary" },
  paid: { label: "Pagado", variant: "outline" },
  shipped: { label: "Enviado", variant: "default" },
  delivered: { label: "Entregado", variant: "default" },
  completed: { label: "Completado", variant: "default" },
  cancelled: { label: "Cancelado", variant: "destructive" },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  const fetchOrders = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    const res = await fetch(`/api/orders?${params}`);
    const data = await res.json();
    setOrders(data.orders || []);
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, [statusFilter]);

  const changeStatus = async (id: string, status: string) => {
    await fetch("/api/orders", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) });
    fetchOrders();
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Órdenes</h1>
        <p className="text-muted-foreground">Gestiona todas las órdenes de compra</p>
      </div>
      <div className="flex gap-2">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Estado" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todas</SelectItem>
            {Object.entries(statusConfig).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-4">
        {loading ? <p className="text-muted-foreground p-4">Cargando...</p> : orders.map((order: any) => {
          const sc = statusConfig[order.status] || { label: order.status, variant: "outline" as const };
          return (
            <Card key={order.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">Orden #{order.order_code}</CardTitle>
                    <p className="text-xs text-muted-foreground">{order.buyer?.name || "Anónimo"} — {order.buyer?.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={sc.variant}>{sc.label}</Badge>
                    <Select value={order.status} onValueChange={(v) => changeStatus(order.id, v)}>
                      <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(statusConfig).map(([k, v]) => (
                          <SelectItem key={k} value={k}>{v.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm">Total: <strong>S/ {Number(order.total_amount).toFixed(2)}</strong> — {order.packages?.length || 0} paquete(s)</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {order.shipping?.address && `Envío: ${order.shipping.address}`}
                  {order.invoice?.type && ` — ${order.invoice.type.toUpperCase()}: ${order.invoice.number}`}
                </p>
              </CardContent>
            </Card>
          );
        })}
        {!loading && orders.length === 0 && <p className="text-muted-foreground p-4">No hay órdenes</p>}
      </div>
    </div>
  );
}
