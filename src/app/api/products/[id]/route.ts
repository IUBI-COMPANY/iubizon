import { createServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { error: "ID de producto requerido" },
        { status: 400 },
      );
    }

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: { position: "asc" } },
        category: true,
        company: true,
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Producto no encontrado" },
        { status: 404 },
      );
    }

    return NextResponse.json({ product, success: true });
  } catch (error: unknown) {
    console.error("Error al obtener producto:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}

export async function PUT(
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

    const { id: paramId } = await params;
    const body = await request.json();
    const targetId = paramId || body.id;

    if (!targetId) {
      return NextResponse.json(
        { error: "ID de producto requerido" },
        { status: 400 },
      );
    }

    // 1. Buscar el producto existente
    const existingProduct = await prisma.product.findUnique({
      where: { id: targetId },
      select: { id: true, seller_id: true, company_id: true },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: "Producto no encontrado" },
        { status: 404 },
      );
    }

    // 2. Verificar permisos del usuario (vendedor directo o miembro de la empresa)
    let isAuthorized = existingProduct.seller_id === user.id;

    if (!isAuthorized && existingProduct.company_id) {
      const isCompanyMember = await prisma.companyMember.findFirst({
        where: {
          company_id: existingProduct.company_id,
          user_id: user.id,
        },
      });
      if (isCompanyMember) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return NextResponse.json(
        { error: "No tienes permisos para editar esta publicación" },
        { status: 403 },
      );
    }

    const {
      title,
      description,
      price,
      condition,
      category_id,
      status,
      stock,
      video_url,
      warranty,
      warranty_conditions,
    } = body;

    if (description) {
      const { detectForbiddenContactInfo } =
        await import("@/lib/utils/contactDetector");
      const contactCheck = detectForbiddenContactInfo(description);
      if (contactCheck.hasViolation) {
        return NextResponse.json(
          { error: contactCheck.reason },
          { status: 400 },
        );
      }
    }

    const parsedPrice = price !== undefined ? parseFloat(price) : undefined;
    const parsedStock = stock !== undefined ? parseInt(stock) : undefined;
    const availabilityType =
      parsedStock !== undefined
        ? parsedStock > 1
          ? "available"
          : "unique"
        : undefined;

    // Actualizar campos en la base de datos
    const updatedProduct = await prisma.product.update({
      where: { id: targetId },
      data: {
        ...(title && { title: title.trim() }),
        ...(description !== undefined && {
          description: description?.trim() || null,
        }),
        ...(parsedPrice !== undefined &&
          !isNaN(parsedPrice) && { price: parsedPrice }),
        ...(condition && { condition }),
        ...(category_id && { category: { connect: { id: category_id } } }),
        ...(status && { status }),
        ...(parsedStock !== undefined &&
          !isNaN(parsedStock) && { stock: Math.max(0, parsedStock) }),
        ...(availabilityType && { availability_type: availabilityType }),
        ...(video_url !== undefined && { video_url }),
        ...((warranty !== undefined || warranty_conditions !== undefined) && {
          specifications: {
            warranty: warranty || "Sin garantía del vendedor",
            warranty_coverage:
              "Fallas de fabricación y componentes defectuosos de origen",
            warranty_conditions: warranty_conditions || null,
          },
        }),
        updated_at: new Date(),
      },
    });

    return NextResponse.json({ product: updatedProduct, success: true });
  } catch (error: unknown) {
    console.error("Error detallado al actualizar producto:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Error interno al actualizar";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
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

    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { error: "ID de producto requerido" },
        { status: 400 },
      );
    }

    const existingProduct = await prisma.product.findUnique({
      where: { id },
      select: { seller_id: true, company_id: true },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: "Producto no encontrado" },
        { status: 404 },
      );
    }

    let isAuthorized = existingProduct.seller_id === user.id;
    if (!isAuthorized && existingProduct.company_id) {
      const isCompanyMember = await prisma.companyMember.findFirst({
        where: {
          company_id: existingProduct.company_id,
          user_id: user.id,
        },
      });
      if (isCompanyMember) isAuthorized = true;
    }

    if (!isAuthorized) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    await prisma.product.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Error al eliminar producto:", error);
    return NextResponse.json(
      { error: "Error al eliminar producto" },
      { status: 500 },
    );
  }
}
