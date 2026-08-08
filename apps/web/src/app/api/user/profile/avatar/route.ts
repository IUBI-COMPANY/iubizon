import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No se proporcionó imagen" },
        { status: 400 },
      );
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Tipo de archivo no permitido" },
        { status: 400 },
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Archivo demasiado grande (max 5MB)" },
        { status: 400 },
      );
    }

    const ext = file.name.split(".").pop();
    const fileName = `avatars/${user.id}_${Date.now()}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(fileName, arrayBuffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error("Error al subir avatar:", uploadError);
      return NextResponse.json(
        { error: "Error al subir la imagen" },
        { status: 500 },
      );
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("product-images").getPublicUrl(fileName);

    return NextResponse.json({ url: publicUrl, success: true });
  } catch (err) {
    console.error("Error en API de avatar:", err);
    return NextResponse.json(
      { error: "Error interno al subir imagen" },
      { status: 500 },
    );
  }
}
