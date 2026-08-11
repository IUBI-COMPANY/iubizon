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
  const [result, setResult] = useState<{
    processed: number;
    failed: number;
  } | null>(null);

  const fetchEmails = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/email-queue?status=failed");
    const text = await res.text();
    let data: any = {};
    try {
      data = JSON.parse(text);
    } catch {
      data = { emails: [] };
    }
    setEmails(data.emails || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchEmails();
  }, [fetchEmails]);

  const processQueue = async () => {
    setProcessing(true);
    setResult(null);
    try {
      const res = await fetch("/api/cron/process-emails");
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
            Monitorea los emails fallidos y reprocesa la cola manualmente
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

      {result && (
        <Card>
          <CardContent className="p-4 text-sm">
            Procesados: <strong>{result.processed}</strong> · Fallidos:{" "}
            <strong>{result.failed}</strong>
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
          <p className="text-sm font-medium">No hay emails fallidos</p>
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
