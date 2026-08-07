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

  const formData = await request.formData();
  const file = formData.get("file") as File;
  const productId = formData.get("product_id") as string;

  if (!file) {
    return NextResponse.json(
      { error: "No se proporcionó imagen" },
      { status: 400 },
    );
  }

  if (!productId) {
    return NextResponse.json(
      { error: "ID de producto requerido" },
      { status: 400 },
    );
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { company_id: true },
  });

  if (!product) {
    return NextResponse.json(
      { error: "Producto no encontrado" },
      { status: 404 },
    );
  }

  const isMember = await prisma.companyMember.findFirst({
    where: { company_id: product.company_id, user_id: user.id },
  });

  if (!isMember) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json(
      { error: "Tipo de archivo no permitido" },
      { status: 400 },
    );
  }

  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json(
      { error: "Archivo demasiado grande (max 10MB)" },
      { status: 400 },
    );
  }

  const ext = file.name.split(".").pop();
  const fileName = `${productId}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${ext}`;

  const arrayBuffer = await file.arrayBuffer();
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from("product-images")
    .upload(fileName, arrayBuffer, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    console.error("Upload error:", uploadError);
    return NextResponse.json(
      { error: "Error al subir imagen" },
      { status: 500 },
    );
  }

  const imageCount = await prisma.productImage.count({
    where: { product_id: productId },
  });

  const {
    data: { publicUrl },
  } = supabase.storage.from("product-images").getPublicUrl(fileName);

  const imageData = await prisma.productImage.create({
    data: {
      product_id: productId,
      url: publicUrl,
      position: imageCount,
    },
  });

  return NextResponse.json({ image: imageData, url: publicUrl, success: true });
}

export async function DELETE(request: Request) {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const imageId = searchParams.get("id");

  if (!imageId) {
    return NextResponse.json(
      { error: "ID de imagen requerido" },
      { status: 400 },
    );
  }

  const image = await prisma.productImage.findUnique({
    where: { id: imageId },
    include: {
      product: { select: { company_id: true } },
    },
  });

  if (!image || !image.product) {
    return NextResponse.json(
      { error: "Imagen no encontrada" },
      { status: 404 },
    );
  }

  const isMember = await prisma.companyMember.findFirst({
    where: { company_id: image.product.company_id, user_id: user.id },
  });

  if (!isMember) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const urlParts = image.url.split("/product-images/");
  const fileName = urlParts[1];
  await supabase.storage.from("product-images").remove([fileName]);

  await prisma.productImage.delete({ where: { id: imageId } });

  return NextResponse.json({ success: true });
}
