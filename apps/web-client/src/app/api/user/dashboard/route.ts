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
    let companyId = searchParams.get("company_id");

    // Si no se envio company_id en params, consultar la empresa activa del perfil del usuario
    if (!companyId) {
      const profile = await prisma.profile.findUnique({
        where: { id: user.id },
        select: { last_active_company_id: true },
      });

      if (profile?.last_active_company_id) {
        companyId = profile.last_active_company_id;
      } else {
        const firstMember = await prisma.companyMember.findFirst({
          where: { user_id: user.id },
          select: { company_id: true },
        });
        if (firstMember) {
          companyId = firstMember.company_id;
        }
      }
    }

    let isCompanyMode = false;
    let targetCompany = null;

    if (companyId) {
      // Verificar que el usuario pertenece a la empresa
      const membership = await prisma.companyMember.findFirst({
        where: {
          company_id: companyId,
          user_id: user.id,
        },
        include: { company: true },
      });

      if (membership) {
        isCompanyMode = true;
        targetCompany = membership.company;

        // Auto-vincular cualquier producto del usuario sin company_id a su empresa activa
        await prisma.product.updateMany({
          where: {
            seller_id: user.id,
            company_id: null,
          },
          data: {
            company_id: companyId,
          },
        });
      }
    }

    // Construir filtro de productos
    const productWhere = isCompanyMode
      ? { company_id: companyId! }
      : { seller_id: user.id, company_id: null };

    // Construir filtro de pedidos
    const orderWhere = isCompanyMode
      ? { company_id: companyId! }
      : { seller_id: user.id, company_id: null };

    const [products, orders, totalFavorites] = await Promise.all([
      prisma.product.findMany({
        where: productWhere,
        select: {
          id: true,
          title: true,
          price: true,
          status: true,
          views: true,
          favorites_count: true,
          created_at: true,
          images: {
            orderBy: { position: "asc" },
            take: 1,
          },
        },
        orderBy: { created_at: "desc" },
      }),
      prisma.order.findMany({
        where: orderWhere,
        select: {
          id: true,
          status: true,
          amount: true,
        },
      }),
      isCompanyMode
        ? 0
        : prisma.favorite.count({
            where: { user_id: user.id },
          }),
    ]);

    const activeProducts = products.filter((p) => p.status === "active").length;
    const pendingOrders = orders.filter((o) => o.status === "pending").length;
    const totalViews = products.reduce((sum, p) => sum + (p.views || 0), 0);
    const companyFavorites = products.reduce(
      (sum, p) => sum + (p.favorites_count || 0),
      0,
    );

    return NextResponse.json({
      isCompanyMode,
      company: targetCompany,
      stats: {
        totalProducts: products.length,
        activeProducts,
        totalOrders: orders.length,
        pendingOrders,
        favoritesCount: isCompanyMode ? companyFavorites : totalFavorites,
        totalViews,
      },
      recentProducts: products.slice(0, 5).map((p) => ({
        id: p.id,
        title: p.title,
        price: Number(p.price),
        status: p.status,
        views: p.views || 0,
        image: p.images[0]?.url || null,
        created_at: p.created_at,
      })),
    });
  } catch (err) {
    console.error("Error al obtener estadísticas del dashboard:", err);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
