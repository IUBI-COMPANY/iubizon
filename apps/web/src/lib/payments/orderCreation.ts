import { prisma } from "@/lib/prisma";
import {
  createFullOrder,
  getOrCreateBuyerProfile,
} from "@/lib/services/orders";
import type { ConfirmPaymentResult } from "./types";

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

export interface CompleteOrderInput {
  providerId: string;
  purchaseNumber: string;
  effectiveEmail: string;
  buyerUserId: string;
  cartItems: any[];
  shipping: Record<string, any>;
  invoiceDetails: Record<string, any>;
  paymentMethod: string;
  confirmResult: ConfirmPaymentResult;
  existingRawResponse?: unknown;
}

/**
 * Orquestación agnóstica de proveedor: valida stock, agrupa por empresa y
 * crea la orden + actualiza el PaymentTransaction con el resultado del pago.
 */
export async function completeOrderFromPayment(input: CompleteOrderInput) {
  const {
    providerId,
    purchaseNumber,
    effectiveEmail,
    buyerUserId,
    cartItems,
    shipping,
    invoiceDetails,
    paymentMethod,
    confirmResult,
    existingRawResponse,
  } = input;

  const requestedItems = cartItems
    .map((item) => ({
      productId: extractProductUuid(item),
      quantity: Number(item?.quantity) || 1,
    }))
    .filter((item): item is { productId: string; quantity: number } =>
      Boolean(item.productId),
    );

  if (requestedItems.length === 0) {
    throw new Error("Los productos del carrito no son válidos.");
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
      throw new Error("Uno o más productos ya no están disponibles.");
    }
    if (product.stock !== null && product.stock < item.quantity) {
      throw new Error(
        `Stock insuficiente para "${product.title}". Quedan ${Math.max(product.stock, 0)} unidades.`,
      );
    }
  }

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
      typeof existingRawResponse === "object" && existingRawResponse
        ? (existingRawResponse as Record<string, any>)
        : {};

    const paymentRecord = await tx.paymentTransaction.update({
      where: { purchase_number: purchaseNumber },
      data: {
        status: "authorized",
        transaction_id: confirmResult.transactionId ?? null,
        authorization_code: confirmResult.authorizationCode ?? null,
        card_brand: confirmResult.cardBrand ?? null,
        card_last4: confirmResult.cardLast4 ?? null,
        response_code: "000",
        response_message: "Transacción aprobada",
        raw_response: {
          ...previousRaw,
          shipping: shipping || previousRaw.shipping || {},
          invoiceDetails: invoiceDetails || previousRaw.invoiceDetails || {},
          buyer_email: effectiveEmail,
          [`${providerId}_result`]: confirmResult.rawResponse
            ? JSON.parse(JSON.stringify(confirmResult.rawResponse))
            : undefined,
        },
      },
    });

    const effectiveBuyerId = await getOrCreateBuyerProfile({
      userId: buyerUserId,
      email: effectiveEmail,
      name: shipping?.name,
      phone: shipping?.phone,
      txPrisma: tx,
    });

    // Agrupar por company_id
    const groupMap = new Map<string, typeof requestedItems>();
    for (const item of requestedItems) {
      const product = productMap.get(item.productId)!;
      const key = product.company_id;
      if (!groupMap.has(key)) groupMap.set(key, []);
      groupMap.get(key)!.push(item);
    }

    // Descontar stock atómicamente
    for (const items of groupMap.values()) {
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
      paymentMethod,
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

  return createdOrder;
}
