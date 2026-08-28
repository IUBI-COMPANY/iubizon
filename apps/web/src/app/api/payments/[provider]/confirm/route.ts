import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { getPaymentProvider } from "@/lib/payments/registry";
import { completeOrderFromPayment } from "@/lib/payments/orderCreation";
import { sendOrderConfirmationEmails } from "@/lib/email";
import { normalizeOrderCode } from "@/lib/utils/orderCode";
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

/**
 * Confirma/autoriza el pago con un proveedor y crea la orden.
 * POST /api/payments/[provider]/confirm
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ provider: string }> },
) {
  const { provider: providerId } = await params;
  let isFormPost = false;
  let purchaseNumberForError = "";
  let paymentAuthorized = false;

  try {
    const provider = getPaymentProvider(providerId);
    if (!provider) {
      return NextResponse.json(
        { error: "Proveedor de pago no soportado." },
        { status: 400 },
      );
    }

    const contentType = req.headers.get("content-type") || "";
    isFormPost = !contentType.includes("application/json");

    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let transactionToken = "";
    let chargeToken = "";
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
      transactionToken = body.transactionToken || "";
      chargeToken = body.chargeToken || "";
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
          where: { status: "pending", provider: providerId },
          orderBy: { created_at: "desc" },
        });

    let storedBuyerId: string | null = null;

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
        if (meta.buyer_id) storedBuyerId = meta.buyer_id;
      }
    }

    if (!storedBuyerId && user?.id) {
      storedBuyerId = user.id;
    }

    if ((!transactionToken && !chargeToken) || !purchaseNumber) {
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

    const effectiveEmail =
      shipping?.email?.trim() ||
      (
        existingTx?.raw_response as Record<string, any>
      )?.shipping?.email?.trim() ||
      (existingTx?.raw_response as Record<string, any>)?.buyer_email?.trim() ||
      user?.email ||
      "cliente@iubizon.com";

    const confirmResult = await provider.confirm({
      purchaseNumber,
      amount: Number(amount),
      currency: existingTx?.currency ?? undefined,
      transactionToken,
      chargeToken,
      context: { cartItems, shipping, invoiceDetails },
    });

    if (!confirmResult.success) {
      await prisma.paymentTransaction.updateMany({
        where: { purchase_number: purchaseNumber },
        data: {
          status: "denied",
          response_code: confirmResult.errorCode,
          response_message: confirmResult.errorMessage,
          raw_response: confirmResult.rawResponse
            ? JSON.parse(JSON.stringify(confirmResult.rawResponse))
            : undefined,
        },
      });

      const actionDescription =
        confirmResult.actionDescription ||
        confirmResult.errorMessage ||
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

    const createdOrder = await completeOrderFromPayment({
      providerId,
      purchaseNumber,
      effectiveEmail,
      buyerUserId: (storedBuyerId || user?.id)!,
      cartItems,
      shipping,
      invoiceDetails,
      paymentMethod: `${providerId}_card`,
      confirmResult,
      existingRawResponse: existingTx?.raw_response,
    });

    sendOrderConfirmationEmails(createdOrder.id).catch((err) =>
      console.error(`[Payments Confirm Email Error] ${createdOrder.id}:`, err),
    );

    const paymentSummary = {
      orderCode: createdOrder.order_code,
      amount: Number(amount),
      currency: existingTx?.currency ?? "PEN",
      cardBrand: confirmResult.cardBrand ?? null,
      cardLast4: confirmResult.cardLast4 ?? null,
      transactionDate: createdOrder.created_at
        ? new Date(createdOrder.created_at).toISOString()
        : new Date().toISOString(),
    };

    if (isFormPost) {
      const params = new URLSearchParams({
        order_code: paymentSummary.orderCode,
        amount: String(paymentSummary.amount),
        currency: paymentSummary.currency,
        cardBrand: paymentSummary.cardBrand ?? "",
        cardLast4: paymentSummary.cardLast4 ?? "",
        transactionDate: paymentSummary.transactionDate,
      });
      return NextResponse.redirect(
        new URL(`/cart/result?${params.toString()}`, req.url),
        303,
      );
    }

    return NextResponse.json({
      success: true,
      orderId: createdOrder.id,
      ordersCount: createdOrder.packages.reduce(
        (s, p) => s + p.items.length,
        0,
      ),
      authorizationCode: confirmResult.authorizationCode,
      financials: aggregateOrderFinancials(createdOrder.packages),
      ...paymentSummary,
    });
  } catch (err: unknown) {
    const msg =
      err instanceof Error ? err.message : "Error al confirmar el pago.";
    if (paymentAuthorized && purchaseNumberForError) {
      try {
        await prisma.paymentTransaction.updateMany({
          where: { purchase_number: purchaseNumberForError },
          data: { status: "failed", response_message: msg },
        });
      } catch {}
    }
    console.error(`Error en API /api/payments/${providerId}/confirm:`, err);
    return respondWithError(msg, isFormPost, req.url, 500);
  }
}
