import React from "react";
import { BuyerOrderEmail } from "./templates/BuyerOrderEmail";
import { SellerSaleEmail } from "./templates/SellerSaleEmail";
import { DispatchNotificationEmail } from "./templates/DispatchNotificationEmail";
import { ReturnShippedEmail } from "./templates/ReturnShippedEmail";
import { ReturnReceivedEmail } from "./templates/ReturnReceivedEmail";
import { RefundStatusEmail } from "./templates/RefundStatusEmail";
import { RefundCompletedEmail } from "./templates/RefundCompletedEmail";

const TEMPLATES: Record<string, React.ComponentType<any>> = {
  buyer_order: BuyerOrderEmail,
  seller_sale: SellerSaleEmail,
  dispatch: DispatchNotificationEmail,
  return_shipped: ReturnShippedEmail,
  return_received: ReturnReceivedEmail,
  refund_status: RefundStatusEmail,
  refund_completed: RefundCompletedEmail,
};

export function renderEmail(
  template: string,
  data: any,
): React.ReactElement | null {
  const Component = TEMPLATES[template];
  if (!Component) return null;
  return React.createElement(Component, data);
}
