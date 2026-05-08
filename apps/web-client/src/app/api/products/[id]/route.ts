import { createServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function PUT(request: Request) {
  const supabase = await createServerClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const body = await request.json();
  const { id, title, description, price, condition, category_id, status } = body;

  if (!id) {
    return NextResponse.json({ error: 'ID de producto requerido' }, { status: 400 });
  }

  // Verify ownership
  const { data: product, error: productError } = await supabase
    .from('products')
    .select('seller_id')
    .eq('id', id)
    .single();

  if (productError || product.seller_id !== user.id) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const { data, error } = await supabase
    .from('products')
    .update({
      title,
      description,
      price,
      condition,
      category_id,
      status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('seller_id', user.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ product: data, success: true });
}