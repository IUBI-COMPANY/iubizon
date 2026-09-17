export interface CulqiChargeRequest {
  amount: number; // en céntimos (ej: 1000 = S/ 10.00)
  currency_code: string; // 'PEN' o 'USD'
  email: string;
  source_id: string; // token id (ej: tkn_live_... o tkn_test_...)
  description?: string;
  antifraud_details?: {
    first_name?: string;
    last_name?: string;
    email?: string;
    address?: string;
    address_city?: string;
    country_code?: string;
    phone_number?: string;
  };
  metadata?: Record<string, string>;
}

export interface CulqiChargeResponse {
  id: string;
  object: string;
  amount: number;
  currency_code: string;
  email: string;
  description?: string;
  source?: {
    id: string;
    object: string;
    card_number?: string;
    last_four?: string;
    active?: boolean;
    iin?: {
      card_brand?: string;
      card_type?: string;
      card_category?: string;
      issuer?: {
        name?: string;
      };
    };
    client?: {
      ip?: string;
    };
  };
  outcome?: {
    type: string;
    code?: string;
    merchant_message?: string;
    user_message?: string;
  };
  authorization_code?: string;
  reference_code?: string;
  state?: string;
  creation_date?: number;
  [key: string]: unknown;
}

export interface CulqiErrorResponse {
  object: "error";
  type: string;
  charge_id?: string;
  code?: string;
  decline_code?: string;
  merchant_message?: string;
  user_message?: string;
  param?: string;
}

export interface CulqiRefundRequest {
  charge_id: string;
  amount: number; // en céntimos
  reason: string; // 'duplicado', 'fraudulento', 'solicitud_comprador', etc.
  metadata?: Record<string, string>;
}

export interface CulqiRefundResponse {
  id: string;
  object: "refund";
  charge_id: string;
  amount: number;
  creation_date: number;
  status?: string;
  [key: string]: unknown;
}
