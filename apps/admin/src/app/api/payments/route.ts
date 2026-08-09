import { NextResponse } from "next/server";
import { db } from "@iubizon/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "transactions"; // transactions | payouts

  if (type === "payouts") {
    const payouts = await db.sellerPayout.findMany({
      orderBy: { created_at: "desc" },
      take: 50,
      include: { company: { select: { id: true, name: true } } },
    });
    return NextResponse.json({ payouts });
  }

  const transactions = await db.paymentTransaction.findMany({
    orderBy: { created_at: "desc" },
    take: 50,
    include: { orders: { select: { order_code: true } } },
  });

  return NextResponse.json({ transactions });
}

export async function PATCH(req: Request) {
  const { id, status, payment_method, reference_code, notes } = await req.json();
  await db.sellerPayout.update({
    where: { id },
    data: {
      ...(status && { status }),
      ...(payment_method && { payment_method }),
      ...(reference_code && { reference_code }),
      ...(notes && { notes }),
      ...(status === "paid" ? { paid_at: new Date() } : {}),
    },
  });
  return NextResponse.json({ success: true });
}
