import { NiubizRefundProvider } from "./niubiz";
import { CulqiRefundProvider } from "./culqi";
import type { RefundProvider } from "./types";

const providers: Record<string, RefundProvider> = {
  niubiz: new NiubizRefundProvider(),
  culqi: new CulqiRefundProvider(),
};

export function getRefundProvider(id: string): RefundProvider | null {
  return providers[id] ?? null;
}

export type { RefundParams, RefundProvider, RefundResult } from "./types";
