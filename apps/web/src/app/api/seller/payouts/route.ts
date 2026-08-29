import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { ensureSellerPayoutForPackages } from "@/lib/payoutService";
import { getProtectionDays } from "@/lib/services/platformSettings";

export interface SellerPayoutItem {
  id: string;
  orderId?: string | null;
  orderCode?: string | null;
  packageId: string;
  packagesCount?: number;
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
            order_id: true,
            order: { select: { id: true, order_code: true } },
          },
        },
      },
      orderBy: { created_at: "desc" },
    });

    const protectionDays = await getProtectionDays();

    // Consolidar pagos por orden de compra
    const orderPayoutsMap = new Map<string, SellerPayoutItem>();

    for (const p of rawPayouts) {
      const net = Number(p.net_amount || 0);
      const sub = Number(p.subtotal || 0);
      const comm = Number(p.commission || 0);

      const orderKey =
        p.package?.order?.order_code ||
        p.package?.order_id ||
        p.package_id ||
        p.id;
      const orderCode =
        p.package?.order?.order_code ||
        (p.package?.order_id ? `#${p.package.order_id.slice(0, 8)}` : null);

      const deliveryDate = p.package?.updated_at
        ? new Date(p.package.updated_at)
        : p.created_at
          ? new Date(p.created_at)
          : new Date();

      const availableDate = new Date(
        deliveryDate.getTime() + protectionDays * 24 * 60 * 60 * 1000,
      );

      if (!orderPayoutsMap.has(orderKey)) {
        orderPayoutsMap.set(orderKey, {
          id: p.id,
          orderId: p.package?.order_id || p.package?.order?.id || null,
          orderCode,
          packageId: p.package_id,
          packagesCount: 1,
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
        });
      } else {
        const existing = orderPayoutsMap.get(orderKey)!;
        existing.packagesCount = (existing.packagesCount || 1) + 1;
        existing.subtotal += sub;
        existing.commission += comm;
        existing.netAmount += net;
        existing.trackingNumber = null; // Múltiples bultos asociados a la orden

        // Jerarquía de estados: in_hold > processing > pending > paid > refunded
        if (p.status === "in_hold" || existing.status === "in_hold") {
          existing.status = "in_hold";
        } else if (
          p.status === "processing" ||
          existing.status === "processing"
        ) {
          existing.status = "processing";
        } else if (p.status === "pending" || existing.status === "pending") {
          existing.status = "pending";
        }

        // Tomar la fecha de liberación más tardía si hay varios bultos
        if (existing.availableAt) {
          const prevTime = new Date(existing.availableAt).getTime();
          if (availableDate.getTime() > prevTime) {
            existing.availableAt = availableDate.toISOString();
          }
        }
      }
    }

    const payoutsList = Array.from(orderPayoutsMap.values());

    let inHoldTotal = 0;
    let pendingTotal = 0;
    let paidTotal = 0;
    let accumulatedTotal = 0;

    for (const p of payoutsList) {
      if (p.status === "in_hold") {
        inHoldTotal += p.netAmount;
      } else if (p.status === "pending" || p.status === "processing") {
        pendingTotal += p.netAmount;
      } else if (p.status === "paid") {
        paidTotal += p.netAmount;
      }
      accumulatedTotal += p.netAmount;
    }

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
