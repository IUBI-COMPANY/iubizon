import { prisma } from "@/lib/prisma";

interface RefundCalculation {
  refundAmount: number;
  items: {
    orderItemId: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }[];
}

/**
 * Calcula el monto de reembolso de forma genérica.
 * - "full": total_amount de la orden (incluye envío)
 * - "partial": unit_price * quantity de los items solicitados + envío proporcional
 */
export async function calculateRefundAmount(params: {
  orderId: string;
  type: "full" | "partial";
  items?: { orderItemId: string; quantity: number }[];
}): Promise<RefundCalculation> {
  if (params.type === "full") {
    const order = await prisma.order.findUnique({
      where: { id: params.orderId },
      select: { total_amount: true },
    });
    return {
      refundAmount: Number(order?.total_amount || 0),
      items: [],
    };
  }

  const itemIds = params.items?.map((i) => i.orderItemId) || [];
  if (itemIds.length === 0) {
    return { refundAmount: 0, items: [] };
  }

  const order = await prisma.order.findUnique({
    where: { id: params.orderId },
    select: { subtotal: true, shipping_cost: true },
  });

  const orderItems = await prisma.orderItem.findMany({
    where: { id: { in: itemIds } },
    select: { id: true, quantity: true, unit_price: true },
  });

  const refundItems = params.items!.map((reqItem) => {
    const dbItem = orderItems.find((oi) => oi.id === reqItem.orderItemId);
    if (!dbItem) throw new Error(`OrderItem ${reqItem.orderItemId} no encontrado`);
    if (reqItem.quantity > dbItem.quantity) {
      throw new Error(`Cantidad solicitada (${reqItem.quantity}) excede la comprada (${dbItem.quantity})`);
    }
    const unitPrice = Number(dbItem.unit_price);
    const subtotal = unitPrice * reqItem.quantity;
    return { orderItemId: reqItem.orderItemId, quantity: reqItem.quantity, unitPrice, subtotal };
  });

  const itemsSubtotal = refundItems.reduce((sum, item) => sum + item.subtotal, 0);
  const orderSubtotal = Number(order?.subtotal || 0);
  const shippingCost = Number(order?.shipping_cost || 0);

  let shippingProportion = 0;
  if (orderSubtotal > 0 && shippingCost > 0) {
    shippingProportion = (itemsSubtotal / orderSubtotal) * shippingCost;
  }

  const refundAmount = itemsSubtotal + shippingProportion;

  return { refundAmount, items: refundItems };
}
