import { NextResponse } from "next/server";
import { db } from "@iubizon/db";
import { getPayoutProvider } from "@/lib/payout-providers";

function parseBankAccount(ba: string | null) {
  if (!ba) return null;
  try {
    const parsed = JSON.parse(ba);
    return {
      bankName: parsed.bank_name || parsed.bankName || "",
      accountNumber: parsed.account_number || parsed.accountNumber || "",
      accountType: parsed.account_type || parsed.accountType || "AHORROS",
    };
  } catch {
    return null;
  }
}

function parsePayoutCard(pc: any) {
  if (!pc) return null;
  try {
    const c = typeof pc === "string" ? JSON.parse(pc) : pc;
    return {
      cardNumber: c.cardNumber || null,
      expirationMonth: c.expirationMonth || null,
      expirationYear: c.expirationYear || null,
      alias: c.alias || null,
      aliasType: c.aliasType || null,
    };
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "all";
  const status = searchParams.get("status") || "";
  const company = searchParams.get("company") || "";

  if (type === "transactions") {
    const where: any = {};
    const txs = await db.paymentTransaction.findMany({
      where,
      orderBy: { created_at: "desc" },
      take: 50,
      include: { orders: { select: { order_code: true } } },
    });
    return NextResponse.json({ transactions: txs });
  }

  const where: any = {};
  if (status) where.status = status;
  if (company) {
    where.company = { name: { contains: company, mode: "insensitive" } };
  }

  const [payouts, totalPending, totalInHold, totalPaid] = await Promise.all([
    db.sellerPayout.findMany({
      where,
      orderBy: { created_at: "desc" },
      take: 50,
      include: {
        company: {
          select: {
            id: true,
            name: true,
            email: true,
            bank_account: true,
            payout_card: true,
          },
        },
      },
    }),
    db.sellerPayout.aggregate({
      where: { status: "pending" },
      _sum: { net_amount: true },
    }),
    db.sellerPayout.aggregate({
      where: { status: "in_hold" },
      _sum: { net_amount: true },
    }),
    db.sellerPayout.aggregate({
      where: { status: "paid" },
      _sum: { net_amount: true },
    }),
  ]);

  const adminIds = [
    ...new Set(payouts.map((p) => p.updated_by).filter(Boolean)),
  ] as string[];
  if (adminIds.length > 0) {
    const profiles = await db.profile.findMany({
      where: { id: { in: adminIds } },
      select: { id: true, name: true },
    });
    const pm = new Map(profiles.map((p) => [p.id, p.name]));
    payouts.forEach((p) => {
      if (p.updated_by)
        (p as any).updated_by_name = pm.get(p.updated_by) || null;
    });
  }

  return NextResponse.json({
    payouts,
    summary: {
      totalPending: Number(totalPending._sum.net_amount || 0),
      totalInHold: Number(totalInHold._sum.net_amount || 0),
      totalPaid: Number(totalPaid._sum.net_amount || 0),
      count: payouts.length,
      pendingCount: payouts.filter((p) => p.status === "pending").length,
      inHoldCount: payouts.filter((p) => p.status === "in_hold").length,
      paidCount: payouts.filter((p) => p.status === "paid").length,
    },
  });
}

export async function PATCH(req: Request) {
  const {
    id,
    status,
    payment_method,
    reference_code,
    notes,
    payment_proof,
    updated_by,
  } = await req.json();

  const targetPayout = await db.sellerPayout.findUnique({
    where: { id },
    select: { status: true },
  });

  if (!targetPayout) {
    return NextResponse.json(
      { error: "Payout no encontrado" },
      { status: 404 },
    );
  }

  if (targetPayout.status === "paid" && status === "paid") {
    return NextResponse.json(
      {
        error:
          "Esta retribución ya ha sido transferida y marcada como abonada previamente.",
      },
      { status: 400 },
    );
  }

  if (targetPayout.status === "in_hold" && status === "paid") {
    return NextResponse.json(
      {
        error:
          "Este abono está en periodo de garantía (7 días) de protección al comprador. No puede ser transferido aún.",
      },
      { status: 400 },
    );
  }

  const data: any = {};
  if (status) data.status = status;
  if (payment_method) data.payment_method = payment_method;
  if (reference_code) data.reference_code = reference_code;
  if (notes !== undefined) data.notes = notes;
  if (status === "paid") data.paid_at = new Date();
  if (payment_proof) data.payment_proof = payment_proof;
  if (updated_by) data.updated_by = updated_by;

  if (status === "paid" && payment_method && payment_method !== "manual") {
    try {
      const payout = await db.sellerPayout.findUnique({
        where: { id },
        include: {
          company: {
            select: {
              id: true,
              name: true,
              tax_id: true,
              bank_account: true,
              payout_card: true,
            },
          },
        },
      });

      if (!payout) {
        return NextResponse.json(
          { error: "Payout no encontrado" },
          { status: 404 },
        );
      }

      const bankInfo = parseBankAccount(payout.company?.bank_account ?? null);
      const cardInfo = parsePayoutCard(payout.company?.payout_card ?? null);

      if (!bankInfo?.accountNumber) {
        return NextResponse.json(
          { error: "La empresa no tiene datos bancarios registrados" },
          { status: 400 },
        );
      }

      if (payment_method === "niubiz" && !cardInfo?.cardNumber) {
        return NextResponse.json(
          {
            error:
              "La empresa vendedora no tiene registrada una Tarjeta P2P o Yape/Plin válida para abonos automáticos Niubiz.",
          },
          { status: 400 },
        );
      }

      const p2pLimit = Number(process.env.NIUBIZ_P2P_MAX_AMOUNT || 500);
      const amount = Number(payout.net_amount);
      if (payment_method === "niubiz" && amount > p2pLimit) {
        return NextResponse.json(
          {
            error: `Niubiz P2P no permite pagos mayores a S/ ${p2pLimit} en sandbox. Usa "Marcar Pagado Manual" para este monto (S/ ${amount.toFixed(2)}). En producción el límite se configura con Niubiz.`,
          },
          { status: 400 },
        );
      }

      const provider = getPayoutProvider(payment_method);
      const result = await provider.processPayout({
        amount: Number(payout.net_amount),
        recipientName: payout.company?.name || "Vendedor",
        recipientDocumentType: "RUC",
        recipientDocumentNumber: payout.company?.tax_id || "",
        bankAccount: bankInfo,
        payoutCard: cardInfo,
        ruc: process.env.NIUBIZ_COMPANY_RUC || "20614600374",
        externalReferenceId: id,
        comment: notes || "Pago iubizon",
      });

      if (!result.success) {
        return NextResponse.json(
          { error: "El proveedor de pago rechazó la operación" },
          { status: 400 },
        );
      }

      data.payout_response = result.rawResponse;
      if (result.transactionId && !reference_code) {
        data.reference_code = result.transactionId;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error en el pago";
      console.error("[Payments API] Payout error:", msg);
      return NextResponse.json({ error: msg }, { status: 400 });
    }
  }

  await db.sellerPayout.update({ where: { id }, data });
  return NextResponse.json({ success: true });
}
