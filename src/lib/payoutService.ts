import { prisma } from "@/lib/prisma";
import { calculateIubizonCommission } from "@/lib/utils/commission";
import { getOrderSessionCode } from "@/lib/utils/orderCode";

/**
 * Servicio para la generación automática de registros de pago a vendedores (Seller Payouts)
 * cuando la entrega de un paquete u orden ha sido completada.
 */
export async function ensureSellerPayoutForOrders(orderIds: string[]) {
  if (!orderIds || orderIds.length === 0) return;

  try {
    const orders = await prisma.order.findMany({
      where: {
        id: { in: orderIds },
      },
      include: {
        shipping: true,
      },
    });

    if (orders.length === 0) return;

    // Agrupar por seller_id y tracking_number (o orderCode/payment_id)
    type GroupInfo = {
      sellerId: string;
      trackingNumber: string | null;
      orderCode: string | null;
      subtotal: number;
    };

    const groupMap = new Map<string, GroupInfo>();

    for (const order of orders) {
      const trackingNumber = order.shipping?.tracking_number || null;
      const orderCode = getOrderSessionCode({
        id: order.id,
        paymentId: order.payment_id,
        createdAt: order.created_at,
      });
      const groupKey = `${order.seller_id}_${trackingNumber || orderCode}`;

      if (!groupMap.has(groupKey)) {
        groupMap.set(groupKey, {
          sellerId: order.seller_id,
          trackingNumber,
          orderCode,
          subtotal: 0,
        });
      }

      const grp = groupMap.get(groupKey)!;
      grp.subtotal += Number(order.amount || 0);
    }

    for (const grp of Array.from(groupMap.values())) {
      if (grp.subtotal <= 0) continue;

      const commission = calculateIubizonCommission(grp.subtotal);
      const netAmount = grp.subtotal - commission;

      // Buscar si ya existe un registro de pago para esta entrega por tracking_number u order_code
      const existingPayout = await prisma.sellerPayout.findFirst({
        where: {
          seller_id: grp.sellerId,
          ...(grp.trackingNumber
            ? { tracking_number: grp.trackingNumber }
            : grp.orderCode
              ? { order_code: grp.orderCode }
              : {}),
        },
      });

      if (!existingPayout) {
        await prisma.sellerPayout.create({
          data: {
            seller_id: grp.sellerId,
            tracking_number: grp.trackingNumber,
            order_code: grp.orderCode,
            subtotal: grp.subtotal,
            commission,
            net_amount: netAmount,
            status: "pending", // Pendiente de transferencia por iubizon
          },
        });
      }
    }
  } catch (err) {
    console.error("Error al generar Seller Payouts automáticos:", err);
  }
}
