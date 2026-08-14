import type {
  PaymentProvider,
  InitiatePaymentParams,
  InitiatePaymentResult,
  ConfirmPaymentParams,
  ConfirmPaymentResult,
  RefundPaymentParams,
  RefundPaymentResult,
} from "../types";
import { createNiubizSession } from "./session";
import { authorizeNiubizTransaction } from "./authorization";
import { refundNiubizTransaction } from "./cancellation";

/** Adaptador del proveedor Niubiz a la interface estándar de pagos. */
export const niubizProvider: PaymentProvider = {
  id: "niubiz",

  async initiate(
    params: InitiatePaymentParams,
  ): Promise<InitiatePaymentResult> {
    const session = await createNiubizSession({
      amount: params.amount,
      purchaseNumber: params.purchaseNumber,
      customerIp: params.customerIp,
      customer: params.customer,
    });
    return {
      sessionKey: session.sessionKey,
      merchantId: session.merchantId,
      environment: session.environment,
    };
  },

  async confirm(params: ConfirmPaymentParams): Promise<ConfirmPaymentResult> {
    const result = await authorizeNiubizTransaction({
      transactionToken: params.transactionToken || "",
      purchaseNumber: params.purchaseNumber,
      amount: params.amount,
      currency: params.currency,
    });

    return {
      success: result.success,
      status: result.success ? "authorized" : "denied",
      transactionId: result.transactionId,
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
    const result = await refundNiubizTransaction({
      authorizationCode: String(params.authorizationCode ?? ""),
      transactionId: params.transactionId,
      amount: params.amount,
      purchaseNumber: params.purchaseNumber,
    });
    return {
      success: result.success,
      cancellationCode: result.cancellationCode,
      rawResponse: result.rawResponse,
    };
  },
};
