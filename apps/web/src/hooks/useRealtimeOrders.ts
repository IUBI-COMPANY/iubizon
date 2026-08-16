"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

interface UseRealtimeOrdersOptions {
  companyId?: string | null;
  userId?: string | null;
  onUpdate: () => void;
  enabled?: boolean;
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
    if (!enabled || (!companyId && !userId)) return;

    const supabase = createClient();
    const channelId = `realtime_orders_${companyId || "no_company"}_${userId || "no_user"}`;

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

    // Suscripción a products (para actualizar totalProducts, activeProducts y totalViews en tiempo real)
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

    // Suscripción a favorites (para actualizar interacciones en tiempo real)
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
      supabase.removeChannel(channel);
    };
  }, [companyId, userId, enabled]);
}
