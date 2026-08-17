"use client";

import { useEffect, useRef } from "react";

interface ProductViewTrackerProps {
  productId: string;
}

export function ProductViewTracker({ productId }: ProductViewTrackerProps) {
  const hasTrackedRef = useRef(false);

  useEffect(() => {
    if (!productId || hasTrackedRef.current) return;

    hasTrackedRef.current = true;

    fetch(`/api/products/${encodeURIComponent(productId)}/view`, {
      method: "POST",
    }).catch((err) =>
      console.error(
        "[ProductViewTracker] Error registrando vista de producto:",
        err,
      ),
    );
  }, [productId]);

  return null;
}
