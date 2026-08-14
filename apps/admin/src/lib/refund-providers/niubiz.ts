import { processNiubizRefund } from "@/lib/niubiz";
import type { RefundParams, RefundProvider, RefundResult } from "./types";

export class NiubizRefundProvider implements RefundProvider {
  readonly id = "niubiz";

  async refund(params: RefundParams): Promise<RefundResult> {
    const result = await processNiubizRefund(
      params.transactionId,
      params.ruc || "",
      params.amount,
      params.externalReferenceId || params.purchaseNumber,
    );
    return {
      success: result.success,
      cancellationCode: result.cancellationCode,
      rawResponse: result.rawResponse,
    };
  }
}
