export interface EmailOrderItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  imageUrl: string | null;
  sellerName: string;
  companyName: string | null;
}

export interface BuyerShippingForm {
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  department?: string;
  province?: string;
  district?: string;
  documentType?: string;
  documentNumber?: string;
  notes?: string;
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
  shippingForm: BuyerShippingForm;
  deliveryType?: string;
  invoiceType?: string;
  invoiceNumber?: string;
}

export interface SellerEmailData {
  packageCode: string;
  orderCode: string;
  sellerName: string;
  sellerEmail: string;
  companyName: string | null;
  recipientName: string;
  recipientEmail: string;
  isCompanyRecipient: boolean;
  createdAt: string;
  items: EmailOrderItem[];
  packageSubtotal: number;
  commissionAmount: number;
  netPayoutEstimate: number;
  buyerInfo: BuyerShippingForm;
}

export interface DispatchEmailData {
  orderCode: string;
  buyerName: string;
  buyerEmail: string;
  courier: string;
  trackingNumber: string;
  trackingUrl?: string | null;
  estimatedDelivery: string;
  items: EmailOrderItem[];
  shippingAddress: string;
  shippingCity: string;
  companyName: string;
}
