"use client";

import type { ComponentType } from "react";
import { CreditCard, Wallet } from "lucide-react";
import { NiubizPayModal } from "@/components/features/checkout/NiubizPayModal";
import { CulqiPayModal } from "@/components/features/checkout/CulqiPayModal";
import type { CartItem } from "@/hooks/useCart";
import type { ShippingFormState } from "@/components/features/cart/checkout-schema";

/**
 * Datos de una transacción aprobada, para mostrarlos en la página de resultado.
 */
export interface PaymentSuccessData {
  orderCode: string;
  amount: number;
  currency: string;
  cardBrand: string | null;
  cardLast4: string | null;
  transactionDate: string;
}

/**
 * Props comunes que todo widget de pago debe aceptar.
 */
export interface PaymentWidgetProps {
  amount: number;
  cartItems: CartItem[];
  shippingForm: ShippingFormState;
  invoiceDetails: Record<string, unknown>;
  onValidate: () => boolean;
  onSuccess: (data: PaymentSuccessData) => void;
  onError: (errorMessage: string) => void;
  onLoadingChange?: (loading: boolean, message?: string) => void;
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
  {
    id: "culqi",
    label: "Tarjeta / Billeteras (Culqi)",
    description: "Visa, Mastercard, Diners, Amex y Yape.",
    icon: Wallet,
    Widget: CulqiPayModal,
  },
];

export function getPaymentMethod(
  id: string,
): PaymentMethodDefinition | undefined {
  return PAYMENT_METHODS.find((m) => m.id === id);
}
