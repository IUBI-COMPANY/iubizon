"use client";

import type { ComponentType } from "react";
import { CreditCard } from "lucide-react";
import { NiubizPayModal } from "@/components/features/checkout/NiubizPayModal";
import type { CartItem } from "@/hooks/useCart";
import type { ShippingFormState } from "@/components/features/cart/checkout-schema";

/**
 * Props comunes que todo widget de pago debe aceptar.
 */
export interface PaymentWidgetProps {
  amount: number;
  cartItems: CartItem[];
  shippingForm: ShippingFormState;
  invoiceDetails: Record<string, unknown>;
  onValidate: () => boolean;
  onSuccess: (orderCode: string) => void;
  onError: (errorMessage: string) => void;
}

export interface PaymentMethodDefinition {
  id: string;
  label: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  Widget: ComponentType<PaymentWidgetProps>;
}

/**
 * Métodos de pago conocidos. Para agregar uno nuevo (Culqi, Pago Efectivo,
 * PayPal) basta con crear su widget y registrarlo aquí.
 */
export const PAYMENT_METHODS: PaymentMethodDefinition[] = [
  {
    id: "niubiz",
    label: "Tarjeta Crédito / Débito (Niubiz)",
    description: "Visa, Mastercard, American Express. Pago 100% seguro.",
    icon: CreditCard,
    Widget: NiubizPayModal,
  },
];

export function getPaymentMethod(
  id: string,
): PaymentMethodDefinition | undefined {
  return PAYMENT_METHODS.find((m) => m.id === id);
}
