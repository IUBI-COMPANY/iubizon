import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { generateUniqueCompanySlug } from "@/lib/services/companies";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id: companyId } = await params;
    const body = await request.json();

    // Verificar si el usuario es owner o admin de esta empresa
    const membership = await prisma.companyMember.findFirst({
      where: {
        company_id: companyId,
        user_id: user.id,
        role: { in: ["owner", "admin"] },
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "No tienes permisos para editar esta empresa" },
        { status: 403 },
      );
    }

    const existingCompany = await prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!existingCompany) {
      return NextResponse.json(
        { error: "Empresa no encontrada" },
        { status: 404 },
      );
    }

    let updatedSlug = existingCompany.slug;
    if (body.name && body.name.trim() !== existingCompany.name) {
      updatedSlug = await generateUniqueCompanySlug(
        body.name.trim(),
        companyId,
      );
    }

    const updatedCompany = await prisma.company.update({
      where: { id: companyId },
      data: {
        name: body.name !== undefined ? body.name.trim() : undefined,
        slug: updatedSlug,
        tax_id:
          body.tax_id !== undefined ? body.tax_id.trim() || null : undefined,
        logo_url:
          body.logo_url !== undefined ? body.logo_url || null : undefined,
        phone: body.phone !== undefined ? body.phone.trim() || null : undefined,
        email: body.email !== undefined ? body.email.trim() || null : undefined,
        location:
          body.location !== undefined
            ? body.location.trim() || null
            : undefined,
        description:
          body.description !== undefined
            ? body.description.trim() || null
            : undefined,
      },
    });

    return NextResponse.json({ company: updatedCompany, success: true });
  } catch (err) {
    console.error("Error al actualizar la empresa:", err);
    return NextResponse.json(
      { error: "Error interno del servidor al actualizar la empresa" },
      { status: 500 },
    );
  }
}
