import { createServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = await createServerClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const formData = await request.formData();
  
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const price = parseFloat(formData.get('price') as string);
  const condition = formData.get('condition') as string;
  const category_id = formData.get('category_id') as string;

  if (!title || !description || !price || !condition || !category_id) {
    return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('products')
    .insert({
      title,
      description,
      price,
      condition,
      category_id,
      seller_id: user.id,
      status: 'active',
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ product: data, success: true });
}