import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { calculateRefundAmount } from "@/lib/services/refund";
import { getProtectionDays } from "@/lib/services/platformSettings";
import {
  sendReturnShippedNotification,
  sendReturnReceivedNotification,
} from "@/lib/email";

export async function POST(req: Request) {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const body = await req.json();
    const { orderId, reason, type, items } = body;

    if (!orderId || !reason?.trim()) {
      return NextResponse.json(
        { error: "Orden y motivo son requeridos" },
        { status: 400 },
      );
    }
    if (!["full", "partial"].includes(type)) {
      return NextResponse.json({ error: "Tipo inválido" }, { status: 400 });
    }
    if (type === "partial" && (!items || items.length === 0)) {
      return NextResponse.json(
        { error: "Selecciona al menos un producto para reembolso parcial" },
        { status: 400 },
      );
    }

    // 1. Verificar que la orden existe y es del comprador
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        order_code: true,
        buyer_id: true,
        status: true,
        total_amount: true,
        created_at: true,
      },
    });
    if (!order)
      return NextResponse.json(
        { error: "Orden no encontrada" },
        { status: 404 },
      );
    if (order.buyer_id !== user.id) {
      return NextResponse.json(
        { error: "Esta orden no te pertenece" },
        { status: 403 },
      );
    }

    // 2. La orden debe estar delivered o completed
    if (!["delivered", "completed"].includes(order.status)) {
      return NextResponse.json(
        { error: "Solo puedes solicitar reembolso de órdenes entregadas" },
        { status: 400 },
      );
    }

    // 3. Dentro del plazo de protección
    const protectionDays = await getProtectionDays();
    const daysSinceOrder = order.created_at
      ? Math.floor(
          (Date.now() - new Date(order.created_at).getTime()) /
            (1000 * 3600 * 24),
        )
      : 0;
    if (daysSinceOrder > protectionDays) {
      return NextResponse.json(
        {
          error: `El plazo de protección de ${protectionDays} días ha expirado`,
        },
        { status: 400 },
      );
    }

    // 4. Verificar conflictos
    if (type === "partial") {
      const itemIds = items.map((i: any) => i.orderItemId);
      const conflictingItem = await prisma.refundItem.findFirst({
        where: {
          order_item_id: { in: itemIds },
          request: {
            order_id: orderId,
            status: { in: ["pending", "approved"] },
          },
        },
      });
      if (conflictingItem) {
        return NextResponse.json(
          {
            error:
              "Uno o más productos seleccionados ya tienen un reembolso pendiente",
          },
          { status: 400 },
        );
      }
    } else {
      // Full: no puede existir ninguna solicitud activa en la orden
      const existing = await prisma.refundRequest.findFirst({
        where: { order_id: orderId, status: { in: ["pending", "approved"] } },
      });
      if (existing) {
        return NextResponse.json(
          {
            error: "Ya existe una solicitud de reembolso para esta orden",
          },
          { status: 400 },
        );
      }
    }

    // 5. Si es partial, validar que los items pertenezcan a la orden
    if (type === "partial") {
      const itemIds = items.map((i: any) => i.orderItemId);
      const orderItems = await prisma.orderItem.findMany({
        where: {
          id: { in: itemIds },
          package: { order_id: orderId },
        },
        select: { id: true },
      });
      if (orderItems.length !== itemIds.length) {
        return NextResponse.json(
          { error: "Uno o más productos no pertenecen a esta orden" },
          { status: 400 },
        );
      }
    }

    // 6. Calcular monto
    const calc = await calculateRefundAmount({ orderId, type, items });

    if (calc.refundAmount <= 0) {
      return NextResponse.json(
        { error: "El monto a reembolsar debe ser mayor a S/ 0" },
        { status: 400 },
      );
    }

    // 7. Crear solicitud
    const refund = await prisma.refundRequest.create({
      data: {
        order_id: orderId,
        buyer_id: user.id,
        reason: reason.trim(),
        type,
        refund_amount: calc.refundAmount,
        platform_fee: 0,
        net_refund: calc.refundAmount,
        items:
          type === "partial"
            ? {
                create: calc.items.map((item) => ({
                  order_item_id: item.orderItemId,
                  quantity: item.quantity,
                  unit_price: item.unitPrice,
                  subtotal: item.subtotal,
                })),
              }
            : undefined,
      },
      include: { items: true },
    });

    return NextResponse.json({ refund, success: true });
  } catch (err: unknown) {
    console.error("[Refund API] Error:", err);
    const msg =
      err instanceof Error ? err.message : "Error al procesar solicitud";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

export async function GET(req: Request) {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId");

    if (!orderId) {
      return NextResponse.json(
        { error: "orderId es requerido" },
        { status: 400 },
      );
    }

    const isBuyer = await prisma.order.findFirst({
      where: { id: orderId, buyer_id: user.id },
      select: { id: true },
    });

    const isSeller = !isBuyer
      ? await prisma.orderPackage.findFirst({
          where: {
            order_id: orderId,
            company: { companyMembers: { some: { user_id: user.id } } },
          },
          select: { id: true },
        })
      : null;

    if (!isBuyer && !isSeller) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const requests = await prisma.refundRequest.findMany({
      where: { order_id: orderId },
      orderBy: { created_at: "desc" },
      include: { items: true },
    });

    const itemIds = requests.flatMap((r) =>
      r.items.map((i) => i.order_item_id),
    );
    const orderItems =
      itemIds.length > 0
        ? await prisma.orderItem.findMany({
            where: { id: { in: itemIds } },
            include: {
              product: {
                select: {
                  title: true,
                  images: {
                    take: 1,
                    orderBy: { position: "asc" },
                    select: { url: true },
                  },
                },
              },
              package: {
                select: { company: { select: { name: true } } },
              },
            },
          })
        : [];

    const requestsEnriched = requests.map((r) => ({
      ...r,
      items: r.items.map((item) => {
        const oi = orderItems.find((oi) => oi.id === item.order_item_id);
        return {
          ...item,
          product_title: oi?.product?.title ?? null,
          product_image: oi?.product?.images?.[0]?.url ?? null,
          company_name: oi?.package?.company?.name ?? null,
        };
      }),
    }));

    return NextResponse.json({ requests: requestsEnriched });
  } catch (err) {
    console.error("[Refund API] Error GET:", err);
    return NextResponse.json(
      { error: "Error al consultar reembolsos" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const body = await req.json();
    const { refundId, action } = body;

    if (!refundId)
      return NextResponse.json(
        { error: "ID de solicitud requerido" },
        { status: 400 },
      );

    if (action === "register_return") {
      return handleRegisterReturn(refundId, user.id, body);
    }

    if (action === "confirm_return") {
      return handleConfirmReturn(refundId, user.id);
    }

    return NextResponse.json({ error: "Acción no válida" }, { status: 400 });
  } catch (err) {
    console.error("[Refund API] Error PATCH:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

async function handleRegisterReturn(
  refundId: string,
  userId: string,
  body: any,
) {
  const {
    buyerReturnTracking,
    returnCourier,
    returnTrackingUrl,
    returnEstimatedDelivery,
  } = body;

  if (!buyerReturnTracking?.trim() || !returnCourier?.trim()) {
    return NextResponse.json(
      { error: "Tracking y empresa de transporte son requeridos" },
      { status: 400 },
    );
  }

  const refund = await prisma.refundRequest.findUnique({
    where: { id: refundId },
    select: { id: true, buyer_id: true, status: true },
  });

  if (!refund)
    return NextResponse.json(
      { error: "Solicitud no encontrada" },
      { status: 404 },
    );
  if (refund.buyer_id !== userId)
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  if (refund.status !== "approved") {
    return NextResponse.json(
      { error: "La solicitud debe estar aprobada para registrar el envío" },
      { status: 400 },
    );
  }

  const updated = await prisma.refundRequest.update({
    where: { id: refundId },
    data: {
      buyer_return_tracking: buyerReturnTracking.trim(),
      return_courier: returnCourier.trim(),
      return_tracking_url: returnTrackingUrl?.trim() || null,
      return_estimated_delivery: returnEstimatedDelivery
        ? new Date(returnEstimatedDelivery)
        : null,
      status: "return_in_transit",
    },
  });

  sendReturnShippedNotification(refundId).catch((err) =>
    console.error(
      "[Refund API] Error enviando notificación de devolución:",
      err,
    ),
  );

  return NextResponse.json({ refund: updated, success: true });
}

async function handleConfirmReturn(refundId: string, userId: string) {
  const refund = await prisma.refundRequest.findUnique({
    where: { id: refundId },
    select: {
      id: true,
      status: true,
      items: { select: { order_item_id: true } },
      order: {
        select: {
          packages: {
            select: {
              company: {
                select: {
                  companyMembers: {
                    where: { user_id: userId },
                    select: { id: true },
                  },
                },
              },
              items: { select: { id: true } },
            },
          },
        },
      },
    },
  });

  if (!refund)
    return NextResponse.json(
      { error: "Solicitud no encontrada" },
      { status: 404 },
    );

  const refundedItemIds = new Set(refund.items.map((i) => i.order_item_id));

  const isSellerOfRefundedItems = refund.order.packages.some((p) => {
    if (p.company.companyMembers.length === 0) return false;
    const hasRefundedItem = p.items.some((item) =>
      refundedItemIds.has(item.id),
    );
    return hasRefundedItem;
  });

  if (!isSellerOfRefundedItems) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  if (refund.status !== "return_in_transit") {
    return NextResponse.json(
      { error: "El producto aún no está en camino de vuelta" },
      { status: 400 },
    );
  }

  const updated = await prisma.refundRequest.update({
    where: { id: refundId },
    data: { status: "return_received" },
  });

  sendReturnReceivedNotification(refundId).catch((err) =>
    console.error(
      "[Refund API] Error enviando notificación de recepción:",
      err,
    ),
  );

  return NextResponse.json({ refund: updated, success: true });
}
