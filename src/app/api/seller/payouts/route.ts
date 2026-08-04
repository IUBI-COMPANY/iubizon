import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { ensureSellerPayoutForOrders } from "@/lib/payoutService";

export interface SellerPayoutItem {
  id: string;
  trackingNumber: string | null;
  orderCode: string | null;
  subtotal: number;
  commission: number;
  netAmount: number;
  status: string; // "pending", "processing", "paid", "cancelled"
  paidAt: string | null;
  paymentMethod: string | null;
  referenceCode: string | null;
  notes: string | null;
  createdAt: string;
}

export async function GET() {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // 1. Sincronizar automáticamente cualquier orden entregada del vendedor que no tenga payout aún
    const deliveredOrders = await prisma.order.findMany({
      where: {
        OR: [
          { seller_id: user.id },
          { company: { companyMembers: { some: { user_id: user.id } } } },
        ],
        status: { in: ["delivered", "completed"] },
      },
      select: { id: true },
    });

    if (deliveredOrders.length > 0) {
      await ensureSellerPayoutForOrders(deliveredOrders.map((o) => o.id));
    }

    // 2. Obtener miembros de las compañías a las que pertenece el usuario
    const userCompanyMemberships = await prisma.companyMember.findMany({
      where: { user_id: user.id },
      select: { company_id: true },
    });
    const companyIds = userCompanyMemberships.map((m) => m.company_id);

    const coMembers = await prisma.companyMember.findMany({
      where: { company_id: { in: companyIds } },
      select: { user_id: true },
    });
    const relatedSellerIds = Array.from(
      new Set([user.id, ...coMembers.map((m) => m.user_id)]),
    );

    // 3. Obtener todos los registros de pago del vendedor o su empresa
    const rawPayouts = await prisma.sellerPayout.findMany({
      where: {
        seller_id: { in: relatedSellerIds },
      },
      orderBy: { created_at: "desc" },
    });

    let pendingTotal = 0;
    let paidTotal = 0;
    let accumulatedTotal = 0;

    const payoutsList: SellerPayoutItem[] = rawPayouts.map((p) => {
      const net = Number(p.net_amount || 0);
      const sub = Number(p.subtotal || 0);
      const comm = Number(p.commission || 0);

      if (p.status === "pending" || p.status === "processing") {
        pendingTotal += net;
      } else if (p.status === "paid") {
        paidTotal += net;
      }
      accumulatedTotal += net;

      return {
        id: p.id,
        trackingNumber: p.tracking_number,
        orderCode: p.order_code,
        subtotal: sub,
        commission: comm,
        netAmount: net,
        status: p.status,
        paidAt: p.paid_at ? p.paid_at.toISOString() : null,
        paymentMethod: p.payment_method,
        referenceCode: p.reference_code,
        notes: p.notes,
        createdAt: p.created_at
          ? p.created_at.toISOString()
          : new Date().toISOString(),
      };
    });

    return NextResponse.json({
      payouts: payoutsList,
      kpis: {
        pendingTotal,
        paidTotal,
        accumulatedTotal,
        totalCount: payoutsList.length,
      },
    });
  } catch (err: unknown) {
    console.error("Error al obtener pagos del vendedor:", err);
    return NextResponse.json(
      { error: "Error al cargar historial de pagos" },
      { status: 500 },
    );
  }
}
