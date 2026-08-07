import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const excludeIds =
      searchParams
        .get("exclude")
        ?.split(",")
        .map((s) => s.trim())
        .filter(Boolean) || [];
    const page = Number(searchParams.get("page") || "1");
    const limit = Number(searchParams.get("limit") || "6");
    const skip = (page - 1) * limit;

    const cartProducts = await prisma.product.findMany({
      where: { id: { in: excludeIds } },
      select: { category: { select: { slug: true } } },
    });

    const cartCategorySlugs = cartProducts
      .map((p) => p.category?.slug)
      .filter((slug): slug is string => typeof slug === "string");

    const affinityMap: Record<string, string[]> = {
      proyectores: ["laptops", "tv-audio", "electronica", "muebles"],
      laptops: ["proyectores", "moviles", "electronica", "tv-audio"],
      electronica: ["laptops", "proyectores", "tv-audio", "muebles"],
      "tv-audio": ["proyectores", "electronica", "laptops"],
      moviles: ["laptops", "electronica"],
      hogar: ["muebles", "electrodomesticos", "herramientas"],
      muebles: ["hogar", "electronica"],
      electrodomesticos: ["hogar", "muebles"],
      herramientas: ["herramientas-manuales", "hogar"],
      "herramientas-manuales": ["herramientas", "hogar"],
    };

    let targetSlugs: string[] = [];
    for (const slug of cartCategorySlugs) {
      if (affinityMap[slug]) targetSlugs.push(...affinityMap[slug]);
    }
    targetSlugs = Array.from(new Set(targetSlugs));

    const affinityProducts = await prisma.product.findMany({
      where: {
        status: "active",
        stock: { gt: 0 },
        id: excludeIds.length > 0 ? { notIn: excludeIds } : undefined,
        category:
          targetSlugs.length > 0 ? { slug: { in: targetSlugs } } : undefined,
      },
      select: { id: true },
      orderBy: { views: "desc" },
    });
    const affinityIds = affinityProducts.map((p) => p.id);

    const fallbackProducts = await prisma.product.findMany({
      where: {
        status: "active",
        stock: { gt: 0 },
        id: { notIn: Array.from(new Set([...excludeIds, ...affinityIds])) },
      },
      select: { id: true },
      orderBy: { views: "desc" },
    });
    const fallbackIds = fallbackProducts.map((p) => p.id);

    const allOrderedIds = [...affinityIds, ...fallbackIds];
    const totalCount = allOrderedIds.length;

    const paginatedIds = allOrderedIds.slice(skip, skip + limit);
    const hasMore = skip + limit < totalCount;

    const products = await prisma.product.findMany({
      where: {
        id: {
          in: paginatedIds,
          ...(excludeIds.length > 0 ? { notIn: excludeIds } : {}),
        },
        stock: { gt: 0 },
      },
      select: {
        id: true,
        title: true,
        price: true,
        company_id: true,
        stock: true,
        images: { orderBy: { position: "asc" }, take: 1 },
      },
    });

    const productsMap = new Map(products.map((p) => [p.id, p]));
    const orderedProducts = paginatedIds
      .map((id) => productsMap.get(id))
      .filter((p): p is (typeof products)[number] => !!p);

    const formatted = orderedProducts.map((p) => ({
      id: p.id,
      title: p.title,
      price: Number(p.price),
      company_id: p.company_id,
      stock: p.stock,
      image_url: p.images[0]?.url || null,
    }));

    return NextResponse.json({
      recommendations: formatted,
      pagination: { page, limit, total: totalCount, hasMore },
    });
  } catch (err) {
    console.error("Error al obtener recomendaciones paginadas:", err);
    return NextResponse.json({
      recommendations: [],
      pagination: { page: 1, limit: 6, total: 0, hasMore: false },
    });
  }
}
