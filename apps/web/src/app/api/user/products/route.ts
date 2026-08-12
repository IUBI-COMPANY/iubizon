import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

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
        if (firstMember) companyId = firstMember.company_id;
      }
    }

    let isCompanyMode = false;
    let targetCompany = null;
    let where: any = {};

    if (companyId) {
      const membership = await prisma.companyMember.findFirst({
        where: { company_id: companyId, user_id: user.id },
        include: { company: true },
      });
      if (membership) {
        isCompanyMode = true;
        targetCompany = membership.company;
        where = { company_id: companyId };
      }
    }

    if (!isCompanyMode) {
      const memberships = await prisma.companyMember.findMany({
        where: { user_id: user.id },
        select: { company_id: true },
      });
      const companyIds = memberships.map((m) => m.company_id);
      where = { created_by: user.id };
    }

    const products = await prisma.product.findMany({
      where,
      select: {
        id: true,
        title: true,
        price: true,
        condition: true,
        status: true,
        stock: true,
        views: true,
        is_complementary: true,
        created_at: true,
        category: { select: { name: true } },
        images: {
          orderBy: { position: "asc" },
          take: 1,
          select: { id: true, url: true, position: true },
        },
        _count: { select: { images: true } },
      },
      orderBy: { updated_at: "desc" },
    });

    return NextResponse.json({
      isCompanyMode,
      company: targetCompany,
      products: products.map((p) => ({
        id: p.id,
        title: p.title,
        price: Number(p.price),
        condition: p.condition,
        status: p.status,
        stock: p.stock ?? 1,
        views: p.views || 0,
        is_complementary: p.is_complementary,
        category: p.category?.name || null,
        imageCount: p._count.images,
        images: p.images.map((img) => ({
          id: img.id,
          url: img.url,
          position: img.position,
        })),
        created_at: p.created_at,
      })),
    });
  } catch (err) {
    console.error("Error al obtener productos del usuario/empresa:", err);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
