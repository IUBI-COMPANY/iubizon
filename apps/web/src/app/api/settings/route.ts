import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key");
    if (!key)
      return NextResponse.json({ error: "key es requerido" }, { status: 400 });

    const setting = await prisma.platformSetting.findUnique({
      where: { key },
      select: { value: true },
    });

    if (!setting)
      return NextResponse.json(
        { error: "Configuración no encontrada" },
        { status: 404 },
      );

    return NextResponse.json(setting.value);
  } catch (err) {
    console.error("[Settings API] Error:", err);
    return NextResponse.json(
      { error: "Error al obtener configuración" },
      { status: 500 },
    );
  }
}
