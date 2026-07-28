import { createServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = await createServerClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  let title: string;
  let description: string | null;
  let price: number;
  let condition: string;
  let category_id: string;
  let availability_type: string | null;
  let stock: number;
  let location: string | null;
  let latitude: number | null;
  let longitude: number | null;
  let delivery_preference: string | null;
  let brand: string | null;
  let company_id: string | null = null;
  let video_url: string | null = null;

  const contentType = request.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    const body = await request.json();
    title = body.title;
    description = body.description || null;
    price = parseFloat(body.price);
    condition = body.condition;
    category_id = body.category_id;
    availability_type = body.availability_type || null;
    stock = body.stock ? parseInt(body.stock) : 1;
    location = body.location || null;
    latitude = body.latitude ?? null;
    longitude = body.longitude ?? null;
    delivery_preference = body.delivery_preference || null;
    brand = body.brand || null;
    company_id = body.company_id || null;
    video_url = body.video_url || null;
  } else {
    const formData = await request.formData();
    title = formData.get('title') as string;
    description = (formData.get('description') as string) || null;
    price = parseFloat(formData.get('price') as string);
    condition = formData.get('condition') as string;
    category_id = formData.get('category_id') as string;
    availability_type = (formData.get('availability_type') as string) || null;
    stock = formData.get('stock') ? parseInt(formData.get('stock') as string) : 1;
    location = (formData.get('location') as string) || null;
    latitude = formData.get('latitude') ? parseFloat(formData.get('latitude') as string) : null;
    longitude = formData.get('longitude') ? parseFloat(formData.get('longitude') as string) : null;
    delivery_preference = (formData.get('delivery_preference') as string) || null;
    brand = (formData.get('brand') as string) || null;
    company_id = (formData.get('company_id') as string) || null;
    video_url = (formData.get('video_url') as string) || null;
  }

  if (!title || !price || !condition || !category_id) {
    return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
  }

  // Validar membresía de empresa o autodetectar la empresa activa del usuario
  if (company_id) {
    const { data: memberData } = await supabase
      .from('company_members')
      .select('id')
      .eq('company_id', company_id)
      .eq('user_id', user.id)
      .single();

    if (!memberData) {
      company_id = null; // Si no es miembro, no vincula a la empresa por seguridad
    }
  }

  if (!company_id) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('last_active_company_id')
      .eq('id', user.id)
      .single();

    if (profile?.last_active_company_id) {
      company_id = profile.last_active_company_id;
    } else {
      const { data: firstMember } = await supabase
        .from('company_members')
        .select('company_id')
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle();

      if (firstMember?.company_id) {
        company_id = firstMember.company_id;
      }
    }
  }

  if (category_id === 'other') {
    const { data: otrosCat } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', 'otros')
      .single();

    if (otrosCat) {
      category_id = otrosCat.id;
    } else {
      return NextResponse.json({ error: 'Categoría "Otros" no encontrada' }, { status: 400 });
    }
  }

  if (!location) {
    if (company_id) {
      const { data: comp } = await supabase
        .from('companies')
        .select('location')
        .eq('id', company_id)
        .maybeSingle();
      location = comp?.location || 'Lima, Perú';
    } else {
      const { data: prof } = await supabase
        .from('profiles')
        .select('location')
        .eq('id', user.id)
        .maybeSingle();
      location = prof?.location || 'Lima, Perú';
    }
  }

  const insertData: Record<string, unknown> = {
    title,
    description,
    price,
    condition,
    category_id,
    seller_id: user.id,
    company_id: company_id || null,
    status: 'active',
    stock,
    location: location || null,
    latitude: latitude,
    longitude: longitude,
    brand: brand,
    availability_type: availability_type || 'unique',
    delivery_preference: delivery_preference || null,
    video_url: video_url || null,
  };

  const { data, error } = await supabase
    .from('products')
    .insert(insertData)
    .select()
    .single();

  if (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ product: data, success: true });
}