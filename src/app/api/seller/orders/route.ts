import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { parseDispatchMeta, formatDispatchMeta } from "@/lib/shippingHelper";
import { refundNiubizTransaction } from "@/lib/services/niubiz";

export interface SellerPackageItem {
  id: string;
  productId: string;
  title: string;
  price: number;
  quantity: number;
  subtotal: number;
  image: string | null;
  status: string;
}

export interface SellerPackage {
  packageId: string;
  sessionCode: string;
  trackingNumber: string | null;
  carrierName: string | null;
  trackingUrl: string | null;
  carrierPhone: string | null;
  estimatedDelivery: string | null;
  createdAt: string;
  status: string;
  buyerName: string;
  buyerPhone: string | null;
  buyerEmail: string | null;
  destinationAddress: string | null;
  courierInfo: string | null;
  paymentMethod: string;
  paymentInfo?: {
    provider: string;
    cardBrand: string | null;
    cardLast4: string | null;
    docType: string | null;
    identityNumber: string | null;
  } | null;
  subtotal: number;
  platformCommission: number;
  netEarnings: number;
  orderIds: string[];
  items: SellerPackageItem[];
}

export async function GET(request: Request) {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    let companyIdParam = searchParams.get("company_id");

    // Si no se especificó company_id, consultar la empresa activa del usuario desde su Perfil
    if (!companyIdParam) {
      const profile = await prisma.profile.findUnique({
        where: { id: user.id },
        select: { last_active_company_id: true },
      });

      if (profile?.last_active_company_id) {
        companyIdParam = profile.last_active_company_id;
      }
    }

    let whereClause: any;

    if (
      companyIdParam &&
      companyIdParam !== "personal" &&
      companyIdParam !== "none"
    ) {
      const membership = await prisma.companyMember.findFirst({
        where: {
          company_id: companyIdParam,
          user_id: user.id,
        },
      });

      if (!membership) {
        return NextResponse.json(
          { error: "No tienes permisos para ver las ventas de esta empresa." },
          { status: 403 },
        );
      }

      whereClause = {
        OR: [
          { company_id: companyIdParam },
          { product: { company_id: companyIdParam } },
        ],
      };
    } else {
      // Modo personal (ventas del usuario sin empresa asignada)
      whereClause = {
        seller_id: user.id,
        company_id: null,
      };
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      orderBy: { created_at: "desc" },
      include: {
        buyer: {
          select: {
            id: true,
            name: true,
          },
        },
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

    type TempPackage = {
      packageId: string;
      sessionCode: string;
      trackingNumber: string | null;
      carrierName: string | null;
      trackingUrl: string | null;
      carrierPhone: string | null;
      estimatedDelivery: string | null;
      createdAt: string;
      status: string;
      buyerName: string;
      destinationAddress: string | null;
      courierInfo: string | null;
      paymentMethod: string;
      paymentInfo: {
        provider: string;
        cardBrand: string | null;
        cardLast4: string | null;
        docType: string | null;
        identityNumber: string | null;
      } | null;
      subtotal: number;
      orderIds: string[];
      items: SellerPackageItem[];
    };

    const packageMap = new Map<string, TempPackage>();

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
      const sessionCode = getSessionCode(order);
      const groupKey = `${sessionCode}_${order.seller_id}`;

      const { carrierName, trackingUrl, carrierPhone } = parseDispatchMeta(
        order.shipping?.courier,
      );

      const payInfo = {
        provider: order.payment_method || "niubiz_card",
        cardBrand: order.paymentTransaction?.card_brand || "VISA",
        cardLast4: order.paymentTransaction?.card_last4 || null,
        docType: order.invoiceDocument?.doc_type || null,
        identityNumber: order.invoiceDocument?.identity_number || null,
      };

      if (!packageMap.has(groupKey)) {
        packageMap.set(groupKey, {
          packageId: groupKey,
          sessionCode,
          trackingNumber: order.shipping?.tracking_number || null,
          carrierName,
          trackingUrl,
          carrierPhone,
          estimatedDelivery: order.shipping?.estimated_delivery
            ? order.shipping.estimated_delivery.toISOString()
            : null,
          createdAt:
            order.created_at?.toISOString() || new Date().toISOString(),
          status: order.status,
          buyerName: order.buyer?.name || "Comprador",
          destinationAddress: order.shipping?.destination_address || null,
          courierInfo: order.shipping?.courier || null,
          paymentMethod: order.payment_method || "niubiz_card",
          paymentInfo: payInfo,
          subtotal: 0,
          orderIds: [],
          items: [],
        });
      }

      const pkg = packageMap.get(groupKey)!;
      const itemPrice = Number(order.amount);
      pkg.subtotal += itemPrice;
      pkg.orderIds.push(order.id);

      if (!pkg.trackingNumber && order.shipping?.tracking_number) {
        pkg.trackingNumber = order.shipping.tracking_number;
      }
      if (!pkg.estimatedDelivery && order.shipping?.estimated_delivery) {
        pkg.estimatedDelivery = order.shipping.estimated_delivery.toISOString();
      }
      if (order.shipping?.courier && (!pkg.carrierName || !pkg.courierInfo)) {
        const meta = parseDispatchMeta(order.shipping.courier);
        if (meta.carrierName) pkg.carrierName = meta.carrierName;
        if (meta.trackingUrl) pkg.trackingUrl = meta.trackingUrl;
        if (meta.carrierPhone) pkg.carrierPhone = meta.carrierPhone;
        pkg.courierInfo = order.shipping.courier;
      }

      if (order.product) {
        pkg.items.push({
          id: order.id,
          productId: order.product.id,
          title: order.product.title,
          price: Number(order.unit_price),
          quantity: order.quantity,
          subtotal: itemPrice,
          image: order.product.images?.[0]?.url || null,
          status: order.status,
        });
      }
    }

    const sellerPackages: SellerPackage[] = [];

    for (const tempPkg of Array.from(packageMap.values())) {
      const platformCommission = tempPkg.subtotal * 0.1;
      const netEarnings = tempPkg.subtotal - platformCommission;

      const allDelivered =
        tempPkg.items.length > 0 &&
        tempPkg.items.every(
          (i) => i.status === "delivered" || i.status === "completed",
        );

      const isShippedWithTracking =
        !!tempPkg.trackingNumber ||
        tempPkg.items.some((i) => i.status === "shipped");

      const computedStatus = allDelivered
        ? "delivered"
        : isShippedWithTracking
          ? "shipped"
          : "pending";

      sellerPackages.push({
        packageId: tempPkg.packageId,
        sessionCode: tempPkg.sessionCode,
        trackingNumber: tempPkg.trackingNumber,
        carrierName: tempPkg.carrierName,
        trackingUrl: tempPkg.trackingUrl,
        carrierPhone: tempPkg.carrierPhone,
        estimatedDelivery: tempPkg.estimatedDelivery,
        createdAt: tempPkg.createdAt,
        status: computedStatus,
        buyerName: tempPkg.buyerName,
        buyerPhone: null,
        buyerEmail: null,
        destinationAddress: tempPkg.destinationAddress,
        courierInfo: tempPkg.courierInfo,
        paymentMethod: tempPkg.paymentMethod,
        paymentInfo: tempPkg.paymentInfo,
        subtotal: tempPkg.subtotal,
        platformCommission,
        netEarnings,
        orderIds: tempPkg.orderIds,
        items: tempPkg.items,
      });
    }

    return NextResponse.json({
      packages: sellerPackages,
      totalCount: sellerPackages.length,
    });
  } catch (err: unknown) {
    console.error("Error al obtener ventas del vendedor:", err);
    return NextResponse.json(
      { error: "Error al obtener ventas" },
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

    const body = await req.json();
    const {
      orderIds: rawOrderIds,
      packageId,
      action,
      courier: rawCourier,
      carrierName,
      trackingNumber,
      trackingUrl,
      carrierPhone,
      estimatedDelivery,
    } = body;

    let orderIds: string[] = Array.isArray(rawOrderIds) ? rawOrderIds : [];

    // Fallback: Si no se enviaron orderIds explícitos pero sí packageId, buscarlos en la BD
    if (orderIds.length === 0 && packageId) {
      const sellerOrders = await prisma.order.findMany({
        where: {
          OR: [
            { seller_id: user.id },
            { company: { companyMembers: { some: { user_id: user.id } } } },
          ],
        },
        select: {
          id: true,
          payment_id: true,
          created_at: true,
          seller_id: true,
        },
      });

      orderIds = sellerOrders
        .filter((o) => {
          if (o.id === packageId) return true;
          const sessionCode = o.payment_id
            ? o.payment_id.toUpperCase()
            : o.created_at
              ? o.created_at.toISOString().slice(0, 16)
              : o.id.slice(0, 6).toUpperCase();
          const groupKey = `${sessionCode}_${o.seller_id}`;
          return groupKey === packageId || sessionCode === packageId;
        })
        .map((o) => o.id);
    }

    if (!orderIds || orderIds.length === 0) {
      return NextResponse.json(
        { error: "Faltan las órdenes a actualizar" },
        { status: 400 },
      );
    }

    if (action === "cancel") {
      const ordersToCancel = await prisma.order.findMany({
        where: { id: { in: orderIds } },
        include: { paymentTransaction: true },
      });

      const refundAmount = ordersToCancel.reduce(
        (sum: number, o: { amount: unknown }) => sum + Number(o.amount),
        0,
      );
      const firstWithTx = ordersToCancel.find(
        (o: { paymentTransaction: any }) =>
          o.paymentTransaction && o.paymentTransaction.status === "authorized",
      );

      if (firstWithTx && firstWithTx.paymentTransaction) {
        const tx = firstWithTx.paymentTransaction;
        if (tx.authorization_code && tx.transaction_id) {
          try {
            await refundNiubizTransaction({
              authorizationCode: tx.authorization_code,
              transactionId: tx.transaction_id,
              amount: refundAmount,
              purchaseNumber: tx.purchase_number,
            });

            await prisma.paymentTransaction.create({
              data: {
                provider: "niubiz",
                transaction_type: "refund",
                status: "refunded",
                purchase_number: `REF-${tx.purchase_number}-${Date.now().toString().slice(-4)}`,
                amount: refundAmount,
                currency: "PEN",
                authorization_code: tx.authorization_code,
                transaction_id: tx.transaction_id,
                response_code: "00",
                response_message: `Reembolso parcial de paquete ejecutado (S/ ${refundAmount.toFixed(2)})`,
              },
            });
          } catch (refundErr) {
            console.error(
              "Error al procesar reembolso parcial en Niubiz:",
              refundErr,
            );
          }
        }
      }

      await prisma.order.updateMany({
        where: { id: { in: orderIds } },
        data: { status: "cancelled", updated_at: new Date() },
      });
      await prisma.shipping.updateMany({
        where: { order_id: { in: orderIds } },
        data: { status: "cancelled", updated_at: new Date() },
      });
      return NextResponse.json({ success: true, refundedAmount: refundAmount });
    }

    const courier = (rawCourier || carrierName || "").trim();

    if (!courier) {
      return NextResponse.json(
        { error: "La empresa de transporte es requerida" },
        { status: 400 },
      );
    }

    if (!trackingNumber || !String(trackingNumber).trim()) {
      return NextResponse.json(
        { error: "El Código de Tracking / Guía es requerido" },
        { status: 400 },
      );
    }

    if (!estimatedDelivery) {
      return NextResponse.json(
        { error: "La Fecha Estimada de Entrega es requerida" },
        { status: 400 },
      );
    }

    const estDeliveryDate = new Date(estimatedDelivery);
    const dispatchCourierMeta = formatDispatchMeta({
      courier,
      trackingNumber,
      trackingUrl,
      carrierPhone,
    });

    // Actualizar todas las órdenes del paquete a "shipped"
    await prisma.order.updateMany({
      where: { id: { in: orderIds } },
      data: { status: "shipped", updated_at: new Date() },
    });

    // Optimización de consultas DB para shippings (Lote masivo)
    const existingShippings = await prisma.shipping.findMany({
      where: { order_id: { in: orderIds } },
      select: { id: true, order_id: true },
    });

    const existingOrderIds = new Set(existingShippings.map((s) => s.order_id));
    const missingOrderIds = orderIds.filter((id) => !existingOrderIds.has(id));

    const updateFields = {
      courier: dispatchCourierMeta,
      tracking_number: trackingNumber.trim(),
      estimated_delivery: estDeliveryDate,
      updated_at: new Date(),
    };

    // Intentar actualizar en lote con "in_transit"
    try {
      if (existingShippings.length > 0) {
        await prisma.shipping.updateMany({
          where: { order_id: { in: Array.from(existingOrderIds) } },
          data: { ...updateFields, status: "in_transit" },
        });
      }

      if (missingOrderIds.length > 0) {
        await prisma.shipping.createMany({
          data: missingOrderIds.map((id) => ({
            order_id: id,
            ...updateFields,
            status: "in_transit",
            origin_address: "Almacén / Proveedor",
          })),
        });
      }
    } catch {
      // Fallback seguro a "pending" si la restricción CHECK rechaza "in_transit"
      if (existingShippings.length > 0) {
        await prisma.shipping.updateMany({
          where: { order_id: { in: Array.from(existingOrderIds) } },
          data: { ...updateFields, status: "pending" },
        });
      }

      if (missingOrderIds.length > 0) {
        await prisma.shipping.createMany({
          data: missingOrderIds.map((id) => ({
            order_id: id,
            ...updateFields,
            status: "pending",
            origin_address: "Almacén / Proveedor",
          })),
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("Error al registrar despacho:", err);
    const message =
      err instanceof Error
        ? err.message
        : "Error interno al registrar despacho";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
