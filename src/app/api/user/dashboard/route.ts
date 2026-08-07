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

    let companyId: string | null = null;
    let targetCompany = null;

    const memberships = await prisma.companyMember.findMany({
      where: { user_id: user.id },
      include: { company: true },
    });

    if (companyIdParam) {
      const membership = memberships.find(
        (m) => m.company_id === companyIdParam,
      );
      if (membership) {
        companyId = companyIdParam;
        targetCompany = membership.company;
      }
    } else if (memberships.length > 0) {
      const profile = await prisma.profile.findUnique({
        where: { id: user.id },
        select: { last_active_company_id: true },
      });
      const activeMembership = profile?.last_active_company_id
        ? memberships.find(
            (m) => m.company_id === profile.last_active_company_id,
          )
        : memberships[0];
      if (activeMembership) {
        companyId = activeMembership.company_id;
        targetCompany = activeMembership.company;
      }
    }

    const productWhere = companyId
      ? { company_id: companyId }
      : {
          company_id: {
            notIn: memberships.map((m) => m.company_id).filter(Boolean),
          },
        };

    const [
      totalProducts,
      activeProducts,
      productSums,
      recentProductsRaw,
      totalFavorites,
    ] = await Promise.all([
      prisma.product.count({ where: productWhere }),
      prisma.product.count({ where: { ...productWhere, status: "active" } }),
      prisma.product.aggregate({
        where: productWhere,
        _sum: { views: true, favorites_count: true },
      }),
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
      prisma.favorite.count({ where: { user_id: user.id } }),
    ]);

    const totalViews = productSums._sum.views || 0;
    const companyFavorites = productSums._sum.favorites_count || 0;

    // Conteo de paquetes pendientes
    let pendingOrders = 0;
    let totalPackages = 0;
    if (companyId) {
      [pendingOrders, totalPackages] = await Promise.all([
        prisma.orderPackage.count({
          where: { company_id: companyId, status: { in: ["pending", "paid"] } },
        }),
        prisma.orderPackage.count({ where: { company_id: companyId } }),
      ]);
    }

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
      isCompanyMode: !!companyId,
      company: targetCompany,
      stats: {
        totalProducts,
        activeProducts,
        totalOrders: totalPackages,
        totalPurchases: 0,
        pendingDeliveries: pendingOrders,
        pendingOrders,
        favoritesCount: companyId ? companyFavorites : totalFavorites,
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
