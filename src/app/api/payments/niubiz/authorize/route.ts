import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { authorizeNiubizTransaction } from "@/lib/services/niubiz";
import { calculateIubizonCommission } from "@/lib/utils/commission";
import { getOrCreateBuyerProfile } from "@/lib/services/orders";
import { sendOrderConfirmationEmails } from "@/lib/email";

function respondWithError(
  message: string,
  isFormPost: boolean,
  requestUrl: string,
  status = 400,
) {
  if (isFormPost) {
    const targetUrl = new URL("/cart", requestUrl);
    targetUrl.searchParams.set("error", message);
    return NextResponse.redirect(targetUrl, 303);
  }
  return NextResponse.json({ error: message }, { status });
}

function extractProductUuid(item: any): string | null {
  if (!item) return null;
  const isUuid = (str: string) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

  const directId = item.product_id || item.productId || item.product?.id;
  if (typeof directId === "string" && isUuid(directId)) {
    return directId;
  }

  const itemId = String(item.id || "");
  if (isUuid(itemId)) {
    return itemId;
  }

  const match = itemId.match(
    /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i,
  );
  if (match) {
    return match[0];
  }

  return null;
}

export async function POST(req: Request) {
  let isFormPost = false;
  try {
    const contentType = req.headers.get("content-type") || "";
    isFormPost = !contentType.includes("application/json");

    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let transactionToken = "";
    let purchaseNumber = "";
    let amount = 0;
    let cartItems: any[] = [];
    let shipping: any = {};
    let invoiceDetails: any = {};

    const url = new URL(req.url);
    const searchPurchaseNumber = url.searchParams.get("purchaseNumber");
    const searchAmount = url.searchParams.get("amount");

    if (!isFormPost) {
      const body = await req.json();
      transactionToken = body.transactionToken;
      purchaseNumber = body.purchaseNumber;
      amount = Number(body.amount) || 0;
      cartItems = body.cartItems || [];
      shipping = body.shipping || {};
      invoiceDetails = body.invoiceDetails || {};
    } else {
      const formData = await req.formData();
      transactionToken = String(
        formData.get("transactionToken") ||
          formData.get("transactiontoken") ||
          "",
      );
      purchaseNumber = String(
        formData.get("purchaseNumber") || formData.get("purchasenumber") || "",
      );
      amount = Number(formData.get("amount")) || 0;
    }

    if (!purchaseNumber && searchPurchaseNumber) {
      purchaseNumber = searchPurchaseNumber;
    }
    if (!amount && searchAmount) {
      amount = Number(searchAmount);
    }

    // Buscar la transacción previa en BD para recuperar metadatos (cartItems, shipping, buyer_id)
    const existingTx = purchaseNumber
      ? await prisma.paymentTransaction.findUnique({
          where: { purchase_number: purchaseNumber },
        })
      : await prisma.paymentTransaction.findFirst({
          where: { status: "pending", provider: "niubiz" },
          orderBy: { created_at: "desc" },
        });

    let storedBuyerId: string | null = user?.id || null;

    if (existingTx) {
      if (!purchaseNumber) purchaseNumber = existingTx.purchase_number;
      if (!amount) amount = Number(existingTx.amount);

      if (
        existingTx.raw_response &&
        typeof existingTx.raw_response === "object"
      ) {
        const meta = existingTx.raw_response as Record<string, any>;
        if (
          (!cartItems || cartItems.length === 0) &&
          Array.isArray(meta.cartItems)
        ) {
          cartItems = meta.cartItems;
        }
        if ((!shipping || !shipping.address) && meta.shipping) {
          shipping = meta.shipping;
        }
        if (
          (!invoiceDetails || !invoiceDetails.doc_type) &&
          meta.invoiceDetails
        ) {
          invoiceDetails = meta.invoiceDetails;
        }
        if (!storedBuyerId && meta.buyer_id) {
          storedBuyerId = meta.buyer_id;
        }
      }
    }

    if (!transactionToken || !purchaseNumber) {
      return respondWithError(
        "Datos de transacción incompletos",
        isFormPost,
        req.url,
        400,
      );
    }

    const effectiveEmail =
      shipping?.email?.trim() ||
      (
        existingTx?.raw_response as Record<string, any>
      )?.shipping?.email?.trim() ||
      (existingTx?.raw_response as Record<string, any>)?.buyer_email?.trim() ||
      user?.email ||
      "cliente@iubizon.com";

    // 1. Autorización financiera Server-to-Server en Niubiz
    const authResult = await authorizeNiubizTransaction({
      transactionToken,
      purchaseNumber,
      amount: Number(amount),
      customerEmail: effectiveEmail,
    });

    // 2. Si la tarjeta fue rechazada o denegada
    if (!authResult.success) {
      await prisma.paymentTransaction.updateMany({
        where: { purchase_number: purchaseNumber },
        data: {
          status: "denied",
          response_code: authResult.errorCode,
          response_message: authResult.errorMessage,
          raw_response: authResult.rawResponse
            ? JSON.parse(JSON.stringify(authResult.rawResponse))
            : undefined,
        },
      });

      return respondWithError(
        authResult.errorMessage || "Pago rechazado por el banco emisor",
        isFormPost,
        req.url,
        400,
      );
    }

    // 3. Pago APROBADO: Transacción atómica en PostgreSQL
    const sessionCode = purchaseNumber;

    const createdOrders = await prisma.$transaction(async (tx) => {
      const previousRaw =
        typeof existingTx?.raw_response === "object" && existingTx?.raw_response
          ? (existingTx.raw_response as Record<string, any>)
          : {};

      // a) Actualizar el registro del pago a 'authorized' manteniendo los datos de envío y facturación
      const paymentRecord = await tx.paymentTransaction.update({
        where: { purchase_number: purchaseNumber },
        data: {
          status: "authorized",
          transaction_id: authResult.transactionId,
          authorization_code: authResult.authorizationCode,
          card_brand: authResult.cardBrand,
          card_last4: authResult.cardLast4,
          response_code: "000",
          response_message: "Transacción aprobada",
          raw_response: {
            ...previousRaw,
            shipping: shipping || previousRaw.shipping || {},
            invoiceDetails: invoiceDetails || previousRaw.invoiceDetails || {},
            buyer_email: effectiveEmail,
            niubiz_auth: authResult.rawResponse
              ? JSON.parse(JSON.stringify(authResult.rawResponse))
              : undefined,
          },
        },
      });

      const ordersList = [];
      const effectiveBuyerId = await getOrCreateBuyerProfile({
        userId: storedBuyerId || user?.id,
        email: effectiveEmail,
        name: shipping?.name,
        phone: shipping?.phone,
        txPrisma: tx,
      });

      // b) Generar órdenes por cada ítem/paquete del carrito
      for (const item of cartItems) {
        const itemQuantity = Number(item.quantity) || 1;
        const productId = extractProductUuid(item);
        if (!productId) continue;

        const product = await tx.product.findUnique({
          where: { id: productId },
          select: {
            id: true,
            seller_id: true,
            company_id: true,
            stock: true,
            price: true,
          },
        });

        if (!product) continue;

        let validCompanyId: string | null = null;
        const targetCompanyId = product.company_id || item.company_id;
        if (targetCompanyId) {
          const companyExists = await tx.company.findUnique({
            where: { id: targetCompanyId },
            select: { id: true },
          });
          if (companyExists) validCompanyId = companyExists.id;
        }

        const itemSubtotal = Number(product.price) * itemQuantity;
        const commissionAmount = calculateIubizonCommission(itemSubtotal);

        const order = await tx.order.create({
          data: {
            product_id: product.id,
            buyer_id: effectiveBuyerId,
            seller_id: product.seller_id,
            company_id: validCompanyId,
            payment_transaction_id: paymentRecord.id,
            amount: itemSubtotal,
            commission: commissionAmount,
            status: "paid",
            payment_method: "niubiz_card",
            payment_id: sessionCode,
            shipping: {
              create: {
                origin_address: "Almacén / Proveedor",
                destination_address: `${shipping.address || ""}, ${shipping.city || "Lima"} (Tel: ${shipping.phone || ""})`,
                courier: null,
                tracking_number: null,
                status: "pending",
              },
            },
          },
        });

        // c) Generar comprobante fiscal SUNAT (InvoiceDocument)
        if (invoiceDetails && invoiceDetails.doc_type) {
          await tx.invoiceDocument.create({
            data: {
              order_id: order.id,
              doc_type: invoiceDetails.doc_type || "boleta",
              identity_type: invoiceDetails.identity_type || "dni",
              identity_number: invoiceDetails.identity_number || "00000000",
              legal_name:
                invoiceDetails.legal_name || shipping.name || "Cliente Final",
              tax_address:
                invoiceDetails.tax_address || shipping.address || null,
              sunat_status: "pending",
            },
          });
        }

        // d) Descontar stock
        if (product.stock !== null && product.stock >= itemQuantity) {
          await tx.product.update({
            where: { id: product.id },
            data: { stock: product.stock - itemQuantity },
          });
        }

        ordersList.push(order);
      }

      return ordersList;
    });

    // Despacho de correos en segundo plano (no bloqueante)
    sendOrderConfirmationEmails(purchaseNumber).catch((err) =>
      console.error(
        `[Niubiz Authorize Email Error] Error enviando emails para ${purchaseNumber}:`,
        err,
      ),
    );

    if (isFormPost) {
      return NextResponse.redirect(
        new URL(`/cart/success?order_code=${purchaseNumber}`, req.url),
        303,
      );
    }

    return NextResponse.json({
      success: true,
      orderCode: purchaseNumber,
      sessionCode,
      ordersCount: createdOrders.length,
      authorizationCode: authResult.authorizationCode,
    });
  } catch (err: unknown) {
    const msg =
      err instanceof Error
        ? err.message
        : "Error al autorizar el pago con Niubiz";
    console.error("Error en API /api/payments/niubiz/authorize:", err);
    return respondWithError(msg, isFormPost, req.url, 500);
  }
}
