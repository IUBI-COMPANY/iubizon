'use client';

import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from './useAuth';

interface FavoritesContextType {
  favoriteIds: Set<string>;
  isLoading: boolean;
  toggleFavorite: (productId: string) => Promise<boolean>;
  isFavorite: (productId: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const loadFavorites = async () => {
      if (!user) {
        setFavoriteIds(new Set());
        setIsLoading(false);
        return;
      }

      const supabase = createClient();
      const { data } = await supabase
        .from('favorites')
        .select('product_id')
        .eq('user_id', user.id);

      setFavoriteIds(new Set(data?.map((f) => f.product_id) ?? []));
      setIsLoading(false);
    };

    loadFavorites();
  }, [user]);

  const toggleFavorite = useCallback(async (productId: string): Promise<boolean> => {
    if (!user) {
      window.location.href = `/auth/login?redirect=${encodeURIComponent(window.location.pathname)}`;
      return false;
    }

    const isFavorited = favoriteIds.has(productId);
    const supabase = createClient();

    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (isFavorited) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });

    try {
      if (isFavorited) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', productId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('favorites')
          .insert({ user_id: user.id, product_id: productId });

        if (error) throw error;
      }
      return !isFavorited;
    } catch {
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (isFavorited) {
          next.add(productId);
        } else {
          next.delete(productId);
        }
        return next;
      });
      return isFavorited;
    }
  }, [user, favoriteIds]);

  const isFavorite = useCallback((productId: string): boolean => {
    return favoriteIds.has(productId);
  }, [favoriteIds]);

  return (
    <FavoritesContext.Provider value={{ favoriteIds, isLoading, toggleFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavoritesContext() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavoritesContext must be used within a FavoritesProvider');
  }
  return context;
}