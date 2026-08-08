import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { createNiubizSession } from "@/lib/services/niubiz";
import { generateOrderCode } from "@/lib/utils/orderCode";

export async function POST(req: Request) {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { amount, cartItems, shipping, invoiceDetails } = await req.json();

    if (!amount || Number(amount) <= 0) {
      return NextResponse.json(
        { error: "Monto de transacción inválido" },
        { status: 400 },
      );
    }

    const guestEmail = shipping?.email?.trim();
    const guestName = shipping?.name?.trim();

    if (!user && (!guestEmail || !guestName)) {
      return NextResponse.json(
        {
          error:
            "Por favor completa tu Nombre y Correo electrónico para proceder con tu compra como invitado.",
        },
        { status: 400 },
      );
    }
    const shippingDocType = String(shipping?.documentType || "").trim();
    const shippingDocNumber = String(shipping?.documentNumber || "").trim();
    const isValidDni =
      shippingDocType === "dni" && /^\d{8}$/.test(shippingDocNumber);
    const isValidRuc =
      shippingDocType === "ruc" && /^\d{11}$/.test(shippingDocNumber);
    if (!isValidDni && !isValidRuc) {
      return NextResponse.json(
        {
          error:
            "El DNI (8 dígitos) o RUC (11 dígitos) del destinatario es obligatorio.",
        },
        { status: 400 },
      );
    }

    const customerEmail = guestEmail || user?.email || "cliente@iubizon.com";
    const numericAmount = Number(amount);

    if (user && Array.isArray(cartItems) && cartItems.length > 0) {
      const productIds = cartItems
        .map((i: { id?: string; product_id?: string }) => i.product_id || i.id)
        .filter((id): id is string => Boolean(id));

      const products = await prisma.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, company_id: true, title: true },
      });

      for (const product of products) {
        const isMember = await prisma.companyMember.findFirst({
          where: { company_id: product.company_id, user_id: user.id },
        });
        if (isMember) {
          return NextResponse.json(
            {
              error: `No está permitido comprar tus propias publicaciones ("${product.title}").`,
            },
            { status: 400 },
          );
        }
      }
    }

    let purchaseNumber = generateOrderCode();
    while (
      await prisma.paymentTransaction.findUnique({
        where: { purchase_number: purchaseNumber },
      })
    ) {
      purchaseNumber = generateOrderCode();
    }

    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0] ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    const { sessionKey, merchantId, environment } = await createNiubizSession({
      amount: numericAmount,
      purchaseNumber,
      customerEmail,
      customerIp: clientIp,
    });

    await prisma.paymentTransaction.create({
      data: {
        provider: "niubiz",
        transaction_type: "authorization",
        status: "pending",
        purchase_number: purchaseNumber,
        amount: numericAmount,
        currency: "PEN",
        customer_ip: clientIp,
        raw_response: {
          cartItems: cartItems || [],
          shipping: shipping || {},
          invoiceDetails: invoiceDetails || {},
          buyer_id: user?.id || null,
          buyer_email: customerEmail,
        },
      },
    });

    return NextResponse.json({
      sessionKey,
      merchantId,
      purchaseNumber,
      amount: numericAmount,
      environment,
    });
  } catch (err: unknown) {
    const msg =
      err instanceof Error
        ? err.message
        : "Error al iniciar sesión de pago Niubiz";
    console.error("Error en API /api/payments/niubiz/session:", err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
