import { prisma } from "@/lib/prisma";
import type { OrderStatus } from "@/types";

const orderInclude = {
  product: {
    include: {
      images: { orderBy: { position: "asc" as const } },
      category: true,
      seller: true,
    },
  },
  buyer: true,
  seller: true,
  shipping: true,
};

export async function getUserOrders(userId: string) {
  return prisma.order.findMany({
    where: {
      OR: [{ buyer_id: userId }, { seller_id: userId }],
    },
    include: orderInclude,
    orderBy: { created_at: "desc" },
  });
}

export async function getOrderById(orderId: string) {
  return prisma.order.findUnique({
    where: { id: orderId },
    include: orderInclude,
  });
}

export async function createOrder(orderData: {
  product_id: string;
  buyer_id: string;
  seller_id: string;
  amount: number;
  payment_method: string;
}) {
  return prisma.order.create({
    data: {
      product_id: orderData.product_id,
      buyer_id: orderData.buyer_id,
      seller_id: orderData.seller_id,
      amount: orderData.amount,
      payment_method: orderData.payment_method,
    },
    include: orderInclude,
  });
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  return prisma.order.update({
    where: { id: orderId },
    data: { status },
    include: orderInclude,
  });
}

export async function getOrCreateBuyerProfile(params: {
  userId?: string | null;
  email?: string | null;
  name?: string | null;
  phone?: string | null;
  txPrisma?: any;
}) {
  const client = params.txPrisma || prisma;

  if (params.userId) {
    const existing = await client.profile.findUnique({
      where: { id: params.userId },
      select: { id: true },
    });
    if (existing) return existing.id;
  }

  const email = params.email?.trim() || "invitado@iubizon.com";
  const name = params.name?.trim() || "Cliente Invitado";
  const phone = params.phone?.trim() || null;

  let profile = await client.profile.findFirst({
    where: { email },
    select: { id: true },
  });

  if (!profile) {
    const guestId = params.userId || crypto.randomUUID();
    profile = await client.profile.create({
      data: {
        id: guestId,
        email,
        name,
        phone,
      },
      select: { id: true },
    });
  }

  return profile.id;
}
