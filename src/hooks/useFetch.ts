"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface UseFetchOptions<T> {
  /** Si es true, solo carga una vez y nunca refetch automático */
  fetchOnce?: boolean;
  /** Callback cuando los datos se actualizan */
  onSuccess?: (data: T) => void;
  /** Callback cuando hay error */
  onError?: (error: unknown) => void;
}

interface UseFetchResult<T> {
  /** Datos actuales — nunca null durante refrescos */
  data: T | null;
  /** Solo true en la primera carga (data === null y cargando) */
  isLoading: boolean;
  /** True cuando refresca en background — usar para indicador sutil */
  isRefreshing: boolean;
  /** Error de la última petición */
  error: string | null;
  /** Forzar refetch manual */
  refetch: () => Promise<void>;
}

/**
 * Hook genérico para fetching de datos.
 * - Primera carga: muestra loading (data = null)
 * - Recargas (tab switch, refetch manual): mantiene data anterior, solo isRefreshing = true
 * - Escalable: funciona igual en Server Components, Client Components, modales
 */
export function useFetch<T>(
  fetcher: (signal: AbortSignal) => Promise<T>,
  deps: unknown[] = [],
  options: UseFetchOptions<T> = {},
): UseFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasLoadedOnce = useRef(false);
  const mountedRef = useRef(true);

  const doFetch = useCallback(
    async (isInitial: boolean) => {
      const controller = new AbortController();

      try {
        if (isInitial) {
          setIsLoading(true);
        } else if (hasLoadedOnce.current) {
          setIsRefreshing(true);
        }

        setError(null);
        const result = await fetcher(controller.signal);

        if (!mountedRef.current) return;

        setData(result);
        hasLoadedOnce.current = true;
        options.onSuccess?.(result);
      } catch (err: unknown) {
        if (!mountedRef.current || controller.signal.aborted) return;

        const msg =
          err instanceof Error ? err.message : "Error al cargar datos";
        setError(msg);
        options.onError?.(err);
      } finally {
        if (mountedRef.current) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    },
    [...deps],
  );

  // Carga inicial
  useEffect(() => {
    mountedRef.current = true;

    // Delay mínimo para evitar flash en tab switch — si ya tenemos data,
    // es un refetch silencioso
    if (!options.fetchOnce || !hasLoadedOnce.current) {
      doFetch(!hasLoadedOnce.current);
    }

    return () => {
      mountedRef.current = false;
    };
  }, [doFetch, options.fetchOnce]);

  const refetch = useCallback(async () => {
    await doFetch(false);
  }, [doFetch]);

  return { data, isLoading, isRefreshing, error, refetch };
}
