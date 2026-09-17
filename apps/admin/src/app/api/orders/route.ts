import { NextResponse } from "next/server";
import { db } from "@iubizon/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || "";
  const deliveryType = searchParams.get("deliveryType") || "";
  const search = (searchParams.get("search") || "").trim();

  const where: any = {};
  if (status) {
    where.status = status;
  }
  if (deliveryType) {
    where.packages = {
      some: {
        delivery_type: deliveryType,
      },
    };
  }
  if (search) {
    where.OR = [
      { order_code: { contains: search, mode: "insensitive" } },
      { buyer: { name: { contains: search, mode: "insensitive" } } },
      { buyer: { email: { contains: search, mode: "insensitive" } } },
    ];
  }

  const [rawOrders, total] = await Promise.all([
    db.order.findMany({
      where,
      include: {
        buyer: { select: { name: true, email: true, phone: true } },
        shipping: true,
        invoice: true,
        refundRequests: {
          include: {
            items: true,
          },
          orderBy: { created_at: "desc" },
        },
        packages: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
                legal_name: true,
                tax_id: true,
                phone: true,
              },
            },
            items: {
              include: {
                product: {
                  select: {
                    id: true,
                    title: true,
                    images: { take: 1, select: { url: true } },
                  },
                },
              },
            },
            payouts: true,
          },
        },
      },
      orderBy: { created_at: "desc" },
      take: 50,
    }),
    db.order.count({ where }),
  ]);

  const orders = rawOrders.map((order) => {
    const refundRequests = order.refundRequests || [];
    const refundedAmount = refundRequests
      .filter((r) => r.status === "refunded")
      .reduce((sum, r) => sum + Number(r.refund_amount || 0), 0);
    const pendingRefundAmount = refundRequests
      .filter((r) => r.status !== "refunded" && r.status !== "rejected")
      .reduce((sum, r) => sum + Number(r.refund_amount || 0), 0);
    const totalAmount = Number(order.total_amount || 0);
    const netPaidAmount = Math.max(0, totalAmount - refundedAmount);

    const refundedItemIds = new Set(
      refundRequests
        .filter((r) => r.status === "refunded")
        .flatMap((r) => r.items || [])
        .map((ri) => ri.order_item_id),
    );

    let packagesSubtotal = 0;
    let platformCommissionTotal = 0;
    let sellerEarningsTotal = 0;

    const enrichedPackages = (order.packages || []).map((pkg) => {
      const pkgSubtotal = Number(pkg.subtotal || 0);
      const pkgCommission = Number(pkg.commission_total || 0);
      const pkgNetEarnings = Number(pkg.net_earnings || 0);
      const payout = pkg.payouts?.[0];

      const effectiveSubtotal = payout ? Number(payout.subtotal || 0) : pkgSubtotal;
      const effectiveCommission = payout ? Number(payout.commission || 0) : pkgCommission;
      const effectiveEarnings = payout ? Number(payout.net_amount || 0) : pkgNetEarnings;
      const payoutStatus = payout ? payout.status : (pkg.status === "delivered" || pkg.status === "completed" ? "in_hold" : "pending");

      packagesSubtotal += effectiveSubtotal;
      platformCommissionTotal += effectiveCommission;
      sellerEarningsTotal += effectiveEarnings;

      const enrichedItems = (pkg.items || []).map((item) => ({
        ...item,
        isRefunded: refundedItemIds.has(item.id),
      }));

      return {
        ...pkg,
        effectiveSubtotal,
        effectiveCommission,
        effectiveEarnings,
        payoutStatus,
        items: enrichedItems,
      };
    });

    return {
      ...order,
      packages: enrichedPackages,
      refundedAmount,
      pendingRefundAmount,
      netPaidAmount,
      packagesSubtotal,
      platformCommissionTotal,
      sellerEarningsTotal,
      hasRefund: refundRequests.length > 0,
      refundStatus: refundRequests[0]?.status || null,
      refundType: refundRequests[0]?.type || null,
      refundedItemIds: Array.from(refundedItemIds),
    };
  });

  return NextResponse.json({ orders, total });

}

export async function PATCH(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const queryId = searchParams.get("id");
    const body = await req.json();
    const {
      action,
      id: bodyId,
      orderId,
      packageId,
      status: bodyStatus,
      courier,
      trackingNumber,
      trackingUrl,
      carrierPhone,
      estimatedDelivery,
    } = body;

    const targetOrderId = bodyId || orderId || queryId;

    // Acción 1: Actualizar datos de despacho del paquete (iubizon -> cliente final o vendedor -> iubizon)
    if (action === "updatePackageDispatch" && packageId) {
      const updatedPkg = await db.orderPackage.update({
        where: { id: packageId },
        data: {
          courier: courier || null,
          tracking_number: trackingNumber || null,
          tracking_url: trackingUrl || null,
          carrier_phone: carrierPhone || null,
          estimated_delivery: estimatedDelivery
            ? new Date(estimatedDelivery)
            : null,
          ...(bodyStatus ? { status: bodyStatus } : {}),
        },
      });

      // Si el estado del paquete cambia a "shipped" o "delivered", sincronizar el estado global de la orden si corresponde
      if (bodyStatus === "shipped" || bodyStatus === "delivered") {
        const pkgOrder = await db.orderPackage.findUnique({
          where: { id: packageId },
          select: { order_id: true },
        });
        if (pkgOrder?.order_id) {
          const allPackages = await db.orderPackage.findMany({
            where: { order_id: pkgOrder.order_id },
            select: { status: true },
          });
          const allShippedOrDelivered = allPackages.every(
            (p) =>
              p.status === "shipped" ||
              p.status === "delivered" ||
              p.status === "completed",
          );
          if (allShippedOrDelivered) {
            await db.order.update({
              where: { id: pkgOrder.order_id },
              data: { status: bodyStatus },
            });
          }
        }
      }

      return NextResponse.json({ success: true, package: updatedPkg });
    }

    // Acción 2: Marcar recepción de paquete en Almacén Central iubizon
    if (
      (action === "markPackageReceived" ||
        action === "mark_received_in_warehouse") &&
      packageId
    ) {
      const updatedPkg = await db.orderPackage.update({
        where: { id: packageId },
        data: {
          status: "received_in_warehouse",
        },
      });
      return NextResponse.json({ success: true, package: updatedPkg });
    }

    // Acción 3: Cancelar orden
    if (action === "cancel" && targetOrderId) {
      await db.order.update({
        where: { id: targetOrderId },
        data: { status: "cancelled" },
      });
      await db.orderPackage.updateMany({
        where: { order_id: targetOrderId },
        data: { status: "cancelled" },
      });
      return NextResponse.json({ success: true });
    }

    // Acción 4: Cambio manual de estado de la orden (soporte)
    const effectiveStatus =
      bodyStatus || (action === "force_status" ? body.status : null);
    if (targetOrderId && effectiveStatus) {
      await db.order.update({
        where: { id: targetOrderId },
        data: { status: effectiveStatus },
      });

      // También actualizar el estado de sus paquetes
      await db.orderPackage.updateMany({
        where: { order_id: targetOrderId },
        data: { status: effectiveStatus },
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: "Parámetros insuficientes." },
      { status: 400 },
    );
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Error al actualizar la orden.",
      },
      { status: 500 },
    );
  }
}
