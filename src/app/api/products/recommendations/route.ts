import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const excludeIds =
      searchParams.get("exclude")?.split(",").filter(Boolean) || [];
    const page = Number(searchParams.get("page") || "1");
    const limit = Number(searchParams.get("limit") || "6");
    const skip = (page - 1) * limit;

    // 1. Obtener las categorías de los productos que ya están en el carrito
    const cartProducts = await prisma.product.findMany({
      where: { id: { in: excludeIds } },
      select: {
        category: {
          select: {
            slug: true,
          },
        },
      },
    });

    const cartCategorySlugs = cartProducts
      .map((p) => p.category?.slug)
      .filter((slug): slug is string => typeof slug === "string");

    // 2. Definir mapa de afinidad para recomendar categorías complementarias
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
      if (affinityMap[slug]) {
        targetSlugs.push(...affinityMap[slug]);
      }
    }
    // Eliminar duplicados
    targetSlugs = Array.from(new Set(targetSlugs));

    // 3. Obtener listas de IDs ordenadas por afinidad
    const affinityProducts = await prisma.product.findMany({
      where: {
        status: "active",
        id: { notIn: excludeIds },
        category:
          targetSlugs.length > 0 ? { slug: { in: targetSlugs } } : undefined,
      },
      select: { id: true },
      orderBy: { views: "desc" },
    });
    const affinityIds = affinityProducts.map((p) => p.id);

    // Obtener los demás productos activos para fallback
    const fallbackProducts = await prisma.product.findMany({
      where: {
        status: "active",
        id: { notIn: [...excludeIds, ...affinityIds] },
      },
      select: { id: true },
      orderBy: { views: "desc" },
    });
    const fallbackIds = fallbackProducts.map((p) => p.id);

    // Combinar listas manteniendo la prioridad de afinidad
    const allOrderedIds = [...affinityIds, ...fallbackIds];
    const totalCount = allOrderedIds.length;

    // Obtener los IDs correspondientes a la página actual
    const paginatedIds = allOrderedIds.slice(skip, skip + limit);
    const hasMore = skip + limit < totalCount;

    // 4. Consultar detalles de los productos paginados
    const products = await prisma.product.findMany({
      where: {
        id: { in: paginatedIds },
      },
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
    });

    // Mantener el orden de prioridad de los IDs paginados
    const productsMap = new Map(products.map((p) => [p.id, p]));
    const orderedProducts = paginatedIds
      .map((id) => productsMap.get(id))
      .filter((p): p is (typeof products)[number] => !!p);

    const formatted = orderedProducts.map((p) => ({
      id: p.id,
      title: p.title,
      price: Number(p.price),
      seller_id: p.seller_id,
      company_id: p.company_id,
      image_url: p.images[0]?.url || null,
    }));

    return NextResponse.json({
      recommendations: formatted,
      pagination: {
        page,
        limit,
        total: totalCount,
        hasMore,
      },
    });
  } catch (err) {
    console.error("Error al obtener recomendaciones paginadas:", err);
    return NextResponse.json({
      recommendations: [],
      pagination: { page: 1, limit: 6, total: 0, hasMore: false },
    });
  }
}
