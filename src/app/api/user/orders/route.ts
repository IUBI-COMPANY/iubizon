import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { parseDispatchMeta } from "@/lib/shippingHelper";
import { ensureSellerPayoutForOrders } from "@/lib/payoutService";

export interface PackageItem {
  id: string;
  productId: string;
  title: string;
  price: number;
  image: string | null;
  company: {
    id: string;
    name: string;
    logoUrl: string | null;
    slug: string | null;
  } | null;
}

export interface PaymentDetails {
  provider: string;
  cardBrand: string | null;
  cardLast4: string | null;
  authorizationCode: string | null;
  docType: string | null;
  identityNumber: string | null;
  legalName: string | null;
}

export interface TrackingPackage {
  trackingNumber: string | null;
  carrierName: string | null;
  trackingUrl: string | null;
  estimatedDelivery: string | null;
  status: string;
  paymentMethod: string;
  paymentDetails: PaymentDetails | null;
  subtotal: number;
  taxAmount: number;
  shippingCost: number;
  totalAmount: number;
  destinationAddress: string | null;
  courierInfo: string | null;
  sellerName: string | null;
  orderIds: string[];
  items: PackageItem[];
}

export interface PurchaseOrderSession {
  orderCode: string;
  createdAt: string;
  subtotal: number;
  taxAmount: number;
  shippingCost: number;
  totalAmount: number;
  totalItems: number;
  destinationAddress: string | null;
  paymentDetails: PaymentDetails | null;
  packages: TrackingPackage[];
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

    const orders = await prisma.order.findMany({
      where: { buyer_id: user.id },
      orderBy: { created_at: "desc" },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            price: true,
            images: {
              orderBy: { position: "asc" },
              take: 1,
            },
          },
        },
        company: {
          select: {
            id: true,
            name: true,
            logo_url: true,
            slug: true,
          },
        },
        seller: {
          select: {
            id: true,
            name: true,
          },
        },
        shipping: true,
        paymentTransaction: {
          select: {
            provider: true,
            card_brand: true,
            card_last4: true,
            authorization_code: true,
            status: true,
          },
        },
        invoiceDocument: {
          select: {
            doc_type: true,
            identity_type: true,
            identity_number: true,
            legal_name: true,
          },
        },
      },
    });

    // ── Lógica de Auto-Completado por Fecha Estimada (+24 Horas) ─────────────
    const now = new Date();
    const ordersToAutoComplete: string[] = [];

    for (const order of orders) {
      if (
        order.shipping &&
        order.shipping.status === "shipped" &&
        order.shipping.estimated_delivery
      ) {
        const expiryTime = new Date(
          order.shipping.estimated_delivery.getTime() + 24 * 60 * 60 * 1000,
        );
        if (now > expiryTime) {
          ordersToAutoComplete.push(order.id);
          order.status = "delivered";
          if (order.shipping) order.shipping.status = "delivered";
        }
      }
    }

    if (ordersToAutoComplete.length > 0) {
      await prisma.order.updateMany({
        where: { id: { in: ordersToAutoComplete } },
        data: { status: "delivered", updated_at: now },
      });
      await prisma.shipping.updateMany({
        where: { order_id: { in: ordersToAutoComplete } },
        data: { status: "delivered", updated_at: now },
      });
    }

    // ── Agrupación en Sesiones y Paquetes por Vendedor ─────────────────────

    type TempPackage = {
      packageKey: string;
      trackingNumber: string | null;
      carrierName: string | null;
      trackingUrl: string | null;
      estimatedDelivery: string | null;
      status: string;
      paymentMethod: string;
      paymentDetails: PaymentDetails | null;
      sellerName: string | null;
      subtotal: number;
      destinationAddress: string | null;
      courierInfo: string | null;
      orderIds: string[];
      items: PackageItem[];
    };

    type TempSession = {
      orderCode: string;
      createdAt: string;
      packageMap: Map<string, TempPackage>;
    };

    const sessionMap = new Map<string, TempSession>();

    const getSessionCode = (order: (typeof orders)[0]) => {
      if (order.payment_id && order.payment_id.trim() !== "") {
        return order.payment_id.trim().replace(/^NIUBIZ-/i, "");
      }
      if (order.created_at) {
        const timeKey = order.created_at.toISOString().slice(0, 16);
        let hash = 0;
        for (let i = 0; i < timeKey.length; i++) {
          hash = (hash << 5) - hash + timeKey.charCodeAt(i);
          hash |= 0;
        }
        return Math.abs(hash)
          .toString(36)
          .toUpperCase()
          .padStart(6, "0")
          .slice(0, 6);
      }
      return order.id.slice(0, 6).toUpperCase();
    };

    for (const order of orders) {
      const mainOrderCode = getSessionCode(order);
      const pkgKey = `${mainOrderCode}_${order.seller_id}`;

      const { carrierName, trackingUrl } = parseDispatchMeta(
        order.shipping?.courier,
      );

      const payDetails: PaymentDetails | null = order.paymentTransaction
        ? {
            provider: order.payment_method || "niubiz_card",
            cardBrand: order.paymentTransaction.card_brand || "VISA",
            cardLast4: order.paymentTransaction.card_last4 || null,
            authorizationCode:
              order.paymentTransaction.authorization_code || mainOrderCode,
            docType: order.invoiceDocument?.doc_type || null,
            identityNumber: order.invoiceDocument?.identity_number || null,
            legalName: order.invoiceDocument?.legal_name || null,
          }
        : {
            provider: order.payment_method || "niubiz_card",
            cardBrand: "VISA",
            cardLast4: null,
            authorizationCode: mainOrderCode,
            docType: order.invoiceDocument?.doc_type || null,
            identityNumber: order.invoiceDocument?.identity_number || null,
            legalName: order.invoiceDocument?.legal_name || null,
          };

      if (!sessionMap.has(mainOrderCode)) {
        sessionMap.set(mainOrderCode, {
          orderCode: mainOrderCode,
          createdAt:
            order.created_at?.toISOString() || new Date().toISOString(),
          packageMap: new Map<string, TempPackage>(),
        });
      }

      const session = sessionMap.get(mainOrderCode)!;

      if (!session.packageMap.has(pkgKey)) {
        const sellerName =
          order.company?.name || order.seller?.name || "Vendedor iubizon";

        session.packageMap.set(pkgKey, {
          packageKey: pkgKey,
          trackingNumber: order.shipping?.tracking_number || null,
          carrierName,
          trackingUrl,
          estimatedDelivery: order.shipping?.estimated_delivery
            ? order.shipping.estimated_delivery.toISOString()
            : null,
          status: order.status,
          paymentMethod: order.payment_method || "niubiz_card",
          paymentDetails: payDetails,
          sellerName,
          subtotal: 0,
          destinationAddress: order.shipping?.destination_address || null,
          courierInfo: order.shipping?.courier || null,
          orderIds: [],
          items: [],
        });
      }

      const pkg = session.packageMap.get(pkgKey)!;
      const itemPrice = Number(order.amount);
      pkg.subtotal += itemPrice;
      pkg.orderIds.push(order.id);

      if (order.product) {
        pkg.items.push({
          id: order.id,
          productId: order.product.id,
          title: order.product.title,
          price: itemPrice,
          image: order.product.images?.[0]?.url || null,
          company: order.company
            ? {
                id: order.company.id,
                name: order.company.name,
                logoUrl: order.company.logo_url,
                slug: order.company.slug,
              }
            : null,
        });
      }
    }

    const purchaseSessions: PurchaseOrderSession[] = [];

    for (const session of Array.from(sessionMap.values())) {
      const packagesList: TrackingPackage[] = [];
      let sessionSubtotal = 0;
      let sessionItemsCount = 0;
      let mainDestination: string | null = null;
      let mainPayDetails: PaymentDetails | null = null;

      for (const tempPkg of Array.from(session.packageMap.values())) {
        const taxAmount = 0;
        const shippingCost = 50.0;
        const totalAmount = tempPkg.subtotal + shippingCost;

        sessionSubtotal += tempPkg.subtotal;
        sessionItemsCount += tempPkg.items.length;
        if (!mainDestination && tempPkg.destinationAddress) {
          mainDestination = tempPkg.destinationAddress;
        }
        if (!mainPayDetails && tempPkg.paymentDetails) {
          mainPayDetails = tempPkg.paymentDetails;
        }

        packagesList.push({
          trackingNumber: tempPkg.trackingNumber,
          carrierName: tempPkg.carrierName,
          trackingUrl: tempPkg.trackingUrl,
          estimatedDelivery: tempPkg.estimatedDelivery,
          status: tempPkg.status,
          paymentMethod: tempPkg.paymentMethod,
          paymentDetails: tempPkg.paymentDetails,
          subtotal: tempPkg.subtotal,
          taxAmount,
          shippingCost,
          totalAmount,
          destinationAddress: tempPkg.destinationAddress,
          courierInfo: tempPkg.courierInfo,
          sellerName: tempPkg.sellerName,
          orderIds: tempPkg.orderIds,
          items: tempPkg.items,
        });
      }

      const sessionTax = 0;
      const sessionShipping = 50.0;
      const sessionTotal = sessionSubtotal + sessionShipping;

      purchaseSessions.push({
        orderCode: session.orderCode,
        createdAt: session.createdAt,
        subtotal: sessionSubtotal,
        taxAmount: sessionTax,
        shippingCost: sessionShipping,
        totalAmount: sessionTotal,
        totalItems: sessionItemsCount,
        destinationAddress: mainDestination,
        paymentDetails: mainPayDetails,
        packages: packagesList,
      });
    }

    const filteredSessions = orderCodeParam
      ? purchaseSessions.filter(
          (s) => s.orderCode.toLowerCase() === orderCodeParam.toLowerCase(),
        )
      : purchaseSessions;

    return NextResponse.json({
      sessions: filteredSessions,
      session: filteredSessions[0] || null,
      packages: filteredSessions.flatMap((s) => s.packages),
      totalPurchases: purchaseSessions.length,
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

    const { orderIds } = await req.json();

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return NextResponse.json(
        { error: "Faltan los IDs de las órdenes" },
        { status: 400 },
      );
    }

    await prisma.order.updateMany({
      where: {
        id: { in: orderIds },
        buyer_id: user.id,
      },
      data: {
        status: "delivered",
        updated_at: new Date(),
      },
    });

    await prisma.shipping.updateMany({
      where: {
        order_id: { in: orderIds },
      },
      data: {
        status: "delivered",
        updated_at: new Date(),
      },
    });

    await ensureSellerPayoutForOrders(orderIds);

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("Error al confirmar recepción del paquete:", err);
    return NextResponse.json(
      { error: "Error interno al confirmar recepción" },
      { status: 500 },
    );
  }
}
