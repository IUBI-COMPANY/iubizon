"use client";

import { useCallback, useRef, useState } from "react";

/**
 * Estado de carga que muestra el skeleton solo en la PRIMERA carga.
 * En cargas posteriores (p. ej. volver a la pestaña o refetch automático)
 * refresca en silencio sin volver a mostrar el skeleton.
 */
export function useInitialLoading(initialLoading = true) {
  const [loading, setLoading] = useState(initialLoading);
  const hasLoadedOnce = useRef(false);

  const startLoading = useCallback(() => {
    if (!hasLoadedOnce.current) {
      setLoading(true);
    }
  }, []);

  const stopLoading = useCallback(() => {
    setLoading(false);
    hasLoadedOnce.current = true;
  }, []);

  return { loading, startLoading, stopLoading };
}
