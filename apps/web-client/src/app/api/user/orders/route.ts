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

export interface PurchasePackage {
  orderCode: string;
  createdAt: string;
  status: string;
  paymentMethod: string;
  subtotal: number;
  shippingCost: number;
  totalAmount: number;
  items: PackageItem[];
  shipping: {
    destinationAddress: string | null;
    courierInfo: string | null;
    trackingNumber: string | null;
    status: string;
  } | null;
}

export async function GET(req: Request) {
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
        shipping: true,
      },
    });

    // Agrupar órdenes por Código de Orden (tracking_number) en Paquetes de Compra
    const packageMap = new Map<string, PurchasePackage>();

    for (const order of orders) {
      const code =
        order.shipping?.tracking_number ||
        `IUBI-${order.id.slice(0, 6).toUpperCase()}`;

      if (!packageMap.has(code)) {
        packageMap.set(code, {
          orderCode: code,
          createdAt:
            order.created_at?.toISOString() || new Date().toISOString(),
          status: order.status,
          paymentMethod: order.payment_method || "cash_on_delivery",
          subtotal: 0,
          shippingCost: 50.0, // Costo fijo de envío por paquete S/ 50.00
          totalAmount: 50.0,
          items: [],
          shipping: order.shipping
            ? {
                destinationAddress: order.shipping.destination_address,
                courierInfo: order.shipping.courier,
                trackingNumber: order.shipping.tracking_number,
                status: order.shipping.status || order.status,
              }
            : null,
        });
      }

      const pkg = packageMap.get(code)!;
      const itemPrice = Number(order.amount);
      pkg.subtotal += itemPrice;
      pkg.totalAmount = pkg.subtotal + pkg.shippingCost;

      pkg.items.push({
        id: order.id,
        productId: order.product.id,
        title: order.product.title,
        price: itemPrice,
        image: order.product.images[0]?.url || null,
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

    const packages = Array.from(packageMap.values());

    return NextResponse.json({
      packages,
      totalPurchases: packages.length,
    });
  } catch (err: unknown) {
    console.error("Error al obtener compras del usuario:", err);
    return NextResponse.json(
      { error: "Error al cargar historial de compras" },
      { status: 500 },
    );
  }
}
