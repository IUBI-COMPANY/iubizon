"use client";

import { useState, useEffect, useCallback } from "react";
import type { Category } from "@/types";

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/categories");
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Error al cargar categorías");

      const categoriesWithChildren = buildCategoryTree(
        (data.categories || data) as Category[],
      );
      setCategories(categoriesWithChildren);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar categorías",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return { categories, isLoading, error, refetch: fetchCategories };
};

export const useCategory = (slug: string) => {
  const [category, setCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategory = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/categories");
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Error al cargar categoría");

        const found = (data.categories || data).find(
          (c: Category) => c.slug === slug,
        );
        setCategory(found || null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error al cargar categoría",
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) {
      fetchCategory();
    }
  }, [slug]);

  return { category, isLoading, error };
};

const buildCategoryTree = (categories: Category[]): Category[] => {
  const map = new Map<string, Category>();
  const roots: Category[] = [];

  categories.forEach((cat) => {
    map.set(cat.id, { ...cat, children: [] });
  });

  categories.forEach((cat) => {
    const node = map.get(cat.id)!;
    if (cat.parent_id) {
      const parent = map.get(cat.parent_id);
      if (parent) {
        parent.children = parent.children || [];
        parent.children.push(node);
      }
    } else {
      roots.push(node);
    }
  });

  return roots;
};
