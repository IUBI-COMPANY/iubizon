import { createServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(request: Request) {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await request.json();
  const { images } = body;

  if (!images || !Array.isArray(images)) {
    return NextResponse.json({ error: "Imágenes requeridas" }, { status: 400 });
  }

  try {
    for (const image of images) {
      if (!image.id) continue;

      const existingImage = await prisma.productImage.findUnique({
        where: { id: image.id },
        select: { product: { select: { company_id: true } } },
      });

      if (!existingImage) continue;

      const isMember = await prisma.companyMember.findFirst({
        where: {
          company_id: existingImage.product.company_id,
          user_id: user.id,
        },
      });

      if (!isMember) continue;

      await prisma.productImage.update({
        where: { id: image.id },
        data: { position: image.position },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating positions:", error);
    return NextResponse.json(
      { error: "Error al actualizar posiciones" },
      { status: 500 },
    );
  }
}
