import { createServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  let title: string;
  let description: string | null;
  let price: number;
  let condition: string;
  let category_id: string;
  let availability_type: string | null;
  let stock: number;
  let location: string | null;
  let latitude: number | null;
  let longitude: number | null;
  let delivery_preference: string | null;
  let brand: string | null;
  let company_id: string | null = null;
  let video_url: string | null = null;
  let warranty: string | null = null;
  let warranty_conditions: string | null = null;

  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    const body = await request.json();
    title = body.title;
    description = body.description || null;
    price = parseFloat(body.price);
    condition = body.condition;
    category_id = body.category_id;
    availability_type = body.availability_type || null;
    stock = body.stock ? parseInt(body.stock) : 1;
    location = body.location || null;
    latitude = body.latitude ?? null;
    longitude = body.longitude ?? null;
    delivery_preference = body.delivery_preference || null;
    brand = body.brand || null;
    company_id = body.company_id || null;
    video_url = body.video_url || null;
    warranty = body.warranty || null;
    warranty_conditions = body.warranty_conditions || null;
  } else {
    const formData = await request.formData();
    title = formData.get("title") as string;
    description = (formData.get("description") as string) || null;
    price = parseFloat(formData.get("price") as string);
    condition = formData.get("condition") as string;
    category_id = formData.get("category_id") as string;
    availability_type = (formData.get("availability_type") as string) || null;
    stock = formData.get("stock")
      ? parseInt(formData.get("stock") as string)
      : 1;
    location = (formData.get("location") as string) || null;
    latitude = formData.get("latitude")
      ? parseFloat(formData.get("latitude") as string)
      : null;
    longitude = formData.get("longitude")
      ? parseFloat(formData.get("longitude") as string)
      : null;
    delivery_preference =
      (formData.get("delivery_preference") as string) || null;
    brand = (formData.get("brand") as string) || null;
    company_id = (formData.get("company_id") as string) || null;
    video_url = (formData.get("video_url") as string) || null;
    warranty = (formData.get("warranty") as string) || null;
    warranty_conditions =
      (formData.get("warranty_conditions") as string) || null;
  }

  if (!title || !price || !condition || !category_id) {
    return NextResponse.json(
      { error: "Faltan campos requeridos" },
      { status: 400 },
    );
  }

  if (description) {
    const { detectForbiddenContactInfo } =
      await import("@/lib/utils/contactDetector");
    const contactCheck = detectForbiddenContactInfo(description);
    if (contactCheck.hasViolation) {
      return NextResponse.json({ error: contactCheck.reason }, { status: 400 });
    }
  }

  if (company_id) {
    const membership = await prisma.companyMember.findFirst({
      where: { company_id, user_id: user.id },
    });
    if (!membership) company_id = null;
  }

  if (!company_id) {
    const profile = await prisma.profile.findUnique({
      where: { id: user.id },
      select: { last_active_company_id: true },
    });

    if (profile?.last_active_company_id) {
      const membership = await prisma.companyMember.findFirst({
        where: { company_id: profile.last_active_company_id, user_id: user.id },
      });
      if (membership) company_id = profile.last_active_company_id;
    }

    if (!company_id) {
      const firstMember = await prisma.companyMember.findFirst({
        where: { user_id: user.id },
        select: { company_id: true },
      });
      if (firstMember) company_id = firstMember.company_id;
    }
  }

  if (!company_id) {
    return NextResponse.json(
      { error: "No tienes una empresa activa para publicar." },
      { status: 400 },
    );
  }

  const targetCompany = await prisma.company.findUnique({
    where: { id: company_id },
    select: { is_verified: true, is_personal: true },
  });

  const shouldBeInactive =
    targetCompany && !targetCompany.is_personal && !targetCompany.is_verified;

  if (category_id === "other") {
    const otrosCat = await prisma.category.findUnique({
      where: { slug: "otros" },
      select: { id: true },
    });
    if (otrosCat) {
      category_id = otrosCat.id;
    } else {
      return NextResponse.json(
        { error: 'Categoría "Otros" no encontrada' },
        { status: 400 },
      );
    }
  }

  if (!location) {
    const company = await prisma.company.findUnique({
      where: { id: company_id },
      select: { location: true },
    });
    location = company?.location || "Lima, Perú";
  }

  const defaultWarranty = warranty || "Sin garantía del vendedor";

  try {
    const product = await prisma.product.create({
      data: {
        title,
        description,
        price,
        condition,
        category_id,
        company_id,
        created_by: user.id,
        status: shouldBeInactive ? "inactive" : "active",
        stock,
        location: location || null,
        latitude,
        longitude,
        brand,
        availability_type: availability_type || "unique",
        delivery_preference: delivery_preference || null,
        video_url: video_url || null,
        specifications: {
          warranty: defaultWarranty,
          warranty_coverage:
            "Fallas de fabricación y componentes defectuosos de origen",
          warranty_conditions: warranty_conditions || null,
        },
      },
    });

    return NextResponse.json({ product, success: true });
  } catch (error: unknown) {
    console.error("Error creating product:", error);
    const message = error instanceof Error ? error.message : "Error interno";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
