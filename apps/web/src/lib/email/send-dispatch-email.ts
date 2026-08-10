import React from "react";
import { prisma } from "@/lib/prisma";
import { DispatchNotificationEmail } from "./templates/DispatchNotificationEmail";
import { sendResendEmail } from "./send-resend-email";
import type { DispatchEmailData } from "./types";

export async function sendDispatchNotification(
  packageId: string,
  courier: string,
  trackingNumber: string,
  trackingUrl: string | null,
  estimatedDelivery: Date,
) {
  try {
    const pkg = await prisma.orderPackage.findUnique({
      where: { id: packageId },
      include: {
        company: { select: { name: true } },
        order: {
          select: {
            order_code: true,
            buyer: { select: { name: true, email: true } },
            shipping: {
              select: { address: true, department: true, province: true, district: true },
            },
          },
        },
        items: {
          include: {
            product: {
              select: { title: true, images: { orderBy: { position: "asc" }, take: 1 } },
            },
          },
        },
      },
    });

    if (!pkg?.order?.buyer?.email) return;

    const order = pkg.order;
    const buyer = order.buyer;
    const shipping = order.shipping;

    const data: DispatchEmailData = {
      orderCode: order.order_code,
      buyerName: buyer.name || "Cliente",
      buyerEmail: buyer.email,
      courier,
      trackingNumber,
      trackingUrl,
      estimatedDelivery: estimatedDelivery.toLocaleDateString("es-PE", {
        weekday: "long", year: "numeric", month: "long", day: "numeric",
      }),
      items: pkg.items.map((item) => ({
        id: item.id,
        title: item.product.title,
        price: Number(item.unit_price),
        quantity: item.quantity,
        imageUrl: item.product.images[0]?.url || null,
        sellerName: pkg.company?.name || "Vendedor iubizon",
        companyName: pkg.company?.name || null,
      })),
      shippingAddress: shipping?.address || "",
      shippingCity: [shipping?.district, shipping?.province, shipping?.department]
        .filter(Boolean).join(", ") || "",
      companyName: pkg.company?.name || "Vendedor",
    };

    await sendResendEmail(
      data.buyerEmail,
      `¡Tu pedido #${data.orderCode} está en camino! — iubizon`,
      React.createElement(DispatchNotificationEmail, data),
    );
  } catch (err) {
    console.error("[Dispatch Email] Error:", err);
  }
}
