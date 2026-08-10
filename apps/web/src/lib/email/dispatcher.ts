import React from "react";
import { prisma } from "@/lib/prisma";
import { getDefaultFromEmail, getResendClient } from "./client";
import { BuyerOrderEmail } from "./templates/BuyerOrderEmail";
import { SellerSaleEmail } from "./templates/SellerSaleEmail";
import { DispatchNotificationEmail } from "./templates/DispatchNotificationEmail";
import { ReturnShippedEmail } from "./templates/ReturnShippedEmail";
import { ReturnReceivedEmail } from "./templates/ReturnReceivedEmail";
import { RefundStatusEmail } from "./templates/RefundStatusEmail";
import { formatDateTime } from "@/lib/utils";
import type {
  BuyerEmailData,
  DispatchEmailData,
  EmailOrderItem,
  RefundStatusEmailData,
  ReturnReceivedEmailData,
  ReturnShippedEmailData,
  SellerEmailData,
} from "./types";

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

    const createdAtFormatted = formatDateTime(order.created_at);

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

export async function sendDispatchNotification(
  packageId: string,
  courier: string,
  trackingNumber: string,
  trackingUrl: string | null,
  estimatedDelivery: Date,
) {
  try {
    const resend = getResendClient();
    const fromEmail = getDefaultFromEmail();

    const pkg = await prisma.orderPackage.findUnique({
      where: { id: packageId },
      include: {
        company: { select: { name: true } },
        order: {
          select: {
            order_code: true,
            buyer: { select: { name: true, email: true } },
            shipping: {
              select: {
                address: true,
                department: true,
                province: true,
                district: true,
              },
            },
          },
        },
        items: {
          include: {
            product: {
              select: {
                title: true,
                images: { orderBy: { position: "asc" }, take: 1 },
              },
            },
          },
        },
      },
    });

    if (!pkg?.order?.buyer?.email) return;

    const order = pkg.order;
    const buyer = order.buyer;
    const shipping = order.shipping;

    const deliveryDateStr = estimatedDelivery.toLocaleDateString("es-PE", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const items = pkg.items.map((item) => ({
      id: item.id,
      title: item.product.title,
      price: Number(item.unit_price),
      quantity: item.quantity,
      imageUrl: item.product.images[0]?.url || null,
      sellerName: pkg.company?.name || "Vendedor iubizon",
      companyName: pkg.company?.name || null,
    }));

    const data: DispatchEmailData = {
      orderCode: order.order_code,
      buyerName: buyer.name || "Cliente",
      buyerEmail: buyer.email,
      courier,
      trackingNumber,
      trackingUrl,
      estimatedDelivery: deliveryDateStr,
      items,
      shippingAddress: shipping?.address || "",
      shippingCity:
        [shipping?.district, shipping?.province, shipping?.department]
          .filter(Boolean)
          .join(", ") || "",
      companyName: pkg.company?.name || "Vendedor",
    };

    if (resend) {
      const { error } = await resend.emails.send({
        from: fromEmail,
        to: [data.buyerEmail],
        subject: `¡Tu pedido #${data.orderCode} está en camino! - iubizon`,
        react: React.createElement(DispatchNotificationEmail, data),
      });

      if (error) {
        console.error(
          `[Dispatch Email] Error enviando a ${data.buyerEmail}:`,
          error,
        );
      } else {
        console.log(
          `[Dispatch Email] Notificación de envío enviada a ${data.buyerEmail}`,
        );
      }
    }
  } catch (err) {
    console.error("[Dispatch Email] Error:", err);
  }
}

export async function sendReturnShippedNotification(refundId: string) {
  try {
    const resend = getResendClient();
    const fromEmail = getDefaultFromEmail();

    const refund = await prisma.refundRequest.findUnique({
      where: { id: refundId },
      include: {
        order: {
          select: {
            order_code: true,
            buyer: { select: { name: true } },
            packages: {
              select: {
                company: {
                  select: {
                    name: true,
                    email: true,
                    legal_name: true,
                    tax_id: true,
                    phone: true,
                  },
                },
              },
            },
          },
        },
        items: {
          include: {
            order_item: {
              include: {
                product: {
                  select: {
                    title: true,
                    images: { orderBy: { position: "asc" }, take: 1 },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!refund?.order?.packages?.[0]?.company?.email) return;

    const order = refund.order;
    const company = order.packages[0].company;
    const buyerName = order.buyer?.name || "Comprador";

    const deliveryDateStr = refund.return_estimated_delivery
      ? new Date(refund.return_estimated_delivery).toLocaleDateString("es-PE", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "No especificada";

    const items: EmailOrderItem[] = refund.items.map((ri) => ({
      id: ri.order_item_id,
      title: ri.order_item?.product?.title || "Producto",
      price: Number(ri.unit_price),
      quantity: ri.quantity,
      imageUrl: ri.order_item?.product?.images?.[0]?.url || null,
      sellerName: company.name,
      companyName: company.name,
    }));

    const data: ReturnShippedEmailData = {
      orderCode: order.order_code,
      sellerName: company.name,
      sellerEmail: company.email,
      companyName: company.name,
      companyLegalName: company.legal_name || null,
      companyTaxId: company.tax_id || null,
      companyPhone: company.phone || null,
      buyerName,
      courier: refund.return_courier || "No especificada",
      trackingNumber: refund.buyer_return_tracking || "N/A",
      trackingUrl: refund.return_tracking_url || null,
      estimatedDelivery: deliveryDateStr,
      returnAddress: refund.return_address || "No especificada",
      items,
      refundAmount: Number(refund.refund_amount),
    };

    if (resend) {
      const { error } = await resend.emails.send({
        from: fromEmail,
        to: [data.sellerEmail],
        subject: `Devolución en camino — Pedido #${data.orderCode} — iubizon`,
        react: React.createElement(ReturnShippedEmail, data),
      });

      if (error) {
        console.error(
          `[ReturnShipped Email] Error enviando a ${data.sellerEmail}:`,
          error,
        );
      } else {
        console.log(
          `[ReturnShipped Email] Notificación de devolución enviada a ${data.sellerEmail}`,
        );
      }
    }
  } catch (err) {
    console.error("[ReturnShipped Email] Error:", err);
  }
}

export async function sendReturnReceivedNotification(refundId: string) {
  try {
    const resend = getResendClient();
    const fromEmail = getDefaultFromEmail();
    const adminEmail = process.env.ADMIN_EMAIL || "iubizon.company@gmail.com";

    const refund = await prisma.refundRequest.findUnique({
      where: { id: refundId },
      include: {
        order: {
          select: {
            order_code: true,
            buyer: { select: { name: true } },
            packages: {
              select: {
                company: {
                  select: {
                    name: true,
                    legal_name: true,
                    tax_id: true,
                    phone: true,
                  },
                },
              },
            },
          },
        },
        items: {
          include: {
            order_item: {
              include: {
                product: {
                  select: {
                    title: true,
                    images: { orderBy: { position: "asc" }, take: 1 },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!refund) return;

    const order = refund.order;
    const company = order.packages[0]?.company;
    const companyName = company?.name || "Vendedor";
    const buyerName = order.buyer?.name || "Comprador";

    const items: EmailOrderItem[] = refund.items.map((ri) => ({
      id: ri.order_item_id,
      title: ri.order_item?.product?.title || "Producto",
      price: Number(ri.unit_price),
      quantity: ri.quantity,
      imageUrl: ri.order_item?.product?.images?.[0]?.url || null,
      sellerName: companyName,
      companyName,
    }));

    const data: ReturnReceivedEmailData = {
      orderCode: order.order_code,
      companyName,
      companyLegalName: company?.legal_name || null,
      companyTaxId: company?.tax_id || null,
      companyPhone: company?.phone || null,
      sellerName: companyName,
      buyerName,
      refundAmount: Number(refund.refund_amount),
      refundType: refund.type,
      items,
    };

    if (resend) {
      const { error } = await resend.emails.send({
        from: fromEmail,
        to: [adminEmail],
        subject: `Devolución confirmada — Orden #${data.orderCode} — Procesar Reembolso`,
        react: React.createElement(ReturnReceivedEmail, data),
      });

      if (error) {
        console.error(
          `[ReturnReceived Email] Error enviando a ${adminEmail}:`,
          error,
        );
      } else {
        console.log(
          `[ReturnReceived Email] Notificación enviada a ${adminEmail}`,
        );
      }
    }
  } catch (err) {
    console.error("[ReturnReceived Email] Error:", err);
  }
}

export async function sendRefundStatusNotification(
  refundId: string,
  approved: boolean,
) {
  try {
    const resend = getResendClient();
    const fromEmail = getDefaultFromEmail();

    const refund = await prisma.refundRequest.findUnique({
      where: { id: refundId },
      include: {
        order: {
          select: {
            order_code: true,
            buyer: { select: { name: true, email: true } },
            packages: {
              select: {
                company: {
                  select: {
                    name: true,
                    legal_name: true,
                    tax_id: true,
                    phone: true,
                  },
                },
              },
            },
          },
        },
        items: {
          include: {
            order_item: {
              include: {
                product: {
                  select: {
                    title: true,
                    images: { orderBy: { position: "asc" }, take: 1 },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!refund?.order?.buyer?.email) return;

    const buyer = refund.order.buyer;
    const company = refund.order.packages[0]?.company;
    const items: EmailOrderItem[] = refund.items.map((ri) => ({
      id: ri.order_item_id,
      title: ri.order_item?.product?.title || "Producto",
      price: Number(ri.unit_price),
      quantity: ri.quantity,
      imageUrl: ri.order_item?.product?.images?.[0]?.url || null,
      sellerName: "",
      companyName: null,
    }));

    const data: RefundStatusEmailData = {
      orderCode: refund.order.order_code,
      buyerName: buyer.name || "Cliente",
      buyerEmail: buyer.email,
      status: approved ? "approved" : "rejected",
      refundType: refund.type,
      refundAmount: Number(refund.refund_amount),
      adminNotes: refund.admin_notes,
      returnAddress: refund.return_address,
      companyLegalName: company?.legal_name || null,
      companyTaxId: company?.tax_id || null,
      companyPhone: company?.phone || null,
      items,
    };

    if (resend) {
      const { error } = await resend.emails.send({
        from: fromEmail,
        to: [data.buyerEmail],
        subject: `${approved ? "Reembolso Aprobado" : "Reembolso Rechazado"} — Pedido #${data.orderCode} — iubizon`,
        react: React.createElement(RefundStatusEmail, data),
      });

      if (error) {
        console.error(
          `[RefundStatus Email] Error enviando a ${data.buyerEmail}:`,
          error,
        );
      } else {
        console.log(
          `[RefundStatus Email] Notificación enviada a ${data.buyerEmail}`,
        );
      }
    }
  } catch (err) {
    console.error("[RefundStatus Email] Error:", err);
  }
}
