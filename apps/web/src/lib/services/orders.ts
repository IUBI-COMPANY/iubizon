import { prisma } from "@/lib/prisma";
import {
  getCommissionConfig,
  computePackageFinancials,
  computeItemFinancials,
} from "@/lib/utils/commission";
import type { Prisma } from "@prisma/client";

export async function getUserOrdersAsBuyer(userId: string) {
  return prisma.order.findMany({
    where: { buyer_id: userId },
    include: {
      packages: {
        include: {
          company: true,
          items: {
            include: {
              product: {
                include: {
                  images: { orderBy: { position: "asc" }, take: 1 },
                },
              },
            },
          },
        },
      },
      paymentTransaction: true,
    },
    orderBy: { created_at: "desc" },
  });
}

export async function getOrderByCode(orderCode: string) {
  return prisma.order.findUnique({
    where: { order_code: orderCode },
    include: {
      buyer: true,
      packages: {
        include: {
          company: true,
          items: {
            include: {
              product: {
                include: {
                  images: { orderBy: { position: "asc" }, take: 1 },
                },
              },
            },
          },
        },
      },
      paymentTransaction: true,
    },
  });
}

export async function getOrderById(orderId: string) {
  return prisma.order.findUnique({
    where: { id: orderId },
    include: {
      buyer: true,
      packages: {
        include: {
          company: true,
          items: {
            include: {
              product: {
                include: {
                  images: { orderBy: { position: "asc" }, take: 1 },
                },
              },
            },
          },
        },
      },
      paymentTransaction: true,
    },
  });
}

export async function createFullOrder(params: {
  orderCode: string;
  buyerId: string;
  paymentMethod: string;
  paymentTransactionId?: string;
  initialStatus: string;
  shippingCost?: number;
  taxAmount?: number;
  shipping: {
    name: string;
    phone: string;
    email?: string;
    address: string;
    department?: string;
    province?: string;
    district?: string;
    reference?: string;
    documentType?: string;
    documentNumber?: string;
  };
  invoice?: {
    type?: string;
    docType?: string;
    number?: string;
    legalName?: string;
    taxAddress?: string;
  };
  packages: Array<{
    companyId: string;
    deliveryType?: string;
    destinationAddress: string;
    items: Array<{
      productId: string;
      quantity: number;
      unitPrice: number;
    }>;
  }>;
  txPrisma?: Prisma.TransactionClient;
}) {
  const client = params.txPrisma || prisma;
  const commissionConfig = await getCommissionConfig();

  const subtotal = params.packages.reduce(
    (sum, pkg) =>
      sum +
      pkg.items.reduce((s, item) => s + item.unitPrice * item.quantity, 0),
    0,
  );

  const order = await client.order.create({
    data: {
      order_code: params.orderCode,
      buyer_id: params.buyerId,
      payment_transaction_id: params.paymentTransactionId || null,
      payment_method: params.paymentMethod,
      status: params.initialStatus,
      subtotal,
      shipping_cost: params.shippingCost ?? 0,
      tax_amount: params.taxAmount ?? 0,
      total_amount:
        subtotal + (params.shippingCost ?? 0) + (params.taxAmount ?? 0),
      shipping: {
        create: {
          name: params.shipping.name,
          phone: params.shipping.phone,
          email: params.shipping.email || null,
          address: params.shipping.address,
          department: params.shipping.department || null,
          province: params.shipping.province || null,
          district: params.shipping.district || null,
          reference: params.shipping.reference || null,
          document_type: params.shipping.documentType || null,
          document_number: params.shipping.documentNumber || null,
        },
      },
      invoice:
        params.invoice?.type || params.invoice?.number
          ? {
              create: {
                type: params.invoice.type || null,
                doc_type: params.invoice.docType || null,
                number: params.invoice.number || null,
                legal_name: params.invoice.legalName || null,
                tax_address: params.invoice.taxAddress || null,
              },
            }
          : undefined,
      packages: {
        create: params.packages.map((pkg) => {
          const financials = computePackageFinancials(
            pkg.items,
            commissionConfig,
          );

          return {
            company_id: pkg.companyId,
            status: params.initialStatus,
            delivery_type: pkg.deliveryType || null,
            destination_address: pkg.destinationAddress,
            subtotal: financials.subtotal,
            commission_total: financials.commission,
            net_earnings: financials.netEarnings,
            items: {
              create: pkg.items.map((item) => {
                const itemF = computeItemFinancials(
                  item.unitPrice,
                  item.quantity,
                  financials.subtotal,
                  financials.commission,
                );
                return {
                  product_id: item.productId,
                  quantity: item.quantity,
                  unit_price: item.unitPrice,
                  subtotal: itemF.subtotal,
                  commission: itemF.commission,
                  status: params.initialStatus,
                };
              }),
            },
          };
        }),
      },
    },
    include: {
      shipping: true,
      invoice: true,
      packages: {
        include: {
          items: {
            include: {
              product: { select: { id: true, title: true } },
            },
          },
        },
      },
    },
  });

  return order;
}

export async function getOrCreateBuyerProfile(params: {
  userId?: string | null;
  email?: string | null;
  name?: string | null;
  phone?: string | null;
  txPrisma?: Prisma.TransactionClient;
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
    where: { email: { equals: email, mode: "insensitive" } },
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

export async function migrateGuestDataToUser(userId: string, email: string) {
  if (!userId || !email?.trim()) return 0;

  const normalizedEmail = email.trim().toLowerCase();

  try {
    const guestProfiles = await prisma.profile.findMany({
      where: {
        email: { equals: normalizedEmail, mode: "insensitive" },
        id: { not: userId },
      },
      select: { id: true },
    });

    const guestIds = guestProfiles.map((p) => p.id);

    const matchingOrders = await prisma.order.findMany({
      where: {
        buyer_id: { not: userId },
        OR: [
          ...(guestIds.length > 0 ? [{ buyer_id: { in: guestIds } }] : []),
          {
            shipping: {
              email: { equals: normalizedEmail, mode: "insensitive" },
            },
          },
          {
            buyer: {
              email: { equals: normalizedEmail, mode: "insensitive" },
            },
          },
        ],
      },
      select: { id: true, buyer_id: true },
    });

    const orderBuyerIdsToMigrate = Array.from(
      new Set([
        ...guestIds,
        ...matchingOrders.map((o) => o.buyer_id).filter(Boolean),
      ]),
    ).filter((id) => id !== userId);

    if (orderBuyerIdsToMigrate.length === 0 && matchingOrders.length === 0) {
      return 0;
    }

    let migratedCount = 0;

    await prisma.$transaction(async (tx) => {
      const orderUpdate = await tx.order.updateMany({
        where: {
          OR: [
            ...(orderBuyerIdsToMigrate.length > 0
              ? [{ buyer_id: { in: orderBuyerIdsToMigrate } }]
              : []),
            {
              shipping: {
                email: { equals: normalizedEmail, mode: "insensitive" },
              },
            },
          ],
        },
        data: { buyer_id: userId },
      });
      migratedCount = orderUpdate.count;

      if (orderBuyerIdsToMigrate.length > 0) {
        await tx.product.updateMany({
          where: { created_by: { in: orderBuyerIdsToMigrate } },
          data: { created_by: userId },
        });

        await tx.review.updateMany({
          where: { buyer_id: { in: orderBuyerIdsToMigrate } },
          data: { buyer_id: userId },
        });

        await tx.favorite.updateMany({
          where: { user_id: { in: orderBuyerIdsToMigrate } },
          data: { user_id: userId },
        });

        await tx.companyMember.updateMany({
          where: { user_id: { in: orderBuyerIdsToMigrate } },
          data: { user_id: userId },
        });

        await tx.profile.deleteMany({
          where: { id: { in: orderBuyerIdsToMigrate } },
        });
      }
    });

    if (migratedCount > 0) {
      console.log(
        `[GuestMigration] Migradas ${migratedCount} órdenes de ${normalizedEmail} -> usuario ${userId}`,
      );
    }

    return migratedCount;
  } catch (err) {
    console.error(
      `[GuestMigration] Error migrando datos de guest para ${email}:`,
      err,
    );
    return 0;
  }
}
