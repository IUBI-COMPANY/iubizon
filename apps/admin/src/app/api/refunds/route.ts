import { NextResponse } from "next/server";
import { db } from "@iubizon/db";
import { processNiubizRefund } from "@/lib/niubiz";

function triggerRefundEmail(
  refundId: string,
  approved: boolean,
  type?: string,
) {
  try {
    fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/send-refund-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refundId, approved, type }),
    }).catch(() => {});
  } catch {}
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "";
    const search = searchParams.get("search") || "";

    const where: any = {};
    if (status) {
      const statuses = status.split(",").filter(Boolean);
      if (statuses.length === 1) {
        where.status = statuses[0];
      } else {
        where.status = { in: statuses };
      }
    }
    if (search) {
      where.OR = [
        { order: { order_code: { contains: search } } },
        { order: { buyer: { name: { contains: search } } } },
      ];
    }

    const refunds = await db.refundRequest.findMany({
      where,
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
                    location: true,
                  },
                },
              },
            },
          },
        },
        items: true,
      },
      orderBy: { created_at: "desc" },
      take: 100,
    });

    const itemIds = refunds.flatMap((r) => r.items.map((i) => i.order_item_id));
    const orderItemMap = new Map<
      string,
      { title: string; image: string | null }
    >();
    if (itemIds.length > 0) {
      const orderItems = await db.orderItem.findMany({
        where: { id: { in: itemIds } },
        include: {
          product: {
            select: {
              title: true,
              images: {
                orderBy: { position: "asc" },
                take: 1,
                select: { url: true },
              },
            },
          },
        },
      });
      for (const oi of orderItems) {
        orderItemMap.set(oi.id, {
          title: oi.product.title,
          image: oi.product.images[0]?.url || null,
        });
      }
    }

    const adminIds = [
      ...new Set(refunds.map((r) => r.updated_by).filter(Boolean)),
    ] as string[];
    const profiles =
      adminIds.length > 0
        ? await db.profile.findMany({
            where: { id: { in: adminIds } },
            select: { id: true, name: true },
          })
        : [];
    const profileMap = new Map(profiles.map((p) => [p.id, p.name]));

    const mapped = refunds.map((r) => ({
      id: r.id,
      order_code: r.order.order_code,
      buyer_name: r.order.buyer?.name || "N/A",
      buyer_email: r.order.buyer?.email || null,
      type: r.type,
      status: r.status,
      reason: r.reason,
      refund_amount: Number(r.refund_amount),
      return_shipping_cost: r.return_shipping_cost
        ? Number(r.return_shipping_cost)
        : null,
      return_shipping_paid_by: r.return_shipping_paid_by,
      return_address: r.return_address,
      buyer_return_tracking: r.buyer_return_tracking,
      return_courier: r.return_courier,
      return_carrier_phone: r.return_carrier_phone,
      return_estimated_delivery:
        r.return_estimated_delivery?.toISOString() ?? null,
      return_tracking_url: r.return_tracking_url,
      admin_notes: r.admin_notes,
      updated_by_name: r.updated_by
        ? profileMap.get(r.updated_by) || null
        : null,
      refund_method: r.refund_method,
      refund_reference: r.refund_reference,
      processed_at: r.processed_at?.toISOString() ?? null,
      created_at: r.created_at?.toISOString() ?? new Date().toISOString(),
      company_name: r.order.packages[0]?.company?.name || "N/A",
      company_location: r.order.packages[0]?.company?.location || null,
      items: r.items.map((ri) => {
        const p = orderItemMap.get(ri.order_item_id);
        return {
          order_item_id: ri.order_item_id,
          product_title: p?.title || "Producto",
          product_image: p?.image || null,
          quantity: ri.quantity,
          unit_price: Number(ri.unit_price),
          subtotal: Number(ri.subtotal),
        };
      }),
    }));

    const [
      pendingCount,
      approvedCount,
      inTransitCount,
      returnedCount,
      refundedCount,
      rejectedCount,
    ] = await Promise.all([
      db.refundRequest.count({ where: { status: "pending" } }),
      db.refundRequest.count({ where: { status: "approved" } }),
      db.refundRequest.count({ where: { status: "return_in_transit" } }),
      db.refundRequest.count({ where: { status: "return_received" } }),
      db.refundRequest.count({ where: { status: "refunded" } }),
      db.refundRequest.count({ where: { status: "rejected" } }),
    ]);

    return NextResponse.json({
      refunds: mapped,
      pendingCount,
      approvedCount,
      inTransitCount,
      returnedCount,
      refundedCount,
      rejectedCount,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error desconocido";
    console.error("[Refunds API] GET error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { action, refundId } = body;
    if (!refundId)
      return NextResponse.json({ error: "ID requerido" }, { status: 400 });

    if (action === "approve") {
      const {
        return_address,
        return_shipping_cost,
        return_shipping_paid_by,
        admin_notes,
      } = body;
      if (!return_address?.trim())
        return NextResponse.json(
          { error: "Dirección requerida" },
          { status: 400 },
        );

      const refund = await db.refundRequest.findUnique({
        where: { id: refundId },
      });
      if (!refund)
        return NextResponse.json({ error: "No encontrada" }, { status: 404 });
      if (refund.status !== "pending")
        return NextResponse.json(
          { error: "Solo solicitudes pendientes" },
          { status: 400 },
        );

      await db.refundRequest.update({
        where: { id: refundId },
        data: {
          status: "approved",
          return_address: return_address.trim(),
          return_shipping_cost:
            return_shipping_cost != null ? Number(return_shipping_cost) : null,
          return_shipping_paid_by: return_shipping_paid_by || "buyer",
          admin_notes: admin_notes?.trim() || null,
          updated_by: body.updated_by || null,
        },
      });

      triggerRefundEmail(refundId, true);
      triggerRefundEmail(refundId, true, "approved_seller");
      return NextResponse.json({ success: true });
    }

    if (action === "reject") {
      const refund = await db.refundRequest.findUnique({
        where: { id: refundId },
      });
      if (!refund)
        return NextResponse.json({ error: "No encontrada" }, { status: 404 });
      if (refund.status !== "pending")
        return NextResponse.json(
          { error: "Solo solicitudes pendientes" },
          { status: 400 },
        );

      await db.refundRequest.update({
        where: { id: refundId },
        data: {
          status: "rejected",
          admin_notes: body.admin_notes?.trim() || null,
          updated_by: body.updated_by || null,
        },
      });

      triggerRefundEmail(refundId, false);
      return NextResponse.json({ success: true });
    }

    if (action === "process_refund") {
      return await handleProcessRefund(
        refundId,
        body.refund_method,
        body.refund_reference,
        body.updated_by,
      );
    }

    return NextResponse.json({ error: "Acción no válida" }, { status: 400 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error desconocido";
    console.error("[Refunds API] PATCH error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

async function handleProcessRefund(
  refundId: string,
  method?: string,
  refReference?: string,
  updatedBy?: string,
) {
  const refund = await db.refundRequest.findUnique({
    where: { id: refundId },
    select: {
      id: true,
      status: true,
      type: true,
      refund_amount: true,
      order: {
        select: {
          id: true,
          payment_transaction_id: true,
          paymentTransaction: {
            select: {
              id: true,
              transaction_id: true,
              provider: true,
            },
          },
          packages: {
            take: 1,
            select: { company: { select: { tax_id: true } } },
          },
        },
      },
      items: { select: { order_item_id: true } },
    },
  });

  if (!refund)
    return NextResponse.json(
      { error: "Solicitud no encontrada" },
      { status: 404 },
    );
  if (refund.status !== "return_received")
    return NextResponse.json(
      { error: "La devolución debe estar confirmada" },
      { status: 400 },
    );

  const isNiubiz = !method || method === "niubiz";

  if (isNiubiz) {
    const tx = refund.order.paymentTransaction;
    if (!tx)
      return NextResponse.json(
        { error: "No se encontró la transacción de pago" },
        { status: 400 },
      );
    if (tx.provider !== "niubiz")
      return NextResponse.json(
        { error: "Solo reembolsos Niubiz" },
        { status: 400 },
      );
    if (!tx.transaction_id)
      return NextResponse.json(
        { error: "Faltan datos de la transacción" },
        { status: 400 },
      );

    const rawRuc = refund.order.packages[0]?.company?.tax_id;
    const companyRuc = rawRuc
      ? rawRuc.replace(/\D/g, "").slice(-11)
      : process.env.NIUBIZ_COMPANY_RUC || "20614600374";

    if (companyRuc.length !== 11) {
      return NextResponse.json(
        {
          error: `El RUC de la empresa no es válido (${companyRuc} no tiene 11 dígitos)`,
        },
        { status: 400 },
      );
    }

    try {
      const result = await processNiubizRefund(
        tx.transaction_id,
        companyRuc,
        Number(refund.refund_amount),
        refundId,
      );
      await applyRefundDbUpdates(
        refund,
        tx.id,
        result.rawResponse ?? null,
        method,
        refReference,
        updatedBy,
      );
      triggerRefundEmail(refundId, true, "completed");
      return NextResponse.json({
        success: true,
        cancellationCode: result.cancellationCode,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error Niubiz";
      if (msg.includes("cambió mientras se procesaba")) {
        return NextResponse.json({ error: msg }, { status: 409 });
      }
      return NextResponse.json(
        { error: err instanceof Error ? err.message : "Error Niubiz" },
        { status: 400 },
      );
    }
  }

  try {
    await applyRefundDbUpdates(
      refund,
      refund.order.paymentTransaction?.id,
      null,
      method!,
      refReference,
      updatedBy,
    );
    triggerRefundEmail(refundId, true, "completed");
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error";
    if (msg.includes("cambió mientras se procesaba")) {
      return NextResponse.json({ error: msg }, { status: 409 });
    }
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

async function applyRefundDbUpdates(
  refund: {
    id: string;
    type: string;
    order: { id: string };
    items: { order_item_id: string }[];
  },
  txId: string | null | undefined,
  rawResponse: any,
  refundMethod?: string,
  refundReference?: string,
  updatedBy?: string,
) {
  await db.$transaction(async (prisma) => {
    const current = await prisma.refundRequest.findUnique({
      where: { id: refund.id },
      select: { status: true },
    });

    if (current?.status !== "return_received") {
      throw new Error(
        "El estado del reembolso cambió mientras se procesaba. Verifica e intenta de nuevo.",
      );
    }

    if (txId) {
      await prisma.paymentTransaction.update({
        where: { id: txId },
        data: {
          status: "refunded",
          raw_response: rawResponse,
        },
      });
    }

    await prisma.refundRequest.update({
      where: { id: refund.id },
      data: {
        status: "refunded",
        processed_at: new Date(),
        refund_method: refundMethod || "niubiz",
        refund_reference: refundReference?.trim() || null,
        updated_by: updatedBy || null,
      },
    });

    if (refund.type === "full") {
      await prisma.order.update({
        where: { id: refund.order.id },
        data: { status: "refunded" },
      });
    }

    // Reintegrar atómicamente el stock devuelto al inventario del vendedor
    const refundItems = await prisma.refundItem.findMany({
      where: { request_id: refund.id },
    });

    for (const ri of refundItems) {
      if (ri.order_item_id) {
        const oi = await prisma.orderItem.findUnique({
          where: { id: ri.order_item_id },
          select: { product_id: true },
        });
        if (oi?.product_id) {
          await prisma.product.update({
            where: { id: oi.product_id },
            data: { stock: { increment: ri.quantity } },
          });
        }
      }
    }

    const refundedItemIds = refund.items.map((i) => i.order_item_id);
    const packages = await prisma.orderPackage.findMany({
      where: {
        order_id: refund.order.id,
        items: { some: { id: { in: refundedItemIds } } },
      },
      select: { id: true },
    });

    for (const pkg of packages) {
      await recalculatePackagePayoutInTransaction(pkg.id, prisma);
    }
  });
}

async function recalculatePackagePayoutInTransaction(
  packageId: string,
  prisma: any,
) {
  const pkg = await prisma.orderPackage.findUnique({
    where: { id: packageId },
    include: {
      items: true,
      order: {
        select: {
          id: true,
          refundRequests: {
            select: {
              id: true,
              status: true,
              items: { select: { order_item_id: true, quantity: true } },
            },
          },
        },
      },
      payouts: true,
    },
  });

  if (!pkg) return;

  const approvedRefunds = (pkg.order?.refundRequests || []).filter(
    (r: any) => r.status === "refunded",
  );

  const refundQtyByOrderItem = new Map<string, number>();
  for (const refund of approvedRefunds) {
    for (const item of refund.items || []) {
      const currentQty = refundQtyByOrderItem.get(item.order_item_id) || 0;
      refundQtyByOrderItem.set(item.order_item_id, currentQty + item.quantity);
    }
  }

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

  let commission = 0;
  let netAmount = 0;
  let targetStatus = "in_hold";

  if (effectiveSubtotal <= 0) {
    commission = 0;
    netAmount = 0;
    targetStatus = "refunded";
  } else {
    if (effectiveSubtotal < 40) {
      commission = Number((effectiveSubtotal * 0.09 + 2.5).toFixed(2));
    } else {
      commission = Number((effectiveSubtotal * 0.09).toFixed(2));
    }
    netAmount = Math.max(
      0,
      Number((effectiveSubtotal - commission).toFixed(2)),
    );

    const deliveryDate = pkg.updated_at
      ? new Date(pkg.updated_at)
      : new Date(pkg.created_at || Date.now());
    const protectionEndDate = new Date(
      deliveryDate.getTime() + 7 * 24 * 60 * 60 * 1000,
    );
    const hasPendingRefund = (pkg.order?.refundRequests || []).some(
      (r: any) => r.status === "pending" || r.status === "return_received",
    );

    if (new Date() >= protectionEndDate && !hasPendingRefund) {
      targetStatus = "pending";
    } else {
      targetStatus = "in_hold";
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

    await prisma.sellerPayout.update({
      where: { id: existingPayout.id },
      data: {
        subtotal: effectiveSubtotal,
        commission: commission,
        net_amount: netAmount,
        status: finalStatus,
      },
    });
  } else if (effectiveSubtotal > 0) {
    await prisma.sellerPayout.create({
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
}
