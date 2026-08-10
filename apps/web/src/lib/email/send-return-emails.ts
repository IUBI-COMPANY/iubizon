import React from "react";
import { prisma } from "@/lib/prisma";
import { ReturnShippedEmail } from "./templates/ReturnShippedEmail";
import { ReturnReceivedEmail } from "./templates/ReturnReceivedEmail";
import { sendResendEmail } from "./send-resend-email";
import type { EmailOrderItem, ReturnReceivedEmailData, ReturnShippedEmailData } from "./types";

export async function sendReturnShippedNotification(refundId: string) {
  try {
    const refund = await prisma.refundRequest.findUnique({
      where: { id: refundId },
      include: {
        order: {
          select: {
            order_code: true,
            buyer: { select: { name: true } },
            packages: {
              select: {
                company: {
                  select: { name: true, email: true, legal_name: true, tax_id: true, phone: true },
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
                  select: { title: true, images: { orderBy: { position: "asc" }, take: 1 } },
                },
              },
            },
          },
        },
      },
    });

    if (!refund?.order?.packages?.[0]?.company?.email) return;

    const order = refund.order;
    const company = order.packages[0].company;

    const data: ReturnShippedEmailData = {
      orderCode: order.order_code,
      sellerName: company.name,
      sellerEmail: company.email,
      companyName: company.name,
      companyLegalName: company.legal_name || null,
      companyTaxId: company.tax_id || null,
      companyPhone: company.phone || null,
      buyerName: order.buyer?.name || "Comprador",
      courier: refund.return_courier || "No especificada",
      trackingNumber: refund.buyer_return_tracking || "N/A",
      trackingUrl: refund.return_tracking_url || null,
      estimatedDelivery: refund.return_estimated_delivery
        ? new Date(refund.return_estimated_delivery).toLocaleDateString("es-PE", {
            weekday: "long", year: "numeric", month: "long", day: "numeric",
          })
        : "No especificada",
      returnAddress: refund.return_address || "No especificada",
      items: refund.items.map((ri): EmailOrderItem => ({
        id: ri.order_item_id,
        title: ri.order_item?.product?.title || "Producto",
        price: Number(ri.unit_price),
        quantity: ri.quantity,
        imageUrl: ri.order_item?.product?.images?.[0]?.url || null,
        sellerName: company.name,
        companyName: company.name,
      })),
      refundAmount: Number(refund.refund_amount),
    };

    await sendResendEmail(
      data.sellerEmail,
      `Devolución en camino — Pedido #${data.orderCode} — iubizon`,
      React.createElement(ReturnShippedEmail, data),
    );
  } catch (err) {
    console.error("[ReturnShipped Email] Error:", err);
  }
}

export async function sendReturnReceivedNotification(refundId: string) {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || "iubizon.company@gmail.com";

    const refund = await prisma.refundRequest.findUnique({
      where: { id: refundId },
      include: {
        order: {
          select: {
            order_code: true,
            buyer: { select: { name: true } },
            packages: {
              select: {
                company: {
                  select: { name: true, legal_name: true, tax_id: true, phone: true },
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
                  select: { title: true, images: { orderBy: { position: "asc" }, take: 1 } },
                },
              },
            },
          },
        },
      },
    });

    if (!refund) return;

    const order = refund.order;
    const company = order.packages[0]?.company;
    const companyName = company?.name || "Vendedor";

    const data: ReturnReceivedEmailData = {
      orderCode: order.order_code,
      companyName,
      companyLegalName: company?.legal_name || null,
      companyTaxId: company?.tax_id || null,
      companyPhone: company?.phone || null,
      sellerName: companyName,
      buyerName: order.buyer?.name || "Comprador",
      refundAmount: Number(refund.refund_amount),
      refundType: refund.type,
      items: refund.items.map((ri): EmailOrderItem => ({
        id: ri.order_item_id,
        title: ri.order_item?.product?.title || "Producto",
        price: Number(ri.unit_price),
        quantity: ri.quantity,
        imageUrl: ri.order_item?.product?.images?.[0]?.url || null,
        sellerName: companyName,
        companyName,
      })),
    };

    await sendResendEmail(
      adminEmail,
      `Devolución confirmada — Orden #${data.orderCode} — Procesar Reembolso`,
      React.createElement(ReturnReceivedEmail, data),
    );
  } catch (err) {
    console.error("[ReturnReceived Email] Error:", err);
  }
}
