import { NextResponse } from "next/server";
import { db } from "@iubizon/db";

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

  const [payouts, totalPending, totalPaid] = await Promise.all([
    db.sellerPayout.findMany({
      where,
      orderBy: { created_at: "desc" },
      take: 50,
      include: {
        company: {
          select: { id: true, name: true, email: true, bank_account: true },
        },
      },
    }),
    db.sellerPayout.aggregate({
      where: { status: "pending" },
      _sum: { net_amount: true },
    }),
    db.sellerPayout.aggregate({
      where: { status: "paid" },
      _sum: { net_amount: true },
    }),
  ]);

  return NextResponse.json({
    payouts,
    summary: {
      totalPending: Number(totalPending._sum.net_amount || 0),
      totalPaid: Number(totalPaid._sum.net_amount || 0),
      count: payouts.length,
      pendingCount: payouts.filter((p) => p.status === "pending").length,
      paidCount: payouts.filter((p) => p.status === "paid").length,
    },
  });
}

export async function PATCH(req: Request) {
  const { id, status, payment_method, reference_code, notes } =
    await req.json();
  const data: any = {};
  if (status) data.status = status;
  if (payment_method) data.payment_method = payment_method;
  if (reference_code) data.reference_code = reference_code;
  if (notes !== undefined) data.notes = notes;
  if (status === "paid" || status === "processing") data.paid_at = new Date();

  await db.sellerPayout.update({ where: { id }, data });
  return NextResponse.json({ success: true });
}
