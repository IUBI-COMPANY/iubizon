import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { ensureSellerPayoutForPackages } from "@/lib/payoutService";

export interface SellerPayoutItem {
  id: string;
  packageId: string;
  subtotal: number;
  commission: number;
  netAmount: number;
  status: string;
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

    const memberships = await prisma.companyMember.findMany({
      where: { user_id: user.id },
      select: { company_id: true },
    });
    const companyIds = memberships.map((m) => m.company_id);

    if (companyIds.length === 0) {
      return NextResponse.json({
        payouts: [],
        kpis: {
          pendingTotal: 0,
          paidTotal: 0,
          accumulatedTotal: 0,
          totalCount: 0,
        },
      });
    }

    // Sincronizar paquetes entregados sin payout
    const deliveredPackages = await prisma.orderPackage.findMany({
      where: {
        company_id: { in: companyIds },
        status: { in: ["delivered", "completed"] },
      },
      select: { id: true },
    });

    if (deliveredPackages.length > 0) {
      await ensureSellerPayoutForPackages(deliveredPackages.map((p) => p.id));
    }

    const rawPayouts = await prisma.sellerPayout.findMany({
      where: { company_id: { in: companyIds } },
      orderBy: { created_at: "desc" },
    });

    let pendingTotal = 0;
    let paidTotal = 0;
    let accumulatedTotal = 0;

    const payoutsList: SellerPayoutItem[] = rawPayouts.map((p) => {
      const net = Number(p.net_amount || 0);
      const sub = Number(p.subtotal || 0);
      const comm = Number(p.commission || 0);

      if (p.status === "pending" || p.status === "processing")
        pendingTotal += net;
      else if (p.status === "paid") paidTotal += net;
      accumulatedTotal += net;

      return {
        id: p.id,
        packageId: p.package_id,
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
