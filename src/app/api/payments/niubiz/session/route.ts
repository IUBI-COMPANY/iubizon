import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { createNiubizSession } from "@/lib/services/niubiz";

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

    // Para compras como invitado sin estar autenticado
    const guestEmail = shipping?.email?.trim();
    const guestName = shipping?.name?.trim();

    if (!user && (!guestEmail || !guestName)) {
      return NextResponse.json(
        {
          error:
            "Por favor completa tu Nombre y Correo electrónico de contacto para proceder con tu compra como invitado.",
        },
        { status: 400 },
      );
    }

    const customerEmail = user?.email || guestEmail || "cliente@iubizon.com";
    const numericAmount = Number(amount);

    // Validar prevención de auto-compra para usuarios logueados
    if (user && Array.isArray(cartItems) && cartItems.length > 0) {
      const productIds = cartItems
        .map((i: { id?: string; product_id?: string }) => i.product_id || i.id)
        .filter((id): id is string => Boolean(id));

      const selfOwnedProduct = await prisma.product.findFirst({
        where: {
          id: { in: productIds },
          OR: [
            { seller_id: user.id },
            {
              company: {
                companyMembers: {
                  some: { user_id: user.id },
                },
              },
            },
          ],
        },
        select: { title: true },
      });

      if (selfOwnedProduct) {
        return NextResponse.json(
          {
            error: `No está permitido comprar tus propias publicaciones ("${selfOwnedProduct.title}").`,
          },
          { status: 400 },
        );
      }
    }

    // Generar código de orden numérico único de 6 dígitos (Ej: 918025)
    let purchaseNumber = String(Math.floor(100000 + Math.random() * 900000));
    let existingTx = await prisma.paymentTransaction.findUnique({
      where: { purchase_number: purchaseNumber },
    });
    while (existingTx) {
      purchaseNumber = String(Math.floor(100000 + Math.random() * 900000));
      existingTx = await prisma.paymentTransaction.findUnique({
        where: { purchase_number: purchaseNumber },
      });
    }

    // Obtener IP del cliente para CyberSource Fraud Prevention
    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0] ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    // 1. Obtener clave de sesión desde la API de Niubiz
    const { sessionKey, merchantId, environment } = await createNiubizSession({
      amount: numericAmount,
      purchaseNumber,
      customerEmail,
      customerIp: clientIp,
    });

    // 2. Registrar el intento de pago previo en PaymentTransaction junto con la data del carrito
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
