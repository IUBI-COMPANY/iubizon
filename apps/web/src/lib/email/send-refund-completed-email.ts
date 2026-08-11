import { prisma } from "@/lib/prisma";
import { enqueueEmail } from "./email-queue";
import type { EmailOrderItem, RefundCompletedEmailData } from "./types";

export async function sendRefundCompletedNotification(refundId: string) {
  try {
    const refund = await prisma.refundRequest.findUnique({
      where: { id: refundId },
      include: {
        order: {
          select: {
            order_code: true,
            buyer: { select: { name: true, email: true } },
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

    const data: RefundCompletedEmailData = {
      orderCode: refund.order.order_code,
      buyerName: buyer.name || "Cliente",
      buyerEmail: buyer.email,
      refundType: refund.type,
      refundAmount: Number(refund.refund_amount),
      cancellationCode: null,
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

    await enqueueEmail(
      data.buyerEmail,
      `Reembolso Procesado — Pedido #${data.orderCode} — iubizon`,
      "refund_completed",
      data as unknown as Record<string, any>,
    );
  } catch (err) {
    console.error("[RefundCompleted Email] Error:", err);
  }
}
