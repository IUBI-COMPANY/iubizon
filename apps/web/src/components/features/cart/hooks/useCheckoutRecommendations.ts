"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { OrderBump } from "../CartOrderBumps";
import { useToast } from "@/context/ToastContext";

interface UseCheckoutRecommendationsOptions {
  items: Array<{ id: string; product_id?: string; quantity: number; title: string }>;
  companies: Array<{ id: string }>;
  addItem: (item: any) => void;
}

export function useCheckoutRecommendations({
  items,
  companies,
  addItem,
}: UseCheckoutRecommendationsOptions) {
  const toast = useToast();

  const [recommendations, setRecommendations] = useState<OrderBump[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [recsPage, setRecsPage] = useState<number>(1);
  const [recsHasMore, setRecsHasMore] = useState<boolean>(false);

  const fetchRecommendations = useCallback(
    async (pageToFetch = 1) => {
      try {
        setLoadingRecs(true);
        const excludeIds = items
          .map((i) => i.product_id || i.id)
          .filter(Boolean)
          .join(",");
        const ownCompanyIds = companies
          .map((c) => c.id)
          .filter(Boolean)
          .join(",");
        const params = new URLSearchParams({
          exclude: excludeIds,
          page: String(pageToFetch),
          limit: "6",
        });
        if (ownCompanyIds) params.set("excludeCompanies", ownCompanyIds);
        const res = await fetch(
          `/api/products/recommendations?${params.toString()}`,
        );
        const data = await res.json();
        if (Array.isArray(data.recommendations)) {
          setRecommendations(data.recommendations);
          setRecsHasMore(!!data.pagination?.hasMore);
          setRecsPage(pageToFetch);
        }
      } catch (err) {
        console.error("Error al cargar recomendaciones afines:", err);
      } finally {
        setLoadingRecs(false);
      }
    },
    [items, companies],
  );

  const filteredRecommendations = useMemo(() => {
    const cartProductIds = new Set(
      items.map((i) => i.product_id || i.id),
    );
    return recommendations.filter((rec) => !cartProductIds.has(rec.id));
  }, [recommendations, items]);

  useEffect(() => {
    fetchRecommendations(1);
  }, [items, fetchRecommendations]);

  const handleAddBump = (bump: OrderBump) => {
    addItem({
      id: bump.id,
      title: bump.title,
      price: bump.price,
      company_id: bump.company_id,
      images: bump.image_url ? [{ url: bump.image_url }] : [],
      stock: typeof bump.stock === "number" ? bump.stock : 10,
    });
    toast.success(`"${bump.title}" agregado al paquete`, "¡Producto Añadido!");
  };

  return {
    recommendations: filteredRecommendations,
    loadingRecs,
    recsPage,
    recsHasMore,
    fetchRecommendations,
    handleAddBump,
  };
}
