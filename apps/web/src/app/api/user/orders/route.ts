import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { ensureSellerPayoutForPackages } from "@/lib/payoutService";
import { sendDeliveryConfirmationNotifications } from "@/lib/email";

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
  packageNumber: number;
  totalPackages: number;
  companyName: string | null;
  trackingNumber: string | null;
  courier: string | null;
  trackingUrl: string | null;
  estimatedDelivery: string | null;
  deliveryType?: string | null;
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
  shippingPhone?: string | null;
  shippingEmail?: string | null;
  shippingAddress: string | null;
  shippingDepartment: string | null;
  shippingProvince: string | null;
  shippingDistrict: string | null;
  destinationAddress: string | null;
  invoiceType: string | null;
  invoiceNumber: string | null;
  totalItems: number;
  deliveredAt: string | null;
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
      where.order_code = orderCodeParam.replace(/^#/, "").trim();
    }

    const orders = await prisma.order.findMany({
      where,
      orderBy: { created_at: "desc" },
      select: {
        id: true,
        order_code: true,
        created_at: true,
        updated_at: true,
        delivered_at: true,
        status: true,
        subtotal: true,
        shipping_cost: true,
        tax_amount: true,
        total_amount: true,
        payment_method: true,
        shipping: {
          select: {
            name: true,
            phone: true,
            email: true,
            address: true,
            department: true,
            province: true,
            district: true,
          },
        },
        invoice: {
          select: {
            type: true,
            number: true,
            doc_type: true,
          },
        },
        paymentTransaction: {
          select: {
            card_brand: true,
            card_last4: true,
            authorization_code: true,
          },
        },
        packages: {
          orderBy: [{ package_number: "asc" }, { created_at: "asc" }],
          select: {
            id: true,
            package_number: true,
            total_packages: true,
            tracking_number: true,
            courier: true,
            tracking_url: true,
            estimated_delivery: true,
            delivery_type: true,
            status: true,
            subtotal: true,
            net_earnings: true,
            company: {
              select: { id: true, name: true, logo_url: true, slug: true },
            },
            items: {
              select: {
                id: true,
                product_id: true,
                unit_price: true,
                quantity: true,
                subtotal: true,
                product: {
                  select: {
                    id: true,
                    title: true,
                    images: {
                      orderBy: { position: "asc" },
                      take: 1,
                      select: { url: true },
                    },
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
      deliveredAt:
        order.delivered_at?.toISOString() ||
        (order.status === "delivered" || order.status === "completed"
          ? order.updated_at?.toISOString() || null
          : null),
      status: order.status,
      subtotal: Number(order.subtotal || 0),
      shippingCost: Number(order.shipping_cost || 0),
      taxAmount: Number(order.tax_amount || 0),
      totalAmount: Number(order.total_amount || 0),
      shippingName: order.shipping?.name ?? null,
      shippingPhone: order.shipping?.phone ?? null,
      shippingEmail: order.shipping?.email ?? null,
      shippingAddress: order.shipping?.address ?? null,
      shippingDepartment: order.shipping?.department ?? null,
      shippingProvince: order.shipping?.province ?? null,
      shippingDistrict: order.shipping?.district ?? null,
      destinationAddress: order.shipping?.address ?? null,
      invoiceType: order.invoice?.type ?? null,
      invoiceNumber: order.invoice?.number ?? null,
      totalItems: (order.packages || []).reduce(
        (sum, pkg) =>
          sum + (pkg.items || []).reduce((s, i) => s + (i.quantity || 1), 0),
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
      packages: (order.packages || []).map((pkg) => ({
        packageId: pkg.id,
        packageNumber: pkg.package_number ?? 1,
        totalPackages: pkg.total_packages ?? order.packages.length,
        companyName: pkg.company?.name || "Vendedor",
        trackingNumber: pkg.tracking_number,
        courier: pkg.courier,
        trackingUrl: pkg.tracking_url,
        estimatedDelivery: pkg.estimated_delivery?.toISOString() || null,
        deliveryType: pkg.delivery_type,
        status: pkg.status,
        paymentMethod: order.payment_method || "cash_on_delivery",
        cardBrand: order.paymentTransaction?.card_brand || null,
        cardLast4: order.paymentTransaction?.card_last4 || null,
        subtotal: Number(pkg.subtotal || 0),
        netEarnings: Number(pkg.net_earnings || 0),
        items: (pkg.items || []).map((item) => ({
          id: item.id,
          productId: item.product_id,
          title: item.product?.title || "Producto",
          price: Number(item.unit_price || 0),
          quantity: item.quantity || 1,
          subtotal: Number(item.subtotal || 0),
          image: item.product?.images?.[0]?.url || null,
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
    const message = err instanceof Error ? err.message : "Error al cargar historial de compras";
    return NextResponse.json(
      { error: message },
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
        const now = new Date();
        await prisma.order.update({
          where: { id: orderId },
          data: { status: "delivered", delivered_at: now, updated_at: now },
        });

        // Solo generar los payouts cuando TODA la orden está 100% entregada
        const allOrderPackages = await prisma.orderPackage.findMany({
          where: { order_id: orderId },
          select: { id: true },
        });
        await ensureSellerPayoutForPackages(allOrderPackages.map((p) => p.id));
      }
    }

    // Notificar a la empresa que el cliente confirmó la recepción del pedido
    sendDeliveryConfirmationNotifications(packageIds).catch((err) =>
      console.error(
        "[User Orders] Error enviando notificación de entrega:",
        err,
      ),
    );

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("Error al confirmar recepción del paquete:", err);
    return NextResponse.json(
      { error: "Error interno al confirmar recepción" },
      { status: 500 },
    );
  }
}
