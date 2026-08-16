"use client";

import { useEffect, useRef } from "react";

interface CompanyViewTrackerProps {
  companyId: string;
}

export function CompanyViewTracker({ companyId }: CompanyViewTrackerProps) {
  const hasTrackedRef = useRef(false);

  useEffect(() => {
    if (!companyId || hasTrackedRef.current) return;

    // Evitar contar múltiples veces dentro de la misma pestaña/sesión
    const sessionKey = `iubizon_company_viewed_${companyId}`;
    if (typeof window !== "undefined") {
      if (sessionStorage.getItem(sessionKey)) {
        return;
      }
      sessionStorage.setItem(sessionKey, "1");
    }

    hasTrackedRef.current = true;

    fetch(`/api/companies/${encodeURIComponent(companyId)}/view`, {
      method: "POST",
    }).catch((err) =>
      console.error("[CompanyViewTracker] Error registrando vista:", err),
    );
  }, [companyId]);

  return null;
}
