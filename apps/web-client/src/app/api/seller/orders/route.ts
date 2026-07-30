import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { parseDispatchMeta, formatDispatchMeta } from "@/lib/shippingHelper";

export interface SellerPackageItem {
  id: string;
  productId: string;
  title: string;
  price: number;
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
  subtotal: number;
  platformCommission: number;
  netEarnings: number;
  orderIds: string[];
  items: SellerPackageItem[];
}

export async function GET() {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where: {
        OR: [
          { seller_id: user.id },
          { company: { companyMembers: { some: { user_id: user.id } } } },
        ],
      },
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
      subtotal: number;
      orderIds: string[];
      items: SellerPackageItem[];
    };

    const packageMap = new Map<string, TempPackage>();

    const getSessionCode = (order: (typeof orders)[0]) => {
      if (order.payment_id && order.payment_id.trim() !== "") {
        return order.payment_id.toUpperCase();
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
          paymentMethod: order.payment_method || "cash_on_delivery",
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
        pkg.estimatedDelivery =
          order.shipping.estimated_delivery.toISOString();
      }

      if (order.product) {
        pkg.items.push({
          id: order.id,
          productId: order.product.id,
          title: order.product.title,
          price: itemPrice,
          image: order.product.images?.[0]?.url || null,
          status: order.status,
        });
      }
    }

    const sellerPackages: SellerPackage[] = [];

    for (const tempPkg of Array.from(packageMap.values())) {
      const platformCommission = tempPkg.subtotal * 0.1;
      const netEarnings = tempPkg.subtotal - platformCommission;

      sellerPackages.push({
        packageId: tempPkg.packageId,
        sessionCode: tempPkg.sessionCode,
        trackingNumber: tempPkg.trackingNumber,
        carrierName: tempPkg.carrierName,
        trackingUrl: tempPkg.trackingUrl,
        carrierPhone: tempPkg.carrierPhone,
        estimatedDelivery: tempPkg.estimatedDelivery,
        createdAt: tempPkg.createdAt,
        status: tempPkg.status,
        buyerName: tempPkg.buyerName,
        buyerPhone: null,
        buyerEmail: null,
        destinationAddress: tempPkg.destinationAddress,
        courierInfo: tempPkg.courierInfo,
        paymentMethod: tempPkg.paymentMethod,
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
      orderIds,
      action,
      courier,
      trackingNumber,
      trackingUrl,
      carrierPhone,
      estimatedDelivery,
    } = body;

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return NextResponse.json(
        { error: "Faltan las órdenes a actualizar" },
        { status: 400 },
      );
    }

    if (action === "cancel") {
      await prisma.order.updateMany({
        where: { id: { in: orderIds } },
        data: { status: "cancelled", updated_at: new Date() },
      });
      await prisma.shipping.updateMany({
        where: { order_id: { in: orderIds } },
        data: { status: "cancelled", updated_at: new Date() },
      });
      return NextResponse.json({ success: true });
    }

    if (!courier || !String(courier).trim()) {
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
