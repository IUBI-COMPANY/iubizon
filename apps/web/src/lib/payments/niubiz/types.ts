export interface NiubizServiceLocationData {
  urlAddress: string;
  cityName: string;
  countrySubdivisionCode: string;
  countryCode: string;
  postalCode: string;
}

export interface NiubizConfig {
  merchantId: string;
  user: string;
  password: string;
  environment: "sandbox" | "production";
  serviceLocation: NiubizServiceLocationData;
  registrationCount: number;
}

export interface NiubizCustomerData {
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

export interface CreateSessionParams {
  amount: number;
  purchaseNumber: string;
  customer: NiubizCustomerData;
  customerIp?: string;
}

export interface AuthorizeTransactionParams {
  transactionToken: string;
  purchaseNumber: string;
  amount: number;
  customerEmail?: string;
  customerIp?: string;
  currency?: string;
}

export interface RefundTransactionParams {
  authorizationCode: string;
  transactionId: string;
  amount: number;
  purchaseNumber: string;
}

export interface AuthorizationResult {
  success: boolean;
  transactionId?: string;
  authorizationCode?: string;
  cardBrand?: string;
  cardLast4?: string;
  errorCode?: string;
  errorMessage?: string;
  actionDescription?: string;
  rawResponse?: unknown;
}
