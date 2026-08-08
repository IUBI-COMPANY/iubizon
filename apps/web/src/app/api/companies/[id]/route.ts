import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { generateUniqueCompanySlug } from "@/lib/services/companies";

export async function GET(
  _request: Request,
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

    const membership = await prisma.companyMember.findFirst({
      where: { company_id: companyId, user_id: user.id },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "No tienes acceso a esta empresa" },
        { status: 403 },
      );
    }

    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: {
        id: true,
        name: true,
        slug: true,
        legal_name: true,
        tax_id: true,
        logo_url: true,
        description: true,
        phone: true,
        email: true,
        location: true,
        bank_account: true,
      },
    });

    if (!company) {
      return NextResponse.json(
        { error: "Empresa no encontrada" },
        { status: 404 },
      );
    }

    return NextResponse.json({ company });
  } catch (err) {
    console.error("Error al obtener empresa:", err);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}

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
    const newName =
      body.name !== undefined ? body.name.trim() : existingCompany.name;

    if (!updatedSlug) {
      updatedSlug = await generateUniqueCompanySlug(newName, companyId);
    } else if (body.name !== undefined && newName !== existingCompany.name) {
      updatedSlug = await generateUniqueCompanySlug(newName, companyId);
    }

    const finalTaxId = existingCompany.tax_id ?? (body.tax_id?.trim() || null);

    const updatedCompany = await prisma.company.update({
      where: { id: companyId },
      data: {
        name: newName,
        slug: updatedSlug,
        tax_id: finalTaxId,
        logo_url:
          body.logo_url !== undefined ? body.logo_url || null : undefined,
        phone: body.phone !== undefined ? body.phone.trim() || null : undefined,
        email: body.email !== undefined ? body.email.trim() || null : undefined,
        legal_name:
          body.legal_name !== undefined
            ? body.legal_name.trim() || null
            : undefined,
        location:
          body.location !== undefined
            ? body.location.trim() || null
            : undefined,
        bank_account:
          body.bank_account !== undefined
            ? body.bank_account.trim() || null
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
    const message =
      err instanceof Error ? err.message : "Error desconocido al actualizar";
    return NextResponse.json(
      { error: `Error al actualizar la empresa: ${message}` },
      { status: 500 },
    );
  }
}

export async function DELETE(
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

    const membership = await prisma.companyMember.findFirst({
      where: { company_id: companyId, user_id: user.id, role: "owner" },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "Solo el propietario (Owner) puede eliminar esta empresa." },
        { status: 403 },
      );
    }

    const companyProducts = await prisma.product.findMany({
      where: { company_id: companyId },
      select: { id: true },
    });
    const productIds = companyProducts.map((p) => p.id);

    const companyPackages = await prisma.orderPackage.findMany({
      where: { company_id: companyId },
      select: { id: true },
    });
    const packageIds = companyPackages.map((p) => p.id);

    // 1. Eliminar SellerPayouts asociados a los paquetes
    if (packageIds.length > 0) {
      await prisma.sellerPayout.deleteMany({
        where: { package_id: { in: packageIds } },
      });

      // 2. Eliminar OrderItems de los paquetes
      await prisma.orderItem.deleteMany({
        where: { package_id: { in: packageIds } },
      });

      // 3. Eliminar OrderPackages
      await prisma.orderPackage.deleteMany({
        where: { id: { in: packageIds } },
      });
    }

    // 4. Eliminar Review asociadas a los productos de la empresa
    if (productIds.length > 0) {
      await prisma.review.deleteMany({
        where: { product_id: { in: productIds } },
      });
    }

    // 5. Eliminar Favorites de los productos
    if (productIds.length > 0) {
      await prisma.favorite.deleteMany({
        where: { product_id: { in: productIds } },
      });

      // 6. Eliminar ProductImages
      await prisma.productImage.deleteMany({
        where: { product_id: { in: productIds } },
      });

      // 7. Eliminar Products
      await prisma.product.deleteMany({
        where: { id: { in: productIds } },
      });
    }

    // 8. Eliminar CompanyMembers
    await prisma.companyMember.deleteMany({
      where: { company_id: companyId },
    });

    // 9. Desmarcar empresa activa en perfiles
    await prisma.profile.updateMany({
      where: { last_active_company_id: companyId },
      data: { last_active_company_id: null },
    });

    // 10. Eliminar la empresa
    await prisma.company.delete({
      where: { id: companyId },
    });

    return NextResponse.json({
      success: true,
      message:
        "Empresa y todos sus datos relacionados fueron eliminados correctamente.",
    });
  } catch (err) {
    console.error("Error al eliminar la empresa:", err);
    return NextResponse.json(
      { error: "Error interno del servidor al eliminar la empresa" },
      { status: 500 },
    );
  }
}
