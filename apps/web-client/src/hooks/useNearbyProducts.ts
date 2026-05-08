'use client';

import { useState } from 'react';
import { useGeolocation, calculateDistance } from '@/hooks/useGeolocation';
import { createClient } from '@/lib/supabase/client';
import type { Product } from '@/types';

interface ProductWithDistance extends Product {
  distance?: number;
}

interface UseNearbyProductsOptions {
  maxDistanceKm?: number;
  limit?: number;
}

export function useNearbyProducts(options: UseNearbyProductsOptions = {}) {
  const { maxDistanceKm = 50, limit = 20 } = options;
  const { coordinates } = useGeolocation();
  const [products, setProducts] = useState<ProductWithDistance[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchNearbyProducts = async () => {
    if (!coordinates) {
      setProducts([]);
      return;
    }

    setIsLoading(true);
    const supabase = createClient();

    const { data, error } = await supabase
      .from('products')
      .select('*, category:categories(*), seller:profiles(*), images:product_images(*)')
      .eq('status', 'active')
      .limit(100);

    if (error) {
      console.error('Error fetching products:', error);
      setIsLoading(false);
      return;
    }

    const productsWithDistance = (data || [])
      .map((product: any) => ({
        ...product,
        distance: product.latitude && product.longitude
          ? calculateDistance(
              coordinates.latitude,
              coordinates.longitude,
              product.latitude,
              product.longitude
            )
          : undefined,
      }))
      .filter((p: ProductWithDistance) => p.distance === undefined || p.distance <= maxDistanceKm)
      .sort((a: ProductWithDistance, b: ProductWithDistance) => {
        const distA = a.distance ?? Infinity;
        const distB = b.distance ?? Infinity;
        return distA - distB;
      })
      .slice(0, limit);

    setProducts(productsWithDistance);
    setIsLoading(false);
  };

  return {
    products,
    isLoading,
    fetchNearbyProducts,
    hasLocation: !!coordinates,
  };
}