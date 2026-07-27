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

        // Auto-vincular cualquier producto sin empresa del usuario a su empresa activa
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

    const where = isCompanyMode
      ? { company_id: companyId! }
      : { seller_id: user.id, company_id: null };

    const products = await prisma.product.findMany({
      where,
      include: {
        images: { orderBy: { position: "asc" } },
        category: true,
      },
      orderBy: { created_at: "desc" },
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
        views: p.views || 0,
        category: p.category?.name || null,
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
