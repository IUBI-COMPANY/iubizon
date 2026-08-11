import type { PayoutProvider, PayoutResult } from "./types";

export class ManualPayoutProvider implements PayoutProvider {
  readonly name = "manual";

  async processPayout(): Promise<PayoutResult> {
    return { success: true, transactionId: null, rawResponse: null };
  }
}
