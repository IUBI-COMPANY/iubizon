"use client";

import { useCallback, useEffect, useState } from "react";
import { IconMail, IconRefresh, IconAlertTriangle } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface EmailItem {
  id: string;
  to_email: string;
  subject: string;
  template: string;
  status: string;
  attempts: number;
  max_attempts: number;
  last_error: string | null;
  created_at: string;
}

export default function CorreosPage() {
  const [emails, setEmails] = useState<EmailItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [result, setResult] = useState<{
    processed: number;
    failed: number;
    requeued?: number;
  } | null>(null);

  const fetchEmails = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/email-queue?status=${statusFilter}`);
    const text = await res.text();
    let data: any = {};
    try {
      data = JSON.parse(text);
    } catch {
      data = { emails: [] };
    }
    setEmails(data.emails || []);
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => {
    fetchEmails();
  }, [fetchEmails]);

  const processQueue = async () => {
    setProcessing(true);
    setResult(null);
    try {
      const res = await fetch("/api/email-queue/process", {
        method: "POST",
      });
      const data = await res.json();
      setResult(data);
      await fetchEmails();
    } catch {
      // ignore
    } finally {
      setProcessing(false);
    }
  };

  const templateLabels: Record<string, string> = {
    buyer_order: "Confirmación de compra (comprador)",
    seller_sale: "Nueva venta (vendedor)",
    dispatch: "Envío en camino",
    return_shipped: "Devolución en camino",
    return_received: "Devolución confirmada",
    refund_status: "Estado de reembolso",
    refund_completed: "Reembolso procesado",
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cola de Correos</h1>
          <p className="text-muted-foreground text-sm">
            Monitorea y reprocesa los emails manualmente
          </p>
        </div>
        <Button onClick={processQueue} disabled={processing}>
          {processing ? (
            <IconRefresh className="w-4 h-4 animate-spin mr-1" />
          ) : (
            <IconRefresh className="w-4 h-4 mr-1" />
          )}
          {processing ? "Procesando..." : "Procesar Cola"}
        </Button>
      </div>

      <div className="flex gap-2">
        {(["pending", "sending", "failed", "sent"] as const).map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              statusFilter === status
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {status === "pending" && "Pendientes"}
            {status === "sending" && "Enviando"}
            {status === "failed" && "Fallidos"}
            {status === "sent" && "Enviados"}
          </button>
        ))}
      </div>

      {result && (
        <Card>
          <CardContent className="p-4 text-sm">
            Procesados: <strong>{result.processed}</strong> · Fallidos:{" "}
            <strong>{result.failed}</strong> · Reencolados:{" "}
            <strong>{result.requeued ?? 0}</strong>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">Cargando...</p>
        </Card>
      ) : emails.length === 0 ? (
        <Card className="p-12 text-center">
          <IconMail className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-sm font-medium">No hay emails en esta categoría</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {emails.map((email) => (
            <Card key={email.id} className="overflow-hidden">
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <IconAlertTriangle className="w-4 h-4 text-red-500" />
                    <span className="text-sm font-medium">
                      {email.to_email}
                    </span>
                  </div>
                  <Badge variant="destructive" className="text-xs">
                    {email.attempts}/{email.max_attempts} intentos
                  </Badge>
                </div>
                <p className="text-xs font-semibold">{email.subject}</p>
                <p className="text-xs text-muted-foreground">
                  {templateLabels[email.template] || email.template} ·{" "}
                  {new Date(email.created_at).toLocaleDateString("es-PE")}
                </p>
                {email.last_error && (
                  <p className="text-xs text-red-600 mt-1 truncate">
                    {email.last_error}
                  </p>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
