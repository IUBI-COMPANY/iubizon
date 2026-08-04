export const APP_CONFIG = {
  name: "Iubizon",
  description: "Marketplace Peru",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  locale: "es-PE",
  currency: "PEN",
  currencySymbol: "S/",
  commissionRate: 0.09,
  iubizonProPrice: 4900,
};

export const COLORS = {
  primary: "#f25c05",
  secondary: "#112237",
  background: "#ffffff",
  surface: "#f8fafc",
  textPrimary: "#112237",
  textSecondary: "#64748b",
  success: "#10b981",
  error: "#ef4444",
  warning: "#f59e0b",
  border: "#e2e8f0",
};

export const PRODUCT_CONDITIONS = [
  { value: "new", label: "Nuevo" },
  { value: "like_new", label: "Como nuevo" },
  { value: "good", label: "Buen estado" },
  { value: "fair", label: "Aceptable" },
];

export const PRODUCT_STATUS = {
  ACTIVE: "active",
  PENDING: "pending",
  SOLD: "sold",
  REPORTED: "reported",
};

export const ORDER_STATUS = {
  PENDING: "pending",
  PAID: "paid",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};
