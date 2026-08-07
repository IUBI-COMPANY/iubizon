import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { sort_order: "asc" },
    });
    return NextResponse.json({ categories });
  } catch (err) {
    console.error("Error al obtener categorías:", err);
    return NextResponse.json(
      { error: "Error al cargar categorías" },
      { status: 500 },
    );
  }
}
