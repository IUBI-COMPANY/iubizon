"use client";

import { useEffect, useRef } from "react";

interface ProductViewTrackerProps {
  productId: string;
}

export function ProductViewTracker({ productId }: ProductViewTrackerProps) {
  const hasTrackedRef = useRef(false);

  useEffect(() => {
    if (!productId || hasTrackedRef.current) return;

    // Evitar contar múltiples veces dentro de la misma pestaña/sesión
    const sessionKey = `iubizon_product_viewed_${productId}`;
    if (typeof window !== "undefined") {
      if (sessionStorage.getItem(sessionKey)) {
        return;
      }
      sessionStorage.setItem(sessionKey, "1");
    }

    hasTrackedRef.current = true;

    fetch(`/api/products/${encodeURIComponent(productId)}/view`, {
      method: "POST",
    }).catch((err) =>
      console.error("[ProductViewTracker] Error registrando vista:", err),
    );
  }, [productId]);

  return null;
}
