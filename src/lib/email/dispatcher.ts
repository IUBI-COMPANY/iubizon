import React from "react";
import { prisma } from "@/lib/prisma";
import { getResendClient, getDefaultFromEmail } from "./client";
import { BuyerOrderEmail } from "./templates/BuyerOrderEmail";
import { SellerSaleEmail } from "./templates/SellerSaleEmail";
import { calculateIubizonCommission } from "@/lib/utils/commission";
import { getShippingConfig } from "@/lib/services/platformSettings";
import type {
  BuyerEmailData,
  SellerEmailData,
  EmailOrderItem,
} from "./types";

const isUuid = (str: string): boolean =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

export async function sendOrderConfirmationEmails(orderIdOrCode: string) {
  try {
    const resend = getResendClient();
    const fromEmail = getDefaultFromEmail();
    const isParamUuid = isUuid(orderIdOrCode);

    // 1. Consultar transacciones de pago y órdenes coincidentes por ID (UUID), payment_id o purchase_number
    const txWhereOr: any[] = [{ purchase_number: orderIdOrCode }];
    if (isParamUuid) {
      txWhereOr.push({ id: orderIdOrCode });
    }

    const paymentTx = await prisma.paymentTransaction.findFirst({
      where: { OR: txWhereOr },
      select: { id: true, purchase_number: true },
    });

    const whereOr: any[] = [{ payment_id: orderIdOrCode }];
    if (isParamUuid) {
      whereOr.push({ id: orderIdOrCode });
    }

    if (paymentTx) {
      whereOr.push({ payment_transaction_id: paymentTx.id });
      if (paymentTx.purchase_number) {
        whereOr.push({ payment_id: paymentTx.purchase_number });
      }
    }

    const orders = await prisma.order.findMany({
      where: { OR: whereOr },
      include: {
        buyer: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
            location: true,
          },
        },
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        company: {
          select: {
            id: true,
            name: true,
          },
        },
        product: {
          select: {
            id: true,
            title: true,
            price: true,
            images: {
              orderBy: { position: "asc" },
              take: 1,
            },
          },
        },
        shipping: true,
        paymentTransaction: true,
        invoiceDocument: true,
      },
    });

    if (orders.length === 0 || !orders[0].buyer) {
      console.warn(
        `[Email Dispatcher] No se encontraron órdenes o comprador para ${orderIdOrCode}.`,
      );
      return;
    }

    const primaryOrder = orders[0];
    const orderCode =
      primaryOrder.payment_id || primaryOrder.id.slice(0, 8).toUpperCase();

    // Extraer datos de envío y facturación
    const paymentRaw =
      typeof primaryOrder.paymentTransaction?.raw_response === "object" &&
      primaryOrder.paymentTransaction?.raw_response
        ? (primaryOrder.paymentTransaction.raw_response as Record<string, any>)
        : {};

    const rawShipping = paymentRaw.shipping || {};
    const rawInvoice = paymentRaw.invoiceDetails || {};

    const destinationAddress =
      rawShipping.address ||
      primaryOrder.shipping?.destination_address ||
      primaryOrder.buyer.location ||
      "Dirección no especificada";

    const shippingForm = {
      name: rawShipping.name || primaryOrder.buyer.name || "Cliente",
      phone: rawShipping.phone || primaryOrder.buyer.phone || "No especificado",
      email:
        rawShipping.email?.trim() ||
        paymentRaw.buyer_email?.trim() ||
        primaryOrder.buyer.email,
      address: destinationAddress,
      city: rawShipping.city || "Lima",
      notes: rawShipping.notes || undefined,
    };

    const deliveryType = rawShipping.deliveryType || "progressive";
    const invoiceType =
      rawInvoice.doc_type || primaryOrder.invoiceDocument?.doc_type || undefined;
    const invoiceNumber =
      rawInvoice.identity_number ||
      primaryOrder.invoiceDocument?.identity_number ||
      undefined;

    const createdAtFormatted = primaryOrder.created_at
      ? new Date(primaryOrder.created_at).toLocaleDateString("es-PE", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : new Date().toLocaleDateString("es-PE");

    // 2. Mapear todos los productos del pedido para el comprador
    const allEmailItems: EmailOrderItem[] = orders.map((ord) => ({
      id: ord.id,
      title: ord.product.title,
      price: Number(ord.amount),
      quantity: 1,
      imageUrl: ord.product.images[0]?.url || null,
      sellerName: ord.seller.name || "Vendedor iubizon",
      companyName: ord.company?.name || null,
    }));

    const subtotalCalculated = allEmailItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    const shippingCfg = await getShippingConfig();
    const shippingCost = shippingCfg.is_free ? 0.0 : shippingCfg.default_cost;
    const grandTotal = subtotalCalculated + shippingCost;

    const buyerData: BuyerEmailData = {
      orderCode,
      buyerName: shippingForm.name,
      buyerEmail: shippingForm.email,
      createdAt: createdAtFormatted,
      items: allEmailItems,
      subtotal: subtotalCalculated,
      shippingCost,
      total: grandTotal,
      shippingForm,
      deliveryType,
      invoiceType,
      invoiceNumber,
    };

    // 3. Agrupar productos por vendedor
    const itemsBySeller = new Map<
      string,
      {
        sellerEmail: string;
        sellerName: string;
        companyName?: string | null;
        items: EmailOrderItem[];
        subtotal: number;
        commissionTotal: number;
      }
    >();

    for (const ord of orders) {
      const sellerId = ord.seller_id;
      const sellerEmail = ord.seller.email;
      const sellerName = ord.seller.name || "Vendedor iubizon";
      const companyName = ord.company?.name || null;

      if (!sellerEmail) continue;

      const itemPrice = Number(ord.amount);
      const itemCommission =
        ord.commission !== null
          ? Number(ord.commission)
          : calculateIubizonCommission(itemPrice);

      const emailItem: EmailOrderItem = {
        id: ord.id,
        title: ord.product.title,
        price: itemPrice,
        quantity: 1,
        imageUrl: ord.product.images[0]?.url || null,
        sellerName,
        companyName,
      };

      if (!itemsBySeller.has(sellerId)) {
        itemsBySeller.set(sellerId, {
          sellerEmail,
          sellerName,
          companyName,
          items: [emailItem],
          subtotal: itemPrice,
          commissionTotal: itemCommission,
        });
      } else {
        const existing = itemsBySeller.get(sellerId)!;
        existing.items.push(emailItem);
        existing.subtotal += itemPrice;
        existing.commissionTotal += itemCommission;
      }
    }

    // 4. Enviar correos en paralelo

    // A. Correo al comprador
    const sendBuyerPromise = (async () => {
      try {
        if (resend && buyerData.buyerEmail) {
          const { data, error } = await resend.emails.send({
            from: fromEmail,
            to: [buyerData.buyerEmail],
            subject: `Confirmación de compra N° ${buyerData.orderCode} - iubizon`,
            react: React.createElement(BuyerOrderEmail, buyerData),
          });

          if (error) {
            console.error(
              `[Email Dispatcher] Error al enviar email a comprador (${buyerData.buyerEmail}):`,
              error,
            );

            // Fallback de desarrollo si Resend rechaza emails a terceros en modo Sandbox (onboarding@resend.dev)
            if (
              error.message &&
              error.message.includes("testing emails to your own email address")
            ) {
              const accountOwnerEmail =
                error.message.match(/\(([^)]+)\)/)?.[1] ||
                "iubizon.company@gmail.com";
              console.warn(
                `[Resend Notice] Modo Sandbox activo. Redireccionando copia de prueba a ${accountOwnerEmail}...`,
              );
              await resend.emails.send({
                from: fromEmail,
                to: [accountOwnerEmail],
                subject: `[PRUEBA -> ${buyerData.buyerEmail}] Confirmación de compra N° ${buyerData.orderCode} - iubizon`,
                react: React.createElement(BuyerOrderEmail, buyerData),
              });
              console.log(
                `[Email Dispatcher] Copia de correo de prueba entregada en ${accountOwnerEmail}`,
              );
            }
          } else {
            console.log(
              `[Email Dispatcher] Email de compra enviado exitosamente a ${buyerData.buyerEmail} (ID: ${data?.id}) desde ${fromEmail}`,
            );
          }
        } else {
          console.log(
            `[Email Dispatcher - DEV MODE] RESEND_API_KEY no detectada. Email para comprador ${buyerData.buyerEmail} (${buyerData.orderCode}) simulado.`,
          );
        }
      } catch (err) {
        console.error(
          `[Email Dispatcher] Excepción enviando email a comprador:`,
          err,
        );
      }
    })();

    // B. Correos a cada vendedor participante
    const sendSellersPromises = Array.from(itemsBySeller.entries()).map(
      async ([sellerId, sellerGroup], idx) => {
        try {
          const packageCode = `${orderCode}-P${idx + 1}`;
          const commissionAmount = sellerGroup.commissionTotal;
          const netPayoutEstimate = sellerGroup.subtotal - commissionAmount;

          const sellerData: SellerEmailData = {
            packageCode,
            orderCode,
            sellerName: sellerGroup.sellerName,
            sellerEmail: sellerGroup.sellerEmail,
            companyName: sellerGroup.companyName,
            createdAt: createdAtFormatted,
            items: sellerGroup.items,
            packageSubtotal: sellerGroup.subtotal,
            commissionAmount,
            netPayoutEstimate,
            buyerInfo: shippingForm,
          };

          if (resend && sellerGroup.sellerEmail) {
            const { data, error } = await resend.emails.send({
              from: fromEmail,
              to: [sellerGroup.sellerEmail],
              subject: `¡Nueva Venta por Despachar! Paquete ${packageCode} - iubizon`,
              react: React.createElement(SellerSaleEmail, sellerData),
            });

            if (error) {
              console.error(
                `[Email Dispatcher] Error enviando email a vendedor (${sellerGroup.sellerEmail}):`,
                error,
              );

              // Fallback de desarrollo si Resend rechaza emails a terceros en modo Sandbox (onboarding@resend.dev)
              if (
                error.message &&
                error.message.includes(
                  "testing emails to your own email address",
                )
              ) {
                const accountOwnerEmail =
                  error.message.match(/\(([^)]+)\)/)?.[1] ||
                  "iubizon.company@gmail.com";
                console.warn(
                  `[Resend Notice] Modo Sandbox activo. Redireccionando copia de venta de vendedor a ${accountOwnerEmail}...`,
                );
                await resend.emails.send({
                  from: fromEmail,
                  to: [accountOwnerEmail],
                  subject: `[PRUEBA -> Vendedor: ${sellerGroup.sellerEmail}] ¡Nueva Venta por Despachar! Paquete ${packageCode} - iubizon`,
                  react: React.createElement(SellerSaleEmail, sellerData),
                });
                console.log(
                  `[Email Dispatcher] Copia de correo de venta entregada en ${accountOwnerEmail}`,
                );
              }
            } else {
              console.log(
                `[Email Dispatcher] Email de venta enviado exitosamente a vendedor ${sellerGroup.sellerEmail} (ID: ${data?.id}) desde ${fromEmail}`,
              );
            }
          } else {
            console.log(
              `[Email Dispatcher - DEV MODE] Email para vendedor ${sellerGroup.sellerEmail} (${packageCode}) simulado.`,
            );
          }
        } catch (err) {
          console.error(
            `[Email Dispatcher] Excepción enviando email a vendedor ${sellerId}:`,
            err,
          );
        }
      },
    );

    await Promise.all([sendBuyerPromise, ...sendSellersPromises]);
  } catch (globalError) {
    console.error(
      `[Email Dispatcher] Error procesando correos para ${orderIdOrCode}:`,
      globalError,
    );
  }
}
