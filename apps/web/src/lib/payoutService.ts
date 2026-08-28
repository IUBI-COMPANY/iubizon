import { prisma } from "@/lib/prisma";
import { getCommissionConfig } from "@/lib/services/commission";
import { calculateCommission } from "@/lib/utils/financials";
import { getProtectionDays } from "@/lib/services/platformSettings";

/**
 * Recalcula de forma dinámica la retribución de un paquete (`SellerPayout`).
 * Descuenta reembolsos aprobados, recalcula la comisión de iubizon y
 * gestiona la transición del estado 'in_hold' (protección 7 días) a 'pending' (disponible).
 */
export async function syncAndRecalculateSellerPayout(
  packageId: string,
  txPrisma?: any,
) {
  const dbClient = txPrisma || prisma;

  try {
    const pkg = await dbClient.orderPackage.findUnique({
      where: { id: packageId },
      include: {
        items: true,
        order: {
          select: {
            id: true,
            status: true,
            delivered_at: true,
            refundRequests: {
              select: {
                id: true,
                status: true,
                type: true,
                items: { select: { order_item_id: true, quantity: true } },
              },
            },
          },
        },
        payouts: true,
      },
    });

    if (!pkg) return null;

    // Solo procesar si el paquete ha sido entregado o completado
    if (pkg.status !== "delivered" && pkg.status !== "completed") {
      return null;
    }

    // 1. Reembolsos aprobados/completados (status === 'refunded')
    const approvedRefunds = (pkg.order?.refundRequests || []).filter(
      (r: any) => r.status === "refunded",
    );

    const refundQtyByOrderItem = new Map<string, number>();

    for (const refund of approvedRefunds) {
      for (const item of refund.items || []) {
        const currentQty = refundQtyByOrderItem.get(item.order_item_id) || 0;
        refundQtyByOrderItem.set(
          item.order_item_id,
          currentQty + item.quantity,
        );
      }
    }

    // 2. Calcular subtotal original del paquete y subtotal devuelto
    let originalSubtotal = 0;
    let refundedSubtotal = 0;

    for (const item of pkg.items) {
      const itemUnitPrice = Number(item.unit_price || 0);
      const itemQty = Number(item.quantity || 1);
      originalSubtotal += itemUnitPrice * itemQty;

      const refQty = refundQtyByOrderItem.get(item.id) || 0;
      if (refQty > 0) {
        refundedSubtotal += itemUnitPrice * Math.min(refQty, itemQty);
      }
    }

    if (originalSubtotal === 0 && Number(pkg.subtotal) > 0) {
      originalSubtotal = Number(pkg.subtotal);
    }

    const effectiveSubtotal = Math.max(0, originalSubtotal - refundedSubtotal);

    // 3. Reglas de comisión y periodo de garantía (inicia desde la entrega de la orden completa)
    const config = await getCommissionConfig();
    const protectionDays = await getProtectionDays();

    const deliveryDate = pkg.order?.delivered_at
      ? new Date(pkg.order.delivered_at)
      : pkg.updated_at
        ? new Date(pkg.updated_at)
        : new Date(pkg.created_at || Date.now());

    const protectionEndDate = new Date(
      deliveryDate.getTime() + protectionDays * 24 * 60 * 60 * 1000,
    );
    const now = new Date();
    const isProtectionExpired = now >= protectionEndDate;

    const hasActivePendingRefund = (pkg.order?.refundRequests || []).some(
      (r: any) =>
        r.status !== "rejected" &&
        r.status !== "completed" &&
        r.status !== "refunded",
    );

    let targetStatus = "in_hold";
    let commission = 0;
    let netAmount = 0;

    if (effectiveSubtotal <= 0) {
      commission = 0;
      netAmount = 0;
      targetStatus = "refunded";
    } else {
      // Determinar la tasa de comisión congelada asignada al crear la orden
      const originalPkgSubtotal = Number(pkg.subtotal || 0);
      const originalPkgCommission = Number(pkg.commission_total || 0);

      const frozenRate =
        pkg.commission_rate !== null && pkg.commission_rate !== undefined
          ? Number(pkg.commission_rate)
          : originalPkgSubtotal > 0
            ? originalPkgCommission / originalPkgSubtotal
            : config.base_rate;

      // Configuración congelada para la orden (aplica < 40 soles => + S/ 2.50)
      const effectivePkgConfig = {
        base_rate: frozenRate,
        fixed_fee: frozenRate === 0 ? 0 : config.fixed_fee,
        threshold_amount: config.threshold_amount,
      };

      commission = calculateCommission(effectiveSubtotal, effectivePkgConfig);
      netAmount = Math.max(
        0,
        Number((effectiveSubtotal - commission).toFixed(2)),
      );

      if (isProtectionExpired && !hasActivePendingRefund) {
        targetStatus = "pending"; // Disponible para pago
      } else {
        targetStatus = "in_hold"; // En periodo de garantía de 7 días
      }
    }

    const existingPayout = pkg.payouts[0];

    if (existingPayout) {
      let finalStatus = targetStatus;
      if (existingPayout.status === "paid") {
        finalStatus = "paid";
      } else if (existingPayout.status === "cancelled") {
        finalStatus = "cancelled";
      }

      return await dbClient.sellerPayout.update({
        where: { id: existingPayout.id },
        data: {
          subtotal: effectiveSubtotal,
          commission: commission,
          net_amount: netAmount,
          status: finalStatus,
        },
      });
    } else {
      return await dbClient.sellerPayout.create({
        data: {
          company_id: pkg.company_id,
          package_id: pkg.id,
          subtotal: effectiveSubtotal,
          commission: commission,
          net_amount: netAmount,
          status: targetStatus,
        },
      });
    }
  } catch (err) {
    console.error(
      `Error en syncAndRecalculateSellerPayout (${packageId}):`,
      err,
    );
    return null;
  }
}

export async function ensureSellerPayoutForPackages(packageIds: string[]) {
  if (!packageIds || packageIds.length === 0) return;

  try {
    for (const packageId of packageIds) {
      await syncAndRecalculateSellerPayout(packageId);
    }
  } catch (err) {
    console.error("Error al generar Seller Payouts automáticos:", err);
  }
}
