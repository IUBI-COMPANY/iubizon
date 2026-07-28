import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const excludeIds = searchParams.get("exclude")?.split(",").filter(Boolean) || [];

    // Obtener productos activos para mostrar como Order Bumps / Productos Complementarios
    const products = await prisma.product.findMany({
      where: {
        status: "active",
        id: { notIn: excludeIds },
      },
      take: 6,
      select: {
        id: true,
        title: true,
        price: true,
        seller_id: true,
        company_id: true,
        images: {
          orderBy: { position: "asc" },
          take: 1,
        },
      },
      orderBy: { views: "desc" },
    });

    const formatted = products.map((p) => ({
      id: p.id,
      title: p.title,
      price: Number(p.price),
      seller_id: p.seller_id,
      company_id: p.company_id,
      image_url: p.images[0]?.url || null,
    }));

    return NextResponse.json({ recommendations: formatted });
  } catch (err) {
    console.error("Error al obtener recomendaciones:", err);
    return NextResponse.json({ recommendations: [] });
  }
}
