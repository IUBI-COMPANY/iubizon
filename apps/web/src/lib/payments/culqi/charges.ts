import { getCulqiSecretKey, CULQI_CONFIG } from "./config";
import type {
  CulqiChargeRequest,
  CulqiChargeResponse,
  CulqiErrorResponse,
} from "./types";

export interface CreateChargeInput {
  amount: number;
  currency?: string;
  tokenId: string;
  email: string;
  purchaseNumber: string;
  description?: string;
  antifraudDetails?: {
    first_name?: string;
    last_name?: string;
    email?: string;
    address?: string;
    address_city?: string;
    country_code?: string;
    phone_number?: string;
  };
}

export interface ChargeResult {
  success: boolean;
  chargeId?: string;
  authorizationCode?: string;
  cardBrand?: string;
  cardLast4?: string;
  errorCode?: string;
  errorMessage?: string;
  actionDescription?: string;
  rawResponse?: unknown;
}

export async function createCulqiCharge(
  input: CreateChargeInput,
): Promise<ChargeResult> {
  const secretKey = getCulqiSecretKey();

  const amountInCents = Math.round(Number(input.amount) * 100);
  if (amountInCents <= 0) {
    throw new Error("El monto a cobrar debe ser mayor a 0.");
  }

  const payload: CulqiChargeRequest = {
    amount: amountInCents,
    currency_code: input.currency || CULQI_CONFIG.currency,
    email: input.email,
    source_id: input.tokenId,
    description:
      input.description || `Compra iubizon #${input.purchaseNumber}`,
    antifraud_details: input.antifraudDetails,
    metadata: {
      purchaseNumber: input.purchaseNumber,
      platform: "iubizon_web",
    },
  };

  try {
    const res = await fetch(`${CULQI_CONFIG.apiUrl}/charges`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${secretKey}`,
      },
      body: JSON.stringify(payload),
    });

    const data: CulqiChargeResponse | CulqiErrorResponse = await res.json();

    if (!res.ok || (data as CulqiErrorResponse).object === "error") {
      const err = data as CulqiErrorResponse;
      const userMsg =
        err.user_message ||
        err.merchant_message ||
        "La transacción fue declinada por la entidad emisora.";

      return {
        success: false,
        errorCode: err.code || err.decline_code || "CHARGE_DECLINED",
        errorMessage: err.merchant_message || userMsg,
        actionDescription: userMsg,
        rawResponse: err,
      };
    }

    const charge = data as CulqiChargeResponse;

    const brand =
      charge.source?.iin?.card_brand ||
      (charge.source as any)?.card_brand ||
      "Tarjeta";
    const last4 =
      charge.source?.last_four ||
      (charge.source as any)?.last_four ||
      (charge.source?.card_number
        ? charge.source.card_number.slice(-4)
        : undefined);

    return {
      success: true,
      chargeId: charge.id,
      authorizationCode:
        charge.authorization_code ||
        charge.reference_code ||
        input.purchaseNumber,
      cardBrand: brand,
      cardLast4: last4,
      actionDescription: "Pago exitoso",
      rawResponse: charge,
    };
  } catch (err: unknown) {
    const msg =
      err instanceof Error
        ? err.message
        : "Error de conexión con el procesador de pagos Culqi.";
    console.error("[Culqi charges.ts] Error creating charge:", err);
    return {
      success: false,
      errorCode: "CULQI_CONNECTION_ERROR",
      errorMessage: msg,
      actionDescription:
        "No se pudo completar la comunicación con Culqi. Intenta nuevamente.",
      rawResponse: { error: msg },
    };
  }
}
