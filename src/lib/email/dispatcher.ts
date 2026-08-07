import React from "react";
import { prisma } from "@/lib/prisma";
import { getDefaultFromEmail, getResendClient } from "./client";
import { BuyerOrderEmail } from "./templates/BuyerOrderEmail";
import { SellerSaleEmail } from "./templates/SellerSaleEmail";
import type { BuyerEmailData, EmailOrderItem, SellerEmailData } from "./types";

export async function sendOrderConfirmationEmails(orderId: string) {
  try {
    const resend = getResendClient();
    const fromEmail = getDefaultFromEmail();

    const order = await prisma.order.findUnique({
      where: { id: orderId },
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
        shipping: true,
        invoice: true,
        paymentTransaction: true,
        packages: {
          include: {
            company: {
              select: { id: true, name: true, email: true },
            },
            items: {
              include: {
                product: {
                  select: {
                    id: true,
                    title: true,
                    price: true,
                    images: { orderBy: { position: "asc" }, take: 1 },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!order || !order.buyer) {
      console.warn(
        `[Email Dispatcher] No se encontró orden o comprador para ${orderId}.`,
      );
      return;
    }

    const createdAtFormatted = order.created_at
      ? new Date(order.created_at).toLocaleDateString("es-PE", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : new Date().toLocaleDateString("es-PE");

    const allEmailItems: EmailOrderItem[] = order.packages.flatMap((pkg) =>
      pkg.items.map((item) => ({
        id: item.id,
        title: item.product.title,
        price: Number(item.unit_price),
        quantity: item.quantity,
        imageUrl: item.product.images[0]?.url || null,
        sellerName: pkg.company?.name || "Vendedor iubizon",
        companyName: pkg.company?.name || null,
      })),
    );

    const subtotalCalculated = Number(order.subtotal);
    const shippingCost = Number(order.shipping_cost);
    const grandTotal = Number(order.total_amount);

    const shippingForm = {
      name: order.shipping?.name || order.buyer.name || "Cliente",
      phone: order.shipping?.phone || order.buyer.phone || "No especificado",
      email: order.shipping?.email?.trim() || order.buyer.email,
      address:
        order.shipping?.address ||
        order.buyer.location ||
        "Dirección no especificada",
      city:
        [
          order.shipping?.district,
          order.shipping?.province,
          order.shipping?.department,
        ]
          .filter(Boolean)
          .join(", ") || "Lima",
      department: order.shipping?.department || undefined,
      province: order.shipping?.province || undefined,
      district: order.shipping?.district || undefined,
      documentType: order.shipping?.document_type || undefined,
      documentNumber: order.shipping?.document_number || undefined,
      notes: order.shipping?.reference || undefined,
    };

    const buyerData: BuyerEmailData = {
      orderCode: order.order_code,
      buyerName: shippingForm.name,
      buyerEmail: shippingForm.email,
      createdAt: createdAtFormatted,
      items: allEmailItems,
      subtotal: subtotalCalculated,
      shippingCost,
      total: grandTotal,
      shippingForm,
      deliveryType: order.packages[0]?.delivery_type || undefined,
      invoiceType: order.invoice?.type || undefined,
      invoiceNumber: order.invoice?.number || undefined,
    };

    // Correo al comprador
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
            if (
              error.message?.includes(
                "testing emails to your own email address",
              )
            ) {
              const accountOwnerEmail =
                error.message.match(/\(([^)]+)\)/)?.[1] ||
                "iubizon.company@gmail.com";
              console.warn(
                `[Resend Notice] Modo Sandbox. Redireccionando copia a ${accountOwnerEmail}...`,
              );
              await resend.emails.send({
                from: fromEmail,
                to: [accountOwnerEmail],
                subject: `[PRUEBA -> ${buyerData.buyerEmail}] Confirmación de compra N° ${buyerData.orderCode} - iubizon`,
                react: React.createElement(BuyerOrderEmail, buyerData),
              });
            }
          } else {
            console.log(
              `[Email Dispatcher] Email de compra enviado a ${buyerData.buyerEmail} (ID: ${data?.id})`,
            );
          }
        }
      } catch (err) {
        console.error(
          `[Email Dispatcher] Excepción enviando email a comprador:`,
          err,
        );
      }
    })();

    // Correos a cada empresa vendedora (con CC a miembros)
    const companyGroupIds = Array.from(
      new Set(order.packages.map((pkg) => pkg.company_id)),
    );

    const memberEmailsByCompany = new Map<string, string[]>();
    if (companyGroupIds.length > 0) {
      const members = await prisma.companyMember.findMany({
        where: { company_id: { in: companyGroupIds } },
        select: { company_id: true, user: { select: { email: true } } },
      });
      for (const member of members) {
        if (!member.user?.email) continue;
        const list = memberEmailsByCompany.get(member.company_id) || [];
        list.push(member.user.email);
        memberEmailsByCompany.set(member.company_id, list);
      }
    }

    const sendSellersPromises = order.packages.map(async (pkg) => {
      try {
        const items: EmailOrderItem[] = pkg.items.map((item) => ({
          id: item.id,
          title: item.product.title,
          price: Number(item.unit_price),
          quantity: item.quantity,
          imageUrl: item.product.images[0]?.url || null,
          sellerName: pkg.company?.name || "Vendedor iubizon",
          companyName: pkg.company?.name || null,
        }));

        const commissionAmount = Number(pkg.commission_total);
        const netPayoutEstimate = Number(pkg.net_earnings);
        const recipientEmail =
          pkg.company?.email || "iubizon.company@gmail.com";
        const companyName = pkg.company?.name || "Vendedor iubizon";

        const rawMemberEmails = memberEmailsByCompany.get(pkg.company_id) || [];
        const ccEmails = Array.from(
          new Set(
            rawMemberEmails
              .map((e) => e.trim())
              .filter(
                (e) =>
                  e.length > 0 &&
                  e.toLowerCase() !== recipientEmail.toLowerCase(),
              ),
          ),
        );

        const sellerData: SellerEmailData = {
          packageCode: pkg.id,
          orderCode: order.order_code,
          sellerName: companyName,
          sellerEmail: recipientEmail,
          companyName,
          recipientName: companyName,
          recipientEmail,
          isCompanyRecipient: true,
          createdAt: createdAtFormatted,
          items,
          packageSubtotal: Number(pkg.subtotal),
          commissionAmount,
          netPayoutEstimate,
          buyerInfo: shippingForm,
        };

        if (resend && recipientEmail) {
          const { data, error } = await resend.emails.send({
            from: fromEmail,
            to: [recipientEmail],
            ...(ccEmails.length > 0 ? { cc: ccEmails } : {}),
            subject: `¡Nueva Venta por Despachar! Paquete ${pkg.id.slice(0, 8)} - Orden ${order.order_code}`,
            react: React.createElement(SellerSaleEmail, sellerData),
          });

          if (error) {
            console.error(
              `[Email Dispatcher] Error enviando email a empresa (${recipientEmail}):`,
              error,
            );
            if (
              error.message?.includes(
                "testing emails to your own email address",
              )
            ) {
              const accountOwnerEmail =
                error.message.match(/\(([^)]+)\)/)?.[1] ||
                "iubizon.company@gmail.com";
              await resend.emails.send({
                from: fromEmail,
                to: [accountOwnerEmail],
                subject: `[PRUEBA -> ${recipientEmail}] ¡Nueva Venta! Paquete ${pkg.id.slice(0, 8)} - iubizon`,
                react: React.createElement(SellerSaleEmail, sellerData),
              });
            }
          } else {
            console.log(
              `[Email Dispatcher] Email de venta enviado a ${recipientEmail}${ccEmails.length > 0 ? ` (CC: ${ccEmails.join(", ")})` : ""} (ID: ${data?.id})`,
            );
          }
        }
      } catch (err) {
        console.error(
          `[Email Dispatcher] Excepción enviando email a empresa ${pkg.company_id}:`,
          err,
        );
      }
    });

    await Promise.all([sendBuyerPromise, ...sendSellersPromises]);
  } catch (globalError) {
    console.error(
      `[Email Dispatcher] Error procesando correos para ${orderId}:`,
      globalError,
    );
  }
}
