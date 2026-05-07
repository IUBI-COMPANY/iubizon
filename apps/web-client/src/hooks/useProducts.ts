'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Product, SearchFilters, PaginatedResponse } from '@/types';

export const useProducts = (initialFilters?: SearchFilters) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState<SearchFilters>(initialFilters || {});

  const supabase = createClient();

  const fetchProducts = useCallback(async (page = 1) => {
    setIsLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('products')
        .select('*, seller:profiles(*), category:categories(*), images:product_images(*), bundle:product_bundles(*)', {
          count: 'exact',
        })
        .eq('status', 'active')
        .order(filters.sortBy === 'price_asc' ? 'price' : 'created_at', { 
          ascending: filters.sortBy === 'price_asc' || filters.sortBy === 'newest' || !filters.sortBy
        })
        .range((page - 1) * pagination.limit, page * pagination.limit - 1);

      if (filters.categoryId) {
        query = query.eq('category_id', filters.categoryId);
      }
      if (filters.minPrice) {
        query = query.gte('price', filters.minPrice);
      }
      if (filters.maxPrice) {
        query = query.lte('price', filters.maxPrice);
      }
      if (filters.condition && filters.condition.length > 0) {
        query = query.in('condition', filters.condition);
      }
      if (filters.isBundle !== undefined) {
        query = query.eq('is_bundle', filters.isBundle);
      }
      if (filters.query) {
        query = query.ilike('title', `%${filters.query}%`);
      }

      const { data, count, error: fetchError } = await query;

      console.log('Products fetched:', data, 'count:', count, 'error:', fetchError);

      if (fetchError) throw fetchError;

      setProducts(data as Product[]);
      setPagination((prev) => ({
        ...prev,
        page,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / prev.limit),
      }));
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar productos');
    } finally {
      setIsLoading(false);
    }
  }, [filters, pagination.limit, supabase]);

  useEffect(() => {
    fetchProducts(1);
  }, [filters]);

  const updateFilters = (newFilters: SearchFilters) => {
    setFilters(newFilters);
  };

  const loadMore = () => {
    if (!isLoading && pagination.page < pagination.totalPages) {
      fetchProducts(pagination.page + 1);
    }
  };

  return {
    products,
    isLoading,
    error,
    pagination,
    filters,
    updateFilters,
    loadMore,
    refetch: () => fetchProducts(pagination.page),
  };
};

export const useProduct = (productId: string) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const { data, error: fetchError } = await supabase
          .from('products')
          .select('*, seller:profiles(*), category:categories(*), images:product_images(*), bundle:product_bundles(*)')
          .eq('id', productId)
          .single();

        if (fetchError) throw fetchError;

        setProduct(data as Product);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar producto');
      } finally {
        setIsLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId, supabase]);

  return { product, isLoading, error };
};

export const useRelatedProducts = (categoryId: string, productId: string, limit = 4) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchRelated = async () => {
      setIsLoading(true);

      try {
        const { data, error } = await supabase
          .from('products')
          .select('*, seller:profiles(*), images:product_images(*)')
          .eq('category_id', categoryId)
          .eq('status', 'active')
          .neq('id', productId)
          .limit(limit);

        if (error) throw error;

        setProducts(data as Product[]);
      } catch (err) {
        console.error('Error fetching related products:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (categoryId) {
      fetchRelated();
    }
  }, [categoryId, productId, limit, supabase]);

  return { products, isLoading };
};