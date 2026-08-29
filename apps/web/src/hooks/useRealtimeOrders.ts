"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

interface UseRealtimeOrdersOptions {
  companyId?: string | null;
  userId?: string | null;
  onUpdate: () => void;
  enabled?: boolean;
}

/**
 * Notifica a todas las pestañas abiertas y suscriptores locales que ocurrió
 * un cambio en órdenes o despachos para sincronización inmediata.
 */
export function notifyOrderSync() {
  if (typeof window !== "undefined") {
    try {
      const bc = new BroadcastChannel("iubizon_order_sync");
      bc.postMessage({ type: "ORDER_UPDATE", timestamp: Date.now() });
      bc.close();
    } catch {
      // Ignorar si BroadcastChannel no está soportado
    }
    window.dispatchEvent(new CustomEvent("iubizon:order_updated"));
  }
}

export function useRealtimeOrders({
  companyId,
  userId,
  onUpdate,
  enabled = true,
}: UseRealtimeOrdersOptions) {
  const onUpdateRef = useRef(onUpdate);

  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);

  useEffect(() => {
    if (!enabled) return;

    // 1. Sincronización Cross-Tab vía BroadcastChannel
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel("iubizon_order_sync");
      bc.onmessage = () => {
        onUpdateRef.current();
      };
    } catch {
      // BroadcastChannel no disponible en ciertos entornos
    }

    // 2. Sincronización In-Memory Local Event
    const handleLocalEvent = () => {
      onUpdateRef.current();
    };
    window.addEventListener("iubizon:order_updated", handleLocalEvent);

    // 3. Sincronización al enfocar o activar la pestaña
    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === "visible") {
        onUpdateRef.current();
      }
    };
    window.addEventListener("focus", handleVisibilityOrFocus);
    document.addEventListener("visibilitychange", handleVisibilityOrFocus);

    // 4. Polling inteligente de respaldo (cada 3.5s si la pestaña está visible)
    const pollInterval = setInterval(() => {
      if (document.visibilityState === "visible") {
        onUpdateRef.current();
      }
    }, 3500);

    // 5. Suscripción Supabase Realtime WebSocket (CDC)
    const supabase = createClient();
    const channelId = `realtime_orders_${companyId || "no_company"}_${userId || "no_user"}_${Date.now()}`;
    const channel = supabase.channel(channelId);

    // Suscripción a order_packages
    channel.on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "order_packages",
      },
      (payload) => {
        const newRecord = payload.new as { company_id?: string } | null;
        const oldRecord = payload.old as { company_id?: string } | null;

        if (companyId) {
          if (
            newRecord?.company_id === companyId ||
            oldRecord?.company_id === companyId
          ) {
            onUpdateRef.current();
          }
        } else {
          onUpdateRef.current();
        }
      },
    );

    // Suscripción a orders
    channel.on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "orders",
      },
      (payload) => {
        const newRecord = payload.new as { buyer_id?: string } | null;
        const oldRecord = payload.old as { buyer_id?: string } | null;

        if (userId) {
          if (
            newRecord?.buyer_id === userId ||
            oldRecord?.buyer_id === userId
          ) {
            onUpdateRef.current();
          }
        } else {
          onUpdateRef.current();
        }
      },
    );

    // Suscripción a refund_requests
    channel.on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "refund_requests",
      },
      () => {
        onUpdateRef.current();
      },
    );

    // Suscripción a products
    channel.on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "products",
      },
      (payload) => {
        const newRecord = payload.new as { company_id?: string } | null;
        const oldRecord = payload.old as { company_id?: string } | null;

        if (companyId) {
          if (
            newRecord?.company_id === companyId ||
            oldRecord?.company_id === companyId
          ) {
            onUpdateRef.current();
          }
        } else {
          onUpdateRef.current();
        }
      },
    );

    // Suscripción a favorites
    channel.on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "favorites",
      },
      () => {
        onUpdateRef.current();
      },
    );

    channel.subscribe();

    return () => {
      clearInterval(pollInterval);
      if (bc) {
        bc.close();
      }
      window.removeEventListener("iubizon:order_updated", handleLocalEvent);
      window.removeEventListener("focus", handleVisibilityOrFocus);
      document.removeEventListener("visibilitychange", handleVisibilityOrFocus);
      supabase.removeChannel(channel);
    };
  }, [companyId, userId, enabled]);
}
