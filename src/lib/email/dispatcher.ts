import React from "react";
import { prisma } from "@/lib/prisma";
import { resend, DEFAULT_FROM_EMAIL } from "./client";
import { BuyerOrderEmail } from "./templates/BuyerOrderEmail";
import { SellerSaleEmail } from "./templates/SellerSaleEmail";
import { calculateIubizonCommission } from "@/lib/utils/commission";
import type { BuyerEmailData, SellerEmailData, EmailOrderItem } from "./types";

export async function sendOrderConfirmationEmails(orderIdOrCode: string) {
  try {
    // 1. Consultar la orden de referencia para obtener identificadores del pago/sesión
    const targetOrder = await prisma.order.findFirst({
      where: {
        OR: [{ id: orderIdOrCode }, { payment_id: orderIdOrCode }],
      },
      select: {
        id: true,
        payment_id: true,
        payment_transaction_id: true,
      },
    });

    if (!targetOrder) {
      console.warn(`[Email Dispatcher] Orden ${orderIdOrCode} no encontrada.`);
      return;
    }

    const whereOr: any[] = [{ id: targetOrder.id }];
    if (targetOrder.payment_id) {
      whereOr.push({ payment_id: targetOrder.payment_id });
    }
    if (targetOrder.payment_transaction_id) {
      whereOr.push({
        payment_transaction_id: targetOrder.payment_transaction_id,
      });
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

    // Parsear información del comprador y envío
    const destinationAddress =
      primaryOrder.shipping?.destination_address ||
      primaryOrder.buyer.location ||
      "Dirección no especificada";

    const shippingForm = {
      name: primaryOrder.buyer.name || "Cliente",
      phone: primaryOrder.buyer.phone || "No especificado",
      email: primaryOrder.buyer.email,
      address: destinationAddress,
      city: "Lima",
    };

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
    const shippingCost = 0; // Promoción de envío gratis por defecto
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
      deliveryType: "progressive",
    };

    // 3. Agrupar productos por vendedor para enviar una alerta a cada uno
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
          const { error } = await resend.emails.send({
            from: DEFAULT_FROM_EMAIL,
            to: [buyerData.buyerEmail],
            subject: `Confirmación de compra N° ${buyerData.orderCode} - iubizon`,
            react: React.createElement(BuyerOrderEmail, buyerData),
          });
          if (error) {
            console.error(
              `[Email Dispatcher] Error al enviar email a comprador (${buyerData.buyerEmail}):`,
              error,
            );
          } else {
            console.log(
              `[Email Dispatcher] Email de compra enviado a ${buyerData.buyerEmail} (${buyerData.orderCode})`,
            );
          }
        } else {
          console.log(
            `[Email Dispatcher - DEV MODE] Email para comprador ${buyerData.buyerEmail} (${buyerData.orderCode}) simulado.`,
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
            const { error } = await resend.emails.send({
              from: DEFAULT_FROM_EMAIL,
              to: [sellerGroup.sellerEmail],
              subject: `¡Nueva Venta por Despachar! Paquete ${packageCode} - iubizon`,
              react: React.createElement(SellerSaleEmail, sellerData),
            });
            if (error) {
              console.error(
                `[Email Dispatcher] Error enviando email a vendedor (${sellerGroup.sellerEmail}):`,
                error,
              );
            } else {
              console.log(
                `[Email Dispatcher] Email de venta enviado a vendedor ${sellerGroup.sellerEmail} (${packageCode})`,
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
