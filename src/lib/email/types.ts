export type EmailEventType =
  | "BUYER_ORDER_CONFIRMATION"
  | "SELLER_SALE_NOTIFICATION"
  | "ORDER_DISPATCHED_NOTIFICATION";

export interface EmailOrderItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  imageUrl?: string | null;
  sellerName?: string;
  companyName?: string | null;
}

export interface BuyerEmailData {
  orderCode: string;
  buyerName: string;
  buyerEmail: string;
  createdAt: string;
  items: EmailOrderItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  shippingForm: {
    name: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    notes?: string;
  };
  deliveryType: "progressive" | "complete" | string;
  invoiceType?: "boleta" | "factura" | string;
  invoiceNumber?: string;
}

export interface SellerEmailData {
  packageCode: string;
  orderCode: string;
  sellerName: string;
  sellerEmail: string;
  companyName?: string | null;
  recipientName: string;
  recipientEmail: string;
  isCompanyRecipient: boolean;
  createdAt: string;
  items: EmailOrderItem[];
  packageSubtotal: number;
  commissionAmount: number;
  netPayoutEstimate: number;
  buyerInfo: {
    name: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    notes?: string;
  };
}
