"use client";

import {
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
} from "react";
import { useAuth } from "./useAuth";

interface FavoritesContextType {
  favoriteIds: Set<string>;
  favoritesCount: number;
  isLoading: boolean;
  toggleFavorite: (productId: string) => Promise<boolean>;
  isFavorite: (productId: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(
  undefined,
);

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

      try {
        const res = await fetch("/api/user/favorites");
        if (res.ok) {
          const data = await res.json();
          setFavoriteIds(new Set(data.productIds ?? []));
        }
      } catch {
        // fallback silencioso
      }
      setIsLoading(false);
    };

    loadFavorites();
  }, [user]);

  const toggleFavorite = useCallback(
    async (productId: string): Promise<boolean> => {
      if (!user) {
        window.location.href = `/auth/login?redirect=${encodeURIComponent(window.location.pathname)}`;
        return false;
      }

      const isFavorited = favoriteIds.has(productId);

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
        const res = await fetch("/api/user/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId }),
        });

        if (!res.ok) throw new Error("Error al actualizar favorito");

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
    },
    [user, favoriteIds],
  );

  const isFavorite = useCallback(
    (productId: string): boolean => {
      return favoriteIds.has(productId);
    },
    [favoriteIds],
  );

  return (
    <FavoritesContext.Provider
      value={{
        favoriteIds,
        favoritesCount: favoriteIds.size,
        isLoading,
        toggleFavorite,
        isFavorite,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavoritesContext() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error(
      "useFavoritesContext must be used within a FavoritesProvider",
    );
  }
  return context;
}
