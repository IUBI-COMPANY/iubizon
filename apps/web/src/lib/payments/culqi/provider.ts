import type {
  PaymentProvider,
  InitiatePaymentParams,
  InitiatePaymentResult,
  ConfirmPaymentParams,
  ConfirmPaymentResult,
  RefundPaymentParams,
  RefundPaymentResult,
} from "../types";
import { getCulqiPublicKey } from "./config";
import { createCulqiCharge } from "./charges";
import { refundCulqiCharge } from "./refunds";

/** Adaptador del proveedor Culqi a la interface estándar de pagos de iubizon. */
export const culqiProvider: PaymentProvider = {
  id: "culqi",

  async initiate(
    params: InitiatePaymentParams,
  ): Promise<InitiatePaymentResult> {
    const publicKey = getCulqiPublicKey();
    return {
      sessionKey: publicKey,
      merchantId: publicKey,
      environment:
        publicKey.startsWith("pk_live_") ? "production" : "test",
      raw: {
        publicKey,
        amount: params.amount,
        currency: params.currency || "PEN",
        purchaseNumber: params.purchaseNumber,
      },
    };
  },

  async confirm(params: ConfirmPaymentParams): Promise<ConfirmPaymentResult> {
    const tokenId =
      params.transactionToken || params.chargeToken || "";

    if (!tokenId) {
      return {
        success: false,
        status: "denied",
        errorCode: "MISSING_TOKEN",
        errorMessage: "Token de pago Culqi no proporcionado.",
        actionDescription: "No se recibió el token de autorización de tarjeta.",
      };
    }

    const customerEmail =
      params.customer?.email ||
      (params.context?.shipping as any)?.email ||
      "cliente@iubizon.com";

    const result = await createCulqiCharge({
      amount: params.amount,
      currency: params.currency,
      tokenId,
      email: customerEmail,
      purchaseNumber: params.purchaseNumber,
      description: `Orden #${params.purchaseNumber} en iubizon`,
      antifraudDetails: {
        email: customerEmail,
        first_name:
          (params.context?.shipping as any)?.name ||
          params.customer?.documentNumber,
        phone_number:
          params.customer?.phone || (params.context?.shipping as any)?.phone,
        address:
          params.customer?.address ||
          (params.context?.shipping as any)?.address,
        address_city:
          params.customer?.city ||
          (params.context?.shipping as any)?.district,
        country_code: "PE",
      },
    });

    return {
      success: result.success,
      status: result.success ? "authorized" : "denied",
      transactionId: result.chargeId,
      authorizationCode: result.authorizationCode,
      cardBrand: result.cardBrand,
      cardLast4: result.cardLast4,
      errorCode: result.errorCode,
      errorMessage: result.errorMessage,
      actionDescription: result.actionDescription,
      rawResponse: result.rawResponse,
    };
  },

  async refund(params: RefundPaymentParams): Promise<RefundPaymentResult> {
    const result = await refundCulqiCharge({
      chargeId: params.transactionId,
      amount: params.amount,
      reason: params.comment || "solicitud_comprador",
    });

    return {
      success: result.success,
      cancellationCode: result.refundId || null,
      rawResponse: result.rawResponse,
    };
  },
};
