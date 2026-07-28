import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Debes iniciar sesión para procesar tu pedido" },
        { status: 401 },
      );
    }

    const body = await req.json();
    const { items, shipping, payment_method } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "El carrito está vacío" },
        { status: 400 },
      );
    }

    if (!shipping || !shipping.name || !shipping.phone || !shipping.address) {
      return NextResponse.json(
        { error: "Faltan datos obligatorios de envío (Nombre, Teléfono y Dirección)" },
        { status: 400 },
      );
    }

    // 1. Garantizar existencia del perfil del Comprador en la tabla profiles
    await prisma.profile.upsert({
      where: { id: user.id },
      update: {
        email: user.email || shipping.email || "",
        name: shipping.name || user.user_metadata?.name || null,
        phone: shipping.phone || null,
      },
      create: {
        id: user.id,
        email: user.email || shipping.email || "",
        name: shipping.name || user.user_metadata?.name || null,
        phone: shipping.phone || null,
      },
    });

    // Código de orden principal correlativo
    const orderCode = `IUBI-${Math.floor(100000 + Math.random() * 900000)}`;
    const createdOrders = [];

    // 2. Procesar cada ítem del carrito
    for (const item of items) {
      const productId = item.product_id || item.id;
      if (!productId) continue;

      const product = await prisma.product.findUnique({
        where: { id: productId },
        select: { id: true, seller_id: true, company_id: true, price: true },
      });

      if (!product) continue;

      // Garantizar que el vendedor exista en la tabla profiles
      await prisma.profile.upsert({
        where: { id: product.seller_id },
        update: {},
        create: {
          id: product.seller_id,
          email: `seller_${product.seller_id.slice(0, 8)}@iubizon.com`,
          name: "Vendedor iubizon",
        },
      });

      // Verificar si la empresa existe en DB
      let validCompanyId: string | null = null;
      const targetCompanyId = product.company_id || item.company_id;
      if (targetCompanyId) {
        const companyExists = await prisma.company.findUnique({
          where: { id: targetCompanyId },
          select: { id: true },
        });
        if (companyExists) {
          validCompanyId = companyExists.id;
        }
      }

      const itemQuantity = Number(item.quantity) || 1;
      const itemSubtotal = Number(product.price) * itemQuantity;
      const commission = itemSubtotal * 0.1; // 10% comision para iubizon

      const order = await prisma.order.create({
        data: {
          product_id: product.id,
          buyer_id: user.id,
          seller_id: product.seller_id,
          company_id: validCompanyId,
          amount: itemSubtotal,
          commission: commission,
          status: "pending",
          payment_method: payment_method || "cash_on_delivery",
          shipping: {
            create: {
              origin_address: "Almacén Principal iubizon / Vendedor",
              destination_address: `${shipping.address}, ${shipping.city || "Lima"} (Ref: ${shipping.notes || "Sin ref"})`,
              courier: `Cliente: ${shipping.name} | Tel: ${shipping.phone}`,
              tracking_number: orderCode,
              status: "pending",
            },
          },
        },
        include: {
          shipping: true,
          product: {
            select: { title: true },
          },
        },
      });

      createdOrders.push(order);
    }

    if (createdOrders.length === 0) {
      return NextResponse.json(
        { error: "No se pudieron procesar los productos del carrito" },
        { status: 400 },
      );
    }

    // Calcular totales globales del pedido
    const subtotal = items.reduce(
      (sum, i) => sum + Number(i.price) * Number(i.quantity),
      0,
    );
    const shippingCost = 50.0;
    const totalAmount = subtotal + shippingCost;
    const totalCommission = subtotal * 0.1;
    const totalTax = subtotal * 0.18;
    const totalSellerEarnings = subtotal - totalCommission;

    return NextResponse.json({
      success: true,
      orderCode,
      orderCount: createdOrders.length,
      financials: {
        subtotal,
        shippingCost,
        taxAmount: totalTax,
        platformCommission: totalCommission,
        sellerEarnings: totalSellerEarnings,
        totalAmount,
      },
    });
  } catch (err: unknown) {
    console.error("Error detallado al registrar pedido:", err);
    const errorMessage = err instanceof Error ? err.message : "Error interno al procesar la compra";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 },
    );
  }
}
