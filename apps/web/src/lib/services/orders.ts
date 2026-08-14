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
  userId: string;
  txPrisma?: Prisma.TransactionClient;
}) {
  const client = params.txPrisma || prisma;
  const userId = params.userId;

  const existing = await client.profile.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (existing) {
    return existing.id;
  }

  const profile = await client.profile.create({
    data: {
      id: userId,
      email: `user_${userId.slice(0, 8)}@iubizon.local`,
      name: "Usuario",
    },
    select: { id: true },
  });

  return profile.id;
}
