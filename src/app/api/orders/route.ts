import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { calculateIubizonCommission } from "@/lib/utils/commission";
import { getOrCreateBuyerProfile } from "@/lib/services/orders";
import { getShippingConfig } from "@/lib/services/platformSettings";
import { sendOrderConfirmationEmails } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const body = await req.json();
    const {
      items,
      shipping,
      payment_method,
      delivery_type,
      invoice_type,
      invoice_doc_type,
      invoice_dni,
      invoice_ruc,
      invoice_company_name,
    } = body;

    const buyerId = await getOrCreateBuyerProfile({
      userId: user?.id,
      email: shipping?.email,
      name: shipping?.name,
      phone: shipping?.phone,
    });

    // ── Validaciones de entrada ──────────────────────────────────────────────

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "El carrito está vacío" },
        { status: 400 },
      );
    }

    if (!shipping || !shipping.name || !shipping.phone || !shipping.address) {
      return NextResponse.json(
        {
          error:
            "Faltan datos obligatorios de envío (Nombre, Teléfono y Dirección)",
        },
        { status: 400 },
      );
    }

    if (invoice_type === "factura") {
      if (!invoice_ruc || String(invoice_ruc).trim().length !== 11) {
        return NextResponse.json(
          {
            error:
              "El RUC para la factura electrónica debe contener 11 dígitos",
          },
          { status: 400 },
        );
      }
      if (!invoice_company_name || !String(invoice_company_name).trim()) {
        return NextResponse.json(
          {
            error:
              "La Razón Social es requerida para emitir factura electrónica",
          },
          { status: 400 },
        );
      }
    }

    // Validación SUNAT: Boleta > S/700 requiere número de documento
    if (invoice_type === "boleta" || !invoice_type) {
      const orderSubtotal = (
        items as Array<{ price: number; quantity?: number }>
      ).reduce((sum, i) => sum + Number(i.price) * Number(i.quantity || 1), 0);
      const orderTotal = orderSubtotal + 50;
      if (orderTotal > 700 && (!invoice_dni || !String(invoice_dni).trim())) {
        return NextResponse.json(
          {
            error:
              "Para pedidos mayores a S/ 700, la SUNAT exige el número de documento del comprador en la boleta.",
          },
          { status: 400 },
        );
      }
    }

    // ── Preparación de datos ─────────────────────────────────────────────────

    const IUBIZON_WAREHOUSE = "Almacén iubizon – Av. Industrial 2340, Lima 15";
    const isCompleteDelivery = delivery_type === "complete";
    const supplierDestination = isCompleteDelivery
      ? IUBIZON_WAREHOUSE
      : `${shipping.address}, ${shipping.city || "Lima"} (Ref: ${shipping.notes || "Sin ref"})`;

    const invoiceDetails =
      invoice_type === "factura"
        ? `Factura RUC: ${invoice_ruc} (${invoice_company_name})`
        : invoice_dni
          ? `Boleta de Venta — ${String(invoice_doc_type || "dni").toUpperCase()}: ${invoice_dni}`
          : "Boleta de Venta";

    // Código de sesión de compra: 6 dígitos, verificado como único en BD
    const generateSessionCode = async (): Promise<string> => {
      const code = String(Math.floor(100000 + Math.random() * 900000));
      const exists = await prisma.order.findFirst({
        where: { payment_id: code },
      });
      return exists ? generateSessionCode() : code;
    };
    const sessionCode = await generateSessionCode();

    // Garantizar perfil del comprador (usuario o invitado)
    await prisma.profile.upsert({
      where: { id: buyerId },
      update: {
        email: user?.email || shipping.email || "",
        name: shipping.name || user?.user_metadata?.name || null,
        phone: shipping.phone || null,
      },
      create: {
        id: buyerId,
        email: user?.email || shipping.email || "",
        name: shipping.name || user?.user_metadata?.name || null,
        phone: shipping.phone || null,
      },
    });

    // ── Fase 1: Prefetch de productos para poder agrupar antes de la tx ───────

    type ItemInput = {
      product_id?: string;
      id?: string;
      quantity?: number;
      company_id?: string;
      price?: number;
    };
    const enrichedItems = await Promise.all(
      (items as ItemInput[]).map(async (item) => {
        const productId = item.product_id || item.id;
        if (!productId) return null;

        const product = await prisma.product.findUnique({
          where: { id: productId },
          select: {
            id: true,
            title: true,
            seller_id: true,
            company_id: true,
            price: true,
            stock: true,
            status: true,
          },
        });

        return product ? { item, product } : null;
      }),
    );

    const validItems = enrichedItems.filter(Boolean) as Array<{
      item: ItemInput;
      product: {
        id: string;
        title: string;
        seller_id: string;
        company_id: string | null;
        price: unknown;
        stock: number | null;
        status: string;
      };
    }>;

    if (validItems.length === 0) {
      return NextResponse.json(
        { error: "Ninguno de los productos del carrito está disponible" },
        { status: 400 },
      );
    }

    // ── Fase 2: Agrupar por seller_id ────────────────────────────────────────
    // La clave de agrupación es siempre el seller_id del producto.
    // Cada proveedor (independientemente de si opera bajo empresa o no)
    // recibe un tracking code propio para despachar sus productos.

    const groupMap = new Map<string, typeof validItems>();
    for (const entry of validItems) {
      const key = entry.product.seller_id;
      if (!groupMap.has(key)) groupMap.set(key, []);
      groupMap.get(key)!.push(entry);
    }

    const groups = Array.from(groupMap.entries()); // [sellerId, items[]]

    // ── Fase 3: Transacción atómica ─────────────────────────────────────────

    const createdOrders = await prisma.$transaction(async (tx) => {
      const allOrders = [];

      for (let groupIndex = 0; groupIndex < groups.length; groupIndex++) {
        const [, groupItems] = groups[groupIndex];

        for (const { item, product } of groupItems) {
          const itemQuantity = Number(item.quantity) || 1;
          const currentStock = product.stock ?? 1;

          if (product.status !== "active" || currentStock < itemQuantity) {
            throw new Error(
              `Stock insuficiente para "${product.title}". Quedan ${Math.max(currentStock, 0)} unidades disponibles.`,
            );
          }

          // Descuento atómico de stock (evita race conditions)
          const updated = await tx.product.updateMany({
            where: { id: product.id, stock: { gte: itemQuantity } },
            data: { stock: { decrement: itemQuantity } },
          });

          if (updated.count === 0) {
            throw new Error(
              `El producto "${product.title}" se agotó mientras procesabas tu pedido.`,
            );
          }

          // Marcar como vendido si llega a 0
          const afterUpdate = await tx.product.findUnique({
            where: { id: product.id },
            select: { stock: true },
          });
          if ((afterUpdate?.stock ?? 0) <= 0) {
            await tx.product.update({
              where: { id: product.id },
              data: { status: "sold" },
            });
          }

          // Garantizar perfil del vendedor
          await tx.profile.upsert({
            where: { id: product.seller_id },
            update: {},
            create: {
              id: product.seller_id,
              email: `seller_${product.seller_id.slice(0, 8)}@iubizon.com`,
              name: "Vendedor iubizon",
            },
          });

          // Verificar company_id válida
          let validCompanyId: string | null = null;
          const targetCompanyId =
            product.company_id || (item as { company_id?: string }).company_id;
          if (targetCompanyId) {
            const companyExists = await tx.company.findUnique({
              where: { id: targetCompanyId },
              select: { id: true },
            });
            if (companyExists) validCompanyId = companyExists.id;
          }

          const unitPrice = Number(product.price);
          const itemSubtotal = unitPrice * itemQuantity;

          const order = await tx.order.create({
            data: {
              product_id: product.id,
              buyer_id: buyerId,
              seller_id: product.seller_id,
              company_id: validCompanyId,
              quantity: itemQuantity,
              unit_price: unitPrice,
              amount: itemSubtotal,
              commission: calculateIubizonCommission(itemSubtotal),
              status: "pending",
              payment_method: payment_method || "cash_on_delivery",
              payment_id: sessionCode,
              shipping: {
                create: {
                  origin_address: "Almacén / Proveedor",
                  destination_address: supplierDestination,
                  courier: null,
                  tracking_number: null,
                  status: "pending",
                },
              },
            },
            include: {
              shipping: true,
              product: { select: { title: true } },
            },
          });

          allOrders.push(order);
        }
      }

      return allOrders;
    });

    if (createdOrders.length === 0) {
      return NextResponse.json(
        { error: "No se pudieron procesar los productos del carrito" },
        { status: 400 },
      );
    }

    // Despacho de correos en segundo plano (no bloqueante)
    if (createdOrders[0]?.id) {
      sendOrderConfirmationEmails(createdOrders[0].id).catch((err) =>
        console.error(
          `[API Orders Email Error] Error enviando emails para orden ${createdOrders[0].id}:`,
          err,
        ),
      );
    }

    // ── Respuesta ──────────────────────────────────────────────────────────

    // Calcular totales globales
    const subtotal = (items as ItemInput[]).reduce(
      (sum, i) => sum + Number(i.price) * Number(i.quantity || 1),
      0,
    );
    const shippingCfg = await getShippingConfig();
    const shippingCost = shippingCfg.is_free ? 0.0 : shippingCfg.default_cost;
    const totalTax = 0;
    const totalAmount = subtotal + shippingCost;
    const totalCommission = subtotal * 0.1;

    // Construir resumen de grupos de tracking para mostrar en la UI
    const trackingGroups = groups.map(([sellerId, groupItems], index) => ({
      sellerId,
      trackingCode: `${sessionCode}-${String(index + 1).padStart(3, "0")}`,
      productCount: groupItems.reduce(
        (s, e) => s + (Number(e.item.quantity) || 1),
        0,
      ),
      productTitles: groupItems.map((e) => e.product.title),
    }));

    return NextResponse.json({
      success: true,
      orderCode: sessionCode,
      orderCount: createdOrders.length,
      trackingGroups,
      financials: {
        subtotal,
        shippingCost,
        taxAmount: totalTax,
        platformCommission: totalCommission,
        sellerEarnings: subtotal - totalCommission,
        totalAmount,
      },
    });
  } catch (err: unknown) {
    console.error("Error al registrar pedido:", err);
    const errorMessage =
      err instanceof Error
        ? err.message
        : "Error interno al procesar la compra";
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}
