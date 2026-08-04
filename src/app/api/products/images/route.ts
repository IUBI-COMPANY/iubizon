import { createServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

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

  // Verify ownership or company membership
  const { data: product, error: productError } = await supabase
    .from("products")
    .select("seller_id, company_id")
    .eq("id", productId)
    .single();

  if (productError || !product) {
    return NextResponse.json(
      { error: "Producto no encontrado" },
      { status: 404 },
    );
  }

  let isAuthorized = product.seller_id === user.id;

  if (!isAuthorized && product.company_id) {
    const { data: memberData } = await supabase
      .from("company_members")
      .select("id")
      .eq("company_id", product.company_id)
      .eq("user_id", user.id)
      .single();

    if (memberData) {
      isAuthorized = true;
    }
  }

  if (!isAuthorized) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  // Validate file type
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json(
      { error: "Tipo de archivo no permitido" },
      { status: 400 },
    );
  }

  // Validate file size (max 10MB)
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json(
      { error: "Archivo demasiado grande (max 10MB)" },
      { status: 400 },
    );
  }

  // Generate unique filename
  const ext = file.name.split(".").pop();
  const fileName = `${productId}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${ext}`;

  // Upload to Supabase Storage
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

  // Get current image count for position
  const { count } = await supabase
    .from("product_images")
    .select("*", { count: "exact", head: true })
    .eq("product_id", productId);

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from("product-images").getPublicUrl(fileName);

  // Save to database with correct position
  const { data: imageData, error: dbError } = await supabase
    .from("product_images")
    .insert({
      product_id: productId,
      url: publicUrl,
      position: count || 0,
    })
    .select()
    .single();

  if (dbError) {
    console.error("DB error:", dbError);
    return NextResponse.json(
      { error: "Error al guardar imagen" },
      { status: 500 },
    );
  }

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

  // Get image info and verify ownership or company membership
  const { data: image, error: imageError } = await supabase
    .from("product_images")
    .select("*, product:products(seller_id, company_id)")
    .eq("id", imageId)
    .single();

  if (imageError || !image || !image.product) {
    return NextResponse.json(
      { error: "Imagen no encontrada" },
      { status: 404 },
    );
  }

  let isAuthorized = image.product.seller_id === user.id;

  if (!isAuthorized && image.product.company_id) {
    const { data: memberData } = await supabase
      .from("company_members")
      .select("id")
      .eq("company_id", image.product.company_id)
      .eq("user_id", user.id)
      .single();

    if (memberData) {
      isAuthorized = true;
    }
  }

  if (!isAuthorized) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  // Extract filename from URL
  const urlParts = image.url.split("/product-images/");
  const fileName = urlParts[1];

  // Delete from storage
  await supabase.storage.from("product-images").remove([fileName]);

  // Delete from database
  const { error: deleteError } = await supabase
    .from("product_images")
    .delete()
    .eq("id", imageId);

  if (deleteError) {
    return NextResponse.json(
      { error: "Error al eliminar imagen" },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}
