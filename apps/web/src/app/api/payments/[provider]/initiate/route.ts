import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { getPaymentProvider } from "@/lib/payments/registry";
import { generateOrderCode } from "@/lib/utils/orderCode";

/**
 * Inicia el pago con un proveedor (Niubiz, Culqi, ...).
 * POST /api/payments/[provider]/initiate
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ provider: string }> },
) {
  const { provider: providerId } = await params;

  try {
    const provider = getPaymentProvider(providerId);
    if (!provider) {
      return NextResponse.json(
        { error: "Proveedor de pago no soportado." },
        { status: 400 },
      );
    }

    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { amount, currency, cartItems, shipping, invoiceDetails, customer } =
      await req.json();

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

    // Evitar que un usuario compre sus propias publicaciones
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

    const customerEmail = guestEmail || user?.email || "cliente@iubizon.com";
    const numericAmount = Number(amount);
    const currencyValue = currency || "PEN";

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

    // Datos del cliente derivados del formulario de envío (requeridos por el
    // antifraude y el dataMap del proveedor).
    const customerData = customer || {
      email: customerEmail,
      documentNumber: shipping?.documentNumber,
      phone: shipping?.phone,
      address: shipping?.address,
      city: shipping?.district || shipping?.province,
      state: shipping?.department,
      country: "PE",
      registered: Boolean(user),
    };

    const result = await provider.initiate({
      amount: numericAmount,
      currency: currencyValue,
      purchaseNumber,
      customer: customerData,
      customerIp: clientIp,
      context: { cartItems, shipping, invoiceDetails },
    });

    await prisma.paymentTransaction.create({
      data: {
        provider: providerId,
        transaction_type: "authorization",
        status: "pending",
        purchase_number: purchaseNumber,
        amount: numericAmount,
        currency: currencyValue,
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
      ...result,
      purchaseNumber,
      amount: numericAmount,
    });
  } catch (err: unknown) {
    const msg =
      err instanceof Error ? err.message : "Error al iniciar el pago.";
    console.error(`Error en API /api/payments/${providerId}/initiate:`, err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
