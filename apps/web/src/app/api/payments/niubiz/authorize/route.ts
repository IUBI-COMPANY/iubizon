import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { authorizeNiubizTransaction } from "@/lib/services/niubiz";
import {
  createFullOrder,
  getOrCreateBuyerProfile,
} from "@/lib/services/orders";
import { sendOrderConfirmationEmails } from "@/lib/email";
import { normalizeOrderCode, generateOrderCode } from "@/lib/utils/orderCode";
import { aggregateOrderFinancials } from "@/lib/utils/commission";

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
  if (typeof directId === "string" && isUuid(directId)) return directId;

  const itemId = String(item.id || "");
  if (isUuid(itemId)) return itemId;

  const match = itemId.match(
    /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i,
  );
  if (match) return match[0];

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

    if (!purchaseNumber && searchPurchaseNumber)
      purchaseNumber = searchPurchaseNumber;
    const normalized = normalizeOrderCode(purchaseNumber);
    if (normalized) purchaseNumber = normalized;
    purchaseNumberForError = purchaseNumber;
    if (!amount && searchAmount) amount = Number(searchAmount);

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
        )
          cartItems = meta.cartItems;
        if ((!shipping || !shipping.address) && meta.shipping)
          shipping = meta.shipping;
        if (
          (!invoiceDetails || !invoiceDetails.doc_type) &&
          meta.invoiceDetails
        )
          invoiceDetails = meta.invoiceDetails;
        if (!storedBuyerId && meta.buyer_id) storedBuyerId = meta.buyer_id;
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

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return respondWithError(
        "No se encontraron productos en la compra.",
        isFormPost,
        req.url,
        400,
      );
    }

    const shippingDocType = String(shipping?.documentType || "").trim();
    const shippingDocNumber = String(shipping?.documentNumber || "").trim();
    const isValidDni =
      shippingDocType === "dni" && /^\d{8}$/.test(shippingDocNumber);
    const isValidRuc =
      shippingDocType === "ruc" && /^\d{11}$/.test(shippingDocNumber);
    if (!isValidDni && !isValidRuc) {
      return respondWithError(
        "El DNI (8 dígitos) o RUC (11 dígitos) del destinatario es obligatorio.",
        isFormPost,
        req.url,
      );
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
        "Los productos del carrito no son válidos.",
        isFormPost,
        req.url,
        400,
      );
    }

    const productsData = await prisma.product.findMany({
      where: { id: { in: requestedItems.map((r) => r.productId) } },
      select: {
        id: true,
        title: true,
        status: true,
        stock: true,
        company_id: true,
        price: true,
      },
    });
    const productMap = new Map(productsData.map((p) => [p.id, p]));

    for (const item of requestedItems) {
      const product = productMap.get(item.productId);
      if (!product || product.status !== "active") {
        return respondWithError(
          "Uno o más productos ya no están disponibles.",
          isFormPost,
          req.url,
          400,
        );
      }
      if (product.stock !== null && product.stock < item.quantity) {
        return respondWithError(
          `Stock insuficiente para "${product.title}". Quedan ${Math.max(product.stock, 0)} unidades.`,
          isFormPost,
          req.url,
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

    const authResult = await authorizeNiubizTransaction({
      transactionToken,
      purchaseNumber,
      amount: Number(amount),
      customerEmail: effectiveEmail,
    });

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

      const actionDescription =
        authResult.actionDescription ||
        authResult.errorMessage ||
        "Pago rechazado por el banco emisor";
      const transactionDate = new Date().toISOString();

      if (isFormPost) {
        const targetUrl = new URL("/cart/result", req.url);
        targetUrl.searchParams.set("status", "denied");
        targetUrl.searchParams.set("purchaseNumber", purchaseNumber);
        targetUrl.searchParams.set("actionDescription", actionDescription);
        targetUrl.searchParams.set("transactionDate", transactionDate);
        return NextResponse.redirect(targetUrl, 303);
      }

      return NextResponse.json(
        {
          error: actionDescription,
          denied: true,
          purchaseNumber,
          transactionDate,
          actionDescription,
        },
        { status: 400 },
      );
    }
    paymentAuthorized = true;

    const destinationUbigeo = [
      String(shipping?.district || "").trim(),
      String(shipping?.province || "").trim(),
      String(shipping?.department || "").trim(),
    ]
      .filter(Boolean)
      .join(", ");
    const destinationAddress = `${shipping.address || ""}, ${destinationUbigeo || shipping.city || "Lima"} (Tel: ${shipping.phone || ""})`;

    const createdOrder = await prisma.$transaction(async (tx) => {
      const previousRaw =
        typeof existingTx?.raw_response === "object" && existingTx?.raw_response
          ? (existingTx.raw_response as Record<string, any>)
          : {};

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

      const effectiveBuyerId = await getOrCreateBuyerProfile({
        userId: storedBuyerId || user?.id,
        email: effectiveEmail,
        name: shipping?.name,
        phone: shipping?.phone,
        txPrisma: tx,
      });

      // Validar y descontar stock
      for (const item of requestedItems) {
        const product = productMap.get(item.productId);
        if (!product || product.status !== "active") {
          throw new Error(
            "Uno o más productos de tu carrito ya no están disponibles.",
          );
        }

        const currentStock = product.stock ?? 1;
        if (currentStock < item.quantity) {
          throw new Error(
            `El producto "${product.title}" se agotó mientras procesabas tu pedido.`,
          );
        }
      }

      // Agrupar por company_id
      const groupMap = new Map<string, typeof requestedItems>();
      for (const item of requestedItems) {
        const product = productMap.get(item.productId)!;
        const key = product.company_id;
        if (!groupMap.has(key)) groupMap.set(key, []);
        groupMap.get(key)!.push(item);
      }

      // Descontar stock atómicamente
      for (const [companyId, items] of groupMap) {
        for (const item of items) {
          const stockUpdated = await tx.product.updateMany({
            where: {
              id: item.productId,
              status: "active",
              stock: { gte: item.quantity },
            },
            data: { stock: { decrement: item.quantity } },
          });

          if (stockUpdated.count === 0) {
            throw new Error(
              `El producto "${productsData.find((p) => p.id === item.productId)?.title}" se agotó.`,
            );
          }

          const afterStock = await tx.product.findUnique({
            where: { id: item.productId },
            select: { stock: true },
          });
          if ((afterStock?.stock ?? 0) <= 0) {
            await tx.product.update({
              where: { id: item.productId },
              data: { status: "sold" },
            });
          }
        }
      }

      const packages = Array.from(groupMap.entries()).map(
        ([companyId, items]) => ({
          companyId,
          deliveryType: shipping?.deliveryType || "progressive",
          destinationAddress,
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: Number(productMap.get(item.productId)!.price),
          })),
        }),
      );

      return createFullOrder({
        orderCode: purchaseNumber,
        buyerId: effectiveBuyerId,
        paymentMethod: "niubiz_card",
        paymentTransactionId: paymentRecord.id,
        initialStatus: "pending",
        shipping: {
          name: shipping?.name || "Cliente",
          phone: shipping?.phone || "",
          email: shipping?.email,
          address: shipping?.address || "",
          department: shipping?.department,
          province: shipping?.province,
          district: shipping?.district,
          reference: shipping?.notes,
          documentType: shipping?.documentType,
          documentNumber: shipping?.documentNumber,
        },
        invoice: {
          type: invoiceDetails?.doc_type,
          docType: invoiceDetails?.identity_type,
          number: invoiceDetails?.identity_number,
          legalName: invoiceDetails?.legal_name,
          taxAddress: invoiceDetails?.tax_address || shipping?.address,
        },
        packages,
        txPrisma: tx,
      });
    });

    sendOrderConfirmationEmails(createdOrder.id).catch((err) =>
      console.error(`[Niubiz Authorize Email Error] ${createdOrder.id}:`, err),
    );

    if (isFormPost) {
      return NextResponse.redirect(
        new URL(`/cart/result?order_code=${purchaseNumber}`, req.url),
        303,
      );
    }

    return NextResponse.json({
      success: true,
      orderCode: createdOrder.order_code,
      orderId: createdOrder.id,
      ordersCount: createdOrder.packages.reduce(
        (s, p) => s + p.items.length,
        0,
      ),
      authorizationCode: authResult.authorizationCode,
      financials: aggregateOrderFinancials(createdOrder.packages),
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
          data: { status: "failed", response_message: msg },
        });
      } catch {}
    }
    console.error("Error en API /api/payments/niubiz/authorize:", err);
    return respondWithError(msg, isFormPost, req.url, 500);
  }
}
