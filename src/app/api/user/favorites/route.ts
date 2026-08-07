import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const favorites = await prisma.favorite.findMany({
      where: { user_id: user.id },
      select: { product_id: true },
    });

    return NextResponse.json({
      productIds: favorites.map((f) => f.product_id),
    });
  } catch (err) {
    console.error("Error al obtener favoritos:", err);
    return NextResponse.json(
      { error: "Error al cargar favoritos" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { productId } = await req.json();
    if (!productId) {
      return NextResponse.json(
        { error: "ID de producto requerido" },
        { status: 400 },
      );
    }

    const existing = await prisma.favorite.findUnique({
      where: {
        user_id_product_id: { user_id: user.id, product_id: productId },
      },
    });

    if (existing) {
      await prisma.favorite.delete({
        where: { id: existing.id },
      });

      await prisma.product.update({
        where: { id: productId },
        data: { favorites_count: { decrement: 1 } },
      });

      return NextResponse.json({ favorited: false });
    }

    await prisma.favorite.create({
      data: { user_id: user.id, product_id: productId },
    });

    await prisma.product.update({
      where: { id: productId },
      data: { favorites_count: { increment: 1 } },
    });

    return NextResponse.json({ favorited: true });
  } catch (err) {
    console.error("Error al toggle favorito:", err);
    return NextResponse.json(
      { error: "Error al actualizar favorito" },
      { status: 500 },
    );
  }
}
