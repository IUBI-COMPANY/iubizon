import { createServerClient } from '@/lib/supabase/server';
import type { Product, SearchFilters } from '@/types';

interface GetProductsOptions {
  limit?: number;
  offset?: number;
  filters?: SearchFilters;
}

export async function getProducts(options: GetProductsOptions = {}) {
  const { limit = 20, offset = 0, filters } = options;
  const supabase = await createServerClient();

  let query = supabase
    .from('products')
    .select('*, category:categories(*), seller:profiles(*), images:product_images(*)', {
      count: 'exact',
    })
    .eq('status', 'active');

  if (filters?.query) {
    query = query.ilike('title', `%${filters.query}%`);
  }

  if (filters?.categoryId) {
    query = query.eq('category_id', filters.categoryId);
  }

  if (filters?.minPrice) {
    query = query.gte('price', filters.minPrice);
  }

  if (filters?.maxPrice) {
    query = query.lte('price', filters.maxPrice);
  }

  if (filters?.condition && filters.condition.length > 0) {
    query = query.in('condition', filters.condition);
  }

  if (filters?.sortBy === 'price_asc') {
    query = query.order('price', { ascending: true });
  } else if (filters?.sortBy === 'price_desc') {
    query = query.order('price', { ascending: false });
  } else if (filters?.sortBy === 'popular') {
    query = query.order('favorites', { ascending: false });
  } else {
    query = query.order('created_at', { ascending: false });
  }

  const { data, error, count } = await query.range(offset, offset + limit - 1);

  if (error) throw error;

  return {
    products: data as Product[],
    total: count || 0,
    hasMore: (count || 0) > offset + limit,
  };
}

export async function getProductById(id: string) {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from('products')
    .select('*, category:categories(*), seller:profiles(*), images:product_images(*), bundle:product_bundles(*)')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Product;
}

export async function getProductsByCategory(categorySlug: string, limit = 20) {
  const supabase = await createServerClient();

  const { data: category } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', categorySlug)
    .single();

  if (!category) return { products: [], total: 0 };

  const { data, error, count } = await supabase
    .from('products')
    .select('*, category:categories(*), seller:profiles(*), images:product_images(*)', {
      count: 'exact',
    })
    .eq('category_id', category.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;

  return {
    products: data as Product[],
    total: count || 0,
  };
}

export async function getRelatedProducts(productId: string, categoryId: string, limit = 4) {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from('products')
    .select('*, category:categories(*), seller:profiles(*), images:product_images(*)')
    .eq('category_id', categoryId)
    .neq('id', productId)
    .eq('status', 'active')
    .order('favorites', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data as Product[];
}

export async function getUserProducts(userId: string) {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from('products')
    .select('*, category:categories(*), images:product_images(*)')
    .eq('seller_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Product[];
}