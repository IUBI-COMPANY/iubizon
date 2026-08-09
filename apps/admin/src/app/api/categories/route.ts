import { NextResponse } from "next/server";
import { db } from "@iubizon/db";

export async function GET() {
  const categories = await db.category.findMany({
    orderBy: { sort_order: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return NextResponse.json({ categories });
}

export async function PATCH(req: Request) {
  const { id, ...data } = await req.json();
  await db.category.update({ where: { id }, data });
  return NextResponse.json({ success: true });
}
