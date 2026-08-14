/**
 * Abstracción de proveedores de pago.
 * Cada proveedor (Niubiz, Culqi, Pago Efectivo, PayPal, ...) implementa esta
 * interface y se registra en el registry. Las rutas y el frontend consumen la
 * interface, por lo que agregar un proveedor nuevo no requiere tocar el flujo.
 */

export type PaymentProviderId = string;

export interface PaymentCustomerData {
  email: string;
  documentNumber?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  registered?: boolean;
}

export interface InitiatePaymentParams {
  amount: number;
  currency: string;
  purchaseNumber: string;
  customer: PaymentCustomerData;
  customerIp?: string;
  /** Contexto crudo del checkout (cartItems, shipping, invoiceDetails). */
  context?: Record<string, unknown>;
}

/**
 * Resultado de iniciar el pago. Cada proveedor devuelve el payload que su
 * widget del frontend necesita:
 * - Tarjeta directa (Niubiz/Culqi): `sessionKey` + `merchantId` + `environment`.
 * - Redirect (PayPal): `redirectUrl`.
 * - Código offline (Pago Efectivo): `paymentCode` + `expiry`.
 */
export interface InitiatePaymentResult {
  sessionKey?: string;
  merchantId?: string;
  environment?: string;
  redirectUrl?: string;
  paymentCode?: string;
  expiry?: string;
  raw?: unknown;
}

export interface ConfirmPaymentParams {
  purchaseNumber: string;
  amount: number;
  currency?: string;
  customer?: PaymentCustomerData;
  /** Token específico del proveedor (Niubiz/Culqi). */
  transactionToken?: string;
  chargeToken?: string;
  /** Contexto adicional recuperado de la transacción. */
  context?: Record<string, unknown>;
}

export type PaymentStatus = "authorized" | "pending" | "denied";

export interface ConfirmPaymentResult {
  success: boolean;
  status: PaymentStatus;
  transactionId?: string;
  authorizationCode?: string;
  cardBrand?: string;
  cardLast4?: string;
  errorCode?: string;
  errorMessage?: string;
  actionDescription?: string;
  rawResponse?: unknown;
}

export interface RefundPaymentParams {
  transactionId: string;
  amount: number;
  purchaseNumber: string;
  authorizationCode?: string;
  comment?: string;
  externalReferenceId?: string;
  /** Campos específicos por proveedor. */
  [key: string]: unknown;
}

export interface RefundPaymentResult {
  success: boolean;
  cancellationCode?: string;
  rawResponse?: unknown;
}

export interface PaymentProvider {
  readonly id: PaymentProviderId;
  initiate(params: InitiatePaymentParams): Promise<InitiatePaymentResult>;
  confirm(params: ConfirmPaymentParams): Promise<ConfirmPaymentResult>;
  refund?(params: RefundPaymentParams): Promise<RefundPaymentResult>;
}

/** Información pública (no sensible) de un método de pago para el frontend. */
export interface PaymentMethodInfo {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}
