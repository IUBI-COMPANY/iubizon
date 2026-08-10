import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { ensureSellerPayoutForPackages } from "@/lib/payoutService";

export interface BuyerOrderItem {
  id: string;
  productId: string;
  title: string;
  price: number;
  quantity: number;
  subtotal: number;
  image: string | null;
  company: {
    id: string;
    name: string;
    logoUrl: string | null;
    slug: string | null;
  } | null;
}

export interface BuyerPackage {
  packageId: string;
  companyName: string | null;
  trackingNumber: string | null;
  courier: string | null;
  trackingUrl: string | null;
  estimatedDelivery: string | null;
  status: string;
  paymentMethod: string;
  cardBrand: string | null;
  cardLast4: string | null;
  subtotal: number;
  netEarnings: number;
  items: BuyerOrderItem[];
}

export interface BuyerOrderSession {
  orderId: string;
  orderCode: string;
  createdAt: string;
  status: string;
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  totalAmount: number;
  shippingName: string | null;
  shippingAddress: string | null;
  shippingDepartment: string | null;
  shippingProvince: string | null;
  shippingDistrict: string | null;
  destinationAddress: string | null;
  invoiceType: string | null;
  invoiceNumber: string | null;
  totalItems: number;
  hasRefund: boolean;
  refundStatus: string | null;
  refundType: string | null;
  paymentDetails: {
    cardBrand: string | null;
    cardLast4: string | null;
    authorizationCode: string | null;
    docType: string | null;
    identityNumber: string | null;
  } | null;
  packages: BuyerPackage[];
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orderCodeParam = searchParams.get("code");

    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const where: any = { buyer_id: user.id };
    if (orderCodeParam) {
      where.order_code = orderCodeParam;
    }

    const orders = await prisma.order.findMany({
      where,
      orderBy: { created_at: "desc" },
      include: {
        shipping: true,
        invoice: true,
        paymentTransaction: {
          select: {
            card_brand: true,
            card_last4: true,
            authorization_code: true,
          },
        },
        packages: {
          include: {
            company: {
              select: { id: true, name: true, logo_url: true, slug: true },
            },
            items: {
              include: {
                product: {
                  select: {
                    id: true,
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

    const orderIds = orders.map((o) => o.id);
    const refunds =
      orderIds.length > 0
        ? await prisma.refundRequest.findMany({
            where: {
              order_id: { in: orderIds },
              status: {
                in: [
                  "approved",
                  "return_in_transit",
                  "return_received",
                  "refunded",
                ],
              },
            },
            select: { order_id: true, status: true, type: true },
            orderBy: { created_at: "desc" },
          })
        : [];

    const refundByOrder = new Map(refunds.map((r) => [r.order_id, r]));

    const sessions: BuyerOrderSession[] = orders.map((order) => ({
      orderId: order.id,
      orderCode: order.order_code,
      createdAt: order.created_at?.toISOString() || new Date().toISOString(),
      status: order.status,
      subtotal: Number(order.subtotal),
      shippingCost: Number(order.shipping_cost),
      taxAmount: Number(order.tax_amount),
      totalAmount: Number(order.total_amount),
      shippingName: order.shipping?.name ?? null,
      shippingAddress: order.shipping?.address ?? null,
      shippingDepartment: order.shipping?.department ?? null,
      shippingProvince: order.shipping?.province ?? null,
      shippingDistrict: order.shipping?.district ?? null,
      destinationAddress: order.shipping?.address ?? null,
      invoiceType: order.invoice?.type ?? null,
      invoiceNumber: order.invoice?.number ?? null,
      totalItems: order.packages.reduce(
        (sum, pkg) => sum + pkg.items.reduce((s, i) => s + i.quantity, 0),
        0,
      ),
      hasRefund: refundByOrder.has(order.id),
      refundStatus: refundByOrder.get(order.id)?.status ?? null,
      refundType: refundByOrder.get(order.id)?.type ?? null,
      paymentDetails: order.paymentTransaction
        ? {
            cardBrand: order.paymentTransaction.card_brand || null,
            cardLast4: order.paymentTransaction.card_last4 || null,
            authorizationCode:
              order.paymentTransaction.authorization_code || order.order_code,
            docType: order.invoice?.doc_type || null,
            identityNumber: order.invoice?.number || null,
          }
        : order.payment_method === "niubiz_card"
          ? {
              cardBrand: "VISA",
              cardLast4: null,
              authorizationCode: order.order_code,
              docType: order.invoice?.doc_type || null,
              identityNumber: order.invoice?.number || null,
            }
          : null,
      packages: order.packages.map((pkg) => ({
        packageId: pkg.id,
        companyName: pkg.company?.name || "Vendedor",
        trackingNumber: pkg.tracking_number,
        courier: pkg.courier,
        trackingUrl: pkg.tracking_url,
        estimatedDelivery: pkg.estimated_delivery?.toISOString() || null,
        status: pkg.status,
        paymentMethod: order.payment_method || "cash_on_delivery",
        cardBrand: order.paymentTransaction?.card_brand || null,
        cardLast4: order.paymentTransaction?.card_last4 || null,
        subtotal: Number(pkg.subtotal),
        netEarnings: Number(pkg.net_earnings),
        items: pkg.items.map((item) => ({
          id: item.id,
          productId: item.product_id,
          title: item.product.title,
          price: Number(item.unit_price),
          quantity: item.quantity,
          subtotal: Number(item.subtotal),
          image: item.product.images[0]?.url || null,
          company: pkg.company
            ? {
                id: pkg.company.id,
                name: pkg.company.name,
                logoUrl: pkg.company.logo_url,
                slug: pkg.company.slug,
              }
            : null,
        })),
      })),
    }));

    return NextResponse.json({
      sessions,
      session: sessions[0] || null,
      totalPurchases: sessions.length,
    });
  } catch (err: unknown) {
    console.error("Error al obtener compras del usuario:", err);
    return NextResponse.json(
      { error: "Error al cargar historial de compras" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { packageIds } = await req.json();

    if (!packageIds || !Array.isArray(packageIds) || packageIds.length === 0) {
      return NextResponse.json(
        { error: "Faltan los IDs de los paquetes" },
        { status: 400 },
      );
    }

    await prisma.orderPackage.updateMany({
      where: {
        id: { in: packageIds },
        order: { buyer_id: user.id },
      },
      data: { status: "delivered", updated_at: new Date() },
    });

    await prisma.orderItem.updateMany({
      where: {
        package_id: { in: packageIds },
      },
      data: { status: "delivered", updated_at: new Date() },
    });

    // Si todos los paquetes de la orden están entregados, marcar la orden como completada
    const firstPackage = await prisma.orderPackage.findFirst({
      where: { id: packageIds[0] },
      select: { order_id: true },
    });

    if (firstPackage) {
      const orderId = firstPackage.order_id;
      const totalPackages = await prisma.orderPackage.count({
        where: { order_id: orderId },
      });
      const deliveredPackages = await prisma.orderPackage.count({
        where: {
          order_id: orderId,
          status: { in: ["delivered", "completed"] },
        },
      });

      if (deliveredPackages >= totalPackages) {
        await prisma.order.update({
          where: { id: orderId },
          data: { status: "delivered", updated_at: new Date() },
        });
      }
    }

    await ensureSellerPayoutForPackages(packageIds);

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("Error al confirmar recepción del paquete:", err);
    return NextResponse.json(
      { error: "Error interno al confirmar recepción" },
      { status: 500 },
    );
  }
}
