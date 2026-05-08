import { createServerClient } from '@/lib/supabase/server';
import type { Category } from '@/types';

export async function getCategories() {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return data as Category[];
}

export async function getCategoryBySlug(slug: string) {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) throw error;
  return data as Category;
}

export async function getTechCategories() {
  const supabase = await createServerClient();

  const techSlugs = ['electronica', 'laptops', 'proyectores', 'moviles', 'consolas', 'tv-audio'];

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .in('slug', techSlugs)
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return data as Category[];
}

interface CategoryWithStats extends Category {
  product_count: number;
  sales_count: number;
}

export async function getPopularCategories(limit = 6): Promise<CategoryWithStats[]> {
  const supabase = await createServerClient();

  const techSlugs = ['electronica', 'laptops', 'proyectores', 'moviles', 'consolas', 'tv-audio'];

  const { data: categories, error } = await supabase
    .from('categories')
    .select('*')
    .in('slug', techSlugs)
    .order('sort_order', { ascending: true });

  if (error || !categories) return [];

  const categoriesWithStats = await Promise.all(
    categories.map(async (category) => {
      const { count: productCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', category.id)
        .eq('status', 'active');

      return {
        ...category,
        product_count: productCount || 0,
        sales_count: 0,
      } as CategoryWithStats;
    })
  );

  return categoriesWithStats
    .sort((a, b) => b.product_count - a.product_count)
    .slice(0, limit);
}