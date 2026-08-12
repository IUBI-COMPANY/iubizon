import { prisma } from "@/lib/prisma";
import { formatDateTime } from "@/lib/utils";
import { enqueueEmail } from "@iubizon/email";
import type {
  BuyerEmailData,
  EmailOrderItem,
  SellerEmailData,
} from "@iubizon/email";

export async function sendOrderConfirmationEmails(orderId: string) {
  try {
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
            company: { select: { id: true, name: true, email: true } },
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
        `[Order Email] No se encontró orden o comprador para ${orderId}.`,
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
      subtotal: Number(order.subtotal),
      shippingCost: Number(order.shipping_cost),
      total: Number(order.total_amount),
      shippingForm,
      deliveryType: order.packages[0]?.delivery_type || undefined,
      invoiceType: order.invoice?.type || undefined,
      invoiceNumber: order.invoice?.number || undefined,
    };

    enqueueEmail(
      buyerData.buyerEmail,
      `Confirmación de compra #${buyerData.orderCode} — iubizon`,
      "buyer_order",
      buyerData as unknown as Record<string, any>,
    );

    const companyGroupIds = Array.from(
      new Set(order.packages.map((p) => p.company_id)),
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

    const sendSellers = order.packages.map(async (pkg) => {
      try {
        const companyName = pkg.company?.name || "Vendedor iubizon";
        const recipientEmail =
          pkg.company?.email || "iubizon.company@gmail.com";
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
          items: pkg.items.map((item) => ({
            id: item.id,
            title: item.product.title,
            price: Number(item.unit_price),
            quantity: item.quantity,
            imageUrl: item.product.images[0]?.url || null,
            sellerName: companyName,
            companyName,
          })),
          packageSubtotal: Number(pkg.subtotal),
          commissionAmount: Number(pkg.commission_total),
          netPayoutEstimate: Number(pkg.net_earnings),
          buyerInfo: shippingForm,
        };

        return enqueueEmail(
          recipientEmail,
          `¡Nueva Venta! Orden #${order.order_code} — ${companyName}`,
          "seller_sale",
          sellerData as unknown as Record<string, any>,
          ccEmails.length > 0 ? ccEmails : undefined,
        );
      } catch (err) {
        console.error(
          `[Order Email] Error enviando a empresa ${pkg.company_id}:`,
          err,
        );
      }
    });

    await Promise.all([...sendSellers]);
  } catch (err) {
    console.error(
      `[Order Email] Error procesando correos para ${orderId}:`,
      err,
    );
  }
}
