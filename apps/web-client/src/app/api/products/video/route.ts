import { createServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = await createServerClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('file') as File;
  const productId = formData.get('product_id') as string | null;

  if (!file) {
    return NextResponse.json({ error: 'No se proporcionó video' }, { status: 400 });
  }

  // Validar tipo de video (mp4, webm, mov)
  const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-matroska'];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: 'Tipo de archivo no válido. Sube un video MP4, WEBM o MOV.' }, { status: 400 });
  }

  // Validar tamaño máximo (25MB)
  if (file.size > 25 * 1024 * 1024) {
    return NextResponse.json({ error: 'El video excede el límite de 25MB' }, { status: 400 });
  }

  const ext = file.name.split('.').pop() || 'mp4';
  const folder = productId ? productId : user.id;
  const fileName = `videos/${folder}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${ext}`;

  // Subir a Supabase Storage
  const arrayBuffer = await file.arrayBuffer();
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('product-images')
    .upload(fileName, arrayBuffer, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    console.error('Upload video error:', uploadError);
    return NextResponse.json({ error: 'Error al subir el video' }, { status: 500 });
  }

  // Obtener URL pública
  const { data: { publicUrl } } = supabase.storage
    .from('product-images')
    .getPublicUrl(fileName);

  // Si ya existe productId, actualizar video_url directamente
  if (productId) {
    await supabase
      .from('products')
      .update({ video_url: publicUrl })
      .eq('id', productId);
  }

  return NextResponse.json({ url: publicUrl, success: true });
}
