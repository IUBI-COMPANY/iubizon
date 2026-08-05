import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const companyIdParam = searchParams.get("company_id");

    let isCompanyMode = false;
    let targetCompany = null;
    let companyId: string | null = null;

    if (companyIdParam) {
      const membership = await prisma.companyMember.findFirst({
        where: {
          company_id: companyIdParam,
          user_id: user.id,
        },
        include: { company: true },
      });

      if (membership) {
        isCompanyMode = true;
        companyId = companyIdParam;
        targetCompany = membership.company;
      }
    }

    // Filtros de búsqueda para productos y pedidos
    const productWhere = isCompanyMode
      ? { company_id: companyId! }
      : { seller_id: user.id, company_id: null };

    const orderWhere = isCompanyMode
      ? { company_id: companyId! }
      : { buyer_id: user.id };
    const pendingOrderWhere = {
      ...orderWhere,
      status: { in: ["pending", "paid"] },
      shipping: {
        is: {
          tracking_number: null,
        },
      },
    };

    // Consultas ultrarrápidas y optimizadas en paralelo directo desde PostgreSQL
    const [
      totalProducts,
      activeProducts,
      productSums,
      recentProductsRaw,
      totalOrders,
      pendingOrdersCount,
      personalOrderPackages,
      totalFavorites,
    ] = await Promise.all([
      // 1. Conteo total de productos
      prisma.product.count({ where: productWhere }),
      // 2. Conteo de productos activos
      prisma.product.count({
        where: { ...productWhere, status: "active" },
      }),
      // 3. Suma en SQL de vistas y favoritos
      prisma.product.aggregate({
        where: productWhere,
        _sum: {
          views: true,
          favorites_count: true,
        },
      }),
      // 4. Solo los 5 productos más recientes para la vista previa
      prisma.product.findMany({
        where: productWhere,
        select: {
          id: true,
          title: true,
          price: true,
          status: true,
          views: true,
          created_at: true,
          images: {
            orderBy: { position: "asc" },
            take: 1,
            select: { url: true },
          },
        },
        orderBy: { created_at: "desc" },
        take: 3,
      }),
      // 5. Conteo total de pedidos
      prisma.order.count({
        where: orderWhere,
      }),
      // 6. Conteo de pedidos pendientes de tracking
      prisma.order.count({
        where: pendingOrderWhere,
      }),
      // 7. Solo para modo personal: paquetes únicos (por tracking o por order id)
      isCompanyMode
        ? Promise.resolve([])
        : prisma.order.findMany({
            where: orderWhere,
            select: {
              id: true,
              shipping: {
                select: { tracking_number: true },
              },
            },
          }),
      // 8. Conteo de favoritos en modo personal
      isCompanyMode
        ? 0
        : prisma.favorite.count({
            where: { user_id: user.id },
          }),
    ]);

    const totalViews = productSums._sum.views || 0;
    const companyFavorites = productSums._sum.favorites_count || 0;

    const uniquePackages = new Set(
      personalOrderPackages.map((o) => o.shipping?.tracking_number || o.id),
    );

    const recentProducts = recentProductsRaw.map((p) => ({
      id: p.id,
      title: p.title,
      price: Number(p.price),
      status: p.status,
      views: p.views || 0,
      image: p.images[0]?.url || null,
      created_at: p.created_at,
    }));

    return NextResponse.json({
      isCompanyMode,
      company: targetCompany,
      stats: {
        totalProducts,
        activeProducts,
        totalOrders,
        totalPurchases: isCompanyMode ? 0 : uniquePackages.size,
        pendingDeliveries: pendingOrdersCount,
        pendingOrders: isCompanyMode ? pendingOrdersCount : 0,
        favoritesCount: isCompanyMode ? companyFavorites : totalFavorites,
        totalViews,
      },
      recentProducts,
    });
  } catch (err) {
    console.error("Error al obtener estadísticas del dashboard:", err);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
