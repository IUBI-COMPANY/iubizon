import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { ensureSellerPayoutForPackages } from "@/lib/payoutService";
import { getProtectionDays } from "@/lib/services/platformSettings";

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
  availableAt?: string | null;
  trackingNumber?: string | null;
  orderCode?: string | null;
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
          inHoldTotal: 0,
          pendingTotal: 0,
          paidTotal: 0,
          accumulatedTotal: 0,
          totalCount: 0,
        },
      });
    }

    // Sincronizar paquetes entregados sin payout o en recalculo
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
      include: {
        package: {
          select: {
            tracking_number: true,
            updated_at: true,
            created_at: true,
            order: { select: { order_code: true } },
          },
        },
      },
      orderBy: { created_at: "desc" },
    });

    const protectionDays = await getProtectionDays();

    let inHoldTotal = 0;
    let pendingTotal = 0;
    let paidTotal = 0;
    let accumulatedTotal = 0;

    const payoutsList: SellerPayoutItem[] = rawPayouts.map((p) => {
      const net = Number(p.net_amount || 0);
      const sub = Number(p.subtotal || 0);
      const comm = Number(p.commission || 0);

      if (p.status === "in_hold") {
        inHoldTotal += net;
      } else if (p.status === "pending" || p.status === "processing") {
        pendingTotal += net;
      } else if (p.status === "paid") {
        paidTotal += net;
      }
      accumulatedTotal += net;

      const deliveryDate = p.package?.updated_at
        ? new Date(p.package.updated_at)
        : p.created_at
          ? new Date(p.created_at)
          : new Date();

      const availableDate = new Date(
        deliveryDate.getTime() + protectionDays * 24 * 60 * 60 * 1000,
      );

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
        availableAt: availableDate.toISOString(),
        trackingNumber: p.package?.tracking_number || null,
        orderCode: p.package?.order?.order_code || null,
      };
    });

    return NextResponse.json({
      payouts: payoutsList,
      kpis: {
        inHoldTotal,
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
