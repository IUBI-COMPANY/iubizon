import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

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

export interface TrackingPackage {
  trackingNumber: string; // ej. "374155-001"
  status: string;
  paymentMethod: string;
  subtotal: number;
  taxAmount: number;
  shippingCost: number;
  totalAmount: number;
  destinationAddress: string | null;
  courierInfo: string | null;
  sellerName: string | null;
  items: PackageItem[];
}

export interface PurchaseOrderSession {
  orderCode: string; // ej. "374155"
  createdAt: string; // ISO date string
  subtotal: number;
  taxAmount: number;
  shippingCost: number;
  totalAmount: number;
  totalItems: number;
  destinationAddress: string | null;
  packages: TrackingPackage[];
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

    // Obtener todas las órdenes del usuario
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
      },
    });

    type TempPackage = {
      trackingNumber: string;
      status: string;
      paymentMethod: string;
      sellerName: string | null;
      subtotal: number;
      destinationAddress: string | null;
      courierInfo: string | null;
      items: PackageItem[];
    };

    type TempSession = {
      orderCode: string;
      createdAt: string;
      packageMap: Map<string, TempPackage>;
    };

    const sessionMap = new Map<string, TempSession>();

    for (const order of orders) {
      const rawTracking =
        order.shipping?.tracking_number || `374155-${order.id.slice(0, 3)}`;

      // Extraer el código principal de orden (ej. de TRK-374155-001 o 374155-001 -> 374155)
      const match = rawTracking.match(/^(?:TRK-)?([A-Za-z0-9]+)-\d{3}$/);
      const mainOrderCode = match ? match[1] : rawTracking.replace(/^TRK-/, "");

      // Remover cualquier prefijo TRK- para obtener código puro (ej. 374155-001)
      const cleanTracking = rawTracking.replace(/^TRK-/, "");
      const formattedTracking = cleanTracking.includes("-")
        ? cleanTracking
        : `${cleanTracking}-001`;

      if (!sessionMap.has(mainOrderCode)) {
        sessionMap.set(mainOrderCode, {
          orderCode: mainOrderCode,
          createdAt:
            order.created_at?.toISOString() || new Date().toISOString(),
          packageMap: new Map<string, TempPackage>(),
        });
      }

      const session = sessionMap.get(mainOrderCode)!;

      if (!session.packageMap.has(formattedTracking)) {
        const sellerName =
          order.company?.name || order.seller?.name || "Vendedor iubizon";

        session.packageMap.set(formattedTracking, {
          trackingNumber: formattedTracking,
          status: order.shipping?.status || order.status,
          paymentMethod: order.payment_method || "cash_on_delivery",
          sellerName,
          subtotal: 0,
          destinationAddress: order.shipping?.destination_address || null,
          courierInfo: order.shipping?.courier || null,
          items: [],
        });
      }

      const pkg = session.packageMap.get(formattedTracking)!;
      const itemPrice = Number(order.amount);
      pkg.subtotal += itemPrice;

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

    // Construir la estructura final jerárquica
    const purchaseSessions: PurchaseOrderSession[] = [];

    for (const session of Array.from(sessionMap.values())) {
      const packagesList: TrackingPackage[] = [];
      let sessionSubtotal = 0;
      let sessionItemsCount = 0;
      let mainDestination: string | null = null;

      for (const tempPkg of Array.from(session.packageMap.values())) {
        const taxAmount = tempPkg.subtotal * 0.18;
        const shippingCost = 50.0;
        const totalAmount = tempPkg.subtotal + taxAmount + shippingCost;

        sessionSubtotal += tempPkg.subtotal;
        sessionItemsCount += tempPkg.items.length;
        if (!mainDestination && tempPkg.destinationAddress) {
          mainDestination = tempPkg.destinationAddress;
        }

        packagesList.push({
          trackingNumber: tempPkg.trackingNumber,
          status: tempPkg.status,
          paymentMethod: tempPkg.paymentMethod,
          subtotal: tempPkg.subtotal,
          taxAmount,
          shippingCost,
          totalAmount,
          destinationAddress: tempPkg.destinationAddress,
          courierInfo: tempPkg.courierInfo,
          sellerName: tempPkg.sellerName,
          items: tempPkg.items,
        });
      }

      const sessionTax = sessionSubtotal * 0.18;
      const sessionShipping = 50.0;
      const sessionTotal = sessionSubtotal + sessionTax + sessionShipping;

      purchaseSessions.push({
        orderCode: session.orderCode,
        createdAt: session.createdAt,
        subtotal: sessionSubtotal,
        taxAmount: sessionTax,
        shippingCost: sessionShipping,
        totalAmount: sessionTotal,
        totalItems: sessionItemsCount,
        destinationAddress: mainDestination,
        packages: packagesList,
      });
    }

    return NextResponse.json({
      sessions: purchaseSessions,
      packages: purchaseSessions.flatMap((s) => s.packages),
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
