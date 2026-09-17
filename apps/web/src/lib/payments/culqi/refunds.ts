import { getCulqiSecretKey, CULQI_CONFIG } from "./config";
import type { CulqiRefundRequest, CulqiRefundResponse } from "./types";

export interface CreateRefundInput {
  chargeId: string;
  amount: number;
  reason?: string;
}

export interface RefundResult {
  success: boolean;
  refundId?: string;
  rawResponse?: unknown;
  errorMessage?: string;
}

export async function refundCulqiCharge(
  input: CreateRefundInput,
): Promise<RefundResult> {
  const secretKey = getCulqiSecretKey();

  const amountInCents = Math.round(Number(input.amount) * 100);
  if (amountInCents <= 0) {
    throw new Error("El monto a reembolsar debe ser mayor a 0.");
  }

  const payload: CulqiRefundRequest = {
    charge_id: input.chargeId,
    amount: amountInCents,
    reason: input.reason || "solicitud_comprador",
  };

  try {
    const res = await fetch(`${CULQI_CONFIG.apiUrl}/refunds`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${secretKey}`,
      },
      body: JSON.stringify(payload),
    });

    const data: CulqiRefundResponse = await res.json();

    if (!res.ok || (data as any).object === "error") {
      const err = data as any;
      return {
        success: false,
        errorMessage:
          err.user_message ||
          err.merchant_message ||
          "Error al procesar el reembolso en Culqi",
        rawResponse: err,
      };
    }

    return {
      success: true,
      refundId: data.id,
      rawResponse: data,
    };
  } catch (err: unknown) {
    const msg =
      err instanceof Error ? err.message : "Error al conectar con Culqi Refunds";
    console.error("[Culqi refunds.ts] Error executing refund:", err);
    return {
      success: false,
      errorMessage: msg,
      rawResponse: { error: msg },
    };
  }
}
