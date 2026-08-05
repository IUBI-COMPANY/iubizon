import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { authorizeNiubizTransaction } from "@/lib/services/niubiz";
import { calculateIubizonCommission } from "@/lib/utils/commission";
import { getOrCreateBuyerProfile } from "@/lib/services/orders";
import { sendOrderConfirmationEmails } from "@/lib/email";
import { normalizeOrderCode } from "@/lib/utils/orderCode";

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
  let purchaseNumberForError = "";
  let paymentAuthorized = false;
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
    const normalizedPurchaseNumber = normalizeOrderCode(purchaseNumber);
    if (normalizedPurchaseNumber) {
      purchaseNumber = normalizedPurchaseNumber;
    }
    purchaseNumberForError = purchaseNumber;
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
      purchaseNumberForError = purchaseNumber;
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
    if (!/^\d{6}$/.test(purchaseNumber)) {
      return respondWithError(
        "El código de orden debe tener 6 dígitos numéricos.",
        isFormPost,
        req.url,
        400,
      );
    }

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return respondWithError(
        "No se encontraron productos en la compra.",
        isFormPost,
        req.url,
        400,
      );
    }

    const shippingDepartment = String(shipping?.department || "").trim();
    const isProvinceDelivery =
      shippingDepartment.length > 0 &&
      shippingDepartment.toLowerCase() !== "lima";
    if (isProvinceDelivery) {
      const shippingDocType = String(shipping?.documentType || "").trim();
      const shippingDocNumber = String(shipping?.documentNumber || "").trim();
      const isValidDni =
        shippingDocType === "dni" && /^\d{8}$/.test(shippingDocNumber);
      const isValidRuc =
        shippingDocType === "ruc" && /^\d{11}$/.test(shippingDocNumber);
      if (!isValidDni && !isValidRuc) {
        return respondWithError(
          "Para envíos a provincia es obligatorio registrar un DNI (8 dígitos) o RUC (11 dígitos) válido.",
          isFormPost,
          req.url,
          400,
        );
      }
    }

    const requestedItems = cartItems
      .map((item) => ({
        productId: extractProductUuid(item),
        quantity: Number(item?.quantity) || 1,
      }))
      .filter((item): item is { productId: string; quantity: number } =>
        Boolean(item.productId),
      );

    if (requestedItems.length === 0) {
      return respondWithError(
        "Los productos del carrito no son válidos o ya no están disponibles.",
        isFormPost,
        req.url,
        400,
      );
    }

    const productsBeforeAuth = await prisma.product.findMany({
      where: { id: { in: requestedItems.map((item) => item.productId) } },
      select: { id: true, title: true, status: true, stock: true },
    });
    const productsBeforeAuthMap = new Map(
      productsBeforeAuth.map((product) => [product.id, product]),
    );

    for (const item of requestedItems) {
      const product = productsBeforeAuthMap.get(item.productId);
      if (!product || product.status !== "active") {
        return respondWithError(
          "Uno o más productos de tu carrito ya no están disponibles.",
          isFormPost,
          req.url,
          400,
        );
      }
      if (product.stock !== null && product.stock < item.quantity) {
        return respondWithError(
          `Stock insuficiente para "${product.title}". Quedan ${Math.max(product.stock, 0)} unidades disponibles.`,
          isFormPost,
          req.url,
          400,
        );
      }
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
    paymentAuthorized = true;

    // 3. Pago APROBADO: Transacción atómica en PostgreSQL
    const sessionCode = purchaseNumber;
    const destinationUbigeo = [
      String(shipping?.district || "").trim(),
      String(shipping?.province || "").trim(),
      String(shipping?.department || "").trim(),
    ]
      .filter(Boolean)
      .join(", ");

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
            title: true,
            seller_id: true,
            company_id: true,
            status: true,
            stock: true,
            price: true,
          },
        });

        if (!product || product.status !== "active") {
          throw new Error(
            "Uno o más productos de tu carrito ya no están disponibles.",
          );
        }

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

        if (product.stock !== null) {
          const stockUpdated = await tx.product.updateMany({
            where: {
              id: product.id,
              status: "active",
              stock: { gte: itemQuantity },
            },
            data: { stock: { decrement: itemQuantity } },
          });

          if (stockUpdated.count === 0) {
            throw new Error(
              `El producto "${product.title}" se agotó mientras procesabas tu pedido.`,
            );
          }

          const afterStockUpdate = await tx.product.findUnique({
            where: { id: product.id },
            select: { stock: true },
          });
          if ((afterStockUpdate?.stock ?? 0) <= 0) {
            await tx.product.update({
              where: { id: product.id },
              data: { status: "sold" },
            });
          }
        }

        const order = await tx.order.create({
          data: {
            product_id: product.id,
            buyer_id: effectiveBuyerId,
            seller_id: product.seller_id,
            company_id: validCompanyId,
            payment_transaction_id: paymentRecord.id,
            quantity: itemQuantity,
            unit_price: Number(product.price),
            amount: itemSubtotal,
            commission: commissionAmount,
            status: "paid",
            payment_method: "niubiz_card",
            payment_id: sessionCode,
            shipping: {
              create: {
                origin_address: "Almacén / Proveedor",
                destination_address: `${shipping.address || ""}, ${destinationUbigeo || shipping.city || "Lima"} (Tel: ${shipping.phone || ""})`,
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
        ordersList.push(order);
      }

      if (ordersList.length === 0) {
        throw new Error(
          "No se pudo registrar ninguna orden para los productos pagados.",
        );
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
    if (paymentAuthorized && purchaseNumberForError) {
      try {
        await prisma.paymentTransaction.updateMany({
          where: { purchase_number: purchaseNumberForError },
          data: {
            status: "failed",
            response_message: msg,
          },
        });
      } catch (paymentUpdateError) {
        console.error(
          "Error actualizando paymentTransaction tras fallo post-autorización:",
          paymentUpdateError,
        );
      }
    }
    console.error("Error en API /api/payments/niubiz/authorize:", err);
    return respondWithError(msg, isFormPost, req.url, 500);
  }
}
