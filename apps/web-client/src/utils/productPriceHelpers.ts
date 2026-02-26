import { Product } from "@/data-list/products";

export interface DiscountInfo {
  hasDiscount: boolean;
  percentage: number;
  amount: number;
  originalPrice: number;
}

export const getProductDiscountInfo = (product: Product): DiscountInfo => {
  const hasDiscount = !!(
    product.oldPrice &&
    product.discount &&
    product.oldPrice > 0
  );

  if (!hasDiscount || !product.oldPrice || !product.discount) {
    return {
      hasDiscount: false,
      percentage: 0,
      amount: 0,
      originalPrice: product.price,
    };
  }

  const percentage = Math.round((product.discount / product.oldPrice) * 100);

  return {
    hasDiscount: true,
    percentage,
    amount: product.discount,
    originalPrice: product.oldPrice,
  };
};

export const formatPrice = (amount: number | undefined): string => {
  if (amount === undefined || amount === null) return "S/ 0.00";
  return `S/ ${amount.toFixed(2)}`;
};

export const shouldShowCampaignBadge = (
  product: Product,
  showCampaign: boolean,
): boolean => {
  const { hasDiscount } = getProductDiscountInfo(product);
  return showCampaign && hasDiscount;
};
