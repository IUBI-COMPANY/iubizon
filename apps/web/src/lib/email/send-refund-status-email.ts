import React from "react";
import { prisma } from "@/lib/prisma";
import { RefundStatusEmail } from "./templates/RefundStatusEmail";
import { sendResendEmail } from "./send-resend-email";
import type { EmailOrderItem, RefundStatusEmailData } from "./types";

export async function sendRefundStatusNotification(
  refundId: string,
  approved: boolean,
) {
  try {
    const refund = await prisma.refundRequest.findUnique({
      where: { id: refundId },
      include: {
        order: {
          select: {
            order_code: true,
            buyer: { select: { name: true, email: true } },
            packages: {
              select: {
                company: {
                  select: {
                    name: true,
                    legal_name: true,
                    tax_id: true,
                    phone: true,
                  },
                },
              },
            },
          },
        },
        items: {
          include: {
            order_item: {
              include: {
                product: {
                  select: {
                    title: true,
                    images: { orderBy: { position: "asc" }, take: 1 },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!refund?.order?.buyer?.email) return;

    const buyer = refund.order.buyer;
    const company = refund.order.packages[0]?.company;

    const data: RefundStatusEmailData = {
      orderCode: refund.order.order_code,
      buyerName: buyer.name || "Cliente",
      buyerEmail: buyer.email,
      status: approved ? "approved" : "rejected",
      refundType: refund.type,
      refundAmount: Number(refund.refund_amount),
      adminNotes: refund.admin_notes,
      returnAddress: refund.return_address,
      companyLegalName: company?.legal_name || null,
      companyTaxId: company?.tax_id || null,
      companyPhone: company?.phone || null,
      items: refund.items.map((ri): EmailOrderItem => ({
        id: ri.order_item_id,
        title: ri.order_item?.product?.title || "Producto",
        price: Number(ri.unit_price),
        quantity: ri.quantity,
        imageUrl: ri.order_item?.product?.images?.[0]?.url || null,
        sellerName: "",
        companyName: null,
      })),
    };

    await sendResendEmail(
      data.buyerEmail,
      `${approved ? "Reembolso Aprobado" : "Reembolso Rechazado"} — Pedido #${data.orderCode} — iubizon`,
      React.createElement(RefundStatusEmail, data),
    );
  } catch (err) {
    console.error("[RefundStatus Email] Error:", err);
  }
}
