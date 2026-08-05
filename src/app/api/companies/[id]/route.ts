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
        tax_id: existingCompany.tax_id
          ? existingCompany.tax_id
          : body.tax_id !== undefined
            ? body.tax_id.trim() || null
            : undefined,
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

    // Verificar si el usuario es el PROPIETARIO (owner) de esta empresa
    const membership = await prisma.companyMember.findFirst({
      where: {
        company_id: companyId,
        user_id: user.id,
        role: "owner",
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "Solo el propietario (Owner) puede eliminar esta empresa." },
        { status: 403 },
      );
    }

    // 1. Obtener todos los productos asociados a la empresa
    const companyProducts = await prisma.product.findMany({
      where: { company_id: companyId },
      select: { id: true },
    });

    const productIds = companyProducts.map((p) => p.id);

    // 2. Obtener todas las órdenes asociadas a la empresa o a sus productos
    const companyOrders = await prisma.order.findMany({
      where: {
        OR: [{ company_id: companyId }, { product_id: { in: productIds } }],
      },
      select: { id: true },
    });

    const orderIds = companyOrders.map((o) => o.id);

    // 3. Eliminar envíos (Shippings) de las órdenes de la empresa
    if (orderIds.length > 0) {
      await prisma.shipping.deleteMany({
        where: { order_id: { in: orderIds } },
      });

      // 4. Eliminar comprobantes de facturación (InvoiceDocuments)
      await prisma.invoiceDocument.deleteMany({
        where: { order_id: { in: orderIds } },
      });

      // 5. Eliminar reseñas asociadas a las órdenes
      await prisma.review.deleteMany({
        where: { order_id: { in: orderIds } },
      });

      // 6. Eliminar las órdenes de compra relacionadas
      await prisma.order.deleteMany({
        where: { id: { in: orderIds } },
      });
    }

    // 7. Eliminar favoritos, reseñas e imágenes de los productos de la empresa
    if (productIds.length > 0) {
      await prisma.favorite.deleteMany({
        where: { product_id: { in: productIds } },
      });

      await prisma.review.deleteMany({
        where: { product_id: { in: productIds } },
      });

      await prisma.productImage.deleteMany({
        where: { product_id: { in: productIds } },
      });

      // 8. Eliminar las publicaciones / productos
      await prisma.product.deleteMany({
        where: { id: { in: productIds } },
      });
    }

    // 9. Eliminar miembros vinculados a la empresa
    await prisma.companyMember.deleteMany({
      where: { company_id: companyId },
    });

    // 10. Desmarcar la empresa activa en perfiles de usuarios que la tuvieran activa
    await prisma.profile.updateMany({
      where: { last_active_company_id: companyId },
      data: { last_active_company_id: null },
    });

    // 11. Eliminar la empresa definitivamente
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
