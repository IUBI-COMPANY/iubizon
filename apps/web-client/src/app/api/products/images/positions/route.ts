import { createServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function PUT(request: Request) {
  const supabase = await createServerClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const body = await request.json();
  const { images } = body;

  if (!images || !Array.isArray(images)) {
    return NextResponse.json({ error: 'Imágenes requeridas' }, { status: 400 });
  }

  try {
    for (const image of images) {
      if (!image.id) continue;

      const { data: existingImage, error: fetchError } = await supabase
        .from('product_images')
        .select('product_id')
        .eq('id', image.id)
        .single();

      if (fetchError || !existingImage) continue;

      const { data: product, error: productError } = await supabase
        .from('products')
        .select('seller_id')
        .eq('id', existingImage.product_id)
        .single();

      if (productError || product.seller_id !== user.id) continue;

      await supabase
        .from('product_images')
        .update({ position: image.position })
        .eq('id', image.id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating positions:', error);
    return NextResponse.json({ error: 'Error al actualizar posiciones' }, { status: 500 });
  }
}