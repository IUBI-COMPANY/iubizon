'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from './useAuth';
import type { Favorite } from '@/types';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const supabase = createClient();

  const fetchFavorites = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('*, product:products(*, seller:profiles(*), images:product_images(*))')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setFavorites(data as Favorite[]);
      setFavoriteIds(data.map((f) => f.product_id));
    } catch (err) {
      console.error('Error fetching favorites:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const toggleFavorite = async (productId: string) => {
    if (!user) return;

    const isFavorited = favoriteIds.includes(productId);

    try {
      if (isFavorited) {
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', productId);

        setFavoriteIds((prev) => prev.filter((id) => id !== productId));
        setFavorites((prev) => prev.filter((f) => f.product_id !== productId));
      } else {
        const { data, error } = await supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            product_id: productId,
          })
          .select('*, product:products(*, seller:profiles(*), images:product_images(*))')
          .single();

        if (error) throw error;

        setFavoriteIds((prev) => [...prev, productId]);
        setFavorites((prev) => [data as Favorite, ...prev]);
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  };

  const isFavorite = (productId: string): boolean => {
    return favoriteIds.includes(productId);
  };

  return {
    favorites,
    favoriteIds,
    isLoading,
    toggleFavorite,
    isFavorite,
    refetch: fetchFavorites,
  };
};