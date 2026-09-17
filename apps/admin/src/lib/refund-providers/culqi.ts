import type { RefundParams, RefundProvider, RefundResult } from "./types";

export class CulqiRefundProvider implements RefundProvider {
  readonly id = "culqi";

  async refund(params: RefundParams): Promise<RefundResult> {
    const secretKey = process.env.CULQI_SECRET_KEY;
    if (!secretKey) {
      return {
        success: false,
        cancellationCode: null,
        rawResponse: { error: "CULQI_SECRET_KEY no está configurada" },
      };
    }

    const apiUrl = process.env.CULQI_API_URL || "https://api.culqi.com/v2";
    const amountInCents = Math.round(Number(params.amount) * 100);

    try {
      const res = await fetch(`${apiUrl}/refunds`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${secretKey}`,
        },
        body: JSON.stringify({
          charge_id: params.transactionId,
          amount: amountInCents,
          reason: params.comment || "solicitud_comprador",
        }),
      });

      const data = await res.json();

      if (!res.ok || data.object === "error") {
        return {
          success: false,
          cancellationCode: null,
          rawResponse: data,
        };
      }

      return {
        success: true,
        cancellationCode: data.id || null,
        rawResponse: data,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al conectar con Culqi";
      return {
        success: false,
        cancellationCode: null,
        rawResponse: { error: msg },
      };
    }
  }
}
