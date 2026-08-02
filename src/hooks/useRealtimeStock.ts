"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function useRealtimeStock(
  productId: string,
  initialStock: number,
  initialStatus: string = "active"
) {
  const [stock, setStock] = useState<number>(initialStock);
  const [status, setStatus] = useState<string>(initialStatus);

  useEffect(() => {
    if (!productId) return;
    setStock(initialStock);
    setStatus(initialStatus);

    const supabase = createClient();
    const channel = supabase
      .channel(`realtime-product-${productId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "products",
          filter: `id=eq.${productId}`,
        },
        (payload) => {
          if (payload.new) {
            if (typeof payload.new.stock === "number") {
              setStock(payload.new.stock);
            }
            if (payload.new.status) {
              setStatus(payload.new.status);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [productId, initialStock, initialStatus]);

  return {
    stock,
    status,
    isOutOfStock: stock <= 0 || status === "sold",
  };
}
