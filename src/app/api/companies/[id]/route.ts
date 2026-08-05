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

    // Verificar membresía
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
        tax_id: true,
        logo_url: true,
        description: true,
        phone: true,
        email: true,
        location: true,
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

    // Determinar el slug correcto:
    // - Si el nombre cambió → generar slug nuevo
    // - Si el slug actual es null → generar uno nuevo basado en el nombre actual
    // - Si el nombre no cambió y slug existe → mantenerlo tal cual
    let updatedSlug = existingCompany.slug;
    const newName =
      body.name !== undefined ? body.name.trim() : existingCompany.name;

    if (!updatedSlug) {
      // La empresa no tiene slug — generarlo ahora
      updatedSlug = await generateUniqueCompanySlug(newName, companyId);
    } else if (body.name !== undefined && newName !== existingCompany.name) {
      // El nombre cambió → regenerar slug
      updatedSlug = await generateUniqueCompanySlug(newName, companyId);
    }

    // tax_id: nunca modificar si ya existe en la BD
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
