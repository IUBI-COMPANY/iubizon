import { prisma } from "@/lib/prisma";

export async function ensureSellerPayoutForPackages(packageIds: string[]) {
  if (!packageIds || packageIds.length === 0) return;

  try {
    const packages = await prisma.orderPackage.findMany({
      where: { id: { in: packageIds } },
      select: {
        id: true,
        company_id: true,
        subtotal: true,
        commission_total: true,
        net_earnings: true,
      },
    });

    if (packages.length === 0) return;

    for (const pkg of packages) {
      if (Number(pkg.subtotal) <= 0) continue;

      const existing = await prisma.sellerPayout.findFirst({
        where: { package_id: pkg.id },
      });

      if (!existing) {
        await prisma.sellerPayout.create({
          data: {
            company_id: pkg.company_id,
            package_id: pkg.id,
            subtotal: pkg.subtotal,
            commission: pkg.commission_total,
            net_amount: pkg.net_earnings,
            status: "pending",
          },
        });
      }
    }
  } catch (err) {
    console.error("Error al generar Seller Payouts automáticos:", err);
  }
}
