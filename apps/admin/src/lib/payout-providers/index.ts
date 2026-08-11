import type { PayoutProvider } from "./types";
import { NiubizPushPaymentProvider } from "./niubiz";
import { ManualPayoutProvider } from "./manual";

const providers: Record<string, PayoutProvider> = {
  niubiz: new NiubizPushPaymentProvider(),
  manual: new ManualPayoutProvider(),
};

export function getPayoutProvider(name: string): PayoutProvider {
  return providers[name] || providers.manual;
}

export type { PayoutBankAccount, PayoutParams, PayoutProvider, PayoutResult } from "./types";
