import { NextResponse } from "next/server";
import { db } from "@iubizon/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || "";
  const search = searchParams.get("search") || "";

  const where: any = {};
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { brand: { contains: search, mode: "insensitive" } },
    ];
  }

  const [products, total] = await Promise.all([
    db.product.findMany({
      where,
      include: { category: { select: { name: true } }, company: { select: { name: true } }, images: { take: 1, orderBy: { position: "asc" } } },
      orderBy: { updated_at: "desc" },
      take: 50,
    }),
    db.product.count({ where }),
  ]);

  return NextResponse.json({ products, total });
}
