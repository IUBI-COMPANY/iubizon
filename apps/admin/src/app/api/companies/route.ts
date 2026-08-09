import { NextResponse } from "next/server";
import { db } from "@iubizon/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";

  const where: any = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { legal_name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  const [companies, total] = await Promise.all([
    db.company.findMany({
      where,
      include: {
        _count: { select: { products: true, companyMembers: true } },
      },
      orderBy: { created_at: "desc" },
      take: 50,
    }),
    db.company.count({ where }),
  ]);

  return NextResponse.json({ companies, total });
}

export async function PATCH(req: Request) {
  const { id, is_verified } = await req.json();
  await db.company.update({ where: { id }, data: { is_verified } });
  return NextResponse.json({ success: true });
}
