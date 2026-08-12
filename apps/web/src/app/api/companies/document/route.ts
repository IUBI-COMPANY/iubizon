import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { extractCompanyDataFromPdf } from "@/lib/services/documentExtractor";

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
    const companyId = (formData.get("company_id") as string) || null;

    if (!file) {
      return NextResponse.json(
        { error: "No se proporcionó archivo PDF" },
        { status: 400 },
      );
    }

    const allowedTypes = ["application/pdf"];
    if (
      !allowedTypes.includes(file.type) &&
      !file.name.toLowerCase().endsWith(".pdf")
    ) {
      return NextResponse.json(
        { error: "Únicamente se permiten archivos en formato PDF (.pdf)" },
        { status: 400 },
      );
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "El archivo excede el tamaño máximo permitido (10MB)" },
        { status: 400 },
      );
    }

    const folder = companyId || "temp";
    const timestamp = Date.now();
    const fileName = `company_documents/${folder}_ficha_ruc_${timestamp}.pdf`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 1. Ejecutar análisis IA de PDF en paralelo a la subida de almacenamiento
    const [extractedData, uploadResult] = await Promise.all([
      extractCompanyDataFromPdf(buffer, file.name).catch((err) => {
        console.error("Error analizando PDF con IA:", err);
        return null;
      }),
      supabase.storage.from("product-images").upload(fileName, arrayBuffer, {
        contentType: "application/pdf",
        upsert: true,
      }),
    ]);

    if (uploadResult.error) {
      console.error("Error al subir Ficha RUC PDF:", uploadResult.error);
      return NextResponse.json(
        { error: "Error al subir el documento PDF a almacenamiento" },
        { status: 500 },
      );
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("product-images").getPublicUrl(fileName);

    return NextResponse.json({
      url: publicUrl,
      fileName: file.name,
      extractedData,
      success: true,
    });
  } catch (err) {
    console.error("Error en API de documento de empresa:", err);
    return NextResponse.json(
      { error: "Error interno al subir documento PDF" },
      { status: 500 },
    );
  }
}
