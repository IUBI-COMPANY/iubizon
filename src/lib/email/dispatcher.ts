import React from "react";
import { prisma } from "@/lib/prisma";
import { getResendClient, getDefaultFromEmail } from "./client";
import { BuyerOrderEmail } from "./templates/BuyerOrderEmail";
import { SellerSaleEmail } from "./templates/SellerSaleEmail";
import { calculateIubizonCommission } from "@/lib/utils/commission";
import { getShippingConfig } from "@/lib/services/platformSettings";
import type { BuyerEmailData, SellerEmailData, EmailOrderItem } from "./types";

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
            email: true,
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
    const shippingDepartment = String(rawShipping.department || "").trim();
    const shippingProvince = String(rawShipping.province || "").trim();
    const shippingDistrict = String(rawShipping.district || "").trim();
    const shippingDocumentType = String(
      rawShipping.documentType ||
        rawShipping.document_type ||
        rawInvoice.shipping_document_type ||
        rawInvoice.identity_type ||
        "",
    )
      .trim()
      .toLowerCase();
    const shippingDocumentNumber = String(
      rawShipping.documentNumber ||
        rawShipping.document_number ||
        rawInvoice.shipping_document_number ||
        rawInvoice.identity_number ||
        "",
    ).trim();
    const ubigeoLabel = [shippingDistrict, shippingProvince, shippingDepartment]
      .filter(Boolean)
      .join(", ");

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
      address: rawShipping.address || destinationAddress,
      city: ubigeoLabel || rawShipping.city || "Lima",
      department: shippingDepartment || undefined,
      province: shippingProvince || undefined,
      district: shippingDistrict || undefined,
      documentType: shippingDocumentType || undefined,
      documentNumber: shippingDocumentNumber || undefined,
      notes: rawShipping.notes || undefined,
    };

    const deliveryType = rawShipping.deliveryType || "progressive";
    const invoiceType =
      rawInvoice.doc_type ||
      primaryOrder.invoiceDocument?.doc_type ||
      undefined;
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
      price: Number(ord.unit_price),
      quantity: ord.quantity,
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

    // 3. Agrupar productos por Empresa (entidad principal) o por Vendedor individual si no pertenece a una empresa
    const itemsBySeller = new Map<
      string,
      {
        recipientEmail: string;
        recipientName: string;
        isCompanyRecipient: boolean;
        sellerName: string;
        sellerEmail: string;
        companyName?: string | null;
        items: EmailOrderItem[];
        subtotal: number;
        commissionTotal: number;
      }
    >();

    for (const ord of orders) {
      const sellerEmail = ord.seller.email;
      const sellerName = ord.seller.name || "Vendedor iubizon";
      const companyEmail = ord.company?.email?.trim() || null;
      const companyName = ord.company?.name || null;

      // La empresa es la entidad principal cuando el producto está vinculado a una:
      // se agrupa por company_id (consolida ítems de todos sus miembros) y el
      // correo se despacha a la casilla corporativa, no a la del vendedor individual.
      const isCompanyRecipient = Boolean(ord.company_id && companyEmail);
      const groupKey = ord.company_id || ord.seller_id;
      const recipientEmail = isCompanyRecipient ? companyEmail! : sellerEmail;
      const recipientName = isCompanyRecipient
        ? companyName || sellerName
        : sellerName;

      if (!recipientEmail) continue;

      const itemAmount = Number(ord.amount);
      const itemCommission =
        ord.commission !== null
          ? Number(ord.commission)
          : calculateIubizonCommission(itemAmount);

      const emailItem: EmailOrderItem = {
        id: ord.id,
        title: ord.product.title,
        price: Number(ord.unit_price),
        quantity: ord.quantity,
        imageUrl: ord.product.images[0]?.url || null,
        sellerName,
        companyName,
      };

      if (!itemsBySeller.has(groupKey)) {
        itemsBySeller.set(groupKey, {
          recipientEmail,
          recipientName,
          isCompanyRecipient,
          sellerName,
          sellerEmail,
          companyName,
          items: [emailItem],
          subtotal: itemAmount,
          commissionTotal: itemCommission,
        });
      } else {
        const existing = itemsBySeller.get(groupKey)!;
        existing.items.push(emailItem);
        existing.subtotal += itemAmount;
        existing.commissionTotal += itemCommission;
      }
    }

    // 3b. Obtener correos de los miembros de las empresas destinatarias (para copiar/CC)
    const companyGroupIds = Array.from(itemsBySeller.entries())
      .filter(([, group]) => group.isCompanyRecipient)
      .map(([groupKey]) => groupKey);

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

    // B. Correos a cada Empresa o Vendedor individual participante
    const sendSellersPromises = Array.from(itemsBySeller.entries()).map(
      async ([groupKey, sellerGroup], idx) => {
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
            recipientName: sellerGroup.recipientName,
            recipientEmail: sellerGroup.recipientEmail,
            isCompanyRecipient: sellerGroup.isCompanyRecipient,
            createdAt: createdAtFormatted,
            items: sellerGroup.items,
            packageSubtotal: sellerGroup.subtotal,
            commissionAmount,
            netPayoutEstimate,
            buyerInfo: shippingForm,
          };

          // CC a los miembros de la empresa (si aplica), excluyendo duplicados del destinatario principal
          const rawMemberEmails = sellerGroup.isCompanyRecipient
            ? memberEmailsByCompany.get(groupKey) || []
            : [];
          const ccEmails = Array.from(
            new Set(
              rawMemberEmails
                .map((e) => e.trim())
                .filter(
                  (e) =>
                    e.length > 0 &&
                    e.toLowerCase() !==
                      sellerGroup.recipientEmail.trim().toLowerCase(),
                ),
            ),
          );

          if (resend && sellerGroup.recipientEmail) {
            const { data, error } = await resend.emails.send({
              from: fromEmail,
              to: [sellerGroup.recipientEmail],
              ...(ccEmails.length > 0 ? { cc: ccEmails } : {}),
              subject: `¡Nueva Venta por Despachar! Paquete ${packageCode} - iubizon`,
              react: React.createElement(SellerSaleEmail, sellerData),
            });

            if (error) {
              console.error(
                `[Email Dispatcher] Error enviando email a ${sellerGroup.isCompanyRecipient ? "empresa" : "vendedor"} (${sellerGroup.recipientEmail}):`,
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
                  `[Resend Notice] Modo Sandbox activo. Redireccionando copia de venta a ${accountOwnerEmail}...`,
                );
                await resend.emails.send({
                  from: fromEmail,
                  to: [accountOwnerEmail],
                  subject: `[PRUEBA -> ${sellerGroup.recipientEmail}] ¡Nueva Venta por Despachar! Paquete ${packageCode} - iubizon`,
                  react: React.createElement(SellerSaleEmail, sellerData),
                });
                console.log(
                  `[Email Dispatcher] Copia de correo de venta entregada en ${accountOwnerEmail}`,
                );
              }
            } else {
              console.log(
                `[Email Dispatcher] Email de venta enviado exitosamente a ${sellerGroup.isCompanyRecipient ? "empresa" : "vendedor"} ${sellerGroup.recipientEmail}${ccEmails.length > 0 ? ` (CC: ${ccEmails.join(", ")})` : ""} (ID: ${data?.id}) desde ${fromEmail}`,
              );
            }
          } else {
            console.log(
              `[Email Dispatcher - DEV MODE] Email para ${sellerGroup.recipientEmail} (${packageCode}) simulado.`,
            );
          }
        } catch (err) {
          console.error(
            `[Email Dispatcher] Excepción enviando email a grupo ${groupKey}:`,
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
