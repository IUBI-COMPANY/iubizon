import { NextResponse } from "next/server";
import { db } from "@iubizon/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || "";

  const where: any = {};
  if (status) where.status = status;

  const [orders, total] = await Promise.all([
    db.order.findMany({
      where,
      include: {
        buyer: { select: { name: true, email: true } },
        shipping: true,
        invoice: true,
        packages: {
          include: {
            company: { select: { name: true } },
            items: { include: { product: { select: { title: true } } } },
          },
        },
      },
      orderBy: { created_at: "desc" },
      take: 50,
    }),
    db.order.count({ where }),
  ]);

  return NextResponse.json({ orders, total });
}

export async function PATCH(req: Request) {
  const { id, status } = await req.json();
  await db.order.update({ where: { id }, data: { status } });
  return NextResponse.json({ success: true });
}
