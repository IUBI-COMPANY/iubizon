import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export interface SellerPackageItem {
  id: string;
  productId: string;
  title: string;
  price: number;
  image: string | null;
  status: string;
}

export interface SellerPackage {
  trackingNumber: string; // ej. "374155-001"
  createdAt: string;
  status: string;
  buyerName: string;
  buyerPhone: string | null;
  buyerEmail: string | null;
  destinationAddress: string | null;
  courierInfo: string | null;
  paymentMethod: string;
  subtotal: number;
  taxAmount: number;
  shippingCost: number;
  totalAmount: number;
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

    // Obtener todas las órdenes donde el usuario es el vendedor o pertenece a la empresa vendedora
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
            email: true,
            phone: true,
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
      trackingNumber: string;
      createdAt: string;
      status: string;
      buyerName: string;
      buyerPhone: string | null;
      buyerEmail: string | null;
      destinationAddress: string | null;
      courierInfo: string | null;
      paymentMethod: string;
      subtotal: number;
      orderIds: string[];
      items: SellerPackageItem[];
    };

    const packageMap = new Map<string, TempPackage>();

    for (const order of orders) {
      const rawTracking =
        order.shipping?.tracking_number || `374155-${order.id.slice(0, 3)}`;

      // Remover cualquier prefijo TRK- para obtener código limpio (ej. 374155-001)
      const cleanTracking = rawTracking.replace(/^TRK-/, "");
      const formattedTracking = cleanTracking.includes("-")
        ? cleanTracking
        : `${cleanTracking}-001`;

      if (!packageMap.has(formattedTracking)) {
        packageMap.set(formattedTracking, {
          trackingNumber: formattedTracking,
          createdAt: order.created_at?.toISOString() || new Date().toISOString(),
          status: order.shipping?.status || order.status,
          buyerName: order.buyer?.name || "Comprador",
          buyerPhone: order.buyer?.phone || null,
          buyerEmail: order.buyer?.email || null,
          destinationAddress: order.shipping?.destination_address || null,
          courierInfo: order.shipping?.courier || null,
          paymentMethod: order.payment_method || "cash_on_delivery",
          subtotal: 0,
          orderIds: [],
          items: [],
        });
      }

      const pkg = packageMap.get(formattedTracking)!;
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
          status: order.status,
        });
      }
    }

    const sellerPackages: SellerPackage[] = [];

    for (const tempPkg of Array.from(packageMap.values())) {
      const taxAmount = tempPkg.subtotal * 0.18;
      const shippingCost = 50.0;
      const totalAmount = tempPkg.subtotal + taxAmount + shippingCost;

      sellerPackages.push({
        trackingNumber: tempPkg.trackingNumber,
        createdAt: tempPkg.createdAt,
        status: tempPkg.status,
        buyerName: tempPkg.buyerName,
        buyerPhone: tempPkg.buyerPhone,
        buyerEmail: tempPkg.buyerEmail,
        destinationAddress: tempPkg.destinationAddress,
        courierInfo: tempPkg.courierInfo,
        paymentMethod: tempPkg.paymentMethod,
        subtotal: tempPkg.subtotal,
        taxAmount,
        shippingCost,
        totalAmount,
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

// Endpoint para actualizar estado del paquete / órdenes asociadas
export async function PATCH(req: Request) {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { orderIds, trackingNumber, newStatus } = await req.json();

    if (!newStatus) {
      return NextResponse.json(
        { error: "Falta el nuevo estado" },
        { status: 400 },
      );
    }

    if (orderIds && Array.isArray(orderIds) && orderIds.length > 0) {
      // Actualizar todas las órdenes enviadas
      await prisma.order.updateMany({
        where: { id: { in: orderIds } },
        data: { status: newStatus, updated_at: new Date() },
      });

      // Actualizar shippings asociados
      await prisma.shipping.updateMany({
        where: { order_id: { in: orderIds } },
        data: { status: newStatus, updated_at: new Date() },
      });
    } else if (trackingNumber) {
      const shippings = await prisma.shipping.findMany({
        where: { tracking_number: { contains: trackingNumber } },
        select: { order_id: true },
      });
      const ids = shippings.map((s) => s.order_id);
      if (ids.length > 0) {
        await prisma.order.updateMany({
          where: { id: { in: ids } },
          data: { status: newStatus, updated_at: new Date() },
        });
        await prisma.shipping.updateMany({
          where: { order_id: { in: ids } },
          data: { status: newStatus, updated_at: new Date() },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("Error al actualizar estado del pedido:", err);
    return NextResponse.json(
      { error: "Error interno al actualizar pedido" },
      { status: 500 },
    );
  }
}
