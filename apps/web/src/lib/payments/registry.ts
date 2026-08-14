import type { PaymentProvider } from "./types";
import { niubizProvider } from "./niubiz";

/**
 * Registry de proveedores de pago disponibles.
 * Para agregar un proveedor nuevo (Culqi, Pago Efectivo, PayPal, ...):
 * 1. Crear el módulo `lib/payments/<id>/`.
 * 2. Registrarlo aquí.
 */
const providers: Record<string, PaymentProvider> = {
  niubiz: niubizProvider,
};

export function getPaymentProvider(id: string): PaymentProvider | null {
  return providers[id] ?? null;
}
