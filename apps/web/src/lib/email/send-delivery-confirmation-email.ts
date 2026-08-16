import { prisma } from "@/lib/prisma";
import { formatDateTime } from "@/lib/utils";
import { enqueueEmail } from "@iubizon/email";
import type {
  DeliveryConfirmedEmailData,
  EmailOrderItem,
} from "@iubizon/email";

export async function sendDeliveryConfirmationNotifications(
  packageIds: string[],
) {
  try {
    if (packageIds.length === 0) return;

    const packages = await prisma.orderPackage.findMany({
      where: { id: { in: packageIds } },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            email: true,
            legal_name: true,
            tax_id: true,
            phone: true,
          },
        },
        order: {
          select: {
            order_code: true,
            buyer: { select: { name: true } },
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

    if (packages.length === 0) return;

    const companyGroupIds = Array.from(
      new Set(packages.map((p) => p.company_id)),
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

    await Promise.all(
      packages.map(async (pkg) => {
        try {
          const companyName = pkg.company?.name || "Vendedor iubizon";
          const recipientEmail =
            pkg.company?.email || "iubizon.company@gmail.com";
          const rawMemberEmails =
            memberEmailsByCompany.get(pkg.company_id) || [];
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

          const data: DeliveryConfirmedEmailData = {
            orderCode: pkg.order.order_code,
            packageCode: pkg.id,
            companyName,
            companyLegalName: pkg.company?.legal_name || null,
            companyTaxId: pkg.company?.tax_id || null,
            companyPhone: pkg.company?.phone || null,
            sellerName: companyName,
            buyerName: pkg.order.buyer?.name || "Comprador",
            confirmedAt: formatDateTime(pkg.updated_at),
            items: pkg.items.map((item): EmailOrderItem => ({
              id: item.id,
              title: item.product.title,
              price: Number(item.unit_price),
              quantity: item.quantity,
              imageUrl: item.product.images[0]?.url || null,
              sellerName: companyName,
              companyName,
            })),
            packageSubtotal: Number(pkg.subtotal),
            netEarnings: Number(pkg.net_earnings),
          };

          await enqueueEmail(
            recipientEmail,
            `Entrega confirmada — Pedido #${data.orderCode} — iubizon`,
            "delivery_confirmed",
            data as unknown as Record<string, any>,
            ccEmails.length > 0 ? ccEmails : undefined,
          );
        } catch (err) {
          console.error(
            `[DeliveryConfirmed Email] Error enviando a empresa ${pkg.company_id}:`,
            err,
          );
        }
      }),
    );
  } catch (err) {
    console.error(
      `[DeliveryConfirmed Email] Error procesando correos para paquetes ${packageIds.join(", ")}:`,
      err,
    );
  }
}
