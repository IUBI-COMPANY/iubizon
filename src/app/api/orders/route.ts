import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import {
  createFullOrder,
  getOrCreateBuyerProfile,
} from "@/lib/services/orders";
import { getShippingConfig } from "@/lib/services/platformSettings";
import { generateOrderCode } from "@/lib/utils/orderCode";
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

    const shippingDocType = String(shipping.documentType || "").trim();
    const shippingDocNumber = String(shipping.documentNumber || "").trim();
    const isValidDni =
      shippingDocType === "dni" && /^\d{8}$/.test(shippingDocNumber);
    const isValidRuc =
      shippingDocType === "ruc" && /^\d{11}$/.test(shippingDocNumber);
    if (!isValidDni && !isValidRuc) {
      return NextResponse.json(
        { error: "El DNI (8 dígitos) o RUC (11 dígitos) del destinatario es obligatorio." },
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

    if (invoice_type === "boleta" || !invoice_type) {
      const orderSubtotal = (
        items as Array<{ price: number; quantity?: number }>
      ).reduce((sum, i) => sum + Number(i.price) * Number(i.quantity || 1), 0);
      if (
        orderSubtotal + 50 > 700 &&
        (!invoice_dni || !String(invoice_dni).trim())
      ) {
        return NextResponse.json(
          {
            error:
              "Para pedidos mayores a S/ 700, la SUNAT exige el número de documento del comprador en la boleta.",
          },
          { status: 400 },
        );
      }
    }

    type ItemInput = {
      product_id?: string;
      id?: string;
      quantity?: number;
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
        company_id: string;
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

    // Agrupar por company_id (cada empresa = un paquete)
    const IUBIZON_WAREHOUSE = "Almacén iubizon – Av. Industrial 2340, Lima 15";
    const isCompleteDelivery = delivery_type === "complete";
    const destinationUbigeo = [
      String(shipping.district || "").trim(),
      String(shipping.province || "").trim(),
      String(shipping.department || "").trim(),
    ]
      .filter(Boolean)
      .join(", ");
    const supplierDestination = isCompleteDelivery
      ? IUBIZON_WAREHOUSE
      : `${shipping.address}, ${destinationUbigeo || shipping.city || "Lima"} (Ref: ${shipping.notes || "Sin ref"})`;

    const groupMap = new Map<string, typeof validItems>();
    for (const entry of validItems) {
      const key = entry.product.company_id;
      if (!groupMap.has(key)) groupMap.set(key, []);
      groupMap.get(key)!.push(entry);
    }

    // Generar order_code único
    let orderCode = generateOrderCode();
    while (
      await prisma.order.findUnique({
        where: { order_code: orderCode },
        select: { id: true },
      })
    ) {
      orderCode = generateOrderCode();
    }

    const createdOrder = await prisma.$transaction(async (tx) => {
      // Validar stock y descontar
      for (const [companyId, groupItems] of groupMap) {
        for (const { item, product } of groupItems) {
          const itemQuantity = Number(item.quantity) || 1;
          const currentStock = product.stock ?? 1;

          if (product.status !== "active" || currentStock < itemQuantity) {
            throw new Error(
              `Stock insuficiente para "${product.title}". Quedan ${Math.max(currentStock, 0)} unidades disponibles.`,
            );
          }

          const updated = await tx.product.updateMany({
            where: { id: product.id, stock: { gte: itemQuantity } },
            data: { stock: { decrement: itemQuantity } },
          });

          if (updated.count === 0) {
            throw new Error(
              `El producto "${product.title}" se agotó mientras procesabas tu pedido.`,
            );
          }

          const after = await tx.product.findUnique({
            where: { id: product.id },
            select: { stock: true },
          });
          if ((after?.stock ?? 0) <= 0) {
            await tx.product.update({
              where: { id: product.id },
              data: { status: "sold" },
            });
          }
        }
      }

      const packages = Array.from(groupMap.entries()).map(
        ([companyId, groupItems]) => ({
          companyId,
          deliveryType: delivery_type || "progressive",
          destinationAddress: supplierDestination,
          items: groupItems.map(({ item, product }) => ({
            productId: product.id,
            quantity: Number(item.quantity) || 1,
            unitPrice: Number(product.price),
          })),
        }),
      );

      return createFullOrder({
        orderCode,
        buyerId,
        paymentMethod: payment_method || "cash_on_delivery",
        initialStatus: "pending",
        shipping: {
          name: shipping.name,
          phone: shipping.phone,
          email: shipping.email,
          address: shipping.address,
          department: shipping.department,
          province: shipping.province,
          district: shipping.district,
          reference: shipping.notes,
          documentType: shipping.documentType,
          documentNumber: shipping.documentNumber,
        },
        invoice: {
          type: invoice_type,
          docType: invoice_doc_type,
          number: invoice_dni || invoice_ruc,
          legalName: invoice_company_name,
          taxAddress: shipping.address,
        },
        packages,
        txPrisma: tx,
      });
    });

    sendOrderConfirmationEmails(createdOrder.id).catch((err) =>
      console.error(`[API Orders Email Error] ${createdOrder.id}:`, err),
    );

    const shippingCfg = await getShippingConfig();
    const shippingCost = shippingCfg.is_free ? 0.0 : shippingCfg.default_cost;
    const subtotal = Number(createdOrder.subtotal);

    return NextResponse.json({
      success: true,
      orderCode: createdOrder.order_code,
      orderId: createdOrder.id,
      packageCount: createdOrder.packages.length,
      packages: createdOrder.packages.map((pkg) => ({
        packageId: pkg.id,
        companyId: pkg.company_id,
        itemCount: pkg.items.length,
        productTitles: pkg.items.map(
          (i) => (i.product as { title: string }).title,
        ),
      })),
      financials: {
        subtotal,
        shippingCost,
        taxAmount: 0,
        platformCommission: subtotal * 0.09,
        sellerEarnings: subtotal - subtotal * 0.09,
        totalAmount: subtotal + shippingCost,
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
